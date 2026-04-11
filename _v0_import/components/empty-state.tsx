"use client"

import { Search, FileQuestion, MessageCircle, Heart, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type EmptyStateType = 'search' | 'listings' | 'messages' | 'favorites' | 'general'

interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const emptyStateConfig: Record<EmptyStateType, { icon: React.ElementType; title: string; description: string }> = {
  search: {
    icon: Search,
    title: 'Hech narsa topilmadi',
    description: 'Qidiruv bo\'yicha natijalar topilmadi. Filtrlarni o\'zgartirib ko\'ring.'
  },
  listings: {
    icon: Building2,
    title: 'E\'lonlar yo\'q',
    description: 'Hozircha e\'lonlar mavjud emas. Birinchi e\'loningizni qo\'shing!'
  },
  messages: {
    icon: MessageCircle,
    title: 'Xabarlar yo\'q',
    description: 'Hozircha xabarlaringiz yo\'q. Sotuvchilar bilan bog\'laning!'
  },
  favorites: {
    icon: Heart,
    title: 'Tanlanganlar bo\'sh',
    description: 'Yoqtirgan e\'lonlaringizni qo\'shing va shu yerda ko\'ring.'
  },
  general: {
    icon: FileQuestion,
    title: 'Ma\'lumot topilmadi',
    description: 'So\'ralgan ma\'lumot hozircha mavjud emas.'
  }
}

export function EmptyState({
  type = 'general',
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  const config = emptyStateConfig[type]
  const Icon = config.icon

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title || config.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description || config.description}
      </p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="bg-primary hover:bg-primary-dark text-primary-foreground"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
