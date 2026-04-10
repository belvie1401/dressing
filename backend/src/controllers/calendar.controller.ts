import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getEntries(req: Request, res: Response): Promise<void> {
  try {
    const { month, year } = req.query;

    let dateFilter = {};
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
      dateFilter = { date: { gte: start, lte: end } };
    }

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
