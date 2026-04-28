import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog | BePart - NDIS & Aged Care Resources',
  description: 'Learn best practices for NDIS family communication, digital consent, activity logging, and more. Expert insights for care providers.',
}

export default function BlogPage() {
  const posts = [
    {
      slug: 'ndis-family-communication',
      title: 'How NDIS Providers Can Improve Family Communication (Without Adding Admin)',
      excerpt:
        'Discover practical strategies to improve family communication while reducing administrative burden. Real tips that work.',
      date: 'April 29, 2026',
      readTime: '6 min read',
      category: 'NDIS',
    },
    {
      slug: 'aged-care-digital-consent-2026',
      title: 'What Aged Care Providers Need to Know About Digital Consent in 2026',
      excerpt:
        'A practical guide to digital consent compliance under the Privacy Act and Aged Care Act 2024. Stay legally compliant.',
      date: 'April 29, 2026',
      readTime: '7 min read',
      category: 'Aged Care',
    },
    {
      slug: 'carer-activity-logging-guide',
      title: 'The Carer\'s Guide to Logging Activities Faster (Voice vs Manual)',
      excerpt:
        'Compare voice logging vs manual entry. Learn why voice-to-text is transforming care documentation and saving carers hours every week.',
      date: 'April 29, 2026',
      readTime: '5 min read',
      category: 'Best Practices',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Blog & Resources
          </h1>
          <p className="text-xl text-gray-600">
            Best practices, compliance guides, and insights for NDIS and aged care providers.
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-8 mb-16">
            {posts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{post.date}</span>
                    <span className="text-blue-600 font-semibold hover:text-blue-700">
                      Read Article →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="bg-blue-50 rounded-2xl p-12 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Stay Updated
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Get the latest NDIS compliance tips and best practices delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
