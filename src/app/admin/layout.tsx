export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/shared/TopBar'
import { BottomNav } from '@/components/shared/BottomNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect(profile ? `/${profile.role}` : '/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        profile={profile}
        title="Admin Portal"
        portalLabel="Admin"
        portalColor="bg-purple-100 text-purple-800"
      />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {children}
      </main>
      <BottomNav portal="admin" />
    </div>
  )
}
