import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/shared/TopBar'
import { BottomNav } from '@/components/shared/BottomNav'

export default async function CarerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'carer') {
    redirect(profile ? `/${profile.role}` : '/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        profile={profile}
        title="My Schedule"
        portalLabel="Carer"
        portalColor="bg-blue-100 text-blue-800"
      />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {children}
      </main>
      <BottomNav portal="carer" />
    </div>
  )
}
