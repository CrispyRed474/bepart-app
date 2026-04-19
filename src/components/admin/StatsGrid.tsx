'use client'

import { StatCard } from './StatCard'

interface StatsGridProps {
  clientCount: number
  carerCount: number
  familyCount: number
  logCount: number
}

export function StatsGrid({ clientCount, carerCount, familyCount, logCount }: StatsGridProps) {
  const stats = [
    { label: 'Active Clients', value: clientCount, iconType: 'heart' as const, color: 'text-rose-600 bg-rose-50', href: '/admin/clients' },
    { label: 'Care Workers', value: carerCount, iconType: 'users' as const, color: 'text-blue-600 bg-blue-50', href: '/admin/carers' },
    { label: 'Family Members', value: familyCount, iconType: 'users' as const, color: 'text-teal-600 bg-teal-50', href: '/admin/family' },
    { label: 'Total Log Entries', value: logCount, iconType: 'clipboard' as const, color: 'text-purple-600 bg-purple-50', href: '#' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(stat => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          iconType={stat.iconType}
          color={stat.color}
          href={stat.href}
        />
      ))}
    </div>
  )
}
