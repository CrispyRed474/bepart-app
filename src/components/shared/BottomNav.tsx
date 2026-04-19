'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Calendar, Users, User, Activity, LayoutDashboard, Heart, UserCheck, Settings } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface BottomNavProps {
  portal: 'carer' | 'admin' | 'family'
}

const PORTAL_NAV_ITEMS: Record<'carer' | 'admin' | 'family', NavItem[]> = {
  carer: [
    { href: '/carer', label: 'Schedule', icon: <Calendar className="w-5 h-5" /> },
    { href: '/carer/clients', label: 'Clients', icon: <Users className="w-5 h-5" /> },
    { href: '/carer/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ],
  admin: [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/admin/clients', label: 'Clients', icon: <Heart className="w-5 h-5" /> },
    { href: '/admin/carers', label: 'Carers', icon: <UserCheck className="w-5 h-5" /> },
    { href: '/admin/family', label: 'Family', icon: <Users className="w-5 h-5" /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ],
  family: [
    { href: '/family', label: 'Feed', icon: <Activity className="w-5 h-5" /> },
    { href: '/family/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ],
}

export function BottomNav({ portal }: BottomNavProps) {
  const pathname = usePathname()
  const items = PORTAL_NAV_ITEMS[portal]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg safe-bottom">
      <div className="flex items-stretch max-w-6xl mx-auto">
        {items.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2 px-1 gap-0.5 text-xs font-medium transition-colors min-h-[56px]',
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <div className={cn('w-5 h-5', isActive && 'text-blue-600')}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
