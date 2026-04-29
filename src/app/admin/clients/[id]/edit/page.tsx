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
    allergies: [] as string[],
    dietary_restrictions: [] as string[],
    medical_conditions: [] as string[],
    care_plan_notes: '',
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
          allergies: data.allergies ?? [],
          dietary_restrictions: data.dietary_restrictions ?? [],
          medical_conditions: data.medical_conditions ?? [],
          care_plan_notes: data.care_plan_notes ?? '',
        })
      }
      setFetching(false)
    })
  }, [id])

  const set = (field: string, value: string | boolean | string[]) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const addArrayItem = (field: 'allergies' | 'dietary_restrictions' | 'medical_conditions', value: string) => {
    if (value.trim()) {
      setForm(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value]
      }))
    }
  }

  const removeArrayItem = (field: 'allergies' | 'dietary_restrictions' | 'medical_conditions', index: number) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

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
        allergies: form.allergies.length > 0 ? form.allergies : null,
        dietary_restrictions: form.dietary_restrictions.length > 0 ? form.dietary_restrictions : null,
        medical_conditions: form.medical_conditions.length > 0 ? form.medical_conditions : null,
        care_plan_notes: form.care_plan_notes || null,
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

          {/* Medical & Care Profile Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Medical & Care Profile</h3>
            <p className="text-xs text-gray-500 mb-4">Information used by the AI safety scanning system to flag potential care concerns.</p>

            {/* Allergies */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="allergies-input"
                  placeholder="Enter allergy (e.g., peanuts)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement
                      addArrayItem('allergies', input.value)
                      input.value = ''
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('allergies-input') as HTMLInputElement
                    addArrayItem('allergies', input.value)
                    input.value = ''
                  }}
                  className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.allergies.map((allergy, i) => (
                  <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {allergy}
                    <button type="button" onClick={() => removeArrayItem('allergies', i)} className="text-blue-600 hover:text-blue-900">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="dietary-input"
                  placeholder="Enter dietary restriction (e.g., vegan)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement
                      addArrayItem('dietary_restrictions', input.value)
                      input.value = ''
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('dietary-input') as HTMLInputElement
                    addArrayItem('dietary_restrictions', input.value)
                    input.value = ''
                  }}
                  className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.dietary_restrictions.map((restriction, i) => (
                  <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {restriction}
                    <button type="button" onClick={() => removeArrayItem('dietary_restrictions', i)} className="text-green-600 hover:text-green-900">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="medical-input"
                  placeholder="Enter medical condition (e.g., diabetes)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement
                      addArrayItem('medical_conditions', input.value)
                      input.value = ''
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('medical-input') as HTMLInputElement
                    addArrayItem('medical_conditions', input.value)
                    input.value = ''
                  }}
                  className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.medical_conditions.map((condition, i) => (
                  <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {condition}
                    <button type="button" onClick={() => removeArrayItem('medical_conditions', i)} className="text-yellow-600 hover:text-yellow-900">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Care Plan Notes */}
            <Textarea
              label="Care Plan Notes"
              value={form.care_plan_notes}
              onChange={e => set('care_plan_notes', e.target.value)}
              rows={4}
              placeholder="Overview of care plan, important notes for staff..."
            />
          </div>

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
