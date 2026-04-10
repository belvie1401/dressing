import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { uploadImage, removeBackground } from '../services/cloudinary.service';

export async function getItems(req: Request, res: Response): Promise<void> {
  try {
    const { category, season, occasion, color } = req.query;

    const items = await prisma.clothingItem.findMany({
      where: {
        user_id: req.user!.userId,
        ...(category && { category: category as any }),
        ...(season && { season: season as any }),
        ...(occasion && { occasion: occasion as any }),
        ...(color && { colors: { has: color as string } }),
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des vêtements' });
  }
}

export async function getItem(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const item = await prisma.clothingItem.findFirst({
      where: {
        id,
        user_id: req.user!.userId,
      },
      include: {
        outfit_items: {
          include: { outfit: true },
        },
      },
    });

    if (!item) {
      res.status(404).json({ success: false, error: 'Vêtement non trouvé' });
      return;
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function createItem(req: Request, res: Response): Promise<void> {
  try {
    const { category, colors, material, season, occasion, brand, purchase_price, purchase_date, ai_tags, remove_bg } = req.body;

    let photo_url = '';
    let bg_removed_url: string | undefined;

    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      photo_url = result.url;

      if (remove_bg !== '0') {
        try {
          bg_removed_url = await removeBackground(result.public_id);
        } catch {
          // Background removal failed, continue without it
        }
      }
    } else if (req.body.photo_url) {
      photo_url = req.body.photo_url;
    }

    const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors || [];

    const item = await prisma.clothingItem.create({
      data: {
        user_id: req.user!.userId,
        photo_url,
        bg_removed_url,
        category: category || 'TOP',
        colors: parsedColors,
        material,
        season: season || 'ALL',
        occasion: occasion || 'CASUAL',
        brand,
        purchase_price: purchase_price ? parseFloat(purchase_price) : undefined,
        purchase_date: purchase_date ? new Date(purchase_date) : undefined,
        ai_tags: ai_tags ? (typeof ai_tags === 'string' ? JSON.parse(ai_tags) : ai_tags) : undefined,
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de l\'ajout du vêtement' });
  }
}

export async function updateItem(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const item = await prisma.clothingItem.findFirst({
      where: { id, user_id: req.user!.userId },
    });

    if (!item) {
      res.status(404).json({ success: false, error: 'Vêtement non trouvé' });
      return;
    }

    const { category, colors, material, season, occasion, brand, purchase_price, purchase_date, ai_tags } = req.body;

    const updated = await prisma.clothingItem.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(colors && { colors }),
        ...(material !== undefined && { material }),
        ...(season && { season }),
        ...(occasion && { occasion }),
        ...(brand !== undefined && { brand }),
        ...(purchase_price !== undefined && { purchase_price: parseFloat(purchase_price) }),
        ...(purchase_date && { purchase_date: new Date(purchase_date) }),
        ...(ai_tags && { ai_tags }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour' });
  }
}

export async function deleteItem(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const item = await prisma.clothingItem.findFirst({
      where: { id, user_id: req.user!.userId },
    });

    if (!item) {
      res.status(404).json({ success: false, error: 'Vêtement non trouvé' });
      return;
    }

    await prisma.outfitItem.deleteMany({ where: { item_id: id } });
    await prisma.clothingItem.delete({ where: { id } });

    res.json({ success: true, data: { message: 'Vêtement supprimé' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression' });
  }
}

export async function markWorn(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const item = await prisma.clothingItem.findFirst({
      where: { id, user_id: req.user!.userId },
    });

    if (!item) {
      res.status(404).json({ success: false, error: 'Vêtement non trouvé' });
      return;
    }

    const updated = await prisma.clothingItem.update({
      where: { id },
      data: {
        wear_count: { increment: 1 },
        last_worn_at: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
