'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FamilyConsent } from '@/types'

interface ConsentGateProps {
  clientId: string
  clientName: string
  familyUserId: string
  familyUserName: string
  orgId: string
  onConsentChange?: (consentGiven: boolean) => void
}

/**
 * ConsentGate Component
 * Displays consent toggle for family members to receive care updates
 * Used during family link creation/management
 */
export function ConsentGate({
  clientId,
  clientName,
  familyUserId,
  familyUserName,
  orgId,
  onConsentChange,
}: ConsentGateProps) {
  const [consentRecord, setConsentRecord] = useState<FamilyConsent | null>(null)
  const [consentGiven, setConsentGiven] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadConsent()
  }, [clientId, familyUserId])

  async function loadConsent() {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('family_consent')
        .select('*')
        .eq('client_id', clientId)
        .eq('family_user_id', familyUserId)
        .maybeSingle()

      if (error) {
        console.error('Error loading consent:', error)
        setError('Failed to load consent status')
        return
      }

      if (data) {
        setConsentRecord(data)
        setConsentGiven(data.consent_given)
      } else {
        // No consent record yet - create one with default (false)
        setConsentGiven(false)
      }
    } catch (err) {
      console.error('Exception loading consent:', err)
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleConsentToggle(newValue: boolean) {
    try {
      setSaving(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('family_consent')
        .upsert(
          {
            client_id: clientId,
            family_user_id: familyUserId,
            org_id: orgId,
            consent_given: newValue,
            consent_given_at: newValue ? new Date().toISOString() : null,
            consent_reason: newValue ? 'Family member explicitly granted consent' : null,
          },
          { onConflict: 'client_id,family_user_id' }
        )
        .select()
        .single()

      if (error) {
        console.error('Error saving consent:', error)
        setError('Failed to save consent')
        return
      }

      setConsentRecord(data)
      setConsentGiven(newValue)
      onConsentChange?.(newValue)
    } catch (err) {
      console.error('Exception saving consent:', err)
      setError('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-gray-500">Loading consent status...</div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Consent to Share Care Updates</h3>
      
      <p className="text-sm text-gray-700 mb-4">
        Care activity records including activity logs and daily updates will be shared in real time
        with <strong>{familyUserName}</strong> for client <strong>{clientName}</strong>.
        Consent must be given by the care recipient or their legal guardian/nominee.
        You can withdraw consent at any time in Settings.
      </p>

      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => handleConsentToggle(e.target.checked)}
            disabled={saving}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className={`text-sm font-medium ${consentGiven ? 'text-green-700' : 'text-gray-700'}`}>
            {consentGiven ? '✓ Consent given' : 'No consent'}
          </span>
        </label>

        {saving && <span className="text-xs text-gray-500">Saving...</span>}
      </div>

      <p className="text-xs text-gray-600 mt-3">
        {consentGiven
          ? 'Care updates will be shared with this family member.'
          : 'This family member will NOT receive care updates until explicit consent is granted.'}
      </p>
    </div>
  )
}
