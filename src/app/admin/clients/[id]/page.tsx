export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { CareLogCard } from '@/components/shared/CareLogCard'
import { formatDate } from '@/lib/utils'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: client }, { data: logs }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase
      .from('care_log_entries')
      .select('*, carer:profiles!care_log_entries_carer_id_fkey(full_name, avatar_url)')
      .eq('client_id', id)
      .order('logged_at', { ascending: false })
      .limit(20),
  ])

  if (!client) notFound()

  const incidents = logs?.filter(l => l.is_incident) ?? []

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/admin/clients" className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold text-gray-900 flex-1">Client Profile</h2>
        <Link href={`/admin/clients/${id}/edit`} className="p-2 rounded-xl hover:bg-gray-100">
          <Edit2 className="w-5 h-5" />
        </Link>
      </div>

      {/* Profile card */}
      <Card>
        <div className="flex items-start gap-4">
          <Avatar src={client.photo_url} name={client.full_name} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-gray-900">{client.full_name}</h3>
              {client.is_active
                ? <Badge variant="success">Active</Badge>
                : <Badge variant="default">Inactive</Badge>
              }
            </div>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              {client.dob && <div>DOB: {formatDate(client.dob)}</div>}
              {client.ndis_number && <div>NDIS: {client.ndis_number}</div>}
              <div>
                <Badge variant="info">
                  {client.care_type === 'ndis' ? 'NDIS' : client.care_type === 'aged_care' ? 'Aged Care' : 'NDIS + Aged Care'}
                </Badge>
              </div>
            </div>
            {client.notes && (
              <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                {client.notes}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Incident summary */}
      {incidents.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-red-800 font-semibold text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            {incidents.length} incident{incidents.length > 1 ? 's' : ''} on record
          </div>
          <div className="space-y-2">
            {incidents.slice(0, 3).map(inc => (
              <div key={inc.id} className="text-xs text-red-700">• {inc.title}</div>
            ))}
          </div>
        </div>
      )}

      {/* Log history */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Care Log ({logs?.length ?? 0} entries)
        </h3>

        {logs && logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map(entry => (
              <CareLogCard
                key={entry.id}
                entry={entry as any}
                showCarer
              />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-sm text-gray-500 text-center py-6">No log entries yet</p>
          </Card>
        )}
      </div>
    </div>
  )
}
