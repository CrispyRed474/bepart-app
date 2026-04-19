import { AlertTriangle, Clock, User } from 'lucide-react'
import { CareLogEntry } from '@/types'
import { cn, formatRelativeTime, ENTRY_TYPE_LABELS, ENTRY_TYPE_COLORS, SEVERITY_COLORS } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'

interface CareLogCardProps {
  entry: CareLogEntry
  showClient?: boolean
  showCarer?: boolean
  onClick?: () => void
}

export function CareLogCard({ entry, showClient, showCarer, onClick }: CareLogCardProps) {
  const isIncident = entry.is_incident

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border p-4 transition-all',
        isIncident
          ? 'border-red-200 bg-red-50 shadow-red-100 shadow-sm'
          : 'border-gray-100 shadow-sm hover:shadow-md',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {isIncident && (
          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
              ENTRY_TYPE_COLORS[entry.entry_type]
            )}>
              {ENTRY_TYPE_LABELS[entry.entry_type]}
            </span>

            {isIncident && entry.severity && (
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase',
                SEVERITY_COLORS[entry.severity]
              )}>
                {entry.severity}
              </span>
            )}

            <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(entry.logged_at)}
            </span>
          </div>

          <h3 className={cn(
            'mt-1.5 text-sm font-semibold',
            isIncident ? 'text-red-900' : 'text-gray-900'
          )}>
            {entry.title}
          </h3>

          <p className={cn(
            'mt-1 text-sm line-clamp-2',
            isIncident ? 'text-red-700' : 'text-gray-600'
          )}>
            {entry.description}
          </p>

          {/* Photos */}
          {entry.photo_urls && entry.photo_urls.length > 0 && (
            <div className="mt-2 flex gap-1.5 flex-wrap">
              {entry.photo_urls.slice(0, 3).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
              ))}
              {entry.photo_urls.length > 3 && (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                  +{entry.photo_urls.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-2 flex items-center gap-3">
            {showClient && entry.client && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <User className="w-3 h-3" />
                {entry.client.full_name}
              </span>
            )}

            {showCarer && entry.carer && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Avatar src={entry.carer.avatar_url} name={entry.carer.full_name} size="sm" />
                <span className="text-xs text-gray-500">{entry.carer.full_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
