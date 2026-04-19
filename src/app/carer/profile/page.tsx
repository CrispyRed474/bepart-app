'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { LogOut, Edit2 } from 'lucide-react'

export default function CarerProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(data)
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
  if (!profile) return null

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 items-start">
          <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {profile.full_name}
            </h2>
            <p className="text-gray-600 mt-1">{profile.email}</p>
            {profile.phone && <p className="text-gray-600">{profile.phone}</p>}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
            <p className="text-gray-900">{profile.email}</p>
          </div>
          {profile.phone && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
              <p className="text-gray-900">{profile.phone}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Role</p>
            <p className="text-gray-900 capitalize">{profile.role}</p>
          </div>
        </div>
      </Card>

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
