import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, User, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'

export default async function AdminClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('full_name')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Clients</h2>
        <Link href="/admin/clients/new">
          <Button size="sm">
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </Link>
      </div>

      {clients && clients.length > 0 ? (
        <div className="space-y-3">
          {clients.map(client => (
            <Link key={client.id} href={`/admin/clients/${client.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Avatar src={client.photo_url} name={client.full_name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{client.full_name}</h3>
                      {client.is_active
                        ? <Badge variant="success">Active</Badge>
                        : <Badge variant="default">Inactive</Badge>
                      }
                      <Badge variant="info">
                        {client.care_type === 'ndis' ? 'NDIS' : client.care_type === 'aged_care' ? 'Aged Care' : 'NDIS + Aged Care'}
                      </Badge>
                    </div>
                    <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                      {client.dob && <span>DOB: {formatDate(client.dob)}</span>}
                      {client.ndis_number && <span>NDIS: {client.ndis_number}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-10">
            <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No clients yet</p>
            <Link href="/admin/clients/new" className="mt-2 inline-block">
              <Button size="sm" variant="outline">Add first client</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
