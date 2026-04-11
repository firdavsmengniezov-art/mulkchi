"use client"

import { useState } from 'react'
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import { Header } from '@/components/header'
import { SearchFilters } from '@/components/search-filters'
import { ListingCard, ListingCardSkeleton } from '@/components/listing-card'
import { VipCarousel } from '@/components/vip-carousel'
import { ViewToggle } from '@/components/view-toggle'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { mockListings } from '@/lib/mock-data'
import type { Language, SearchFilters as SearchFiltersType } from '@/lib/types'

type ViewMode = 'grid' | 'list' | 'map'
type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Eng yangi' },
  { value: 'price-asc', label: 'Narx: past → yuqori' },
  { value: 'price-desc', label: 'Narx: yuqori → past' },
  { value: 'popular', label: 'Ommabop' },
]

export default function HomePage() {
  const [lang, setLang] = useState<Language>('uz')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [isLoading, setIsLoading] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  // Get VIP and standard listings
  const vipListings = mockListings.filter(l => l.isVip)
  const standardListings = mockListings.filter(l => !l.isVip)

  const handleSearch = (filters: SearchFiltersType) => {
    setIsLoading(true)
    // Simulate search
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    console.log('[v0] Search filters:', filters)
  }

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id) 
        : [...prev, id]
    )
  }

  const currentSort = sortOptions.find(s => s.value === sortBy)

  return (
    <div className="min-h-screen bg-background">
      <Header currentLang={lang} onLangChange={setLang} />

      <main className="container mx-auto px-4 py-6">
        {/* Hero Search */}
        <section className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-balance">
              O&apos;zbekistonda ko&apos;chmas mulk
            </h1>
            <p className="text-muted-foreground text-lg">
              Kvartira, uy, ofis va boshqa mulklarni toping
            </p>
          </div>
          <SearchFilters onSearch={handleSearch} />
        </section>

        {/* Quick Category Tags */}
        <section className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2 text-sm">
              Yangi binolar
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2 text-sm">
              Premium
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2 text-sm">
              Markazda
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2 text-sm">
              Metro yaqinida
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2 text-sm">
              Park yaqinida
            </Badge>
          </div>
        </section>

        {/* VIP Listings Carousel */}
        <VipCarousel listings={vipListings} onFavoriteToggle={handleFavoriteToggle} />

        {/* Uzbek Ornament Divider */}
        <div className="uzbek-ornament my-6" />

        {/* Listings Section */}
        <section>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">Barcha e&apos;lonlar</h2>
              <Badge variant="outline" className="text-muted-foreground">
                {mockListings.length} ta
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden sm:inline">{currentSort?.label}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={sortBy === option.value ? 'bg-secondary' : ''}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Toggle */}
              <ViewToggle
                currentView={viewMode}
                onViewChange={setViewMode}
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && mockListings.length === 0 && (
            <EmptyState
              type="search"
              actionLabel="Filtrlarni tozalash"
              onAction={() => {}}
            />
          )}

          {/* Listings Grid */}
          {!isLoading && mockListings.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {standardListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          )}

          {/* Listings List View */}
          {!isLoading && mockListings.length > 0 && viewMode === 'list' && (
            <div className="flex flex-col gap-4">
              {standardListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          )}

          {/* Map View Placeholder */}
          {!isLoading && viewMode === 'map' && (
            <div className="rounded-xl bg-secondary h-[500px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium text-foreground mb-2">Xarita ko&apos;rinishi</p>
                <p className="text-sm text-muted-foreground">Tez orada mavjud bo&apos;ladi</p>
              </div>
            </div>
          )}

          {/* Pagination / Load More */}
          {!isLoading && mockListings.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" size="lg" className="gap-2">
                Ko&apos;proq ko&apos;rish
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Mulkchi</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Biz haqimizda</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Bog&apos;lanish</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Yordam</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Xizmatlar</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">E&apos;lon qo&apos;shish</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">VIP e&apos;lon</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Reklama</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Qonunchilik</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Foydalanish shartlari</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Maxfiylik siyosati</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Aloqa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>+998 71 123 45 67</li>
                <li>info@mulkchi.uz</li>
                <li>Toshkent, O&apos;zbekiston</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 Mulkchi. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
    </div>
  )
}
