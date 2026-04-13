import { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import prisma from '../lib/prisma';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

const CLERK_SECRET = process.env.CLERK_SECRET_KEY!;

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Token manquant' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify the Clerk session token
    const payload = await verifyToken(token, { secretKey: CLERK_SECRET });
    const clerkUserId = payload.sub;

    if (!clerkUserId) {
      res.status(401).json({ success: false, error: 'Token invalide' });
      return;
    }

    // Find or create the DB user
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { clerk_id: clerkUserId },
        ],
      },
    });

    if (!dbUser) {
      // Fetch user info from Clerk to create a local DB record
      const clerkUser = await clerk.users.getUser(clerkUserId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';

      // Check if a user with this email already exists (migration case)
      dbUser = await prisma.user.findUnique({ where: { email } });

      if (dbUser) {
        // Link existing user to Clerk
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { clerk_id: clerkUserId },
        });
      } else {
        // Create a new user
        const roleStr = (clerkUser.unsafeMetadata?.role as string) || 'CLIENT';
        const role = roleStr === 'STYLIST' ? 'STYLIST' as const : 'CLIENT' as const;
        dbUser = await prisma.user.create({
          data: {
            clerk_id: clerkUserId,
            email,
            name: clerkUser.fullName || clerkUser.firstName || 'Utilisateur',
            avatar_url: clerkUser.imageUrl || null,
            role,
            active_role: roleStr,
          },
        });
      }
    }

    // Set req.user with the same shape all controllers expect
    req.user = {
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    };

    next();
  } catch (error: any) {
    console.error('Auth error:', error.message);
    res.status(401).json({ success: false, error: 'Authentification échouée' });
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Accès refusé' });
      return;
    }

    next();
  };
}
