import { Request, Response } from 'express';
import prisma from '../lib/prisma';

type ActivityItem = {
  kind: 'item_added' | 'outfit_created' | 'message_received' | 'favorite_added';
  text: string;
  at: string;
  thumb?: string | null;
  avatar?: string | null;
};

/**
 * GET /api/activity?limit=N
 * Merged stream of recent user events:
 *  - clothing items added
 *  - outfits created
 *  - messages received
 */
export async function getActivity(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const limit = req.query.limit
      ? Math.max(1, Math.min(50, Number(req.query.limit)))
      : 10;

    const perKind = Math.max(1, Math.ceil(limit));

    const [items, outfits, messages] = await Promise.all([
      prisma.clothingItem.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: perKind,
        select: {
          id: true,
          category: true,
          brand: true,
          photo_url: true,
          created_at: true,
        },
      }),
      prisma.outfit.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: perKind,
        select: { id: true, name: true, created_at: true },
      }),
      prisma.message.findMany({
        where: { to_id: userId },
        orderBy: { created_at: 'desc' },
        take: perKind,
        include: {
          from: {
            select: { name: true, avatar_url: true },
          },
        },
      }),
    ]);

    const stream: (ActivityItem & { ts: number })[] = [];

    for (const it of items) {
      stream.push({
        kind: 'item_added',
        text: it.brand
          ? `${it.brand} ajouté à votre dressing`
          : `Nouveau vêtement ajouté`,
        at: it.created_at.toISOString(),
        thumb: it.photo_url || null,
        ts: it.created_at.getTime(),
      });
    }

    for (const o of outfits) {
      stream.push({
        kind: 'outfit_created',
        text: `Look « ${o.name} » créé`,
        at: o.created_at.toISOString(),
        ts: o.created_at.getTime(),
      });
    }

    for (const m of messages) {
      const fromName = m.from?.name?.split(' ')[0] || 'Quelqu’un';
      stream.push({
        kind: 'message_received',
        text: `${fromName} vous a envoyé un message`,
        at: m.created_at.toISOString(),
        avatar: m.from?.avatar_url || null,
        ts: m.created_at.getTime(),
      });
    }

    stream.sort((a, b) => b.ts - a.ts);
    const out = stream.slice(0, limit).map(({ ts: _ts, ...rest }) => rest);

    res.json({ success: true, data: out });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération de l\'activité' });
  }
}
