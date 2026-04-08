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

    res.json({ success: true, data: entries });
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
    const { outfit_id, date, weather_data, notes } = req.body;

    const entry = await prisma.calendarEntry.create({
      data: {
        user_id: req.user!.userId,
        outfit_id,
        date: new Date(date),
        weather_data,
        notes,
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

    const { outfit_id, date, weather_data, notes } = req.body;

    const updated = await prisma.calendarEntry.update({
      where: { id },
      data: {
        ...(outfit_id && { outfit_id }),
        ...(date && { date: new Date(date) }),
        ...(weather_data && { weather_data }),
        ...(notes !== undefined && { notes }),
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
