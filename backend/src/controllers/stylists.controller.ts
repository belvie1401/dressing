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
    const { search, limit } = req.query;
    const take = limit ? Math.max(1, Math.min(100, Number(limit))) : undefined;
    const q = typeof search === 'string' ? search.trim() : '';

    const searchFilter = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
            { location: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const stylists = await prisma.user.findMany({
      where: { role: 'STYLIST', ...searchFilter },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        style_profile: true,
        location: true,
      },
      ...(take ? { take } : {}),
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

/**
 * GET /api/stylists/stats
 * Stylist-scoped KPIs for the dashboard top cards.
 * - active_clients: number of ACTIVE client connections
 * - active_clients_delta: new active clients this month
 * - managed_pieces: total clothing items across all active clients
 * - managed_pieces_delta: items added this month across active clients
 * - appointments_this_week: appointments in current ISO week
 */
export async function getStylistStats(req: Request, res: Response): Promise<void> {
  try {
    if (req.user!.role !== 'STYLIST') {
      res.status(403).json({ success: false, error: 'Réservé aux stylistes' });
      return;
    }

    const stylistId = req.user!.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Active clients
    const activeConnections = await prisma.stylistClient.findMany({
      where: { stylist_id: stylistId, status: 'ACTIVE' },
      select: { client_id: true, started_at: true },
    });
    const activeClients = activeConnections.length;
    const activeClientsDelta = activeConnections.filter(
      (c) => c.started_at && c.started_at >= startOfMonth
    ).length;

    const clientIds = activeConnections.map((c) => c.client_id);

    // Managed pieces = total clothing across clients
    const managedPieces = clientIds.length
      ? await prisma.clothingItem.count({
          where: { user_id: { in: clientIds } },
        })
      : 0;

    const managedPiecesDelta = clientIds.length
      ? await prisma.clothingItem.count({
          where: {
            user_id: { in: clientIds },
            created_at: { gte: startOfMonth },
          },
        })
      : 0;

    // Appointments this week (Mon-Sun)
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const appointmentsThisWeek = await prisma.calendarEntry.count({
      where: {
        user_id: stylistId,
        date: { gte: monday, lte: sunday },
      },
    });

    res.json({
      success: true,
      data: {
        active_clients: activeClients,
        active_clients_delta: activeClientsDelta,
        managed_pieces: managedPieces,
        managed_pieces_delta: managedPiecesDelta,
        appointments_this_week: appointmentsThisWeek,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors du calcul des statistiques' });
  }
}

/**
 * GET /api/stylists/clients?limit=N
 * Returns this stylist's ACTIVE clients with hydrated wardrobe count.
 */
export async function getStylistClients(req: Request, res: Response): Promise<void> {
  try {
    if (req.user!.role !== 'STYLIST') {
      res.status(403).json({ success: false, error: 'Réservé aux stylistes' });
      return;
    }

    const stylistId = req.user!.userId;
    const limit = req.query.limit
      ? Math.max(1, Math.min(50, Number(req.query.limit)))
      : undefined;

    const connections = await prisma.stylistClient.findMany({
      where: { stylist_id: stylistId, status: 'ACTIVE' },
      include: {
        client: {
          select: { id: true, name: true, avatar_url: true, email: true, style_profile: true },
        },
      },
      orderBy: { started_at: 'desc' },
      ...(limit ? { take: limit } : {}),
    });

    const clientIds = connections.map((c) => c.client_id);

    // Count items per client
    const itemCounts = clientIds.length
      ? await prisma.clothingItem.groupBy({
          by: ['user_id'],
          where: { user_id: { in: clientIds } },
          _count: { id: true },
          _max: { created_at: true },
        })
      : [];

    const countMap = new Map(
      itemCounts.map((c) => [c.user_id, { count: c._count.id, last: c._max.created_at }])
    );

    const data = connections.map((c) => {
      const stats = countMap.get(c.client_id);
      const profile = c.client?.style_profile as Record<string, unknown> | null;
      const tags = Array.isArray(profile?.tags) ? (profile!.tags as string[]) : [];
      return {
        id: c.client_id,
        name: c.client?.name || '',
        avatar_url: c.client?.avatar_url || null,
        email: c.client?.email || null,
        pieces: stats?.count ?? 0,
        last_update: stats?.last ?? null,
        tags,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des clientes' });
  }
}

/**
 * GET /api/stylists/requests/pending
 * Pending client invitations for this stylist.
 */
export async function getPendingRequests(req: Request, res: Response): Promise<void> {
  try {
    if (req.user!.role !== 'STYLIST') {
      res.status(403).json({ success: false, error: 'Réservé aux stylistes' });
      return;
    }

    const stylistId = req.user!.userId;
    const requests = await prisma.stylistClient.findMany({
      where: { stylist_id: stylistId, status: 'PENDING' },
      include: {
        client: {
          select: { id: true, name: true, avatar_url: true, email: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({
      success: true,
      data: {
        count: requests.length,
        requests: requests.map((r) => ({
          id: r.id,
          client: r.client,
          created_at: r.created_at,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * GET /api/stylists/sessions/count
 * Number of ACTIVE stylist connections from the perspective of the authenticated user.
 * - CLIENT: sessions they have with stylists
 * - STYLIST: sessions they have with clients
 */
export async function getSessionsCount(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    const count = await prisma.stylistClient.count({
      where: {
        status: 'ACTIVE',
        ...(role === 'STYLIST' ? { stylist_id: userId } : { client_id: userId }),
      },
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * GET /api/stylists/objectives
 * Monthly objectives for the stylist. Targets are stored in style_profile.objectives
 * (when set), otherwise default to 0-target placeholders for new accounts.
 * Progress values come from live DB counts.
 */
export async function getStylistObjectives(req: Request, res: Response): Promise<void> {
  try {
    if (req.user!.role !== 'STYLIST') {
      res.status(403).json({ success: false, error: 'Réservé aux stylistes' });
      return;
    }

    const stylistId = req.user!.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const user = await prisma.user.findUnique({
      where: { id: stylistId },
      select: { style_profile: true },
    });
    const profile = (user?.style_profile as Record<string, unknown>) || {};
    const objectives = (profile.objectives as Record<string, number> | undefined) || {};

    const targetNewClients = Number(objectives.new_clients_target ?? 0);
    const targetLookbooks = Number(objectives.lookbooks_target ?? 0);
    const targetRevenue = Number(objectives.revenue_target ?? 0);

    // Progress: new ACTIVE clients started this month
    const newClients = await prisma.stylistClient.count({
      where: {
        stylist_id: stylistId,
        status: 'ACTIVE',
        started_at: { gte: startOfMonth },
      },
    });

    // Progress: lookbooks created this month
    const lookbooksCreated = await prisma.lookbook.count({
      where: {
        stylist_id: stylistId,
        created_at: { gte: startOfMonth },
      },
    });

    // Progress: completed transactions this month (net revenue)
    const txs = await prisma.transaction.findMany({
      where: {
        stylist_id: stylistId,
        status: 'COMPLETED',
        completed_at: { gte: startOfMonth },
      },
      select: { net_amount: true },
    });
    const revenue = txs.reduce((acc, t) => acc + (t.net_amount || 0), 0);

    res.json({
      success: true,
      data: {
        month: now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        new_clients: { current: newClients, target: targetNewClients },
        lookbooks: { current: lookbooksCreated, target: targetLookbooks },
        revenue: { current: Number(revenue.toFixed(2)), target: targetRevenue },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des objectifs' });
  }
}

/**
 * GET /api/stylists/me/reviews
 * Returns the authenticated stylist's client reviews.
 * No reviews model exists yet, so returns [] for new accounts.
 */
export async function getMyReviews(req: Request, res: Response): Promise<void> {
  try {
    if (req.user!.role !== 'STYLIST') {
      res.status(403).json({ success: false, error: 'Réservé aux stylistes' });
      return;
    }
    // No Review model in schema yet — return empty until implemented.
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * GET /api/stylists/me/public-stats
 * Computes public-facing stats for the stylist's own profile page:
 *   - looks_created: number of Lookbooks authored
 *   - satisfaction_percent: % approved lookbooks vs (approved + rejected)
 *   - experience_years: years since account creation (or null if < 1)
 */
export async function getMyPublicStats(req: Request, res: Response): Promise<void> {
  try {
    if (req.user!.role !== 'STYLIST') {
      res.status(403).json({ success: false, error: 'Réservé aux stylistes' });
      return;
    }
    const userId = req.user!.userId;

    const [looksCreated, approved, rejected, user] = await Promise.all([
      prisma.lookbook.count({ where: { stylist_id: userId } }),
      prisma.lookbook.count({ where: { stylist_id: userId, status: 'APPROVED' } }),
      prisma.lookbook.count({ where: { stylist_id: userId, status: 'REJECTED' } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { created_at: true },
      }),
    ]);

    const totalRated = approved + rejected;
    const satisfactionPercent = totalRated > 0
      ? Math.round((approved / totalRated) * 100)
      : null;

    let experienceYears: number | null = null;
    if (user?.created_at) {
      const ageMs = Date.now() - new Date(user.created_at).getTime();
      const years = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
      experienceYears = years >= 1 ? years : null;
    }

    res.json({
      success: true,
      data: {
        looks_created: looksCreated,
        satisfaction_percent: satisfactionPercent,
        experience_years: experienceYears,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * GET /api/stylists/search?q=...
 * Search across this stylist's ACTIVE clients (name + location) and their
 * wardrobe items (item name, brand). Returns a small grouped result set.
 */
export async function searchStylistScope(req: Request, res: Response): Promise<void> {
  try {
    if (req.user!.role !== 'STYLIST') {
      res.status(403).json({ success: false, error: 'Réservé aux stylistes' });
      return;
    }

    const stylistId = req.user!.userId;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (!q || q.length < 2) {
      res.json({ success: true, data: { clients: [], items: [] } });
      return;
    }

    // Active client IDs for this stylist
    const connections = await prisma.stylistClient.findMany({
      where: { stylist_id: stylistId, status: 'ACTIVE' },
      select: { client_id: true },
    });
    const clientIds = connections.map((c) => c.client_id);

    if (clientIds.length === 0) {
      res.json({ success: true, data: { clients: [], items: [] } });
      return;
    }

    const [clients, items] = await Promise.all([
      prisma.user.findMany({
        where: {
          id: { in: clientIds },
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          avatar_url: true,
          email: true,
          location: true,
        },
        take: 8,
      }),
      prisma.clothingItem.findMany({
        where: {
          user_id: { in: clientIds },
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { brand: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          user_id: true,
          name: true,
          brand: true,
          category: true,
          photo_url: true,
          bg_removed_url: true,
        },
        take: 8,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    // Hydrate item.client name so the dropdown can show it
    const ownerMap = new Map(clientIds.map((id) => [id, '']));
    if (items.length > 0) {
      const owners = await prisma.user.findMany({
        where: { id: { in: items.map((i) => i.user_id) } },
        select: { id: true, name: true },
      });
      for (const o of owners) ownerMap.set(o.id, o.name);
    }

    const itemsHydrated = items.map((i) => ({
      ...i,
      client_name: ownerMap.get(i.user_id) || '',
    }));

    res.json({ success: true, data: { clients, items: itemsHydrated } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la recherche' });
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
