"use client"

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/lib/types'

interface ConversationListProps {
  conversations: Conversation[]
  activeConversationId?: string
  onSelect: (conversation: Conversation) => void
}

export function ConversationList({ conversations, activeConversationId, onSelect }: ConversationListProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Kecha'
    } else {
      return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })
    }
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation)}
          className={cn(
            'flex items-start gap-3 p-4 text-left transition-colors hover:bg-secondary',
            activeConversationId === conversation.id && 'bg-secondary'
          )}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            {conversation.participant.avatar ? (
              <Image
                src={conversation.participant.avatar}
                alt={conversation.participant.name}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                {conversation.participant.name.charAt(0)}
              </div>
            )}
            {/* Online indicator */}
            {conversation.participant.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground truncate">
                {conversation.participant.name}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatTime(conversation.lastMessage.timestamp)}
              </span>
            </div>
            
            {/* Listing badge */}
            {conversation.listing && (
              <div className="flex items-center gap-2 mt-1">
                <Image
                  src={conversation.listing.image}
                  alt={conversation.listing.title}
                  width={24}
                  height={18}
                  className="rounded object-cover"
                />
                <span className="text-xs text-muted-foreground truncate">
                  ${conversation.listing.price.toLocaleString()}
                </span>
              </div>
            )}
            
            {/* Last message */}
            <div className="flex items-center justify-between gap-2 mt-1">
              <p className={cn(
                'text-sm truncate',
                conversation.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}>
                {conversation.lastMessage.content}
              </p>
              {conversation.unreadCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground px-1.5 shrink-0">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
