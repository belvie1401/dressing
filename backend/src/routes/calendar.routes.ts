import { Router } from 'express';
import {
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  getAgendaStats,
  bookSession,
} from '../controllers/calendar.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getEntries);
router.get('/agenda-stats', getAgendaStats);
router.get('/:id', getEntry);
router.post('/', createEntry);
router.post('/book', bookSession);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

export default router;
