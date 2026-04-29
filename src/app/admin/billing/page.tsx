'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface BillingInfo {
  plan_name: string;
  plan_status: string;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
}

export default function BillingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    const loadBilling = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        // Get user's organisation
        const { data: userOrg } = await supabase
          .from('organisation_members')
          .select('organisation_id')
          .eq('user_id', user.id)
          .eq('role', 'owner')
          .single();

        if (!userOrg) {
          setLoading(false);
          return;
        }

        setOrgId(userOrg.organisation_id);

        // Get billing info
        const { data: org } = await supabase
          .from('organisations')
          .select(
            'plan_name, plan_status, trial_ends_at, subscription_ends_at'
          )
          .eq('id', userOrg.organisation_id)
          .single();

        setBilling(org);
      } catch (error) {
        console.error('Error loading billing:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBilling();
  }, [router]);

  const handleCheckout = async (plan: string, addAiScreening: boolean = false) => {
    if (!orgId) return;

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          add_ai_screening: addAiScreening,
          org_id: orgId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  const handlePortal = async () => {
    if (!orgId) return;

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId }),
      });

      if (!response.ok) throw new Error('Failed to create portal session');

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading billing information...</p>
      </div>
    );
  }

  const daysLeft =
    billing?.trial_ends_at && billing.plan_status === 'trialing'
      ? Math.ceil(
          (new Date(billing.trial_ends_at).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  const planLabel = billing?.plan_name
    ? billing.plan_name.charAt(0).toUpperCase() + billing.plan_name.slice(1)
    : 'No plan';

  const statusLabel =
    billing?.plan_status === 'trialing'
      ? 'Trial'
      : billing?.plan_status === 'active'
        ? 'Active'
        : billing?.plan_status === 'past_due'
          ? 'Past Due'
          : 'Cancelled';

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Billing</h1>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Manage your subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Plan</p>
              <p className="text-2xl font-bold">{planLabel}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-2xl font-bold text-blue-600">{statusLabel}</p>
            </div>
          </div>

          {daysLeft !== null && (
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">
                {daysLeft > 0
                  ? `${daysLeft} days left in your free trial`
                  : 'Your trial has ended'}
              </p>
            </div>
          )}

          {billing?.subscription_ends_at && billing.plan_status === 'active' && (
            <div>
              <p className="text-sm text-gray-500">Next billing date</p>
              <p className="text-lg font-semibold">
                {new Date(billing.subscription_ends_at).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => handleCheckout('practice')}
              className="flex-1"
            >
              Upgrade Plan
            </Button>
            <Button
              onClick={() => handleCheckout('practice', true)}
              variant="outline"
              className="flex-1"
            >
              Add AI Screening
            </Button>
            <Button onClick={handlePortal} variant="secondary" className="flex-1">
              Manage Billing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Table */}
      <div>
        <h2 className="mb-4 text-xl font-bold">Available Plans</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'solo', title: 'Solo', price: '$49', clients: 'Up to 10 clients' },
            {
              name: 'practice',
              title: 'Practice',
              price: '$149',
              clients: 'Up to 50 clients',
              popular: true,
            },
            {
              name: 'organisation',
              title: 'Organisation',
              price: '$349',
              clients: 'Up to 150 clients',
            },
            {
              name: 'enterprise',
              title: 'Enterprise',
              price: '$799',
              clients: 'Unlimited clients',
            },
          ].map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? 'border-blue-600 md:scale-105' : ''}
            >
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription>{plan.clients}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold">{plan.price}/mo</p>
                <Button
                  onClick={() => handleCheckout(plan.name)}
                  className="w-full"
                  variant={
                    billing?.plan_name === plan.name ? 'secondary' : 'default'
                  }
                >
                  {billing?.plan_name === plan.name
                    ? 'Current Plan'
                    : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
