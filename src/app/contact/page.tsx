import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | BePart',
  description: 'Get in touch with the BePart team. We help NDIS and aged care providers communicate better with families.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-600">
            Interested in BePart for your NDIS or aged care organisation? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form
            action="https://formspree.io/f/br14n@elfloors.com.au"
            method="POST"
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="you@organisation.com.au"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="organisation" className="block text-sm font-medium text-gray-700 mb-1">
                  Organisation
                </label>
                <input
                  type="text"
                  id="organisation"
                  name="organisation"
                  placeholder="Your organisation name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  placeholder="Tell us about your organisation and what you're looking for..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Redirect after submit */}
              <input type="hidden" name="_next" value="https://bepart.com.au/contact/thanks" />
              <input type="hidden" name="_subject" value="BePart — New Contact Enquiry" />

              <button
                type="submit"
                className="w-full bg-sage-600 hover:bg-sage-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Send Message
              </button>
            </div>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            We&apos;ll respond within 1 business day.
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Or email us directly at{' '}
          <a href="mailto:hello@bepart.ai" className="text-sage-600 hover:underline">
            hello@bepart.ai
          </a>
        </p>
      </div>
    </div>
  )
}
