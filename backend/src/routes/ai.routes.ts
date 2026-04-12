import { Router } from 'express';
import { scanClothing, generateOutfits, analyzeStyleDNA, analyzeStyle } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/scan-clothing', scanClothing);
router.post('/generate-outfits', generateOutfits);
router.post('/analyze-style', analyzeStyle);
router.get('/style-dna', analyzeStyleDNA);

export default router;
