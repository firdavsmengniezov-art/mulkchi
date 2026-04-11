"use client"

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ArrowLeft, MoreVertical, Phone, Video, Search } from 'lucide-react'
import { Header } from '@/components/header'
import { ConversationList } from '@/components/chat/conversation-list'
import { MessageBubble, TypingIndicator } from '@/components/chat/message-bubble'
import { ChatInput } from '@/components/chat/chat-input'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { mockConversations, mockMessages, mockUser } from '@/lib/mock-data'
import type { Language, Conversation, Message } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const [lang, setLang] = useState<Language>('uz')
  const [conversations] = useState(mockConversations)
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [isTyping, setIsTyping] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation)
    // In a real app, you would fetch messages for this conversation
    setMessages(mockMessages)
  }

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: mockUser.id,
      receiverId: activeConversation?.participant.id || '',
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    }
    setMessages(prev => [...prev, newMessage])

    // Simulate typing response
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const response: Message = {
        id: `m${Date.now() + 1}`,
        senderId: activeConversation?.participant.id || '',
        receiverId: mockUser.id,
        content: 'Rahmat, tushundim!',
        timestamp: new Date().toISOString(),
        isRead: false
      }
      setMessages(prev => [...prev, response])
    }, 2000)
  }

  const filteredConversations = conversations.filter(c =>
    c.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header currentLang={lang} onLangChange={setLang} />

      <div className="flex-1 container mx-auto px-4 py-4">
        <div className="bg-card rounded-xl overflow-hidden h-[calc(100vh-120px)]" style={{ boxShadow: 'var(--shadow)' }}>
          <div className="flex h-full">
            {/* Conversation List - Hidden on mobile when chat is active */}
            <div className={cn(
              'w-full md:w-80 lg:w-96 border-r border-border flex flex-col',
              activeConversation ? 'hidden md:flex' : 'flex'
            )}>
              {/* Search Header */}
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground mb-3">Xabarlar</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-secondary border-0"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  <ConversationList
                    conversations={filteredConversations}
                    activeConversationId={activeConversation?.id}
                    onSelect={handleSelectConversation}
                  />
                ) : (
                  <EmptyState
                    type="messages"
                    title="Suhbatlar topilmadi"
                    description="Qidiruv bo'yicha natija yo'q"
                  />
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={cn(
              'flex-1 flex flex-col',
              !activeConversation ? 'hidden md:flex' : 'flex'
            )}>
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-border">
                    {/* Back button - Mobile only */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setActiveConversation(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>

                    {/* Avatar */}
                    <div className="relative">
                      {activeConversation.participant.avatar ? (
                        <Image
                          src={activeConversation.participant.avatar}
                          alt={activeConversation.participant.name}
                          width={44}
                          height={44}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                          {activeConversation.participant.name.charAt(0)}
                        </div>
                      )}
                      {activeConversation.participant.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {activeConversation.participant.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {activeConversation.participant.isOnline ? (
                          <span className="text-green">Online</span>
                        ) : (
                          'Oxirgi safar: bugun'
                        )}
                      </p>
                    </div>

                    {/* Listing Badge */}
                    {activeConversation.listing && (
                      <Badge variant="secondary" className="hidden sm:flex gap-2 py-1.5">
                        <Image
                          src={activeConversation.listing.image}
                          alt={activeConversation.listing.title}
                          width={24}
                          height={18}
                          className="rounded object-cover"
                        />
                        <span className="text-xs">${activeConversation.listing.price.toLocaleString()}</span>
                      </Badge>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Video className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Uzbek Ornament Divider */}
                  <div className="uzbek-ornament" />

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={message.senderId === mockUser.id}
                      />
                    ))}
                    {isTyping && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <ChatInput onSend={handleSendMessage} />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <EmptyState
                    type="messages"
                    title="Suhbatni tanlang"
                    description="Xabarlar ko'rish uchun chap tarafdagi suhbatni tanlang"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
