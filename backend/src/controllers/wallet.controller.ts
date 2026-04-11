import { Request, Response } from 'express';
import prisma from '../lib/prisma';

const PLATFORM_FEE_PERCENT = 0.2; // 20% platform commission

async function ensureWallet(stylistId: string) {
  let wallet = await prisma.stylistWallet.findUnique({
    where: { stylist_id: stylistId },
  });
  if (!wallet) {
    wallet = await prisma.stylistWallet.create({
      data: { stylist_id: stylistId },
    });
  }
  return wallet;
}

/**
 * GET /api/wallet
 * Returns the authenticated stylist's wallet balance + totals.
 */
export async function getWallet(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'STYLIST') {
      res.status(403).json({ success: false, error: 'R\u00e9serv\u00e9 aux stylistes' });
      return;
    }

    const wallet = await ensureWallet(userId);

    // Compute "this month" earnings from completed transactions
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTx = await prisma.transaction.findMany({
      where: {
        stylist_id: userId,
        status: 'COMPLETED',
        completed_at: { gte: startOfMonth },
      },
      select: { net_amount: true },
    });
    const thisMonth = monthTx.reduce((sum, t) => sum + t.net_amount, 0);

    res.json({
      success: true,
      data: {
        balance: wallet.balance,
        pending_balance: wallet.pending_balance,
        total_earned: wallet.total_earned,
        this_month: thisMonth,
        stripe_account_id: wallet.stripe_account_id,
        platform_fee_percent: PLATFORM_FEE_PERCENT,
      },
    });
  } catch (error) {
    console.error('getWallet error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * GET /api/wallet/transactions
 * Returns the list of transactions for the authenticated stylist.
 */
export async function getTransactions(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    const where: any = { stylist_id: userId };
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    // Hydrate client names
    const clientIds = transactions
      .map((t) => t.client_id)
      .filter((id): id is string => !!id);
    const clients = clientIds.length
      ? await prisma.user.findMany({
          where: { id: { in: clientIds } },
          select: { id: true, name: true, avatar_url: true },
        })
      : [];
    const clientMap = new Map(clients.map((c) => [c.id, c]));

    const hydrated = transactions.map((t) => ({
      ...t,
      client: t.client_id ? clientMap.get(t.client_id) || null : null,
    }));

    res.json({ success: true, data: hydrated });
  } catch (error) {
    console.error('getTransactions error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * POST /api/wallet/session-payment
 * Creates a PENDING transaction record when a client books a session.
 * Splits the gross_amount into 80% net (stylist) / 20% fee (platform).
 * Body: { stylist_id, gross_amount, description?, session_id?, stripe_payment_intent_id? }
 */
export async function recordSessionPayment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const clientId = req.user!.userId;
    const {
      stylist_id,
      gross_amount,
      description,
      session_id,
      stripe_payment_intent_id,
    } = req.body;

    if (!stylist_id || typeof gross_amount !== 'number' || gross_amount <= 0) {
      res.status(400).json({ success: false, error: 'Donn\u00e9es invalides' });
      return;
    }

    const stylist = await prisma.user.findUnique({ where: { id: stylist_id } });
    if (!stylist || stylist.role !== 'STYLIST') {
      res.status(404).json({ success: false, error: 'Styliste non trouv\u00e9' });
      return;
    }

    await ensureWallet(stylist_id);

    const platformFee = Math.round(gross_amount * PLATFORM_FEE_PERCENT * 100) / 100;
    const netAmount = Math.round((gross_amount - platformFee) * 100) / 100;

    const tx = await prisma.transaction.create({
      data: {
        stylist_id,
        client_id: clientId,
        session_id: session_id || null,
        gross_amount,
        platform_fee: platformFee,
        net_amount: netAmount,
        status: 'PENDING',
        stripe_payment_intent_id: stripe_payment_intent_id || null,
        description: description || 'Session de conseil',
      },
    });

    // Increment pending balance
    await prisma.stylistWallet.update({
      where: { stylist_id },
      data: { pending_balance: { increment: netAmount } },
    });

    res.json({ success: true, data: tx });
  } catch (error) {
    console.error('recordSessionPayment error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * POST /api/wallet/complete/:transactionId
 * Marks a PENDING transaction as COMPLETED.
 * Moves funds from pending_balance -> balance and credits total_earned.
 * In production this would be called from a Stripe webhook after the session
 * actually takes place (or from an admin/system hook).
 */
export async function completeTransaction(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const transactionId = String(req.params.transactionId || '');
    const userId = req.user!.userId;

    const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!tx) {
      res.status(404).json({ success: false, error: 'Transaction introuvable' });
      return;
    }
    if (tx.status !== 'PENDING') {
      res.status(400).json({ success: false, error: 'Transaction d\u00e9j\u00e0 trait\u00e9e' });
      return;
    }

    // Only the stylist owner or the client can trigger completion
    if (tx.stylist_id !== userId && tx.client_id !== userId) {
      res.status(403).json({ success: false, error: 'Acc\u00e8s refus\u00e9' });
      return;
    }

    const now = new Date();

    const [updatedTx] = await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'COMPLETED', completed_at: now },
      }),
      prisma.stylistWallet.update({
        where: { stylist_id: tx.stylist_id },
        data: {
          pending_balance: { decrement: tx.net_amount },
          balance: { increment: tx.net_amount },
          total_earned: { increment: tx.net_amount },
        },
      }),
    ]);

    res.json({ success: true, data: updatedTx });
  } catch (error) {
    console.error('completeTransaction error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * POST /api/wallet/withdraw
 * Withdraws `amount` euros from the stylist's balance.
 * Min 20 euros. Creates a WITHDRAWN transaction record.
 * In production this would trigger a Stripe Transfer to the connected account.
 */
export async function withdraw(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ success: false, error: 'Montant invalide' });
      return;
    }
    if (amount < 20) {
      res
        .status(400)
        .json({ success: false, error: 'Montant minimum: 20 euros' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'STYLIST') {
      res.status(403).json({ success: false, error: 'R\u00e9serv\u00e9 aux stylistes' });
      return;
    }

    const wallet = await ensureWallet(userId);
    if (wallet.balance < amount) {
      res.status(400).json({ success: false, error: 'Solde insuffisant' });
      return;
    }

    const now = new Date();

    // NOTE: In production, call Stripe transfer here before committing.
    // const transfer = await stripe.transfers.create({
    //   amount: Math.round(amount * 100),
    //   currency: 'eur',
    //   destination: wallet.stripe_account_id,
    // });

    const [tx] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          stylist_id: userId,
          gross_amount: amount,
          platform_fee: 0,
          net_amount: -amount,
          status: 'WITHDRAWN',
          description: 'Retrait vers compte bancaire',
          completed_at: now,
        },
      }),
      prisma.stylistWallet.update({
        where: { stylist_id: userId },
        data: {
          balance: { decrement: amount },
          updated_at: now,
        },
      }),
    ]);

    res.json({ success: true, data: tx });
  } catch (error) {
    console.error('withdraw error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

/**
 * POST /api/wallet/connect-stripe
 * Stores the stylist's Stripe Connect account id so they can receive transfers.
 * In production this returns a Stripe Connect onboarding URL.
 */
export async function connectStripe(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { stripe_account_id } = req.body;

    const wallet = await ensureWallet(userId);

    const updated = await prisma.stylistWallet.update({
      where: { id: wallet.id },
      data: { stripe_account_id: stripe_account_id || null },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('connectStripe error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}
