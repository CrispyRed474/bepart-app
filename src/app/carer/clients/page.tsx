'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Client, Profile } from '@/types'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

export default function CarerClientsPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(profileData)

      const { data: clientCarers } = await supabase
        .from('client_carers')
        .select('client:clients(*)')
        .eq('carer_id', profileData.id)

      const clientList = clientCarers?.map(cc => cc.client as Client) || []
      setClients(clientList)
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Clients</h1>
        <p className="text-gray-600 mt-1">{clients.length} active clients</p>
      </div>

      {clients.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">No clients assigned yet</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clients.map(client => (
            <Link key={client.id} href={`/carer/clients/${client.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-4 items-start">
                  <Avatar
                    src={client.photo_url}
                    name={client.full_name}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {client.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Care Type: {client.care_type}
                    </p>
                    {client.dob && (
                      <p className="text-xs text-gray-500 mt-1">
                        DOB: {new Date(client.dob).toLocaleDateString('en-AU')}
                      </p>
                    )}
                    <div className="mt-3">
                      <Badge variant="default">View Profile</Badge>
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
