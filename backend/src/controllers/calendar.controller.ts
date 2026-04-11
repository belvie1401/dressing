import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getEntries(req: Request, res: Response): Promise<void> {
  try {
    const { month, year, week, upcoming, limit } = req.query;

    let dateFilter: Record<string, unknown> = {};

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
      dateFilter = { date: { gte: start, lte: end } };
    } else if (week === 'current') {
      // Monday → Sunday of the current week
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 Sun - 6 Sat
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      dateFilter = { date: { gte: monday, lte: sunday } };
    } else if (upcoming === 'true') {
      dateFilter = { date: { gte: new Date() } };
    }

    const take = limit ? Math.max(1, Math.min(100, Number(limit))) : undefined;

    const entries = await prisma.calendarEntry.findMany({
      where: {
        user_id: req.user!.userId,
        ...dateFilter,
      },
      include: {
        outfit: {
          include: {
            items: {
              include: { item: true },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
      ...(take ? { take } : {}),
    });

    // Hydrate client info for stylist events
    const clientIds = entries
      .map((e) => e.client_id)
      .filter((id): id is string => !!id);

    const clients = clientIds.length
      ? await prisma.user.findMany({
          where: { id: { in: Array.from(new Set(clientIds)) } },
          select: { id: true, name: true, avatar_url: true },
        })
      : [];

    const clientMap = new Map(clients.map((c) => [c.id, c]));
    const hydrated = entries.map((e) => ({
      ...e,
      client: e.client_id ? clientMap.get(e.client_id) || null : null,
    }));

    res.json({ success: true, data: hydrated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération du calendrier' });
  }
}

export async function getEntry(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const entry = await prisma.calendarEntry.findFirst({
      where: {
        id,
        user_id: req.user!.userId,
      },
      include: {
        outfit: {
          include: {
            items: {
              include: { item: true },
            },
          },
        },
      },
    });

    if (!entry) {
      res.status(404).json({ success: false, error: 'Entrée non trouvée' });
      return;
    }

    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function createEntry(req: Request, res: Response): Promise<void> {
  try {
    const {
      outfit_id,
      date,
      weather_data,
      notes,
      client_id,
      event_type,
      duration_min,
      zoom_link,
      title,
    } = req.body;

    if (!date) {
      res.status(400).json({ success: false, error: 'La date est requise' });
      return;
    }

    const entry = await prisma.calendarEntry.create({
      data: {
        user_id: req.user!.userId,
        outfit_id: outfit_id || null,
        date: new Date(date),
        weather_data,
        notes,
        client_id: client_id || null,
        event_type: event_type || null,
        duration_min: duration_min ? Number(duration_min) : null,
        zoom_link: zoom_link || null,
        title: title || null,
      },
      include: {
        outfit: {
          include: {
            items: {
              include: { item: true },
            },
          },
        },
      },
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    console.error('Create calendar entry error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la création' });
  }
}

/**
 * POST /api/calendar/book
 * Client books a session with a stylist.
 * Creates mirrored entries on both sides.
 */
export async function bookSession(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { stylist_id, date, duration_min, price, notes } = req.body;

    if (!stylist_id || !date || !duration_min) {
      res.status(400).json({
        success: false,
        error: 'stylist_id, date et duration_min sont requis',
      });
      return;
    }

    const stylist = await prisma.user.findUnique({
      where: { id: stylist_id },
      select: { id: true, role: true, name: true },
    });
    if (!stylist) {
      res.status(404).json({ success: false, error: 'Styliste non trouvé' });
      return;
    }

    const client = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    const bookingDate = new Date(date);

    // Client-side entry
    const clientEntry = await prisma.calendarEntry.create({
      data: {
        user_id: userId,
        date: bookingDate,
        event_type: 'BOOKING',
        duration_min: Number(duration_min),
        title: `Session avec ${stylist.name}`,
        notes: notes || null,
      },
    });

    // Stylist-side entry
    await prisma.calendarEntry.create({
      data: {
        user_id: stylist_id,
        date: bookingDate,
        event_type: 'BOOKING',
        duration_min: Number(duration_min),
        client_id: userId,
        title: `Session avec ${client?.name ?? 'Client'}`,
      },
    });

    res.status(201).json({
      success: true,
      data: { ...clientEntry, price: price ?? null },
    });
  } catch (error) {
    console.error('Book session error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la réservation' });
  }
}

export async function updateEntry(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const entry = await prisma.calendarEntry.findFirst({
      where: { id, user_id: req.user!.userId },
    });

    if (!entry) {
      res.status(404).json({ success: false, error: 'Entrée non trouvée' });
      return;
    }

    const {
      outfit_id,
      date,
      weather_data,
      notes,
      client_id,
      event_type,
      duration_min,
      zoom_link,
      title,
    } = req.body;

    const updated = await prisma.calendarEntry.update({
      where: { id },
      data: {
        ...(outfit_id !== undefined && { outfit_id: outfit_id || null }),
        ...(date && { date: new Date(date) }),
        ...(weather_data && { weather_data }),
        ...(notes !== undefined && { notes }),
        ...(client_id !== undefined && { client_id: client_id || null }),
        ...(event_type !== undefined && { event_type: event_type || null }),
        ...(duration_min !== undefined && {
          duration_min: duration_min ? Number(duration_min) : null,
        }),
        ...(zoom_link !== undefined && { zoom_link: zoom_link || null }),
        ...(title !== undefined && { title: title || null }),
      },
      include: {
        outfit: {
          include: {
            items: {
              include: { item: true },
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

export async function deleteEntry(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const entry = await prisma.calendarEntry.findFirst({
      where: { id, user_id: req.user!.userId },
    });

    if (!entry) {
      res.status(404).json({ success: false, error: 'Entrée non trouvée' });
      return;
    }

    await prisma.calendarEntry.delete({ where: { id } });

    res.json({ success: true, data: { message: 'Entrée supprimée' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression' });
  }
}

/**
 * GET /api/calendar/agenda-stats
 * Planning stats for stylists:
 *  - occupation_rate: % of 8-hour workdays filled this month with appointments
 *  - average_duration_min: avg duration_min across this month's appointments
 *  - cancellation_rate: % of deleted (past) slots (placeholder: 0 for new accounts)
 *  - pending_count: pending appointments (upcoming, no outfit linked → considered waiting)
 */
export async function getAgendaStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const entries = await prisma.calendarEntry.findMany({
      where: {
        user_id: userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { duration_min: true, date: true },
    });

    const totalMinutes = entries.reduce(
      (acc, e) => acc + (e.duration_min ?? 0),
      0
    );

    const averageDuration = entries.length > 0
      ? Math.round(totalMinutes / entries.length)
      : 0;

    // Occupation: total booked minutes / (workdays in month * 8h * 60)
    const daysInMonth = endOfMonth.getDate();
    let workDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(now.getFullYear(), now.getMonth(), d).getDay();
      if (dow !== 0 && dow !== 6) workDays++;
    }
    const workCapacityMin = workDays * 8 * 60;
    const occupationRate = workCapacityMin > 0
      ? Math.min(100, Math.round((totalMinutes / workCapacityMin) * 100))
      : 0;

    // Pending requests = upcoming entries without linked outfit/title
    const pendingCount = await prisma.calendarEntry.count({
      where: {
        user_id: userId,
        date: { gte: now },
      },
    });

    res.json({
      success: true,
      data: {
        occupation_rate: occupationRate,
        average_duration_min: averageDuration,
        cancellation_rate: 0,
        pending_count: pendingCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors du calcul des statistiques agenda',
    });
  }
}
