import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { uploadImage, removeBackground } from '../services/cloudinary.service';

// ─── Shared photo upload helper ──────────────────────────────────────────────
// Uploads a single buffer to Cloudinary (with optional bg removal) and
// gracefully falls back to a base64 data URI when credentials are missing
// or the upload fails. Returns { url, bgUrl } where `url` is always set.
async function processPhotoBuffer(
  file: Express.Multer.File,
  removeBg: boolean,
): Promise<{ url: string; bgUrl?: string }> {
  let url = '';
  let bgUrl: string | undefined;

  const cloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'placeholder';

  if (cloudinaryConfigured) {
    try {
      const result = await uploadImage(file.buffer);
      url = result.url;

      if (removeBg) {
        try {
          bgUrl = await removeBackground(result.public_id);
        } catch {
          // Background removal failed — continue without it
        }
      }
    } catch (uploadErr) {
      console.error('Cloudinary upload error:', uploadErr);
      // Fall through to data-URI fallback below
    }
  }

  if (!url) {
    const b64 = file.buffer.toString('base64');
    const mime = file.mimetype || 'image/jpeg';
    url = `data:${mime};base64,${b64}`;
  }

  return { url, bgUrl };
}

function getUploadedFile(
  req: Request,
  fieldName: string,
): Express.Multer.File | undefined {
  // Supports both upload.single() (req.file) and upload.fields() (req.files)
  if (req.file && fieldName === 'photo') return req.file;
  const files = req.files as
    | { [field: string]: Express.Multer.File[] }
    | Express.Multer.File[]
    | undefined;
  if (files && !Array.isArray(files) && files[fieldName]?.[0]) {
    return files[fieldName][0];
  }
  return undefined;
}

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
    const {
      name,
      category,
      colors,
      material,
      season,
      occasion,
      brand,
      purchase_price,
      purchase_date,
      ai_tags,
      remove_bg,
      photo_hash,
      duplicate_confirmed,
    } = req.body;

    const userId = req.user!.userId;

    // ── Photo deduplication check ──
    // Wrapped in its own try/catch so a missing column (before DB migration runs)
    // never blocks item creation — worst case we skip the check.
    if (photo_hash && duplicate_confirmed !== '1') {
      try {
        const existing = await prisma.clothingItem.findFirst({
          where: { user_id: userId, photo_hash },
        });
        if (existing) {
          res.status(409).json({
            success: false,
            error: 'DUPLICATE',
            message: 'Ce vêtement existe déjà dans votre dressing',
            existing_item: existing,
          });
          return;
        }
      } catch {
        // Column not yet migrated — skip dedup check silently
      }
    }

    // ── Upload front photo ──
    let photo_url = '';
    let bg_removed_url: string | undefined;
    const frontFile = getUploadedFile(req, 'photo');
    if (frontFile) {
      const res1 = await processPhotoBuffer(frontFile, remove_bg !== '0');
      photo_url = res1.url;
      bg_removed_url = res1.bgUrl;
    } else if (req.body.photo_url) {
      photo_url = req.body.photo_url;
    }

    // ── Upload back photo (optional) ──
    let photo_back_url: string | undefined;
    let photo_back_removed: string | undefined;
    const backFile = getUploadedFile(req, 'photo_back');
    if (backFile) {
      const res2 = await processPhotoBuffer(backFile, remove_bg !== '0');
      photo_back_url = res2.url;
      photo_back_removed = res2.bgUrl;
    }

    const has_360_view = !!photo_back_url;
    const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors || [];

    const item = await prisma.clothingItem.create({
      data: {
        user_id: userId,
        name: name || null,
        photo_url,
        photo_hash: photo_hash || null,
        bg_removed_url,
        photo_back_url: photo_back_url || null,
        photo_back_removed: photo_back_removed || null,
        has_360_view,
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
    console.error('Create clothing item error:', error);
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

    const {
      name,
      category,
      colors,
      material,
      season,
      occasion,
      brand,
      purchase_price,
      purchase_date,
      ai_tags,
      remove_bg,
    } = req.body;

    // Allow uploading a back photo later to unlock the 360° view
    const backFile = getUploadedFile(req, 'photo_back');
    let newBackUrl: string | undefined;
    let newBackRemoved: string | undefined;
    if (backFile) {
      const uploaded = await processPhotoBuffer(backFile, remove_bg !== '0');
      newBackUrl = uploaded.url;
      newBackRemoved = uploaded.bgUrl;
    }

    const updated = await prisma.clothingItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name || null }),
        ...(category && { category }),
        ...(colors && { colors }),
        ...(material !== undefined && { material }),
        ...(season && { season }),
        ...(occasion && { occasion }),
        ...(brand !== undefined && { brand }),
        ...(purchase_price !== undefined && { purchase_price: parseFloat(purchase_price) }),
        ...(purchase_date && { purchase_date: new Date(purchase_date) }),
        ...(ai_tags && { ai_tags }),
        ...(newBackUrl && {
          photo_back_url: newBackUrl,
          photo_back_removed: newBackRemoved || null,
          has_360_view: true,
        }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update clothing item error:', error);
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

/**
 * GET /api/wardrobe/count
 * Returns the total number of clothing items owned by the authenticated user.
 */
export async function getItemsCount(req: Request, res: Response): Promise<void> {
  try {
    const count = await prisma.clothingItem.count({
      where: { user_id: req.user!.userId },
    });
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors du comptage' });
  }
}

/**
 * GET /api/wardrobe/stats
 * Returns month-over-month wardrobe stats for the authenticated user:
 *  - worn: total wear count this month (across all items)
 *  - new_outfits: outfits created this month
 *  - cost_per_wear: average (purchase_price / wear_count) for items with both
 */
export async function getWardrobeStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Items worn this month — sum their wear events via last_worn_at in-month count.
    // Prisma doesn't expose per-event history so we approximate with items whose
    // last_worn_at falls in the current month, summing wear_count deltas.
    const itemsWornThisMonth = await prisma.clothingItem.count({
      where: {
        user_id: userId,
        last_worn_at: { gte: startOfMonth },
      },
    });

    const newOutfitsThisMonth = await prisma.outfit.count({
      where: {
        user_id: userId,
        created_at: { gte: startOfMonth },
      },
    });

    // Cost per wear = average(purchase_price / wear_count) where both > 0
    const items = await prisma.clothingItem.findMany({
      where: {
        user_id: userId,
        purchase_price: { not: null, gt: 0 },
        wear_count: { gt: 0 },
      },
      select: { purchase_price: true, wear_count: true },
    });

    let costPerWear = 0;
    if (items.length > 0) {
      const sum = items.reduce(
        (acc, it) => acc + (it.purchase_price ?? 0) / (it.wear_count || 1),
        0
      );
      costPerWear = sum / items.length;
    }

    res.json({
      success: true,
      data: {
        worn: itemsWornThisMonth,
        new_outfits: newOutfitsThisMonth,
        cost_per_wear: Number(costPerWear.toFixed(1)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors du calcul des statistiques' });
  }
}
