import { Router } from 'express';
import {
  listMine,
  markRead,
  markAllRead,
  removeOne,
  adminSend,
  adminHistory,
  adminSearchUsers,
} from '../controllers/notifications.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─── User-facing routes (mounted at /api/notifications) ─────────────────────
const userRouter = Router();
userRouter.use(authenticate);
userRouter.get('/', listMine);
userRouter.post('/read-all', markAllRead);
userRouter.post('/:id/read', markRead);
userRouter.delete('/:id', removeOne);

// ─── Admin routes (mounted at /api/admin) ───────────────────────────────────
const adminRouter = Router();
adminRouter.use(authenticate, requireRole(['ADMIN']));
adminRouter.post('/notifications/send', adminSend);
adminRouter.get('/notifications/history', adminHistory);
adminRouter.get('/users', adminSearchUsers);

export { userRouter as notificationsRouter, adminRouter };
export default userRouter;
