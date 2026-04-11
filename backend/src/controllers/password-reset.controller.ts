import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'LIEN <onboarding@resend.dev>';
const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

interface ResendResponse {
  id?: string;
  message?: string;
}

// ─── Email helpers ──────────────────────────────────────────────────────────
async function sendResetEmail(email: string, link: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log('\n========== PASSWORD RESET (dev mode) ==========');
    console.log(`To: ${email}`);
    console.log(`Link: ${link}`);
    console.log('Expires: 1 hour');
    console.log('===============================================\n');
    return;
  }

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F7F5F2;padding:40px 20px;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
        <h1 style="font-family:Georgia,serif;font-size:24px;color:#111111;margin:0 0 16px;">LIEN</h1>
        <h2 style="font-family:Georgia,serif;font-size:20px;color:#111111;margin:0 0 12px;">R&eacute;initialisez votre mot de passe</h2>
        <p style="color:#8A8A8A;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expirera dans 1 heure.
        </p>
        <a href="${link}" style="display:inline-block;background:#111111;color:#ffffff;padding:14px 28px;border-radius:9999px;text-decoration:none;font-size:14px;font-weight:500;">
          R&eacute;initialiser mon mot de passe
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
      subject: 'Réinitialisez votre mot de passe LIEN',
      html,
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ResendResponse;
    throw new Error(`Resend API error: ${err.message || res.statusText}`);
  }
}

async function sendResetConfirmationEmail(email: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log('\n========== PASSWORD RESET CONFIRMED (dev mode) ==========');
    console.log(`To: ${email}`);
    console.log('=========================================================\n');
    return;
  }

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F7F5F2;padding:40px 20px;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
        <h1 style="font-family:Georgia,serif;font-size:24px;color:#111111;margin:0 0 16px;">LIEN</h1>
        <h2 style="font-family:Georgia,serif;font-size:20px;color:#111111;margin:0 0 12px;">Mot de passe modifi&eacute;</h2>
        <p style="color:#8A8A8A;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Votre mot de passe a &eacute;t&eacute; modifi&eacute; avec succ&egrave;s. Si vous n&rsquo;&ecirc;tes pas &agrave; l&rsquo;origine de ce changement, contactez imm&eacute;diatement notre support.
        </p>
      </div>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [email],
      subject: 'Votre mot de passe a été modifié avec succès',
      html,
    }),
  }).catch((err) => {
    // Best-effort: never block reset on confirmation email failure
    console.error('Reset confirmation email failed:', err);
  });
}

// ─── POST /api/auth/forgot-password ─────────────────────────────────────────
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      // Still return 200 to avoid leaking which inputs are valid
      res.json({ success: true });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Security: always 200, never reveal whether the email exists
    if (!user) {
      res.json({ success: true });
      return;
    }

    // Invalidate any pre-existing reset tokens for this user
    await prisma.passwordReset.deleteMany({ where: { user_id: user.id } });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    await prisma.passwordReset.create({
      data: {
        user_id: user.id,
        token,
        expires_at: expiresAt,
      },
    });

    const link = `${FRONTEND_URL}/auth/reset-password?token=${token}`;

    try {
      await sendResetEmail(normalizedEmail, link);
    } catch (mailErr) {
      console.error('Reset email send failed:', mailErr);
      // Still return 200 — security: don't expose mail provider state to caller
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    // Even on internal errors return 200 to avoid email enumeration
    res.json({ success: true });
  }
}

// ─── GET /api/auth/verify-reset-token?token=... ────────────────────────────
export async function verifyResetToken(req: Request, res: Response): Promise<void> {
  try {
    const token = req.query.token;

    if (!token || typeof token !== 'string') {
      res.json({ success: true, data: { valid: false, reason: 'not_found' } });
      return;
    }

    const record = await prisma.passwordReset.findUnique({ where: { token } });

    if (!record || record.used) {
      res.json({ success: true, data: { valid: false, reason: 'not_found' } });
      return;
    }

    if (record.expires_at < new Date()) {
      res.json({ success: true, data: { valid: false, reason: 'expired' } });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: record.user_id },
      select: { email: true },
    });

    if (!user) {
      res.json({ success: true, data: { valid: false, reason: 'not_found' } });
      return;
    }

    res.json({ success: true, data: { valid: true, email: user.email } });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}

// ─── POST /api/auth/reset-password ─────────────────────────────────────────
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, new_password } = req.body;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, error: 'INVALID_TOKEN' });
      return;
    }

    if (!new_password || typeof new_password !== 'string' || new_password.length < 8) {
      res.status(400).json({ success: false, error: 'WEAK_PASSWORD' });
      return;
    }

    const record = await prisma.passwordReset.findUnique({ where: { token } });

    if (!record || record.used) {
      res.status(400).json({ success: false, error: 'INVALID_TOKEN' });
      return;
    }

    if (record.expires_at < new Date()) {
      res.status(400).json({ success: false, error: 'EXPIRED_TOKEN' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: record.user_id } });
    if (!user) {
      res.status(400).json({ success: false, error: 'INVALID_TOKEN' });
      return;
    }

    // Hash + persist new password into the existing style_profile.password slot
    const hashed = await bcrypt.hash(new_password, 12);
    const profile =
      (user.style_profile && typeof user.style_profile === 'object'
        ? (user.style_profile as Record<string, unknown>)
        : {}) || {};
    const updatedProfile = { ...profile, password: hashed };

    await prisma.user.update({
      where: { id: user.id },
      data: { style_profile: updatedProfile },
    });

    // Mark token as used (single-use)
    await prisma.passwordReset.update({
      where: { token },
      data: { used: true },
    });

    // Best-effort confirmation email
    sendResetConfirmationEmail(user.email);

    // Auto-login: issue a fresh JWT
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
          active_role: user.active_role,
          is_dual_role: user.is_dual_role,
          referral_code: user.referral_code,
          avatar_url: user.avatar_url,
          location: user.location,
        },
        token: jwtToken,
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}
