import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserCheck, Mail, Phone } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'

export default async function AdminCarersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  const { data: carers } = await supabase
    .from('profiles')
    .select('*')
    .eq('org_id', profile.org_id)
    .eq('role', 'carer')
    .order('full_name')

  // Get log counts per carer
  const carerIds = carers?.map(c => c.id) ?? []
  const logCounts: Record<string, number> = {}

  if (carerIds.length > 0) {
    for (const carerId of carerIds) {
      const { count } = await supabase
        .from('care_log_entries')
        .select('*', { count: 'exact', head: true })
        .eq('carer_id', carerId)
      logCounts[carerId] = count ?? 0
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Care Workers</h2>
        <Badge variant="info">{carers?.length ?? 0} total</Badge>
      </div>

      {carers && carers.length > 0 ? (
        <div className="space-y-3">
          {carers.map(carer => (
            <Card key={carer.id}>
              <div className="flex items-start gap-4">
                <Avatar src={carer.avatar_url} name={carer.full_name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{carer.full_name}</h3>
                    <Badge variant="info">Carer</Badge>
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mail className="w-3 h-3" />
                      {carer.email}
                    </div>
                    {carer.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        {carer.phone}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex gap-3">
                    <span className="text-xs text-gray-500">
                      {logCounts[carer.id] ?? 0} log entries
                    </span>
                    <span className="text-xs text-gray-400">
                      Joined {formatDate(carer.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-10">
            <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No carers registered yet</p>
            <p className="text-xs text-gray-400 mt-1">Carers sign up at /auth/signup</p>
          </div>
        </Card>
      )}
    </div>
  )
}
