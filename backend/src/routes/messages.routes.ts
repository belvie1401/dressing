import { Router } from 'express';
import { getConversations, getMessages, getUnreadCount } from '../controllers/messages.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/:userId', getMessages);

export default router;
