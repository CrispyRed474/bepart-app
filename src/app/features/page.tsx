import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features | BePart - NDIS Care Worker App',
  description: 'Discover BePart features: voice-to-text logging, real-time family updates, AI anomaly detection, compliance reports, and more for NDIS care providers.',
}

export default function FeaturesPage() {
  const features = [
    {
      title: 'Voice-to-Text Activity Logging',
      description:
        'Save hours every week with voice-to-text activity logging. Carers can log activities naturally while in the field—no typing required. Our AI converts spoken entries into compliance-ready documentation automatically.',
      benefit: 'Carers spend less time on admin, more time caring.',
      icon: '🎤',
    },
    {
      title: 'Real-Time Family Updates Feed',
      description:
        'Keep families connected with real-time updates about their loved ones. Share activity summaries, photos, and progress notes instantly. Families stay informed without requesting updates.',
      benefit: 'Build trust and improve family engagement.',
      icon: '📱',
    },
    {
      title: 'Consent-Gated Family Access',
      description:
        'Legally compliant family access built in. Organisations control exactly what families see through granular consent management. Respects privacy while enabling transparency.',
      benefit: 'Comply with consent requirements while empowering families.',
      icon: '🔐',
    },
    {
      title: 'Compliance Documentation & Reports',
      description:
        'Generate compliance-ready reports instantly. Activity logs, incident records, and consent documentation are always audit-ready. Meet NDIS quality standards without extra work.',
      benefit: 'Never miss an audit requirement.',
      icon: '📋',
    },
    {
      title: 'AI Anomaly Detection for Risk Flagging',
      description:
        'Our AI monitors activity patterns and flags potential risks automatically. Detect unusual incidents, health changes, or safety concerns before they escalate. Carers and managers are alerted instantly.',
      benefit: 'Proactively identify and respond to risks.',
      icon: '⚠️',
    },
    {
      title: 'Australian Data Hosting (Sydney)',
      description:
        'All your data is hosted on Australian servers in Sydney. We comply with Australian Privacy Act requirements and NDIS data security standards. Your data never leaves Australia.',
      benefit: 'Meet local compliance requirements with peace of mind.',
      icon: '🇦🇺',
    },
    {
      title: 'Mobile-Optimized for Field Work',
      description:
        'BePart works beautifully on any device. Carers can log activities, access client information, and communicate with families—all from their phone while in the field. Offline mode means work continues even without internet.',
      benefit: 'Support carers wherever they are.',
      icon: '📲',
    },
    {
      title: 'Team Management & Coordination',
      description:
        'Manage teams of carers, assign clients, and coordinate schedules. Admin dashboards give you visibility into all activity. Assign permissions based on roles.',
      benefit: 'Scale your organisation with confidence.',
      icon: '👥',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features for NDIS Care Workers
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to log activities faster, communicate better, and stay compliant—built specifically for NDIS providers.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
            {features.map((feature, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex-shrink-0 text-5xl">{feature.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-3 rounded">
                    <p className="text-sm font-semibold text-blue-900">{feature.benefit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Why BePart */}
          <div className="bg-gray-50 rounded-2xl p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why NDIS Providers Choose BePart
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-3">6+ hours</div>
                <p className="text-gray-700 font-semibold mb-2">Saved per week per carer</p>
                <p className="text-sm text-gray-600">
                  Voice logging eliminates manual typing and paperwork.
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-3">100%</div>
                <p className="text-gray-700 font-semibold mb-2">Audit-ready documentation</p>
                <p className="text-sm text-gray-600">
                  Compliance requirements met automatically.
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-3">10x</div>
                <p className="text-gray-700 font-semibold mb-2">Faster incident response</p>
                <p className="text-sm text-gray-600">
                  AI detection flags risks before they escalate.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-gray-200 rounded-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Security & Compliance</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span>End-to-end encryption for sensitive data</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span>Australian Privacy Act compliant</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span>NDIS quality standards certified</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span>Regular security audits</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span>99.9% uptime SLA (Enterprise)</span>
                  </li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Capabilities</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span>Works on iOS, Android, web browsers</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span>Offline mode for seamless operation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span>Real-time sync across devices</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span>Integration with NDIS-approved tools</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span>API access for custom integrations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-blue-600 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to transform your organisation?</h2>
            <p className="text-lg mb-8 text-blue-100">
              See BePart in action with a free 14-day trial. No credit card required.
            </p>
            <button className="bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-blue-50 transition-colors">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
