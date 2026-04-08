import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, role } = req.body;

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

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de l\'inscription' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

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

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
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
        },
        token,
      },
    });
  } catch (error) {
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
