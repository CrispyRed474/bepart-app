'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const PLANS = [
  {
    name: 'solo',
    title: 'Solo',
    price: '$49',
    description: 'Perfect for solo practitioners',
    clients: 'Up to 10 clients',
    features: [
      'Client management',
      'Basic case tracking',
      'Document storage',
      'Email support',
    ],
  },
  {
    name: 'practice',
    title: 'Practice',
    price: '$149',
    description: 'Most popular for small to medium practices',
    clients: 'Up to 50 clients',
    popular: true,
    features: [
      'Everything in Solo',
      'Team collaboration',
      'Advanced case tracking',
      'Custom workflows',
      'Priority support',
      'API access',
    ],
  },
  {
    name: 'organisation',
    title: 'Organisation',
    price: '$349',
    description: 'For larger organizations',
    clients: 'Up to 150 clients',
    features: [
      'Everything in Practice',
      'Advanced permissions',
      'Custom branding',
      'SSO',
      'Dedicated support',
      'Analytics & reporting',
    ],
  },
  {
    name: 'enterprise',
    title: 'Enterprise',
    price: '$799',
    description: 'Unlimited scale with dedicated support',
    clients: 'Unlimited clients',
    features: [
      'Everything in Organisation',
      'Unlimited users',
      'Custom integrations',
      'SLA guarantee',
      'Dedicated account manager',
      'Phone support',
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    checkAuth();
  }, []);

  const handleStartTrial = async (planName: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // Get user's organisation
      const { data: userOrg } = await supabase
        .from('organisation_members')
        .select('organisation_id')
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .single();

      if (!userOrg) {
        alert('You must be an organisation owner to start a trial.');
        setLoading(false);
        return;
      }

      // Redirect to checkout
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planName,
          add_ai_screening: false,
          org_id: userOrg.organisation_id,
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start trial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 py-12 px-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Start with a free 14-day trial. No credit card required. Cancel anytime.
        </p>
      </div>

      {/* Add-on */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          Add AI Screening to any plan for <span className="text-lg font-bold">$29/mo</span>
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col ${plan.popular ? 'border-2 border-blue-600 md:scale-105' : ''}`}
          >
            {plan.popular && (
              <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm font-semibold rounded-t-lg">
                MOST POPULAR
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.title}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              {/* Price */}
              <div>
                <p className="text-4xl font-bold">{plan.price}</p>
                <p className="text-sm text-gray-600">per month</p>
              </div>

              {/* Clients limit */}
              <p className="text-sm font-medium text-gray-700">{plan.clients}</p>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <svg
                      className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={() => handleStartTrial(plan.name)}
                disabled={loading}
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
              >
                {loading ? 'Loading...' : 'Start 14-Day Free Trial'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>

        <div className="space-y-6">
          {[
            {
              q: 'Do I need a credit card for the free trial?',
              a: 'No. You can start your 14-day free trial without providing any payment information.',
            },
            {
              q: 'Can I upgrade or downgrade my plan?',
              a: 'Yes. You can change your plan at any time from your billing page. Changes take effect on your next billing cycle.',
            },
            {
              q: 'What happens when my trial ends?',
              a: 'We\'ll send you a reminder email. Your plan will be paused until you add a payment method. No charges will be made.',
            },
            {
              q: 'Can I cancel my subscription?',
              a: 'Yes. You can cancel anytime from your Stripe customer portal. Your access continues until the end of the current billing period.',
            },
            {
              q: 'Is the AI Screening add-on included in any plan?',
              a: 'No. AI Screening is an optional add-on available for $29/month on any plan.',
            },
          ].map((item, i) => (
            <div key={i} className="border-b pb-6">
              <p className="font-semibold mb-2">{item.q}</p>
              <p className="text-gray-700">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
