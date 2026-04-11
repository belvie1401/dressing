import { Router } from 'express';
import {
  getWallet,
  getTransactions,
  recordSessionPayment,
  completeTransaction,
  withdraw,
  connectStripe,
} from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getWallet);
router.get('/transactions', getTransactions);
router.post('/session-payment', recordSessionPayment);
router.post('/complete/:transactionId', completeTransaction);
router.post('/withdraw', withdraw);
router.post('/connect-stripe', connectStripe);

export default router;
