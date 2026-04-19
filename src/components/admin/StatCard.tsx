'use client'

import Link from 'next/link'
import { Heart, Users, ClipboardList } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface StatCardProps {
  label: string
  value: number
  iconType: 'heart' | 'users' | 'clipboard'
  color: string
  href: string
}

const ICON_MAP = {
  heart: Heart,
  users: Users,
  clipboard: ClipboardList,
}

export function StatCard({ label, value, iconType, color, href }: StatCardProps) {
  const Icon = ICON_MAP[iconType]

  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow">
        <div className={`inline-flex p-2.5 rounded-xl mb-3 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </Card>
    </Link>
  )
}
