'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { Profile } from '@/types'

interface TopBarProps {
  profile: Profile
  title: string
  portalLabel: string
  portalColor: string
}

export function TopBar({ profile, title, portalLabel, portalColor }: TopBarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${portalColor}`}>
            {portalLabel}
          </div>
          <h1 className="text-base font-semibold text-gray-900 hidden sm:block">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 relative">
            <Bell className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {profile.full_name.split(' ')[0]}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
