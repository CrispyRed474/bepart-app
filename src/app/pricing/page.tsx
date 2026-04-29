'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

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
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleStartTrial = async (planName: string) => {
    try {
      setLoading(true);

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
          org_id: userOrg.organisation_id,
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start trial. Please try again.');
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

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-xl border p-6 flex flex-col ${
              plan.popular ? 'border-2 border-blue-600 md:scale-105 shadow-lg' : 'border-gray-200'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="mb-4">
                <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  MOST POPULAR
                </span>
              </div>
            )}

            {/* Plan Name & Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold">{plan.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-4xl font-bold">{plan.price}</p>
              <p className="text-sm text-gray-600">per month</p>
            </div>

            {/* Clients Limit */}
            <p className="text-sm font-medium text-gray-700 mb-6 pb-6 border-b">{plan.clients}</p>

            {/* Features */}
            <ul className="space-y-3 mb-8 flex-1">
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
            <button
              onClick={() => handleStartTrial(plan.name)}
              disabled={loading}
              className={`w-full px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {loading ? 'Loading...' : 'Start 14-Day Free Trial'}
            </button>
          </div>
        ))}
      </div>

      {/* AI Screening Add-on Section */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">AI Screening Add-on</h2>
          <p className="text-gray-600 mb-4">Available on all plans</p>
          <p className="text-4xl font-bold text-blue-600 mb-4">$29<span className="text-lg text-gray-600">/mo</span></p>
          <p className="text-gray-700">
            Enhance any plan with our AI-powered screening tool for automated case analysis and recommendations.
          </p>
        </div>
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
              a: "We'll send you a reminder email. Your plan will be paused until you add a payment method. No charges will be made.",
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
