import { Router } from 'express';
import { getReferralStats } from '../controllers/referral.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', authenticate, getReferralStats);

export default router;
