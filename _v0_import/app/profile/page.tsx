"use client"

import { useState, Suspense } from 'react'
import Image from 'next/image'
import { FileText, Eye, Phone, ShoppingBag, Share2, Pencil, Plus } from 'lucide-react'
import { Header } from '@/components/header'
import { ProfileSidebar } from '@/components/profile-sidebar'
import { StatsCard } from '@/components/stats-card'
import { ListingCard, ListingCardSkeleton } from '@/components/listing-card'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockUser, mockListings } from '@/lib/mock-data'
import type { Language } from '@/lib/types'

function ProfileContent() {
  const [lang, setLang] = useState<Language>('uz')
  const [activeTab, setActiveTab] = useState('listings')

  // Get user's listings (mock: using first 3)
  const userListings = mockListings.slice(0, 3)
  const favoriteListings = mockListings.filter(l => l.isFavorite)

  const stats = [
    { icon: FileText, label: "E'lonlar", value: mockUser.stats.listings },
    { icon: Eye, label: "Ko'rishlar", value: mockUser.stats.views.toLocaleString(), trend: { value: 12, isPositive: true } },
    { icon: Phone, label: "Qo'ng'iroqlar", value: mockUser.stats.calls },
    { icon: ShoppingBag, label: 'Sotuvlar', value: mockUser.stats.sales, trend: { value: 8, isPositive: true } },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header currentLang={lang} onLangChange={setLang} />

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <ProfileSidebar />

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-card rounded-xl p-6" style={{ boxShadow: 'var(--shadow)' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  {mockUser.avatar ? (
                    <Image
                      src={mockUser.avatar}
                      alt={mockUser.name}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                      {mockUser.name.charAt(0)}
                    </div>
                  )}
                  <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-secondary border-2 border-card hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-foreground">{mockUser.name}</h1>
                  <p className="text-sm text-muted-foreground">{mockUser.phone}</p>
                  <p className="text-sm text-muted-foreground">{mockUser.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    A&apos;zo bo&apos;lgan: {new Date(mockUser.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" className="gap-2 flex-1 sm:flex-initial">
                    <Share2 className="h-4 w-4" />
                    <span>Ulashish</span>
                  </Button>
                  <Button className="gap-2 flex-1 sm:flex-initial bg-primary hover:bg-primary-dark text-primary-foreground">
                    <Pencil className="h-4 w-4" />
                    <span>Tahrirlash</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <StatsCard
                  key={stat.label}
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  trend={stat.trend}
                />
              ))}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-card rounded-xl p-1 h-auto flex-wrap" style={{ boxShadow: 'var(--shadow)' }}>
                <TabsTrigger 
                  value="listings" 
                  className="flex-1 sm:flex-initial data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5"
                >
                  E&apos;lonlar
                </TabsTrigger>
                <TabsTrigger 
                  value="buyers" 
                  className="flex-1 sm:flex-initial data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5"
                >
                  Xaridor
                </TabsTrigger>
                <TabsTrigger 
                  value="favorites" 
                  className="flex-1 sm:flex-initial data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5"
                >
                  Tanlanganlar
                </TabsTrigger>
              </TabsList>

              {/* Listings Tab */}
              <TabsContent value="listings" className="mt-6">
                {userListings.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-foreground">Mening e&apos;lonlarim</h2>
                      <Button className="gap-2 bg-primary hover:bg-primary-dark text-primary-foreground">
                        <Plus className="h-4 w-4" />
                        <span>Yangi e&apos;lon</span>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {userListings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState
                    type="listings"
                    actionLabel="E'lon qo'shish"
                    onAction={() => {}}
                  />
                )}
              </TabsContent>

              {/* Buyers Tab */}
              <TabsContent value="buyers" className="mt-6">
                <EmptyState
                  type="general"
                  title="Xaridorlar yo'q"
                  description="Sizning e'lonlaringizga qiziquvchi xaridorlar bu yerda ko'rinadi."
                />
              </TabsContent>

              {/* Favorites Tab */}
              <TabsContent value="favorites" className="mt-6">
                {favoriteListings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {favoriteListings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    type="favorites"
                    actionLabel="E'lonlarni ko'rish"
                    onAction={() => {}}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  )
}
