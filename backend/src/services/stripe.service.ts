import Stripe from 'stripe';
import { Request } from 'express';
import prisma from '../lib/prisma';

const stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY || '');

const PLAN_PRICES: Record<string, string> = {
  CLIENT_PRO: process.env.STRIPE_CLIENT_PRO_PRICE_ID || '',
  STYLIST_PRO: process.env.STRIPE_STYLIST_PRO_PRICE_ID || '',
};

export async function createCheckoutSession(
  userId: string,
  plan: string
): Promise<any> {
  const priceId = PLAN_PRICES[plan];
  if (!priceId) {
    throw new Error('Plan invalide');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/profile?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/profile`,
    customer_email: user.email,
    metadata: { userId, plan },
  });

  return session;
}

export async function handleWebhook(req: Request): Promise<void> {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('Webhook secret not configured');
  }

  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    webhookSecret
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

      if (userId && plan) {
        await prisma.subscription.upsert({
          where: { user_id: userId },
          update: {
            plan: plan as any,
            stripe_subscription_id: session.subscription as string,
            status: 'active',
          },
          create: {
            user_id: userId,
            plan: plan as any,
            stripe_subscription_id: session.subscription as string,
            status: 'active',
          },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any;
      await prisma.subscription.updateMany({
        where: { stripe_subscription_id: subscription.id },
        data: { status: 'canceled', plan: 'FREE' },
      });
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as any;
      await prisma.subscription.updateMany({
        where: { stripe_subscription_id: subscription.id },
        data: {
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000),
        },
      });
      break;
    }
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.cancel(subscriptionId);
}
