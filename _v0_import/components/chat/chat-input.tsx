"use client"

import { useState, useRef } from 'react'
import { Paperclip, Smile, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  return (
    <div className="flex items-end gap-2 p-4 bg-card border-t border-border">
      {/* Attachment Button */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        disabled={disabled}
      >
        <Paperclip className="h-5 w-5" />
      </Button>

      {/* Input Area */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Xabar yozing..."
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full resize-none rounded-[20px] bg-secondary px-4 py-3 pr-12 text-sm',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />
        {/* Emoji Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 bottom-1 h-8 w-8 text-muted-foreground hover:text-foreground"
          disabled={disabled}
        >
          <Smile className="h-4 w-4" />
        </Button>
      </div>

      {/* Send Button */}
      <Button
        onClick={handleSubmit}
        disabled={!message.trim() || disabled}
        className={cn(
          'shrink-0 h-11 w-11 rounded-full p-0',
          'bg-primary hover:bg-primary-dark text-primary-foreground',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  )
}
