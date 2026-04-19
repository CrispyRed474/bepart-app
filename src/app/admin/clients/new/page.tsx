'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'

export default function NewClientPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    dob: '',
    ndis_number: '',
    care_type: 'ndis',
    notes: '',
  })

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .single()

    if (!profile) {
      setError('Could not load profile')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('clients').insert({
      org_id: profile.org_id,
      full_name: form.full_name,
      dob: form.dob || null,
      ndis_number: form.ndis_number || null,
      care_type: form.care_type,
      notes: form.notes || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin/clients')
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/clients" className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold text-gray-900">New Client</h2>
      </div>

      <Card>
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name *"
            value={form.full_name}
            onChange={e => set('full_name', e.target.value)}
            required
            placeholder="Margaret Thompson"
          />

          <Input
            label="Date of birth"
            type="date"
            value={form.dob}
            onChange={e => set('dob', e.target.value)}
          />

          <Select
            label="Care type"
            value={form.care_type}
            onChange={e => set('care_type', e.target.value)}
            options={[
              { value: 'ndis', label: 'NDIS' },
              { value: 'aged_care', label: 'Aged Care' },
              { value: 'both', label: 'NDIS + Aged Care' },
            ]}
          />

          <Input
            label="NDIS number"
            value={form.ndis_number}
            onChange={e => set('ndis_number', e.target.value)}
            placeholder="430123456"
          />

          <Textarea
            label="Notes"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Care needs, preferences, important information..."
            rows={4}
          />

          <div className="flex gap-3 pt-2">
            <Link href="/admin/clients" className="flex-1">
              <Button variant="secondary" className="w-full">Cancel</Button>
            </Link>
            <Button type="submit" className="flex-1" loading={loading}>
              Create Client
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
