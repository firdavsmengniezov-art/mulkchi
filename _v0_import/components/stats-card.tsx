"use client"

import { cn } from '@/lib/utils'

interface StatsCardProps {
  icon: React.ElementType
  label: string
  value: number | string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({ icon: Icon, label, value, trend, className }: StatsCardProps) {
  return (
    <div 
      className={cn(
        'flex flex-col p-4 bg-card rounded-xl',
        className
      )}
      style={{ boxShadow: 'var(--shadow)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium ml-auto',
            trend.isPositive ? 'text-green' : 'text-primary'
          )}>
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </span>
        )}
      </div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-sm text-muted-foreground mt-1">{label}</span>
    </div>
  )
}
