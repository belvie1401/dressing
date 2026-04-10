import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function getCallbackUrl(req: Request): string {
  // Use explicit env var if set, otherwise derive from request
  if (process.env.GOOGLE_CALLBACK_URL) return process.env.GOOGLE_CALLBACK_URL;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}/api/auth/google/callback`;
}

/**
 * GET /auth/google
 * Redirects user to Google OAuth consent screen
 */
export async function googleRedirect(req: Request, res: Response): Promise<void> {
  if (!GOOGLE_CLIENT_ID) {
    res.status(500).json({ success: false, error: 'Google OAuth non configuré' });
    return;
  }

  const callbackUrl = getCallbackUrl(req);
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

/**
 * GET /auth/google/callback
 * Exchanges authorization code for tokens, creates/finds user, redirects to frontend
 */
export async function googleCallback(req: Request, res: Response): Promise<void> {
  try {
    const { code, error } = req.query;

    if (error || !code) {
      res.redirect(`${FRONTEND_URL}/login?error=google_denied`);
      return;
    }

    const callbackUrl = getCallbackUrl(req);

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json() as Record<string, string>;

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Google token exchange failed:', tokenData);
      res.redirect(`${FRONTEND_URL}/login?error=google_token_failed`);
      return;
    }

    // Fetch user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userInfoRes.json() as Record<string, string>;

    if (!googleUser.email) {
      res.redirect(`${FRONTEND_URL}/login?error=google_no_email`);
      return;
    }

    // Find or create user in database
    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || googleUser.email.split('@')[0],
          avatar_url: googleUser.picture || null,
          role: 'CLIENT',
          style_profile: { provider: 'google', google_id: googleUser.id },
        },
      });
    } else {
      // Update avatar if not set and Google provides one
      if (!user.avatar_url && googleUser.picture) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar_url: googleUser.picture },
        });
      }
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${jwtToken}`);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    res.redirect(`${FRONTEND_URL}/login?error=google_server_error`);
  }
}
