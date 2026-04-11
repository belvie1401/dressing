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
  getStylistStats,
  getStylistClients,
  getPendingRequests,
  getSessionsCount,
  getStylistObjectives,
  getMyReviews,
  getMyPublicStats,
  searchStylistScope,
} from '../controllers/stylists.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', listStylists);
router.get('/search', searchStylistScope);
router.get('/connections', getConnections);
router.get('/stats', getStylistStats);
router.get('/clients', getStylistClients);
router.get('/requests/pending', getPendingRequests);
router.get('/sessions/count', getSessionsCount);
router.get('/objectives', getStylistObjectives);
router.get('/me/reviews', getMyReviews);
router.get('/me/public-stats', getMyPublicStats);
router.put('/services', updateServices);
router.post('/invite', invite);
router.post('/accept/:id', acceptInvite);
router.post('/reject/:id', rejectInvite);
router.get('/client/:clientId/wardrobe', getClientWardrobe);
router.get('/:id', getStylistById);

export default router;
