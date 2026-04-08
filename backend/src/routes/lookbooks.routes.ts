import { Router } from 'express';
import {
  getLookbooks,
  getLookbook,
  createLookbook,
  updateLookbook,
  deleteLookbook,
  sendLookbook,
  submitFeedback,
} from '../controllers/lookbooks.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getLookbooks);
router.get('/:id', getLookbook);
router.post('/', createLookbook);
router.put('/:id', updateLookbook);
router.delete('/:id', deleteLookbook);
router.post('/:id/send', sendLookbook);
router.post('/:id/feedback', submitFeedback);

export default router;
