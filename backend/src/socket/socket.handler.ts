import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

const onlineUsers = new Map<string, string>(); // userId -> socketId

export function setupSocket(io: Server): void {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    onlineUsers.set(userId, socket.id);

    // Broadcast online status
    io.emit('user:online', { userId, online: true });

    console.log(`User connected: ${userId}`);

    // Send message
    socket.on('message:send', async (data: {
      to_id: string;
      content: string;
      type?: string;
      metadata?: Record<string, unknown>;
    }) => {
      try {
        const message = await prisma.message.create({
          data: {
            from_id: userId,
            to_id: data.to_id,
            content: data.content,
            type: (data.type as any) || 'TEXT',
            metadata: (data.metadata as any) || undefined,
          },
          include: {
            from: {
              select: { id: true, name: true, avatar_url: true },
            },
          },
        });

        // Emit to recipient if online
        const recipientSocketId = onlineUsers.get(data.to_id);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message:received', message);
        }

        // Confirm to sender
        socket.emit('message:sent', message);
      } catch (error) {
        socket.emit('message:error', { error: 'Erreur lors de l\'envoi du message' });
      }
    });

    // Mark message as read
    socket.on('message:read', async (data: { from_id: string }) => {
      try {
        await prisma.message.updateMany({
          where: {
            from_id: data.from_id,
            to_id: userId,
            read_at: null,
          },
          data: { read_at: new Date() },
        });

        // Notify the sender that messages were read
        const senderSocketId = onlineUsers.get(data.from_id);
        if (senderSocketId) {
          io.to(senderSocketId).emit('message:read', { by: userId });
        }
      } catch (error) {
        socket.emit('message:error', { error: 'Erreur serveur' });
      }
    });

    // Lookbook shared notification
    socket.on('lookbook:shared', (data: { client_id: string; lookbook_id: string }) => {
      const clientSocketId = onlineUsers.get(data.client_id);
      if (clientSocketId) {
        io.to(clientSocketId).emit('lookbook:received', {
          lookbook_id: data.lookbook_id,
          from: userId,
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user:online', { userId, online: false });
      console.log(`User disconnected: ${userId}`);
    });
  });
}
