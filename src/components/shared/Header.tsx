'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()

  // Only show header on public pages
  const publicPages = ['/', '/pricing', '/features', '/blog', '/contact']
  const isPublicPage = publicPages.some(
    p => pathname === p || pathname.startsWith(p + '/')
  )

  if (!isPublicPage) {
    return null
  }

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          BePart
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            href="/features"
            className={cn(
              'font-medium text-sm transition-colors',
              pathname.startsWith('/features')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className={cn(
              'font-medium text-sm transition-colors',
              pathname.startsWith('/pricing')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            className={cn(
              'font-medium text-sm transition-colors',
              pathname.startsWith('/blog')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className={cn(
              'font-medium text-sm transition-colors',
              pathname === '/contact'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Contact
          </Link>
          <Link
            href="/auth/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  )
}
