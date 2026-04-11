import { Router } from 'express';
import {
  getLookbooks,
  getLookbook,
  getStylistPublicLookbooks,
  createLookbook,
  updateLookbook,
  deleteLookbook,
  sendLookbook,
  submitFeedback,
  uploadLookbookPhoto,
} from '../controllers/lookbooks.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

router.post('/upload-photo', upload.single('photo'), uploadLookbookPhoto);
router.get('/', getLookbooks);
router.get('/stylist/:stylistId/public', getStylistPublicLookbooks);
router.get('/:id', getLookbook);
router.post('/', createLookbook);
router.put('/:id', updateLookbook);
router.delete('/:id', deleteLookbook);
router.post('/:id/send', sendLookbook);
router.post('/:id/feedback', submitFeedback);

export default router;
