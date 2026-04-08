import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getLookbooks(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    const lookbooks = await prisma.lookbook.findMany({
      where: role === 'STYLIST'
        ? { stylist_id: userId }
        : { client_id: userId },
      include: {
        stylist: {
          select: { id: true, name: true, avatar_url: true },
        },
        client: {
          select: { id: true, name: true, avatar_url: true },
        },
        outfits: {
          include: {
            outfit: {
              include: {
                items: {
                  include: { item: true },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: lookbooks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des lookbooks' });
  }
}

export async function getLookbook(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const lookbook = await prisma.lookbook.findFirst({
      where: {
        id,
        OR: [{ stylist_id: userId }, { client_id: userId }],
      },
      include: {
        stylist: {
          select: { id: true, name: true, avatar_url: true },
        },
        client: {
          select: { id: true, name: true, avatar_url: true },
        },
        outfits: {
          include: {
            outfit: {
              include: {
                items: {
                  include: { item: true },
                },
              },
            },
          },
        },
      },
    });

    if (!lookbook) {
      res.status(404).json({ success: false, error: 'Lookbook non trouvé' });
      return;
    }

    res.json({ success: true, data: lookbook });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function createLookbook(req: Request, res: Response): Promise<void> {
  try {
    const { client_id, title, description, outfit_ids } = req.body;

    const lookbook = await prisma.lookbook.create({
      data: {
        stylist_id: req.user!.userId,
        client_id,
        title,
        description,
        outfits: {
          create: (outfit_ids || []).map((outfit_id: string) => ({
            outfit_id,
          })),
        },
      },
      include: {
        outfits: {
          include: {
            outfit: {
              include: {
                items: {
                  include: { item: true },
                },
              },
            },
          },
        },
      },
    });

    res.status(201).json({ success: true, data: lookbook });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la création du lookbook' });
  }
}

export async function updateLookbook(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const lookbook = await prisma.lookbook.findFirst({
      where: { id, stylist_id: req.user!.userId },
    });

    if (!lookbook) {
      res.status(404).json({ success: false, error: 'Lookbook non trouvé' });
      return;
    }

    const { title, description, outfit_ids } = req.body;

    if (outfit_ids) {
      await prisma.lookbookOutfit.deleteMany({ where: { lookbook_id: id } });
      await prisma.lookbookOutfit.createMany({
        data: outfit_ids.map((outfit_id: string) => ({
          lookbook_id: id,
          outfit_id,
        })),
      });
    }

    const updated = await prisma.lookbook.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
      },
      include: {
        outfits: {
          include: {
            outfit: {
              include: {
                items: {
                  include: { item: true },
                },
              },
            },
          },
        },
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour' });
  }
}

export async function deleteLookbook(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const lookbook = await prisma.lookbook.findFirst({
      where: { id, stylist_id: req.user!.userId },
    });

    if (!lookbook) {
      res.status(404).json({ success: false, error: 'Lookbook non trouvé' });
      return;
    }

    await prisma.lookbookOutfit.deleteMany({ where: { lookbook_id: id } });
    await prisma.lookbook.delete({ where: { id } });

    res.json({ success: true, data: { message: 'Lookbook supprimé' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression' });
  }
}

export async function sendLookbook(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const lookbook = await prisma.lookbook.findFirst({
      where: { id, stylist_id: req.user!.userId, status: 'DRAFT' },
    });

    if (!lookbook) {
      res.status(404).json({ success: false, error: 'Lookbook non trouvé ou déjà envoyé' });
      return;
    }

    const updated = await prisma.lookbook.update({
      where: { id },
      data: { status: 'SENT' },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de l\'envoi' });
  }
}

export async function submitFeedback(req: Request, res: Response): Promise<void> {
  try {
    const { status, feedback } = req.body;

    const { id } = req.params as { id: string };
    const lookbook = await prisma.lookbook.findFirst({
      where: {
        id,
        client_id: req.user!.userId,
        status: 'SENT',
      },
    });

    if (!lookbook) {
      res.status(404).json({ success: false, error: 'Lookbook non trouvé' });
      return;
    }

    const updated = await prisma.lookbook.update({
      where: { id },
      data: {
        status: status === 'approve' ? 'APPROVED' : 'REJECTED',
        feedback,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
