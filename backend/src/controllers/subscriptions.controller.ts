import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import * as stripeService from '../services/stripe.service';

export async function createCheckout(req: Request, res: Response): Promise<void> {
  try {
    const { plan } = req.body;
    const userId = req.user!.userId;

    const session = await stripeService.createCheckoutSession(userId, plan);
    res.json({ success: true, data: { url: session.url } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la création du paiement' });
  }
}

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  try {
    await stripeService.handleWebhook(req);
    res.json({ success: true, data: { received: true } });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Webhook invalide' });
  }
}

export async function getSubscription(req: Request, res: Response): Promise<void> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { user_id: req.user!.userId },
    });

    res.json({
      success: true,
      data: subscription || { plan: 'FREE', status: 'active' },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function cancelSubscription(req: Request, res: Response): Promise<void> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { user_id: req.user!.userId },
    });

    if (!subscription || !subscription.stripe_subscription_id) {
      res.status(404).json({ success: false, error: 'Aucun abonnement actif' });
      return;
    }

    await stripeService.cancelSubscription(subscription.stripe_subscription_id);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'canceled' },
    });

    res.json({ success: true, data: { message: 'Abonnement annulé' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de l\'annulation' });
  }
}
