import { Request, Response } from 'express';
import prisma from '../lib/prisma';

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

    res.json({ success: true, data: stylists });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des stylistes' });
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
