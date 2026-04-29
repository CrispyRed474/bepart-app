/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session for a billing plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { STRIPE_PRICE_IDS } from '@/lib/stripe/price-ids';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, add_ai_screening, org_id } = body;

    if (!plan || !org_id) {
      return NextResponse.json(
        { error: 'Missing plan or org_id' },
        { status: 400 }
      );
    }

    if (!['solo', 'practice', 'organisation', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Get organisation record
    const { data: org, error: fetchError } = await supabase
      .from('organisations')
      .select('*')
      .eq('id', org_id)
      .single();

    if (fetchError || !org) {
      return NextResponse.json(
        { error: 'Organisation not found' },
        { status: 404 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId = org.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: org.email,
        metadata: {
          org_id: org_id,
        },
      });
      customerId = customer.id;

      // Save customer ID to org
      await supabase
        .from('organisations')
        .update({ stripe_customer_id: customerId })
        .eq('id', org_id);
    }

    // Build line items
    const lineItems = [
      {
        price: STRIPE_PRICE_IDS[plan as keyof typeof STRIPE_PRICE_IDS],
        quantity: 1,
      },
    ];

    if (add_ai_screening) {
      lineItems.push({
        price: STRIPE_PRICE_IDS.ai_screening,
        quantity: 1,
      });
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: lineItems,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          org_id: org_id,
          plan: plan,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
