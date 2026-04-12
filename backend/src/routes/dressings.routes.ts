import { Router } from 'express';
import {
  listDressings,
  createDressing,
  updateDressing,
  deleteDressing,
} from '../controllers/dressings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', listDressings);
router.post('/', createDressing);
router.put('/:id', updateDressing);
router.delete('/:id', deleteDressing);

export default router;
