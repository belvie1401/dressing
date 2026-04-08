import { Router } from 'express';
import { getConversations, getMessages } from '../controllers/messages.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getConversations);
router.get('/:userId', getMessages);

export default router;
