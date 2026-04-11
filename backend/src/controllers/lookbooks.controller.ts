import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { uploadImage } from '../services/cloudinary.service';

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === 'string');
    } catch {
      // not JSON, fall through
    }
  }
  return [];
}

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

export async function getStylistPublicLookbooks(req: Request, res: Response): Promise<void> {
  try {
    const { stylistId } = req.params as { stylistId: string };
    const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;
    const take = limitRaw && Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 24) : undefined;

    const lookbooks = await prisma.lookbook.findMany({
      where: { stylist_id: stylistId, is_public: true },
      orderBy: { created_at: 'desc' },
      take,
      include: {
        outfits: {
          include: {
            outfit: {
              include: {
                items: { include: { item: true } },
              },
            },
          },
        },
      },
    });

    res.json({ success: true, data: lookbooks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function getLookbook(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const lookbook = await prisma.lookbook.findFirst({
      where: {
        id,
        OR: [
          { stylist_id: userId },
          { client_id: userId },
          { is_public: true },
        ],
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
    if (req.user!.role !== 'STYLIST') {
      res.status(403).json({ success: false, error: 'Réservé aux stylistes' });
      return;
    }

    const {
      client_id,
      title,
      description,
      outfit_ids,
      type,
      price,
      photos,
      before_photos,
      after_photos,
      tags,
      is_public,
    } = req.body;

    if (!title || typeof title !== 'string') {
      res.status(400).json({ success: false, error: 'Titre requis' });
      return;
    }

    const lookbook = await prisma.lookbook.create({
      data: {
        stylist_id: req.user!.userId,
        client_id: client_id || null,
        title,
        description: description || null,
        type: type || null,
        price: price != null && price !== '' ? Number(price) : null,
        photos: toStringArray(photos),
        before_photos: toStringArray(before_photos),
        after_photos: toStringArray(after_photos),
        tags: toStringArray(tags),
        is_public: Boolean(is_public),
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
    console.error('Create lookbook error:', error);
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

    const {
      title,
      description,
      outfit_ids,
      type,
      price,
      photos,
      before_photos,
      after_photos,
      tags,
      is_public,
      client_id,
    } = req.body;

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
        ...(type !== undefined && { type }),
        ...(price !== undefined && { price: price === null || price === '' ? null : Number(price) }),
        ...(photos !== undefined && { photos: toStringArray(photos) }),
        ...(before_photos !== undefined && { before_photos: toStringArray(before_photos) }),
        ...(after_photos !== undefined && { after_photos: toStringArray(after_photos) }),
        ...(tags !== undefined && { tags: toStringArray(tags) }),
        ...(is_public !== undefined && { is_public: Boolean(is_public) }),
        ...(client_id !== undefined && { client_id: client_id || null }),
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
    console.error('Update lookbook error:', error);
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

/**
 * POST /api/lookbooks/upload-photo
 * Accepts a multipart/form-data upload under field "photo".
 * Returns { url, public_id }.
 */
export async function uploadLookbookPhoto(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'Aucun fichier fourni' });
      return;
    }
    const result = await uploadImage(req.file.buffer);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Upload lookbook photo error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de l\'upload' });
  }
}
