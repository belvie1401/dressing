import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getConversations(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    // Get all users the current user has exchanged messages with
    const sentTo = await prisma.message.findMany({
      where: { from_id: userId },
      select: { to_id: true },
      distinct: ['to_id'],
    });

    const receivedFrom = await prisma.message.findMany({
      where: { to_id: userId },
      select: { from_id: true },
      distinct: ['from_id'],
    });

    const contactIds = new Set([
      ...sentTo.map((m) => m.to_id),
      ...receivedFrom.map((m) => m.from_id),
    ]);

    const conversations = await Promise.all(
      Array.from(contactIds).map(async (contactId) => {
        const contact = await prisma.user.findUnique({
          where: { id: contactId },
          select: { id: true, name: true, avatar_url: true, role: true },
        });

        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { from_id: userId, to_id: contactId },
              { from_id: contactId, to_id: userId },
            ],
          },
          orderBy: { created_at: 'desc' },
        });

        const unreadCount = await prisma.message.count({
          where: {
            from_id: contactId,
            to_id: userId,
            read_at: null,
          },
        });

        return {
          contact,
          lastMessage,
          unreadCount,
        };
      })
    );

    // Sort by last message date
    conversations.sort((a, b) => {
      const dateA = a.lastMessage?.created_at?.getTime() || 0;
      const dateB = b.lastMessage?.created_at?.getTime() || 0;
      return dateB - dateA;
    });

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des conversations' });
  }
}

export async function getMessages(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const otherUserId = req.params.userId as string;
    const { cursor, limit = '50' } = req.query;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { from_id: userId, to_id: otherUserId },
          { from_id: otherUserId, to_id: userId },
        ],
        ...(cursor && { created_at: { lt: new Date(cursor as string) } }),
      },
      orderBy: { created_at: 'desc' },
      take: parseInt(limit as string),
      include: {
        from: {
          select: { id: true, name: true, avatar_url: true },
        },
      },
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        from_id: otherUserId as string,
        to_id: userId,
        read_at: null,
      },
      data: { read_at: new Date() },
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des messages' });
  }
}
