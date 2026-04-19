'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

interface Props {
  familyUserId: string
  orgId: string
  clients: { id: string; full_name: string }[]
  currentLinks: { id: string; client_id: string }[]
}

export function ManageFamilyLinks({ familyUserId, orgId, clients, currentLinks }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [adding, setAdding] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState('')
  const [loading, setLoading] = useState(false)

  const linkedIds = currentLinks.map(l => l.client_id)
  const unlinkedClients = clients.filter(c => !linkedIds.includes(c.id))

  const handleAdd = async () => {
    if (!selectedClientId) return
    setLoading(true)
    try {
      await supabase.from('family_client_links').insert({
        family_user_id: familyUserId,
        client_id: selectedClientId,
        org_id: orgId,
      })
      setAdding(false)
      setSelectedClientId('')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (linkId: string) => {
    await supabase.from('family_client_links').delete().eq('id', linkId)
    router.refresh()
  }

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="text-xs text-sage-600 font-semibold hover:underline mt-2"
      >
        + Link another client
      </button>
    )
  }

  return (
    <div className="flex gap-2 items-end mt-2">
      <Select
        value={selectedClientId}
        onChange={(e) => setSelectedClientId(e.target.value)}
        className="flex-1"
      >
        <option value="">Select client...</option>
        {unlinkedClients.map(c => (
          <option key={c.id} value={c.id}>{c.full_name}</option>
        ))}
      </Select>
      <Button
        size="sm"
        loading={loading}
        onClick={handleAdd}
        disabled={!selectedClientId}
      >
        Link
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setAdding(false)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}
