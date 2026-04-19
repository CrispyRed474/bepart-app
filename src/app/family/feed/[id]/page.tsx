'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CareLogEntry } from '@/types'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { IncidentAlert } from '@/components/shared/IncidentAlert'
import { format } from 'date-fns'
import { ENTRY_TYPE_LABELS, ENTRY_TYPE_COLORS, SEVERITY_COLORS } from '@/lib/utils'
import { ArrowLeft, AlertTriangle, Clock, User } from 'lucide-react'

export default function FeedDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [entry, setEntry] = useState<CareLogEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntry()
  }, [params.id])

  async function loadEntry() {
    try {
      const { data } = await supabase
        .from('care_log_entries')
        .select('*, client:clients(*), carer:profiles(*)')
        .eq('id', params.id)
        .single()

      setEntry(data)
    } catch (error) {
      console.error('Error loading entry:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!entry) return <Card className="p-8 text-center">Entry not found</Card>

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Incident Alert */}
      {entry.is_incident && (
        <IncidentAlert incident={entry} />
      )}

      {/* Main Card */}
      <Card className={`p-6 ${entry.is_incident ? 'border-red-200 bg-red-50' : ''}`}>
        <div className="space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="default"
                className={ENTRY_TYPE_COLORS[entry.entry_type]}
              >
                {ENTRY_TYPE_LABELS[entry.entry_type]}
              </Badge>
              {entry.is_incident && entry.severity && (
                <Badge
                  variant="default"
                  className={SEVERITY_COLORS[entry.severity]}
                >
                  {entry.severity.toUpperCase()}
                </Badge>
              )}
              <span className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
                <Clock className="w-4 h-4" />
                {format(new Date(entry.logged_at), 'dd MMM yyyy HH:mm')}
              </span>
            </div>

            <h1 className={`text-2xl font-bold mt-3 ${
              entry.is_incident ? 'text-red-900' : 'text-gray-900'
            }`}>
              {entry.title}
            </h1>
          </div>

          {/* Description */}
          <div>
            <h2 className={`text-sm font-medium mb-2 ${
              entry.is_incident ? 'text-red-800' : 'text-gray-700'
            }`}>
              Details
            </h2>
            <p className={`whitespace-pre-wrap text-base ${
              entry.is_incident ? 'text-red-700' : 'text-gray-700'
            }`}>
              {entry.description}
            </p>
          </div>

          {/* Photos */}
          {entry.photo_urls && entry.photo_urls.length > 0 && (
            <div>
              <h2 className="text-sm font-medium mb-3 text-gray-700">
                Photos ({entry.photo_urls.length})
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {entry.photo_urls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="w-full rounded-lg max-h-96 object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Care Provider Info */}
          {entry.carer && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                Recorded by
              </p>
              <div className="flex items-center gap-3">
                <Avatar
                  src={entry.carer.avatar_url}
                  name={entry.carer.full_name}
                  size="md"
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {entry.carer.full_name}
                  </p>
                  <p className="text-xs text-gray-500">{entry.carer.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
