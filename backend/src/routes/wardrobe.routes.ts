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

router.get('/', getItems);
router.get('/count', getItemsCount);
router.get('/stats', getWardrobeStats);
router.get('/:id', getItem);
router.post('/', upload.single('photo'), createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.post('/:id/wear', markWorn);

export default router;
