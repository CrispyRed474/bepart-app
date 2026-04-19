'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Client, CareLogEntry, Profile } from '@/types'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CareLogCard } from '@/components/shared/CareLogCard'
import { IncidentAlert } from '@/components/shared/IncidentAlert'
import Link from 'next/link'

export default function FamilyFeedPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [entries, setEntries] = useState<CareLogEntry[]>([])
  const [incidents, setIncidents] = useState<CareLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Subscribe to realtime updates
  const setupRealtimeSubscription = useCallback((clientId: string, orgId: string) => {
    const subscription = supabase
      .channel(`care-log-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'care_log_entries',
          filter: `client_id=eq.${clientId}`,
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            const newEntry = payload.new as CareLogEntry
            setEntries(prev => [newEntry, ...prev])
            if (newEntry.is_incident) {
              setIncidents(prev => [newEntry, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedEntry = payload.new as CareLogEntry
            setEntries(prev =>
              prev.map(e => (e.id === updatedEntry.id ? updatedEntry : e))
            )
          }
        }
      )
      .subscribe()

    return subscription
  }, [supabase])

  useEffect(() => {
    loadFeed()
  }, [])

  async function loadFeed() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get family profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(profileData)

      // Get linked client
      const { data: familyLink } = await supabase
        .from('family_client_links')
        .select('client:clients(*)')
        .eq('family_user_id', profileData.id)
        .single()

      if (familyLink?.client) {
        const linkedClient = familyLink.client as Client
        setClient(linkedClient)

        // Get care log entries
        const { data: entriesData } = await supabase
          .from('care_log_entries')
          .select('*')
          .eq('client_id', linkedClient.id)
          .order('logged_at', { ascending: false })
          .limit(50)

        setEntries(entriesData || [])

        // Filter incidents
        const incidentList = entriesData?.filter(e => e.is_incident) || []
        setIncidents(incidentList)

        // Setup realtime subscription
        setupRealtimeSubscription(linkedClient.id, profileData.org_id)
      }
    } catch (error) {
      console.error('Error loading feed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!client) return <Card className="p-8 text-center text-gray-600">No client linked</Card>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {client.full_name}'s Updates
        </h1>
        <p className="text-gray-600 mt-1">Care activity and updates</p>
      </div>

      {/* Critical Incidents Alert */}
      {incidents.length > 0 && (
        <div className="space-y-2">
          {incidents.slice(0, 3).map(incident => (
            <IncidentAlert key={incident.id} incident={incident} />
          ))}
        </div>
      )}

      {/* Care Feed */}
      {entries.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">No care updates yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <Link key={entry.id} href={`/family/feed/${entry.id}`}>
              <CareLogCard entry={entry} showCarer />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
