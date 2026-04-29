'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

interface BillingInfo {
  plan_name: string;
  plan_status: string;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  ai_screening_enabled: boolean;
}

export default function BillingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          setError('You must be an organisation owner to view billing.');
          setLoading(false);
          return;
        }

        setOrgId(userOrg.organisation_id);

        // Get billing info
        const { data: org, error: orgError } = await supabase
          .from('organisations')
          .select(
            'plan_name, plan_status, trial_ends_at, subscription_ends_at, ai_screening_enabled'
          )
          .eq('id', userOrg.organisation_id)
          .single();

        if (orgError) throw orgError;
        setBilling(org);
      } catch (error) {
        console.error('Error loading billing:', error);
        setError('Failed to load billing information.');
      } finally {
        setLoading(false);
      }
    };

    loadBilling();
  }, [router, supabase]);

  const handleCheckout = async (plan: string) => {
    if (!orgId) return;

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
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

  const handleAddAiScreening = async () => {
    if (!orgId) return;

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          add_ai_screening: true,
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

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-red-900">{error}</p>
        </div>
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">No billing information available.</p>
      </div>
    );
  }

  const daysLeft =
    billing.trial_ends_at && billing.plan_status === 'trialing'
      ? Math.ceil(
          (new Date(billing.trial_ends_at).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  const planLabel = billing.plan_name
    ? billing.plan_name.charAt(0).toUpperCase() + billing.plan_name.slice(1)
    : 'No plan';

  const statusBadgeColor =
    billing.plan_status === 'trialing'
      ? 'bg-blue-100 text-blue-900'
      : billing.plan_status === 'active'
        ? 'bg-green-100 text-green-900'
        : billing.plan_status === 'past_due'
          ? 'bg-yellow-100 text-yellow-900'
          : 'bg-gray-100 text-gray-900';

  const statusLabel =
    billing.plan_status === 'trialing'
      ? 'Trial'
      : billing.plan_status === 'active'
        ? 'Active'
        : billing.plan_status === 'past_due'
          ? 'Past Due'
          : 'Cancelled';

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Billing</h1>

      {/* Current Plan Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Current Plan</h2>
          <p className="text-sm text-gray-500">Manage your subscription and add-ons</p>
        </div>

        <div className="space-y-6">
          {/* Plan Details */}
          <div className="grid grid-cols-2 gap-6 border-b pb-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Plan</p>
              <p className="text-2xl font-bold">{planLabel}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusBadgeColor}`}>
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Trial Info */}
          {daysLeft !== null && (
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                {daysLeft > 0
                  ? `${daysLeft} days left in your free trial`
                  : 'Your trial has ended'}
              </p>
            </div>
          )}

          {/* Renewal Date */}
          {billing.subscription_ends_at && billing.plan_status === 'active' && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Next billing date</p>
              <p className="text-lg font-semibold">
                {new Date(billing.subscription_ends_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => handleCheckout('practice')}
              className="w-full"
            >
              Upgrade Plan
            </Button>
            
            {!billing.ai_screening_enabled && (
              <Button
                onClick={handleAddAiScreening}
                variant="outline"
                className="w-full"
              >
                Add AI Screening ($29/mo)
              </Button>
            )}
            
            <Button 
              onClick={handlePortal} 
              variant="secondary" 
              className="w-full"
            >
              Manage Billing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
