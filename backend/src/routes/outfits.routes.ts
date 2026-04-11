import { Router } from 'express';
import {
  getOutfits,
  getOutfit,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  markWorn,
  getOutfitsCount,
} from '../controllers/outfits.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getOutfits);
router.get('/count', getOutfitsCount);
router.get('/:id', getOutfit);
router.post('/', createOutfit);
router.put('/:id', updateOutfit);
router.delete('/:id', deleteOutfit);
router.post('/:id/wear', markWorn);

export default router;
