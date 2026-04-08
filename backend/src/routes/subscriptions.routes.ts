import { Router } from 'express';
import {
  createCheckout,
  handleWebhook,
  getSubscription,
  cancelSubscription,
} from '../controllers/subscriptions.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/webhook', handleWebhook);

router.use(authenticate);

router.post('/checkout', createCheckout);
router.get('/', getSubscription);
router.post('/cancel', cancelSubscription);

export default router;
