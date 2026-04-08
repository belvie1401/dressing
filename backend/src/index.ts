import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { setupSocket } from './socket/socket.handler';
import { errorMiddleware } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import wardrobeRoutes from './routes/wardrobe.routes';
import outfitsRoutes from './routes/outfits.routes';
import calendarRoutes from './routes/calendar.routes';
import stylistsRoutes from './routes/stylists.routes';
import lookbooksRoutes from './routes/lookbooks.routes';
import messagesRoutes from './routes/messages.routes';
import aiRoutes from './routes/ai.routes';
import weatherRoutes from './routes/weather.routes';
import subscriptionsRoutes from './routes/subscriptions.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/outfits', outfitsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/stylists', stylistsRoutes);
app.use('/api/lookbooks', lookbooksRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// Socket.io
setupSocket(io);

// Error middleware (must be last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
export default app;
