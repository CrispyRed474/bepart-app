export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Link2, Mail } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { ManageFamilyLinks } from './ManageFamilyLinks'

export default async function AdminFamilyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  const [{ data: familyMembers }, { data: clients }, { data: links }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('org_id', profile.org_id)
      .eq('role', 'family')
      .order('full_name'),
    supabase
      .from('clients')
      .select('id, full_name')
      .eq('org_id', profile.org_id)
      .eq('is_active', true),
    supabase
      .from('family_client_links')
      .select('*, client:clients(full_name)')
      .eq('org_id', profile.org_id),
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Family Members</h2>
        <Badge variant="info">{familyMembers?.length ?? 0} total</Badge>
      </div>

      {familyMembers && familyMembers.length > 0 ? (
        <div className="space-y-3">
          {familyMembers.map(member => {
            const memberLinks = links?.filter(l => l.family_user_id === member.id) ?? []
            return (
              <Card key={member.id}>
                <div className="flex items-start gap-4">
                  <Avatar src={member.avatar_url} name={member.full_name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{member.full_name}</h3>
                      <Badge variant="default">Family</Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </div>

                    {/* Linked clients */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">
                        <Link2 className="w-3 h-3 inline mr-1" />
                        Linked clients:
                      </p>
                      {memberLinks.length > 0 ? (
                        <div className="flex gap-1.5 flex-wrap">
                          {memberLinks.map(link => (
                            <Badge key={link.id} variant="success">
                              {(link.client as any)?.full_name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No clients linked</p>
                      )}
                    </div>

                    {/* Manage links */}
                    <ManageFamilyLinks
                      familyUserId={member.id}
                      orgId={profile.org_id}
                      clients={clients ?? []}
                      currentLinks={memberLinks}
                    />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-10">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No family members registered yet</p>
            <p className="text-xs text-gray-400 mt-1">Family members sign up at /auth/signup</p>
          </div>
        </Card>
      )}
    </div>
  )
}
