'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, AlertCircle, Loader } from 'lucide-react'

interface Organisation {
  id: string
  name: string
  ai_screening_enabled: boolean
}

export default function AdminSettingsPage() {
  const supabase = createClient()
  const [org, setOrg] = useState<Organisation | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch organisation
  useEffect(() => {
    const fetchOrg = async () => {
      setLoading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('user_id', user.id)
        .single()

      if (!profile) {
        setLoading(false)
        return
      }

      // Fetch organisation
      const { data: orgData, error } = await supabase
        .from('organisations')
        .select('id, name, ai_screening_enabled')
        .eq('id', profile.org_id)
        .single()

      if (error) {
        console.error('Error fetching organisation:', error)
        setLoading(false)
        return
      }

      setOrg(orgData)
      setLoading(false)
    }

    fetchOrg()
  }, [supabase])

  // Toggle AI screening
  const handleToggleAIScreening = async () => {
    if (!org) return

    setToggling(true)
    setMessage(null)

    try {
      const newStatus = !org.ai_screening_enabled

      const { error } = await supabase
        .from('organisations')
        .update({
          ai_screening_enabled: newStatus,
          ai_screening_enabled_at: newStatus ? new Date().toISOString() : null,
        })
        .eq('id', org.id)

      if (error) {
        throw error
      }

      // Update local state
      setOrg({ ...org, ai_screening_enabled: newStatus })
      setMessage({
        type: 'success',
        text: newStatus
          ? 'AI Screening enabled. Your team will now only see notes with potential issues.'
          : 'AI Screening disabled. Your team will review all notes manually.',
      })
    } catch (error) {
      console.error('Error toggling AI screening:', error)
      setMessage({
        type: 'error',
        text: 'Failed to update AI Screening setting. Please try again.',
      })
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Failed to load organisation settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organisation Settings</h1>
          <p className="text-gray-600 mt-2">Manage {org.name}</p>
        </div>

        {/* Messages */}
        {message && (
          <div className={clsx(
            'mb-6 p-4 rounded-lg flex items-start gap-3',
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          )}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <p className={message.type === 'success' ? 'text-green-900' : 'text-red-900'}>
              {message.text}
            </p>
          </div>
        )}

        {/* AI Screening Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Screening Add-on</h2>
              <p className="text-gray-600 mt-2">Intelligent note pre-screening for your organisation</p>
            </div>
            <div className="flex items-center gap-3">
              {org.ai_screening_enabled ? (
                <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <Check className="w-4 h-4" />
                  Enabled
                </span>
              ) : (
                <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  <X className="w-4 h-4" />
                  Disabled
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-gray-900">
              Our AI pre-screens every note against resident profiles. Only notes with potential issues land in your review queue. Saves hours of manual review every week.
            </p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What's included:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Automatic allergy violation detection</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Dietary restriction breach alerts</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Care plan contradiction detection</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Safeguarding language flagging</span>
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-gray-900">
              <span className="font-semibold">$29/mo</span> per organisation
            </p>
          </div>

          {/* Billing Note */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-amber-900 text-sm">
              Billing integration coming soon — contact <a href="mailto:hello@bepart.ai" className="underline font-semibold">hello@bepart.ai</a> to enable.
            </p>
          </div>

          {/* Toggle Button */}
          <div className="flex gap-4">
            <button
              onClick={handleToggleAIScreening}
              disabled={toggling}
              className={clsx(
                'px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2',
                org.ai_screening_enabled
                  ? 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
              )}
            >
              {toggling && <Loader className="w-5 h-5 animate-spin" />}
              {org.ai_screening_enabled
                ? 'Disable AI Screening'
                : 'Enable AI Screening — $29/mo'}
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-700 mb-4">
            For questions about AI Screening or to discuss custom billing arrangements, please contact:
          </p>
          <a
            href="mailto:hello@bepart.ai"
            className="text-blue-600 font-semibold hover:underline"
          >
            hello@bepart.ai
          </a>
        </div>
      </div>
    </div>
  )
}

// Import clsx for className utilities
import clsx from 'clsx'
