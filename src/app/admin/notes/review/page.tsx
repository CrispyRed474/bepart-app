'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import clsx from 'clsx'

interface FlaggedNote {
  id: string
  client_id: string
  carer_id: string
  title: string
  description: string
  ai_flagged_issues: string[]
  ai_scan_result: {
    flagged: boolean
    issues: string[]
    severity: 'low' | 'medium' | 'high'
  }
  created_at: string
  client: { full_name: string }
  carer: { full_name: string }
}

type FilterType = 'all' | 'today' | 'week'

export default function NotesReviewPage() {
  const supabase = createClient()
  const [notes, setNotes] = useState<FlaggedNote[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedNote, setSelectedNote] = useState<FlaggedNote | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  // Fetch flagged notes
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true)

      let query = supabase
        .from('care_log_entries')
        .select(
          `
          id,
          client_id,
          carer_id,
          title,
          description,
          ai_flagged_issues,
          ai_scan_result,
          created_at,
          client:clients(full_name),
          carer:profiles(full_name)
        `
        )
        .eq('status', 'flagged')
        .order('created_at', { ascending: false })

      // Apply date filters
      const now = new Date()
      if (filter === 'today') {
        const startOfDay = new Date(now)
        startOfDay.setHours(0, 0, 0, 0)
        query = query.gte('created_at', startOfDay.toISOString())
      } else if (filter === 'week') {
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        query = query.gte('created_at', weekAgo.toISOString())
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching notes:', error)
        return
      }

      setNotes(data || [])
      setLoading(false)
    }

    fetchNotes()
  }, [filter, supabase])

  // Handle approve action
  const handleApprove = async (noteId: string) => {
    setActionInProgress(noteId)

    try {
      const response = await fetch(`/api/notes/${noteId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          description: editDescription || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve note')
      }

      // Remove from list
      setNotes(notes.filter((n) => n.id !== noteId))
      setSelectedNote(null)
      setEditDescription('')
    } catch (error) {
      console.error('Approve error:', error)
      alert('Failed to approve note')
    } finally {
      setActionInProgress(null)
    }
  }

  // Handle reject action
  const handleReject = async (noteId: string) => {
    if (!confirm('Are you sure you want to reject this note? It will not be shared with family.')) {
      return
    }

    setActionInProgress(noteId)

    try {
      const response = await fetch(`/api/notes/${noteId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject note')
      }

      // Remove from list
      setNotes(notes.filter((n) => n.id !== noteId))
      setSelectedNote(null)
    } catch (error) {
      console.error('Reject error:', error)
      alert('Failed to reject note')
    } finally {
      setActionInProgress(null)
    }
  }

  // Handle escalate action
  const handleEscalate = async (noteId: string) => {
    setActionInProgress(noteId)

    try {
      const response = await fetch(`/api/notes/${noteId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'escalate' }),
      })

      if (!response.ok) {
        throw new Error('Failed to escalate note')
      }

      alert('Note escalated. It has been marked for further review.')
      // Optionally remove or keep in list
    } catch (error) {
      console.error('Escalate error:', error)
      alert('Failed to escalate note')
    } finally {
      setActionInProgress(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      case 'low':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'medium':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'low':
        return <AlertCircle className="w-5 h-5 text-blue-600" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flagged notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notes Review Queue</h1>
          <p className="text-gray-600">
            {notes.length} flagged note{notes.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          {(['all', 'today', 'week'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              )}
            >
              {f === 'all' ? 'All Flagged' : f === 'today' ? 'Today' : 'This Week'}
            </button>
          ))}
        </div>

        {/* Main Layout: List + Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {notes.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600" />
                  <p>No flagged notes in this period</p>
                </div>
              ) : (
                <ul className="divide-y max-h-[600px] overflow-y-auto">
                  {notes.map((note) => (
                    <li
                      key={note.id}
                      onClick={() => {
                        setSelectedNote(note)
                        setEditDescription(note.description)
                      }}
                      className={clsx(
                        'p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4',
                        selectedNote?.id === note.id
                          ? 'bg-blue-50 border-l-blue-600'
                          : 'border-l-red-600'
                      )}
                    >
                      <p className="font-semibold text-gray-900 truncate">
                        {note.client.full_name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{note.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(note.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedNote && (
            <div className="lg:col-span-2">
              <div className={clsx(
                'bg-white rounded-lg shadow p-6 border-l-4',
                selectedNote.ai_scan_result.severity === 'high'
                  ? 'border-l-red-600'
                  : selectedNote.ai_scan_result.severity === 'medium'
                  ? 'border-l-yellow-600'
                  : 'border-l-blue-600'
              )}>
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedNote.client.full_name}
                      </h2>
                      <p className="text-gray-600">
                        Carer: {selectedNote.carer.full_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(selectedNote.ai_scan_result.severity)}
                      <span className={clsx(
                        'px-3 py-1 rounded-full text-sm font-medium',
                        selectedNote.ai_scan_result.severity === 'high'
                          ? 'bg-red-100 text-red-800'
                          : selectedNote.ai_scan_result.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      )}>
                        {selectedNote.ai_scan_result.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedNote.created_at)}
                  </p>
                </div>

                {/* Title */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedNote.title}
                  </h3>
                </div>

                {/* Flagged Issues */}
                {selectedNote.ai_flagged_issues.length > 0 && (
                  <div className={clsx(
                    'mb-6 p-4 rounded-lg border',
                    getSeverityColor(selectedNote.ai_scan_result.severity)
                  )}>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      AI-Flagged Issues
                    </h4>
                    <ul className="space-y-2">
                      {selectedNote.ai_flagged_issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-900">
                          <span className="text-red-600 font-bold mt-0.5">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Note Content (Editable) */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Note Content
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    placeholder="Edit note if needed..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can edit the note before approval
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => handleApprove(selectedNote.id)}
                    disabled={actionInProgress === selectedNote.id}
                    className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedNote.id)}
                    disabled={actionInProgress === selectedNote.id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleEscalate(selectedNote.id)}
                    disabled={actionInProgress === selectedNote.id}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-5 h-5" />
                    Escalate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
