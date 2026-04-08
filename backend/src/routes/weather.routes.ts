import { Router } from 'express';
import { getCurrentWeather, getForecast } from '../controllers/weather.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/current', getCurrentWeather);
router.get('/forecast', getForecast);

export default router;
