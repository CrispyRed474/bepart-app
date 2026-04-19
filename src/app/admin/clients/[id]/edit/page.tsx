'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/LoadingSpinner'

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    dob: '',
    ndis_number: '',
    care_type: 'ndis',
    notes: '',
    is_active: true,
  })

  useEffect(() => {
    supabase.from('clients').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setForm({
          full_name: data.full_name,
          dob: data.dob ?? '',
          ndis_number: data.ndis_number ?? '',
          care_type: data.care_type,
          notes: data.notes ?? '',
          is_active: data.is_active,
        })
      }
      setFetching(false)
    })
  }, [id])

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: updateError } = await supabase
      .from('clients')
      .update({
        full_name: form.full_name,
        dob: form.dob || null,
        ndis_number: form.ndis_number || null,
        care_type: form.care_type,
        notes: form.notes || null,
        is_active: form.is_active,
      })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push(`/admin/clients/${id}`)
    router.refresh()
  }

  if (fetching) return <PageLoader />

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/admin/clients/${id}`} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold text-gray-900">Edit Client</h2>
      </div>

      <Card>
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name *" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
          <Input label="Date of birth" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
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
          <Input label="NDIS number" value={form.ndis_number} onChange={e => set('ndis_number', e.target.value)} />
          <Textarea label="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} rows={4} />

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => set('is_active', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            Active client
          </label>

          <div className="flex gap-3 pt-2">
            <Link href={`/admin/clients/${id}`} className="flex-1">
              <Button variant="secondary" className="w-full">Cancel</Button>
            </Link>
            <Button type="submit" className="flex-1" loading={loading}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
