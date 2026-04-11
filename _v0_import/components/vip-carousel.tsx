"use client"

import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ListingCard } from '@/components/listing-card'
import type { Listing } from '@/lib/types'

interface VipCarouselProps {
  listings: Listing[]
  onFavoriteToggle?: (id: string) => void
}

export function VipCarousel({ listings, onFavoriteToggle }: VipCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  if (listings.length === 0) return null

  return (
    <section className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-gold" />
          <h2 className="text-xl font-bold text-foreground">VIP e&apos;lonlar</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="h-9 w-9 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="h-9 w-9 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="w-[300px] flex-shrink-0 snap-start"
          >
            <ListingCard
              listing={listing}
              variant="vip"
              onFavoriteToggle={onFavoriteToggle}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
