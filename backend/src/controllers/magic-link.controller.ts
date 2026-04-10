import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'LIEN <onboarding@resend.dev>';
const MAGIC_LINK_TTL_MINUTES = 15;

interface ResendResponse {
  id?: string;
  message?: string;
}

/**
 * Sends an email using the Resend API. If RESEND_API_KEY is not set,
 * logs the magic link to console so it still works in local dev.
 */
async function sendMagicLinkEmail(email: string, link: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log('\n========== MAGIC LINK (dev mode) ==========');
    console.log(`To: ${email}`);
    console.log(`Link: ${link}`);
    console.log(`Expires: ${MAGIC_LINK_TTL_MINUTES} minutes`);
    console.log('===========================================\n');
    return;
  }

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F7F5F2;padding:40px 20px;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
        <h1 style="font-family:Georgia,serif;font-size:24px;color:#111111;margin:0 0 16px;">LIEN</h1>
        <h2 style="font-family:Georgia,serif;font-size:20px;color:#111111;margin:0 0 12px;">Votre lien de connexion</h2>
        <p style="color:#8A8A8A;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Cliquez sur le bouton ci-dessous pour vous connecter &agrave; votre compte LIEN. Ce lien expirera dans ${MAGIC_LINK_TTL_MINUTES} minutes.
        </p>
        <a href="${link}" style="display:inline-block;background:#111111;color:#ffffff;padding:14px 28px;border-radius:9999px;text-decoration:none;font-size:14px;font-weight:500;">
          Se connecter
        </a>
        <p style="color:#8A8A8A;font-size:12px;line-height:1.6;margin:32px 0 0;">
          Si vous n&rsquo;avez pas demand&eacute; ce lien, vous pouvez ignorer cet email en toute s&eacute;curit&eacute;.
        </p>
        <p style="color:#CFCFCF;font-size:11px;margin:24px 0 0;word-break:break-all;">
          Ou copiez-collez : ${link}
        </p>
      </div>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [email],
      subject: 'Votre lien de connexion LIEN',
      html,
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ResendResponse;
    throw new Error(`Resend API error: ${err.message || res.statusText}`);
  }
}

/**
 * POST /api/auth/magic-link
 * Body: { email: string }
 * Generates a secure token, stores it, and emails a magic link.
 */
export async function requestMagicLink(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'Email invalide' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Generate a cryptographically secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MINUTES * 60 * 1000);

    // Remove any pre-existing tokens for this email (single active link at a time)
    await prisma.magicLinkToken.deleteMany({ where: { email: normalizedEmail } });

    await prisma.magicLinkToken.create({
      data: {
        email: normalizedEmail,
        token,
        expires_at: expiresAt,
      },
    });

    const link = `${FRONTEND_URL}/auth/verify?token=${token}`;

    try {
      await sendMagicLinkEmail(normalizedEmail, link);
    } catch (mailErr) {
      console.error('Magic link email send failed:', mailErr);
      res.status(500).json({
        success: false,
        error: 'Impossible d\'envoyer l\'email. Veuillez réessayer.',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        email: normalizedEmail,
        expires_in_minutes: MAGIC_LINK_TTL_MINUTES,
      },
    });
  } catch (error) {
    console.error('Request magic link error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * GET /api/auth/verify?token=...
 * Verifies a magic link token, creates/finds user, returns JWT.
 */
export async function verifyMagicLink(req: Request, res: Response): Promise<void> {
  try {
    const token = req.query.token;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, error: 'Token manquant' });
      return;
    }

    const record = await prisma.magicLinkToken.findUnique({ where: { token } });

    if (!record) {
      res.status(404).json({ success: false, error: 'Lien invalide' });
      return;
    }

    if (record.expires_at < new Date()) {
      await prisma.magicLinkToken.delete({ where: { token } });
      res.status(410).json({ success: false, error: 'Lien expiré' });
      return;
    }

    // Find or create the user
    let user = await prisma.user.findUnique({ where: { email: record.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: record.email,
          name: record.email.split('@')[0],
          role: 'CLIENT',
          style_profile: { provider: 'magic_link' },
        },
      });
    }

    // Single-use: delete the token now
    await prisma.magicLinkToken.delete({ where: { token } });

    // Magic link tokens yield a 30-day session (treated as "remember me")
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar_url: user.avatar_url,
          location: user.location,
          style_profile: user.style_profile,
        },
        token: jwtToken,
      },
    });
  } catch (error) {
    console.error('Verify magic link error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
