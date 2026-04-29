/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events for billing
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature') || '';

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn('STRIPE_WEBHOOK_SECRET not set, skipping webhook verification');
      // For local development, allow unverified webhooks
      // In production, this should fail
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Webhook secret not configured' },
          { status: 500 }
        );
      }
    }

    let event: any;

    if (process.env.STRIPE_WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      // Development: parse JSON directly
      event = JSON.parse(body);
    }

    console.log(`Webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const orgId = session.metadata?.org_id;
  const plan = session.metadata?.plan;

  if (!orgId || !plan) return;

  // Calculate trial end date (14 days from now)
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  const { error } = await supabase
    .from('organisations')
    .update({
      stripe_subscription_id: subscription.id,
      plan_name: plan,
      plan_status: 'trialing',
      trial_ends_at: trialEndsAt.toISOString(),
      // Save the first price ID from line items
      stripe_price_id: subscription.items.data[0]?.price?.id,
    })
    .eq('id', orgId);

  if (error) {
    console.error('Error updating org after checkout:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  const orgId = subscription.metadata?.org_id;

  if (!orgId) return;

  const status = subscription.status;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  const { error } = await supabase
    .from('organisations')
    .update({
      plan_status: status,
      subscription_ends_at: currentPeriodEnd.toISOString(),
    })
    .eq('id', orgId);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  const orgId = subscription.metadata?.org_id;

  if (!orgId) return;

  const { error } = await supabase
    .from('organisations')
    .update({
      plan_status: 'cancelled',
      stripe_subscription_id: null,
    })
    .eq('id', orgId);

  if (error) {
    console.error('Error marking subscription as cancelled:', error);
  }
}

async function handlePaymentSucceeded(invoice: any) {
  const customerId = invoice.customer;

  // Find org by customer ID
  const { data: org, error: fetchError } = await supabase
    .from('organisations')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (fetchError || !org) {
    console.error('Org not found for customer:', customerId);
    return;
  }

  const { error } = await supabase
    .from('organisations')
    .update({
      plan_status: 'active',
    })
    .eq('id', org.id);

  if (error) {
    console.error('Error updating payment succeeded:', error);
  }

  // TODO: Send confirmation email
  console.log(`Payment succeeded for org ${org.id}`);
}

async function handlePaymentFailed(invoice: any) {
  const customerId = invoice.customer;

  // Find org by customer ID
  const { data: org, error: fetchError } = await supabase
    .from('organisations')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (fetchError || !org) {
    console.error('Org not found for customer:', customerId);
    return;
  }

  const { error } = await supabase
    .from('organisations')
    .update({
      plan_status: 'past_due',
    })
    .eq('id', org.id);

  if (error) {
    console.error('Error updating payment failed:', error);
  }

  // TODO: Send alert email
  console.log(`Payment failed for org ${org.id}`);
}
