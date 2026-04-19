import { AlertTriangle, X } from 'lucide-react'
import { CareLogEntry } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

interface IncidentAlertProps {
  entries: CareLogEntry[]
  onDismiss?: () => void
}

export function IncidentAlert({ entries, onDismiss }: IncidentAlertProps) {
  const incidents = entries.filter(e => e.is_incident)
  if (incidents.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-red-800">
            {incidents.length} Incident{incidents.length > 1 ? 's' : ''} Reported
          </h3>
          <ul className="mt-1 space-y-1">
            {incidents.slice(0, 3).map(inc => (
              <li key={inc.id} className="text-xs text-red-700">
                • {inc.title} — {formatRelativeTime(inc.logged_at)}
              </li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
