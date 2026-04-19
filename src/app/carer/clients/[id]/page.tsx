'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Client, CareLogEntry, Profile } from '@/types'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CareLogCard } from '@/components/shared/CareLogCard'
import { format } from 'date-fns'
import Link from 'next/link'
import { Activity, Pill, FileText, AlertTriangle } from 'lucide-react'

interface ClientProfile extends Client {
  conditions?: string[]
  medications?: string[]
}

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [client, setClient] = useState<ClientProfile | null>(null)
  const [logEntries, setLogEntries] = useState<CareLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClientData()
  }, [params.id])

  async function loadClientData() {
    try {
      // Get client
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .single()

      setClient(clientData)

      // Get recent log entries
      const { data: entries } = await supabase
        .from('care_log_entries')
        .select('*')
        .eq('client_id', params.id)
        .order('logged_at', { ascending: false })
        .limit(20)

      setLogEntries(entries || [])
    } catch (error) {
      console.error('Error loading client:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !client) return <LoadingSpinner />

  const age = client.dob
    ? Math.floor(
        (new Date().getTime() - new Date(client.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      )
    : null

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <Card className="p-6">
        <div className="flex gap-4 items-start">
          <Avatar src={client.photo_url} name={client.full_name} size="xl" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{client.full_name}</h1>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              {age && <p>Age: {age} years</p>}
              {client.dob && <p>DOB: {format(new Date(client.dob), 'dd MMM yyyy')}</p>}
              {client.ndis_number && <p>NDIS: {client.ndis_number}</p>}
              <p className="capitalize">Care Type: {client.care_type}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/carer/clients/${client.id}/log`}>
          <Button className="w-full" variant="primary">
            <FileText className="w-4 h-4 mr-2" />
            New Log Entry
          </Button>
        </Link>
        <Link href={`/carer/clients/${client.id}/tasks`}>
          <Button className="w-full" variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Tasks
          </Button>
        </Link>
      </div>

      {/* Care Notes */}
      {client.notes && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Care Notes</h3>
          <p className="text-sm text-gray-600">{client.notes}</p>
        </Card>
      )}

      {/* Recent Activity Feed */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {logEntries.length === 0 ? (
          <Card className="p-4 text-center text-gray-500">
            No entries yet
          </Card>
        ) : (
          <div className="space-y-4">
            {logEntries.map(entry => (
              <Link
                key={entry.id}
                href={`/carer/clients/${client.id}/log/${entry.id}`}
              >
                <CareLogCard entry={entry} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
