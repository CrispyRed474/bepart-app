import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { IncidentAlert } from '@/components/shared/IncidentAlert'
import { CareLogCard } from '@/components/shared/CareLogCard'
import { StatsGrid } from '@/components/admin/StatsGrid'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  // Fetch stats in parallel
  const [
    { count: clientCount },
    { count: carerCount },
    { count: familyCount },
    { count: logCount },
    { data: recentLogs },
    { data: incidents },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('org_id', profile.org_id).eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('org_id', profile.org_id).eq('role', 'carer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('org_id', profile.org_id).eq('role', 'family'),
    supabase.from('care_log_entries').select('*', { count: 'exact', head: true }).eq('org_id', profile.org_id),
    supabase.from('care_log_entries')
      .select('*, client:clients(full_name), carer:profiles!care_log_entries_carer_id_fkey(full_name, avatar_url)')
      .eq('org_id', profile.org_id)
      .order('logged_at', { ascending: false })
      .limit(5),
    supabase.from('care_log_entries')
      .select('*, client:clients(full_name), carer:profiles!care_log_entries_carer_id_fkey(full_name, avatar_url)')
      .eq('org_id', profile.org_id)
      .eq('is_incident', true)
      .order('logged_at', { ascending: false })
      .limit(5),
  ])



  return (
    <div className="space-y-6">
      {/* Incident alerts */}
      {incidents && incidents.length > 0 && (
        <IncidentAlert entries={incidents as any} />
      )}

      {/* Stats */}
      <StatsGrid
        clientCount={clientCount ?? 0}
        carerCount={carerCount ?? 0}
        familyCount={familyCount ?? 0}
        logCount={logCount ?? 0}
      />

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          <Link href="/admin/clients" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {recentLogs && recentLogs.length > 0 ? (
          <div className="space-y-3">
            {recentLogs.map(entry => (
              <CareLogCard
                key={entry.id}
                entry={entry as any}
                showClient
                showCarer
              />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-sm text-gray-500 text-center py-6">No activity yet</p>
          </Card>
        )}
      </div>
    </div>
  )
}
