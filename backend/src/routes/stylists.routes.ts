import { Router } from 'express';
import {
  listStylists,
  getStylistById,
  updateServices,
  invite,
  acceptInvite,
  rejectInvite,
  getClientWardrobe,
  getConnections,
} from '../controllers/stylists.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', listStylists);
router.get('/connections', getConnections);
router.put('/services', updateServices);
router.post('/invite', invite);
router.post('/accept/:id', acceptInvite);
router.post('/reject/:id', rejectInvite);
router.get('/client/:clientId/wardrobe', getClientWardrobe);
router.get('/:id', getStylistById);

export default router;
