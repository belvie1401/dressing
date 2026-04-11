import { Router } from 'express';
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  markWorn,
  getItemsCount,
  getWardrobeStats,
} from '../controllers/wardrobe.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

const photoFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'photo_back', maxCount: 1 },
]);

router.get('/', getItems);
router.get('/count', getItemsCount);
router.get('/stats', getWardrobeStats);
router.get('/:id', getItem);
router.post('/', photoFields, createItem);
router.put('/:id', photoFields, updateItem);
router.delete('/:id', deleteItem);
router.post('/:id/wear', markWorn);

export default router;
