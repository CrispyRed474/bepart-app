import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateStr)
}

export const ENTRY_TYPE_LABELS: Record<string, string> = {
  activity: 'Activity',
  medication: 'Medication',
  incident: 'Incident',
  note: 'Note',
  meal: 'Meal',
  hygiene: 'Hygiene',
  health: 'Health',
}

export const ENTRY_TYPE_COLORS: Record<string, string> = {
  activity: 'bg-blue-100 text-blue-800',
  medication: 'bg-purple-100 text-purple-800',
  incident: 'bg-red-100 text-red-800',
  note: 'bg-gray-100 text-gray-800',
  meal: 'bg-green-100 text-green-800',
  hygiene: 'bg-teal-100 text-teal-800',
  health: 'bg-orange-100 text-orange-800',
}

export const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
  critical: 'bg-red-900 text-white',
}
