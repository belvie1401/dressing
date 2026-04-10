import { Request, Response } from 'express';
import prisma from '../lib/prisma';

function stripSensitiveProfile(
  profile: Record<string, unknown> | null | undefined
): Record<string, unknown> | null {
  if (!profile || typeof profile !== 'object') return null;
  const { password, ...safe } = profile as Record<string, unknown>;
  return safe;
}

export async function listStylists(req: Request, res: Response): Promise<void> {
  try {
    const stylists = await prisma.user.findMany({
      where: { role: 'STYLIST' },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        style_profile: true,
        location: true,
      },
    });

    const safe = stylists.map((s) => ({
      ...s,
      style_profile: stripSensitiveProfile(s.style_profile as Record<string, unknown> | null),
    }));

    res.json({ success: true, data: safe });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des stylistes' });
  }
}

export async function getStylistById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const stylist = await prisma.user.findFirst({
      where: { id, role: 'STYLIST' },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        style_profile: true,
        location: true,
      },
    });

    if (!stylist) {
      res.status(404).json({ success: false, error: 'Styliste non trouvé' });
      return;
    }

    res.json({
      success: true,
      data: {
        ...stylist,
        style_profile: stripSensitiveProfile(stylist.style_profile as Record<string, unknown> | null),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * PUT /api/stylists/services
 * Body: { services: [{ name, description, duration_min, price }, ...] }
 * Stores services array in the authenticated stylist's style_profile.
 */
export async function updateServices(req: Request, res: Response): Promise<void> {
  try {
    if (req.user!.role !== 'STYLIST') {
      res.status(403).json({ success: false, error: 'Réservé aux stylistes' });
      return;
    }

    const { services } = req.body as { services: unknown };
    if (!Array.isArray(services)) {
      res.status(400).json({ success: false, error: 'Le champ services doit être un tableau' });
      return;
    }

    const existing = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { style_profile: true },
    });
    const profile = (existing?.style_profile as Record<string, unknown>) || {};

    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { style_profile: { ...profile, services } },
      select: { style_profile: true },
    });

    res.json({
      success: true,
      data: {
        services:
          ((updated.style_profile as Record<string, unknown>)?.services as unknown[]) || [],
      },
    });
  } catch (error) {
    console.error('Update services error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function getConnections(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    const connections = await prisma.stylistClient.findMany({
      where: role === 'STYLIST'
        ? { stylist_id: userId }
        : { client_id: userId },
      include: {
        stylist: {
          select: { id: true, name: true, avatar_url: true, email: true },
        },
        client: {
          select: { id: true, name: true, avatar_url: true, email: true },
        },
      },
    });

    res.json({ success: true, data: connections });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function invite(req: Request, res: Response): Promise<void> {
  try {
    const { stylist_id } = req.body;
    const client_id = req.user!.userId;

    const existing = await prisma.stylistClient.findFirst({
      where: { stylist_id, client_id },
    });

    if (existing) {
      res.status(400).json({ success: false, error: 'Connexion déjà existante' });
      return;
    }

    const connection = await prisma.stylistClient.create({
      data: {
        stylist_id,
        client_id,
        status: 'PENDING',
      },
      include: {
        stylist: {
          select: { id: true, name: true, avatar_url: true },
        },
      },
    });

    res.status(201).json({ success: true, data: connection });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de l\'invitation' });
  }
}

export async function acceptInvite(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const connection = await prisma.stylistClient.findFirst({
      where: {
        id,
        stylist_id: req.user!.userId,
        status: 'PENDING',
      },
    });

    if (!connection) {
      res.status(404).json({ success: false, error: 'Invitation non trouvée' });
      return;
    }

    const updated = await prisma.stylistClient.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        started_at: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function rejectInvite(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const connection = await prisma.stylistClient.findFirst({
      where: {
        id,
        stylist_id: req.user!.userId,
        status: 'PENDING',
      },
    });

    if (!connection) {
      res.status(404).json({ success: false, error: 'Invitation non trouvée' });
      return;
    }

    const updated = await prisma.stylistClient.update({
      where: { id },
      data: { status: 'ENDED' },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function getClientWardrobe(req: Request, res: Response): Promise<void> {
  try {
    const stylistId = req.user!.userId;
    const clientId = req.params.clientId as string;

    const connection = await prisma.stylistClient.findFirst({
      where: {
        stylist_id: stylistId,
        client_id: clientId,
        status: 'ACTIVE',
      },
    });

    if (!connection) {
      res.status(403).json({ success: false, error: 'Accès refusé - pas de connexion active' });
      return;
    }

    const items = await prisma.clothingItem.findMany({
      where: { user_id: clientId },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
