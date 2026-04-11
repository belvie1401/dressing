import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, role } = req.body;
    const refCode = (req.body.referral_code || req.query.ref) as string | undefined;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ success: false, error: 'Cet email est déjà utilisé' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role || 'CLIENT',
        style_profile: { password: hashedPassword },
      },
    });

    // Generate referral code from user ID
    const referralCode = 'LIEN-' + user.id.slice(0, 6).toUpperCase();

    // Handle incoming referral code
    let referredBy: string | undefined;
    if (refCode) {
      const referrer = await prisma.user.findUnique({ where: { referral_code: refCode } });
      if (referrer && referrer.id !== user.id) {
        referredBy = refCode;
        await prisma.user.update({
          where: { id: referrer.id },
          data: {
            referral_count: { increment: 1 },
            free_months_earned: { increment: 1 },
          },
        });
      }
    }

    // Save referral code (and referred_by if applicable)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        referral_code: referralCode,
        ...(referredBy && { referred_by: referredBy }),
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          active_role: user.active_role,
          is_dual_role: user.is_dual_role,
          referral_code: referralCode,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de l\'inscription' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, remember_me } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.style_profile) {
      res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' });
      return;
    }

    const profile = user.style_profile as Record<string, unknown>;
    const storedPassword = profile.password as string;
    if (!storedPassword) {
      res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' });
      return;
    }

    const valid = await bcrypt.compare(password, storedPassword);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' });
      return;
    }

    // remember_me === true (default) → 30 day session, false → 24 hours
    const expiresIn: string = remember_me === false ? '24h' : '30d';

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: expiresIn as any }
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
          referral_count: user.referral_count,
          free_months_earned: user.free_months_earned,
          avatar_url: user.avatar_url,
          location: user.location,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la connexion' });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active_role: true,
        is_dual_role: true,
        referral_code: true,
        referral_count: true,
        free_months_earned: true,
        avatar_url: true,
        location: true,
        style_profile: true,
        created_at: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      return;
    }

    // Strip password from style_profile before returning
    if (user.style_profile && typeof user.style_profile === 'object') {
      const { password, ...safeProfile } = user.style_profile as Record<string, unknown>;
      (user as any).style_profile = Object.keys(safeProfile).length > 0 ? safeProfile : null;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const { name, avatar_url, location, style_profile } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(name && { name }),
        ...(avatar_url && { avatar_url }),
        ...(location && { location }),
        ...(style_profile && { style_profile }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active_role: true,
        is_dual_role: true,
        avatar_url: true,
        location: true,
        style_profile: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour' });
  }
}

export async function switchRole(req: Request, res: Response): Promise<void> {
  try {
    const { role } = req.body;
    if (role !== 'CLIENT' && role !== 'STYLIST') {
      res.status(400).json({ success: false, error: 'Rôle invalide' });
      return;
    }
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { active_role: role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active_role: true,
        is_dual_role: true,
        avatar_url: true,
        location: true,
      },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function activateStylist(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { is_dual_role: true, active_role: 'STYLIST' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active_role: true,
        is_dual_role: true,
        avatar_url: true,
        location: true,
      },
    });

    await prisma.stylistWallet.upsert({
      where: { stylist_id: userId },
      create: { stylist_id: userId },
      update: {},
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
