import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller';
import { googleRedirect, googleCallback } from '../controllers/google-auth.controller';
import { requestMagicLink, verifyMagicLink } from '../controllers/magic-link.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

// Google OAuth
router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);

// Magic link (passwordless)
router.post('/magic-link', requestMagicLink);
router.get('/verify', verifyMagicLink);

export default router;
