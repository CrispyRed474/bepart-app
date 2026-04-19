'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Client, Profile } from '@/types'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { format } from 'date-fns'
import { LogOut } from 'lucide-react'

export default function FamilyProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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
        setClient(familyLink.client as Client)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Care Member Profile</h1>
      </div>

      {/* Your Profile */}
      {profile && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h2>
          <div className="flex gap-4 items-start">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="lg" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{profile.full_name}</h3>
              <p className="text-gray-600">{profile.email}</p>
              {profile.phone && <p className="text-gray-600">{profile.phone}</p>}
            </div>
          </div>
        </Card>
      )}

      {/* Linked Client Profile */}
      {client ? (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Care Member Information
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <Avatar src={client.photo_url} name={client.full_name} size="lg" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{client.full_name}</h3>
                {client.dob && (
                  <p className="text-sm text-gray-600">
                    DOB: {format(new Date(client.dob), 'dd MMMM yyyy')}
                  </p>
                )}
                <p className="text-sm text-gray-600 capitalize">
                  Care Type: {client.care_type}
                </p>
              </div>
            </div>

            {client.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Care Notes
                </h4>
                <p className="text-sm text-gray-600">{client.notes}</p>
              </div>
            )}

            {client.ndis_number && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  NDIS Number
                </p>
                <p className="text-sm text-gray-900">{client.ndis_number}</p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center text-gray-600">
          <p>No care member linked to your account</p>
        </Card>
      )}

      <Button
        variant="danger"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </Button>
    </div>
  )
}
