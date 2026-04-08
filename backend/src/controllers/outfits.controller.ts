import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getOutfits(req: Request, res: Response): Promise<void> {
  try {
    const { occasion, season } = req.query;

    const outfits = await prisma.outfit.findMany({
      where: {
        user_id: req.user!.userId,
        ...(occasion && { occasion: occasion as any }),
        ...(season && { season: season as any }),
      },
      include: {
        items: {
          include: { item: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: outfits });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des tenues' });
  }
}

export async function getOutfit(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const outfit = await prisma.outfit.findFirst({
      where: {
        id,
        user_id: req.user!.userId,
      },
      include: {
        items: {
          include: { item: true },
        },
      },
    });

    if (!outfit) {
      res.status(404).json({ success: false, error: 'Tenue non trouvée' });
      return;
    }

    res.json({ success: true, data: outfit });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function createOutfit(req: Request, res: Response): Promise<void> {
  try {
    const { name, occasion, season, item_ids, ai_generated } = req.body;

    const outfit = await prisma.outfit.create({
      data: {
        user_id: req.user!.userId,
        name,
        occasion,
        season,
        ai_generated: ai_generated || false,
        items: {
          create: (item_ids || []).map((item_id: string) => ({
            item_id,
          })),
        },
      },
      include: {
        items: {
          include: { item: true },
        },
      },
    });

    res.status(201).json({ success: true, data: outfit });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la création de la tenue' });
  }
}

export async function updateOutfit(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const outfit = await prisma.outfit.findFirst({
      where: { id, user_id: req.user!.userId },
    });

    if (!outfit) {
      res.status(404).json({ success: false, error: 'Tenue non trouvée' });
      return;
    }

    const { name, occasion, season, item_ids } = req.body;

    if (item_ids) {
      await prisma.outfitItem.deleteMany({ where: { outfit_id: id } });
      await prisma.outfitItem.createMany({
        data: item_ids.map((item_id: string) => ({
          outfit_id: id,
          item_id,
        })),
      });
    }

    const updated = await prisma.outfit.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(occasion && { occasion }),
        ...(season && { season }),
      },
      include: {
        items: {
          include: { item: true },
        },
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour' });
  }
}

export async function deleteOutfit(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const outfit = await prisma.outfit.findFirst({
      where: { id, user_id: req.user!.userId },
    });

    if (!outfit) {
      res.status(404).json({ success: false, error: 'Tenue non trouvée' });
      return;
    }

    await prisma.outfitItem.deleteMany({ where: { outfit_id: id } });
    await prisma.lookbookOutfit.deleteMany({ where: { outfit_id: id } });
    await prisma.calendarEntry.deleteMany({ where: { outfit_id: id } });
    await prisma.outfit.delete({ where: { id } });

    res.json({ success: true, data: { message: 'Tenue supprimée' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression' });
  }
}

export async function markWorn(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const outfit = await prisma.outfit.findFirst({
      where: { id, user_id: req.user!.userId },
      include: { items: true },
    });

    if (!outfit) {
      res.status(404).json({ success: false, error: 'Tenue non trouvée' });
      return;
    }

    const now = new Date();

    const updated = await prisma.outfit.update({
      where: { id },
      data: {
        worn_count: { increment: 1 },
        last_worn_at: now,
      },
    });

    // Also increment wear count on each item
    for (const oi of outfit.items) {
      await prisma.clothingItem.update({
        where: { id: oi.item_id },
        data: {
          wear_count: { increment: 1 },
          last_worn_at: now,
        },
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
