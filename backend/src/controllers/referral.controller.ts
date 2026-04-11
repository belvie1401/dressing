import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getReferralStats(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        referral_code: true,
        referral_count: true,
        free_months_earned: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      return;
    }

    res.json({
      success: true,
      data: {
        referral_code: user.referral_code || '',
        referral_count: user.referral_count,
        free_months: user.free_months_earned,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
