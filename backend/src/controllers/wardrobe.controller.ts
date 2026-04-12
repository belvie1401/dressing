import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { uploadImage, removeBackground } from '../services/cloudinary.service';
import { virtualTryOn } from '../services/ai.service';
import { createNotification } from './notifications.controller';

// ─── Plan limits ─────────────────────────────────────────────────────────────
const FREE_PLAN_ITEM_LIMIT = 50;
const FREE_PLAN_WARN_AT = 45;

/**
 * Returns the current plan for a user. Absent subscription = FREE.
 */
async function getUserPlan(userId: string): Promise<string> {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { user_id: userId },
      select: { plan: true, status: true },
    });
    if (!sub) return 'FREE';
    // Treat any non-active sub as FREE
    if (sub.status && sub.status !== 'active' && sub.status !== 'trialing') {
      return 'FREE';
    }
    return sub.plan;
  } catch {
    return 'FREE';
  }
}

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
    const { category, season, occasion, color, search, limit } = req.query;

    const take = limit ? Math.max(1, Math.min(100, Number(limit))) : undefined;

    // Build full-text-ish search across the user's wardrobe.
    // Prisma string `contains` with `mode: 'insensitive'` is supported on Postgres.
    const q = typeof search === 'string' ? search.trim() : '';
    const searchFilter = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { brand: { contains: q, mode: 'insensitive' as const } },
            { material: { contains: q, mode: 'insensitive' as const } },
            { colors: { has: q.toLowerCase() } },
          ],
        }
      : {};

    const items = await prisma.clothingItem.findMany({
      where: {
        user_id: req.user!.userId,
        ...(category && { category: category as any }),
        ...(season && { season: season as any }),
        ...(occasion && { occasion: occasion as any }),
        ...(color && { colors: { has: color as string } }),
        ...searchFilter,
      },
      orderBy: { created_at: 'desc' },
      ...(take ? { take } : {}),
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

    // ── FREE plan hard limit (50 items) ──
    // Block additional adds and surface a friendly LIMIT notification.
    const plan = await getUserPlan(userId);
    if (plan === 'FREE') {
      const currentCount = await prisma.clothingItem.count({
        where: { user_id: userId },
      });
      if (currentCount >= FREE_PLAN_ITEM_LIMIT) {
        // Best-effort: surface a persistent ALERT notification
        await createNotification({
          user_id: userId,
          type: 'ALERT',
          title: 'Limite atteinte',
          message: `Vous avez atteint la limite de ${FREE_PLAN_ITEM_LIMIT} vêtements du plan Gratuit.`,
          link: '/pricing',
          link_label: 'Passer au Pro',
        });
        res.status(403).json({
          success: false,
          error: 'PLAN_LIMIT_REACHED',
          message: `Limite de ${FREE_PLAN_ITEM_LIMIT} vêtements atteinte sur le plan Gratuit.`,
        });
        return;
      }
    }

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

    // ── Auto-trigger LIMIT notifications (FREE plan only) ──
    if (plan === 'FREE') {
      try {
        const newCount = await prisma.clothingItem.count({
          where: { user_id: userId },
        });
        if (newCount === FREE_PLAN_WARN_AT) {
          await createNotification({
            user_id: userId,
            type: 'LIMIT',
            title: 'Limite bientôt atteinte',
            message:
              'Il vous reste 5 emplacements sur votre plan Gratuit. Passez au plan Pro pour continuer.',
            link: '/pricing',
            link_label: 'Voir les plans',
          });
        } else if (newCount === FREE_PLAN_ITEM_LIMIT) {
          await createNotification({
            user_id: userId,
            type: 'ALERT',
            title: 'Limite atteinte',
            message: `Vous avez atteint la limite de ${FREE_PLAN_ITEM_LIMIT} vêtements du plan Gratuit.`,
            link: '/pricing',
            link_label: 'Passer au Pro',
          });
        }
      } catch {
        // Notification creation must never block item creation
      }
    }

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

/**
 * POST /api/wardrobe/bulk
 *
 * Bulk-create clothing items in one request. Used by the bulk upload flow on
 * /wardrobe/add. Accepts multipart/form-data with:
 *   - photo_0, photo_1, …, photo_N  — image files (max 20)
 *   - items_meta                    — JSON string of metadata array, one entry
 *                                     per photo, in matching order
 *   - remove_bg                     — '1' (default) | '0'
 *
 * The free-plan limit is enforced for the entire batch up-front. Each photo is
 * uploaded to Cloudinary sequentially (to avoid rate limits) using the same
 * `processPhotoBuffer` helper as the single-item route, then a Prisma row is
 * created for each. Failures on individual items are skipped — successfully
 * created rows are still returned.
 */
export async function bulkCreateItems(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    // ── Parse metadata array ──
    const rawMeta = req.body.items_meta;
    let metas: Array<Record<string, unknown>> = [];
    if (typeof rawMeta === 'string') {
      try {
        metas = JSON.parse(rawMeta);
      } catch {
        res.status(400).json({ success: false, error: 'items_meta JSON invalide' });
        return;
      }
    } else if (Array.isArray(rawMeta)) {
      metas = rawMeta as Array<Record<string, unknown>>;
    }

    if (!Array.isArray(metas) || metas.length === 0) {
      res.status(400).json({ success: false, error: 'Aucun vêtement à enregistrer' });
      return;
    }
    if (metas.length > 20) {
      res.status(400).json({ success: false, error: 'Maximum 20 vêtements par lot' });
      return;
    }

    // ── Index uploaded photos by their field name ──
    // `photo_<i>`        → front photo (required)
    // `photo_back_<i>`   → back photo (optional, unlocks 360° view)
    const files = (req.files as Express.Multer.File[]) || [];
    const photoByIndex = new Map<number, Express.Multer.File>();
    const backPhotoByIndex = new Map<number, Express.Multer.File>();
    for (const f of files) {
      const back = /^photo_back_(\d+)$/.exec(f.fieldname);
      if (back) {
        backPhotoByIndex.set(parseInt(back[1], 10), f);
        continue;
      }
      const front = /^photo_(\d+)$/.exec(f.fieldname);
      if (front) photoByIndex.set(parseInt(front[1], 10), f);
    }

    // ── FREE plan limit (block whole batch if it would exceed) ──
    const plan = await getUserPlan(userId);
    if (plan === 'FREE') {
      const currentCount = await prisma.clothingItem.count({
        where: { user_id: userId },
      });
      if (currentCount + metas.length > FREE_PLAN_ITEM_LIMIT) {
        await createNotification({
          user_id: userId,
          type: 'ALERT',
          title: 'Limite atteinte',
          message: `L'ajout de ${metas.length} vêtements dépasserait la limite de ${FREE_PLAN_ITEM_LIMIT} du plan Gratuit.`,
          link: '/pricing',
          link_label: 'Passer au Pro',
        });
        res.status(403).json({
          success: false,
          error: 'PLAN_LIMIT_REACHED',
          message: `L'ajout de ${metas.length} vêtements dépasserait votre limite de ${FREE_PLAN_ITEM_LIMIT} sur le plan Gratuit.`,
        });
        return;
      }
    }

    const removeBg = req.body.remove_bg !== '0';
    const created: Array<Record<string, unknown>> = [];

    // ── Sequential upload + create (parallel would hit Cloudinary rate limits) ──
    for (let i = 0; i < metas.length; i++) {
      const meta = metas[i];
      const file = photoByIndex.get(i);
      if (!file) continue;

      try {
        const { url, bgUrl } = await processPhotoBuffer(file, removeBg);

        // Optional back photo
        let photo_back_url: string | undefined;
        let photo_back_removed: string | undefined;
        const backFile = backPhotoByIndex.get(i);
        if (backFile) {
          const backRes = await processPhotoBuffer(backFile, removeBg);
          photo_back_url = backRes.url;
          photo_back_removed = backRes.bgUrl;
        }

        const rawColors = meta.colors;
        let colors: string[] = [];
        if (Array.isArray(rawColors)) {
          colors = rawColors as string[];
        } else if (typeof rawColors === 'string') {
          try {
            const parsed = JSON.parse(rawColors);
            if (Array.isArray(parsed)) colors = parsed as string[];
          } catch {
            // ignore — leave colours empty
          }
        }

        const item = await prisma.clothingItem.create({
          data: {
            user_id: userId,
            name: (meta.name as string) || null,
            photo_url: url,
            bg_removed_url: bgUrl,
            photo_back_url: photo_back_url || null,
            photo_back_removed: photo_back_removed || null,
            has_360_view: !!photo_back_url,
            category: ((meta.category as string) || 'TOP') as any,
            colors,
            material: (meta.material as string) || undefined,
            season: ((meta.season as string) || 'ALL') as any,
            occasion: ((meta.occasion as string) || 'CASUAL') as any,
            brand: (meta.brand as string) || undefined,
            ai_tags: (meta.ai_tags as any) || undefined,
          },
        });

        created.push(item);
      } catch (err) {
        console.error(`Bulk create — item ${i} failed:`, err);
        // Continue with the rest of the batch
      }
    }

    // ── LIMIT warning notification (FREE plan only) ──
    if (plan === 'FREE') {
      try {
        const newCount = await prisma.clothingItem.count({
          where: { user_id: userId },
        });
        if (newCount >= FREE_PLAN_WARN_AT && newCount < FREE_PLAN_ITEM_LIMIT) {
          await createNotification({
            user_id: userId,
            type: 'LIMIT',
            title: 'Limite bientôt atteinte',
            message: `Il vous reste ${FREE_PLAN_ITEM_LIMIT - newCount} emplacements sur votre plan Gratuit.`,
            link: '/pricing',
            link_label: 'Voir les plans',
          });
        } else if (newCount >= FREE_PLAN_ITEM_LIMIT) {
          await createNotification({
            user_id: userId,
            type: 'ALERT',
            title: 'Limite atteinte',
            message: `Vous avez atteint la limite de ${FREE_PLAN_ITEM_LIMIT} vêtements du plan Gratuit.`,
            link: '/pricing',
            link_label: 'Passer au Pro',
          });
        }
      } catch {
        // Notification creation must never block the response
      }
    }

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Bulk create clothing items error:', error);
    res.status(500).json({ success: false, error: "Erreur lors de l'ajout en lot" });
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

/**
 * POST /api/wardrobe/try-on
 *
 * Body: { item_id: string, force?: boolean }
 *
 * Generates a virtual try-on of the item on the user's reference avatar via
 * Replicate's IDM-VTON. Caches the result on `clothing_item.try_on_url` so a
 * second request returns instantly. Pass `force: true` to bypass the cache.
 */
export async function tryOnItem(req: Request, res: Response): Promise<void> {
  try {
    const { item_id, force } = req.body as { item_id?: string; force?: boolean };
    const userId = req.user!.userId;

    if (!item_id || typeof item_id !== 'string') {
      res.status(400).json({
        success: false,
        error: 'MISSING_ITEM_ID',
        message: 'item_id requis',
      });
      return;
    }

    // 1. Verify item ownership
    const item = await prisma.clothingItem.findFirst({
      where: { id: item_id, user_id: userId },
    });
    if (!item) {
      res.status(404).json({
        success: false,
        error: 'ITEM_NOT_FOUND',
        message: 'Vêtement introuvable',
      });
      return;
    }

    // 2. Verify user has uploaded a body reference photo
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar_body_url: true },
    });

    if (!user?.avatar_body_url) {
      res.status(400).json({
        success: false,
        error: 'NO_AVATAR',
        message: 'Ajoutez une photo de référence dans votre profil',
      });
      return;
    }

    // 3. Cache hit — return existing try-on (unless force=true)
    if (!force && item.try_on_url) {
      res.json({
        success: true,
        data: { url: item.try_on_url, cached: true },
      });
      return;
    }

    // 4. Build a short garment description for the model
    const garmentDesc = [
      item.category,
      Array.isArray(item.colors) ? item.colors.join(' ') : '',
      item.material || '',
      item.name || '',
    ]
      .filter(Boolean)
      .join(', ');

    const garmentPhoto = item.bg_removed_url || item.photo_url;

    // 5. Generate via Replicate
    let tryOnUrl: string;
    try {
      tryOnUrl = await virtualTryOn(user.avatar_body_url, garmentPhoto, garmentDesc);
    } catch (err) {
      const e = err as { message?: string };
      console.error('Try-on error:', e);
      res.status(500).json({
        success: false,
        error: 'TRYON_FAILED',
        message: e.message || 'Essayage virtuel indisponible. Réessayez.',
      });
      return;
    }

    // 6. Persist to the item so future loads are instant
    await prisma.clothingItem.update({
      where: { id: item_id },
      data: { try_on_url: tryOnUrl },
    });

    res.json({ success: true, data: { url: tryOnUrl, cached: false } });
  } catch (error) {
    console.error('tryOnItem error:', error);
    res.status(500).json({
      success: false,
      error: 'TRYON_FAILED',
      message: 'Essayage virtuel indisponible. Réessayez.',
    });
  }
}
