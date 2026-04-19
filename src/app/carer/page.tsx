'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, Client } from '@/types'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Clock, MapPin } from 'lucide-react'
import Link from 'next/link'

interface ScheduleEntry {
  client: Client
  time: string
  duration: string
  type: string
}

export default function CarerSchedulePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assignedClients, setAssignedClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(profileData)

      // Get assigned clients
      const { data: clientCarers } = await supabase
        .from('client_carers')
        .select('client:clients(*)')
        .eq('carer_id', profileData.id)

      const clients = clientCarers?.map(cc => cc.client as Client) || []
      setAssignedClients(clients)
    } catch (error) {
      console.error('Error loading schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const scheduleEntries: ScheduleEntry[] = assignedClients.map(client => ({
    client,
    time: '10:00 AM',
    duration: '2 hours',
    type: 'Regular Visit',
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Today's Schedule</h1>
        <p className="text-gray-600 mt-1">
          {scheduleEntries.length} {scheduleEntries.length === 1 ? 'visit' : 'visits'} scheduled
        </p>
      </div>

      {scheduleEntries.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">No visits scheduled for today</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {scheduleEntries.map((entry, i) => (
            <Link key={i} href={`/carer/clients/${entry.client.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-4 items-start">
                  <Avatar
                    src={entry.client.photo_url}
                    name={entry.client.full_name}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {entry.client.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">{entry.type}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {entry.time} • {entry.duration}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="default">Check-in</Badge>
                      <Badge variant="outline">Care Log</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
