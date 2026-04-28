import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing Plans | BePart - NDIS Communication App',
  description: 'Affordable NDIS communication app pricing. Solo ($49), Practice ($149), Organisation ($349), Enterprise ($799). Families always free. Australian data hosting.',
}

export default function PricingPage() {
  const plans = [
    {
      name: 'Solo',
      price: '$49',
      period: '/month',
      description: 'Perfect for individual carers',
      clients: 'Up to 10 clients',
      popular: false,
      features: [
        'Voice-to-text activity logging',
        'Family updates feed',
        'Compliance documentation',
        'Mobile-optimized',
        'Australian data hosting',
        'Email support',
      ],
    },
    {
      name: 'Practice',
      price: '$149',
      period: '/month',
      description: 'Most popular for small providers',
      clients: 'Up to 50 clients',
      popular: true,
      features: [
        'Everything in Solo',
        'Team management (up to 10 carers)',
        'Consent-gated family access',
        'AI anomaly detection',
        'Advanced compliance reports',
        'Priority support',
        'Custom branding',
      ],
    },
    {
      name: 'Organisation',
      price: '$349',
      period: '/month',
      description: 'For larger NDIS providers',
      clients: 'Up to 150 clients',
      popular: false,
      features: [
        'Everything in Practice',
        'Team management (up to 50 carers)',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated account manager',
        '99.9% uptime SLA',
      ],
    },
    {
      name: 'Enterprise',
      price: '$799',
      period: '/month',
      description: 'Unlimited for large organisations',
      clients: 'Unlimited clients',
      popular: false,
      features: [
        'Everything in Organisation',
        'Unlimited team members',
        'Custom data residency',
        'Advanced security features',
        '24/7 phone support',
        'Custom training & onboarding',
      ],
    },
  ]

  const faqs = [
    {
      question: 'Is BePart NDIS compliant?',
      answer: 'Yes. BePart is designed specifically for NDIS providers and meets all compliance requirements including activity logging, family communication, and consent management. We comply with NDIS quality and safeguards standards.',
    },
    {
      question: 'Where is our data hosted?',
      answer: 'All data is hosted on Australian servers in Sydney. We use industry-standard encryption and follow Australian Privacy Act requirements and NDIS data security guidelines.',
    },
    {
      question: 'Can families access BePart for free?',
      answer: 'Yes. Family members always get free access to the family updates feed and consent-gated information. There are no hidden fees for family participation—they\'re included with your plan.',
    },
    {
      question: 'Can I change plans anytime?',
      answer: 'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.',
    },
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes. All plans come with a 14-day free trial. No credit card required to get started.',
    },
    {
      question: 'What happens if I exceed my client limit?',
      answer: 'We\'ll notify you when you\'re approaching your limit. You can upgrade to a higher plan anytime, or contact our team to discuss custom arrangements.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that fits your organisation. Australian data hosting included.
          </p>
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
            ✓ 14-day free trial • No credit card required
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl border-2 p-8 transition-all ${
                  plan.popular
                    ? 'border-blue-500 bg-blue-50 shadow-xl scale-105'
                    : 'border-gray-200 bg-white hover:border-gray-300 shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="mb-4">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.price}
                    <span className="text-lg text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{plan.clients}</p>
                </div>

                <button
                  className={`w-full font-semibold py-3 px-4 rounded-lg mb-8 transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'border-2 border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                >
                  Start Free Trial
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Plan Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="text-left py-4 px-4 font-bold text-gray-900">Feature</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900">Solo</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900">Practice</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900">Organisation</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 text-gray-900 font-medium">Max Clients</td>
                    <td className="text-center py-4 px-4 text-gray-600">10</td>
                    <td className="text-center py-4 px-4 text-gray-600">50</td>
                    <td className="text-center py-4 px-4 text-gray-600">150</td>
                    <td className="text-center py-4 px-4 text-gray-600">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="py-4 px-4 text-gray-900 font-medium">Team Members</td>
                    <td className="text-center py-4 px-4 text-gray-600">1</td>
                    <td className="text-center py-4 px-4 text-gray-600">Up to 10</td>
                    <td className="text-center py-4 px-4 text-gray-600">Up to 50</td>
                    <td className="text-center py-4 px-4 text-gray-600">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 text-gray-900 font-medium">Voice Logging</td>
                    <td className="text-center py-4 px-4">✓</td>
                    <td className="text-center py-4 px-4">✓</td>
                    <td className="text-center py-4 px-4">✓</td>
                    <td className="text-center py-4 px-4">✓</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="py-4 px-4 text-gray-900 font-medium">AI Anomaly Detection</td>
                    <td className="text-center py-4 px-4">–</td>
                    <td className="text-center py-4 px-4">✓</td>
                    <td className="text-center py-4 px-4">✓</td>
                    <td className="text-center py-4 px-4">✓</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 text-gray-900 font-medium">Consent Management</td>
                    <td className="text-center py-4 px-4">Basic</td>
                    <td className="text-center py-4 px-4">Advanced</td>
                    <td className="text-center py-4 px-4">Advanced</td>
                    <td className="text-center py-4 px-4">Advanced</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="py-4 px-4 text-gray-900 font-medium">Dedicated Support</td>
                    <td className="text-center py-4 px-4">Email</td>
                    <td className="text-center py-4 px-4">Priority Email</td>
                    <td className="text-center py-4 px-4">Account Manager</td>
                    <td className="text-center py-4 px-4">24/7 Phone</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-blue-600 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to improve family communication?</h2>
            <p className="text-lg mb-8 text-blue-100">
              Start your free 14-day trial today. No credit card required.
            </p>
            <button className="bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-blue-50 transition-colors">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>

      {/* Footer Trust Indicators */}
      <div className="bg-gray-50 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">🇦🇺</div>
              <h3 className="font-bold text-gray-900 mb-1">Australian Data Hosting</h3>
              <p className="text-sm text-gray-600">All data stored in Sydney, Australia</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">🔒</div>
              <h3 className="font-bold text-gray-900 mb-1">NDIS Compliant</h3>
              <p className="text-sm text-gray-600">Built for NDIS quality standards</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">⚡</div>
              <h3 className="font-bold text-gray-900 mb-1">14-Day Free Trial</h3>
              <p className="text-sm text-gray-600">No credit card required</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
