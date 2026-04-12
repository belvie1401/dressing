import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Plan limits for max dressings
const PLAN_LIMITS: Record<string, number> = {
  FREE: 1,
  ESSENTIAL: 3,
  FAMILY: 6,
  PREMIUM: 999,
  CLIENT_PRO: 3,
  STYLIST_FREE: 1,
  STYLIST_PRO: 1,
};

async function getUserPlan(userId: string): Promise<string> {
  const sub = await prisma.subscription.findUnique({ where: { user_id: userId } });
  return sub?.plan ?? 'FREE';
}

export async function listDressings(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    const dressings = await prisma.dressing.findMany({
      where: { user_id: userId },
      orderBy: [{ is_primary: 'desc' }, { created_at: 'asc' }],
      include: { _count: { select: { items: true } } },
    });

    // Auto-create primary dressing if none exists
    if (dressings.length === 0) {
      const primary = await prisma.dressing.create({
        data: {
          user_id: userId,
          name: 'Mon dressing',
          emoji: '👗',
          is_primary: true,
        },
        include: { _count: { select: { items: true } } },
      });
      res.json({ success: true, data: [primary] });
      return;
    }

    res.json({ success: true, data: dressings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function createDressing(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { name, owner_label, emoji } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, error: 'Le nom est requis' });
      return;
    }

    // Check plan limits
    const plan = await getUserPlan(userId);
    const maxDressings = PLAN_LIMITS[plan] ?? 1;
    const currentCount = await prisma.dressing.count({ where: { user_id: userId } });

    if (currentCount >= maxDressings) {
      res.status(403).json({
        success: false,
        error: `Votre plan ${plan} est limité à ${maxDressings} dressing(s). Passez à un plan supérieur.`,
      });
      return;
    }

    const dressing = await prisma.dressing.create({
      data: {
        user_id: userId,
        name: name.trim(),
        owner_label: owner_label?.trim() || null,
        emoji: emoji || '👗',
        is_primary: false,
      },
      include: { _count: { select: { items: true } } },
    });

    res.json({ success: true, data: dressing });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la création' });
  }
}

export async function updateDressing(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const { name, owner_label, emoji } = req.body;

    const dressing = await prisma.dressing.findFirst({
      where: { id, user_id: userId },
    });

    if (!dressing) {
      res.status(404).json({ success: false, error: 'Dressing non trouvé' });
      return;
    }

    const updated = await prisma.dressing.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(owner_label !== undefined && { owner_label: owner_label?.trim() || null }),
        ...(emoji !== undefined && { emoji }),
      },
      include: { _count: { select: { items: true } } },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour' });
  }
}

export async function deleteDressing(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const dressing = await prisma.dressing.findFirst({
      where: { id, user_id: userId },
    });

    if (!dressing) {
      res.status(404).json({ success: false, error: 'Dressing non trouvé' });
      return;
    }

    if (dressing.is_primary) {
      res.status(400).json({ success: false, error: 'Impossible de supprimer le dressing principal' });
      return;
    }

    // Move items to primary dressing (or unlink them)
    const primary = await prisma.dressing.findFirst({
      where: { user_id: userId, is_primary: true },
    });

    if (primary) {
      await prisma.clothingItem.updateMany({
        where: { dressing_id: id },
        data: { dressing_id: primary.id },
      });
    } else {
      await prisma.clothingItem.updateMany({
        where: { dressing_id: id },
        data: { dressing_id: null },
      });
    }

    await prisma.dressing.delete({ where: { id } });

    res.json({ success: true, data: { message: 'Dressing supprimé' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression' });
  }
}
