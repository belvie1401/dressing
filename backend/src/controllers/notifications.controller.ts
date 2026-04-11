import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const VALID_TYPES = ['PROMO', 'ALERT', 'INFO', 'LIMIT', 'SYSTEM'] as const;
const VALID_TARGETS = ['ALL', 'CLIENTS', 'STYLISTS', 'SPECIFIC'] as const;
type NotifType = (typeof VALID_TYPES)[number];

function isValidType(t: unknown): t is NotifType {
  return typeof t === 'string' && (VALID_TYPES as readonly string[]).includes(t);
}

// ─── User-facing endpoints ───────────────────────────────────────────────────

/**
 * GET /api/notifications?limit=20&page=1
 * Returns the authenticated user's notifications, unread first, newest first.
 */
export async function listMine(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const limit = req.query.limit
      ? Math.max(1, Math.min(100, Number(req.query.limit)))
      : 20;
    const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    const skip = (page - 1) * limit;

    const now = new Date();
    const where = {
      user_id: userId,
      OR: [{ expires_at: null }, { expires_at: { gt: now } }],
    };

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: [{ read: 'asc' }, { sent_at: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, read: false } }),
    ]);

    res.json({
      success: true,
      data: { items, total, unread_count: unreadCount, page, limit },
    });
  } catch (error) {
    console.error('List notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du chargement des notifications',
    });
  }
}

/** POST /api/notifications/:id/read */
export async function markRead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;

    const notif = await prisma.notification.findFirst({
      where: { id, user_id: userId },
    });
    if (!notif) {
      res.status(404).json({ success: false, error: 'Notification introuvable' });
      return;
    }

    if (!notif.read) {
      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
      // Increment broadcast read counter (best effort)
      if (notif.broadcast_id) {
        try {
          await prisma.adminBroadcast.update({
            where: { id: notif.broadcast_id },
            data: { read_count: { increment: 1 } },
          });
        } catch {
          // Broadcast row may be missing — ignore
        }
      }
    }

    res.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/** POST /api/notifications/read-all */
export async function markAllRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await prisma.notification.updateMany({
      where: { user_id: userId, read: false },
      data: { read: true },
    });
    res.json({ success: true, data: { updated: result.count } });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/** DELETE /api/notifications/:id */
export async function removeOne(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;

    const notif = await prisma.notification.findFirst({
      where: { id, user_id: userId },
    });
    if (!notif) {
      res.status(404).json({ success: false, error: 'Notification introuvable' });
      return;
    }

    await prisma.notification.delete({ where: { id } });
    res.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression' });
  }
}

// ─── Admin endpoints ─────────────────────────────────────────────────────────

/**
 * POST /api/admin/notifications/send
 * Body: { type, title, message, target, link?, link_label?, expires_at? }
 * Target: 'ALL' | 'CLIENTS' | 'STYLISTS' | <user_id>
 */
export async function adminSend(req: Request, res: Response): Promise<void> {
  try {
    const { type, title, message, target, link, link_label, expires_at } =
      req.body as {
        type?: string;
        title?: string;
        message?: string;
        target?: string;
        link?: string;
        link_label?: string;
        expires_at?: string;
      };

    if (!isValidType(type)) {
      res.status(400).json({ success: false, error: 'Type de notification invalide' });
      return;
    }
    if (!title || !message || !target) {
      res.status(400).json({
        success: false,
        error: 'Titre, message et destinataires requis',
      });
      return;
    }
    if (title.length > 60) {
      res.status(400).json({
        success: false,
        error: 'Le titre dépasse 60 caractères',
      });
      return;
    }
    if (message.length > 200) {
      res.status(400).json({
        success: false,
        error: 'Le message dépasse 200 caractères',
      });
      return;
    }

    // Resolve recipients
    let recipients: { id: string }[] = [];
    let targetLabel: string;

    if (target === 'ALL') {
      recipients = await prisma.user.findMany({ select: { id: true } });
      targetLabel = 'ALL';
    } else if (target === 'CLIENTS') {
      recipients = await prisma.user.findMany({
        where: { role: 'CLIENT' },
        select: { id: true },
      });
      targetLabel = 'CLIENTS';
    } else if (target === 'STYLISTS') {
      recipients = await prisma.user.findMany({
        where: { role: 'STYLIST' },
        select: { id: true },
      });
      targetLabel = 'STYLISTS';
    } else {
      // Treat any other value as a specific user_id
      const user = await prisma.user.findUnique({
        where: { id: target },
        select: { id: true },
      });
      if (!user) {
        res
          .status(404)
          .json({ success: false, error: 'Utilisateur introuvable' });
        return;
      }
      recipients = [user];
      targetLabel = 'SPECIFIC';
    }

    if (recipients.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Aucun destinataire pour cette cible',
      });
      return;
    }

    const expiresDate = expires_at ? new Date(expires_at) : null;

    // Create the broadcast log row first so we can stamp every fan-out row.
    const broadcast = await prisma.adminBroadcast.create({
      data: {
        type,
        title,
        message,
        target: targetLabel,
        link: link || null,
        link_label: link_label || null,
        expires_at: expiresDate,
        sent_by: req.user!.userId,
        total_sent: recipients.length,
      },
    });

    // Fan-out: one Notification row per recipient.
    await prisma.notification.createMany({
      data: recipients.map((r) => ({
        user_id: r.id,
        type,
        title,
        message,
        link: link || null,
        link_label: link_label || null,
        expires_at: expiresDate,
        broadcast_id: broadcast.id,
      })),
    });

    res.json({
      success: true,
      data: { sent_count: recipients.length, broadcast_id: broadcast.id },
    });
  } catch (error) {
    console.error('Admin send notification error:', error);
    res
      .status(500)
      .json({ success: false, error: "Erreur lors de l'envoi de la notification" });
  }
}

/** GET /api/admin/notifications/history */
export async function adminHistory(_req: Request, res: Response): Promise<void> {
  try {
    const broadcasts = await prisma.adminBroadcast.findMany({
      orderBy: { sent_at: 'desc' },
      take: 100,
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
    });
    res.json({ success: true, data: broadcasts });
  } catch (error) {
    console.error('Admin history error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * GET /api/admin/users?search=query
 * Lightweight live-search used by the admin send form to pick a specific user.
 */
export async function adminSearchUsers(req: Request, res: Response): Promise<void> {
  try {
    const search = (req.query.search as string | undefined) ?? '';
    const q = search.trim();

    const where = q
      ? {
          OR: [
            { email: { contains: q, mode: 'insensitive' as const } },
            { name: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar_url: true,
      },
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin search users error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

// ─── Internal helper used by other controllers (e.g. wardrobe.createItem) ───
/**
 * Creates a single notification for a user. Designed to be called from
 * other controllers without throwing — failure is logged but never rethrown.
 */
export async function createNotification(input: {
  user_id: string;
  type: NotifType;
  title: string;
  message: string;
  link?: string;
  link_label?: string;
  expires_at?: Date;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        user_id: input.user_id,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link ?? null,
        link_label: input.link_label ?? null,
        expires_at: input.expires_at ?? null,
      },
    });
  } catch (err) {
    console.error('createNotification failed:', err);
  }
}
