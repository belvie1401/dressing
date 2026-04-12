import { Router } from 'express';
import {
  getItems,
  getItem,
  createItem,
  bulkCreateItems,
  updateItem,
  deleteItem,
  markWorn,
  archiveItem,
  getItemsCount,
  getWardrobeStats,
  tryOnItem,
} from '../controllers/wardrobe.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

const photoFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'photo_back', maxCount: 1 },
]);

// Bulk uploads accept arbitrary `photo_<i>` field names (up to 20 photos),
// so we use `upload.any()` rather than a fixed `fields()` definition.
const bulkPhotoUpload = upload.any();

router.get('/', getItems);
router.get('/count', getItemsCount);
router.get('/stats', getWardrobeStats);
// Note: declared before `/:id` so the static segment isn't swallowed
router.post('/try-on', tryOnItem);
router.get('/:id', getItem);
router.post('/', photoFields, createItem);
router.post('/bulk', bulkPhotoUpload, bulkCreateItems);
router.put('/:id', photoFields, updateItem);
router.delete('/:id', deleteItem);
router.post('/:id/wear', markWorn);
router.put('/:id/archive', archiveItem);

export default router;
