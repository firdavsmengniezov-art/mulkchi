"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Heart, MapPin, BedDouble, Maximize, Building2, BadgeCheck, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Listing } from '@/lib/types'

interface ListingCardProps {
  listing: Listing
  variant?: 'default' | 'vip'
  onFavoriteToggle?: (id: string) => void
}

export function ListingCard({ listing, variant = 'default', onFavoriteToggle }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(listing.isFavorite)
  const [imageError, setImageError] = useState(false)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    onFavoriteToggle?.(listing.id)
  }

  const formatPrice = (price: number, currency: string, priceType?: string) => {
    const formatted = new Intl.NumberFormat('en-US').format(price)
    const suffix = priceType === 'monthly' ? '/oy' : ''
    return `${formatted} ${currency}${suffix}`
  }

  const isVip = variant === 'vip' || listing.isVip

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl bg-card transition-all duration-200 hover:shadow-lg',
        isVip && 'ring-2 ring-gold'
      )}
      style={{ boxShadow: 'var(--shadow)' }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageError ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {isVip && (
            <Badge className="bg-gold text-foreground font-semibold border-0">
              VIP
            </Badge>
          )}
          {listing.purpose === 'rent' && (
            <Badge variant="secondary" className="bg-blue text-accent-foreground border-0">
              Ijara
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-colors hover:bg-card"
        >
          <Heart
            className={cn(
              'h-5 w-5 transition-colors',
              isFavorite ? 'fill-primary text-primary' : 'text-foreground'
            )}
          />
        </button>

        {/* Image Count */}
        {listing.images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-md bg-foreground/70 px-2 py-1 text-xs font-medium text-card">
            1/{listing.images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Price */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-xl font-bold text-foreground">
            {formatPrice(listing.price, listing.currency, listing.priceType)}
          </span>
          {listing.isVerified && (
            <BadgeCheck className="h-5 w-5 shrink-0 text-green" />
          )}
        </div>

        {/* Location */}
        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{listing.district}, {listing.address}</span>
        </div>

        {/* Features */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-foreground">
          {listing.rooms > 0 && (
            <div className="flex items-center gap-1.5">
              <BedDouble className="h-4 w-4 text-muted-foreground" />
              <span>{listing.rooms} xona</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4 text-muted-foreground" />
            <span>{listing.area} m²</span>
          </div>
          {listing.floor && listing.totalFloors && (
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{listing.floor}/{listing.totalFloors} qavat</span>
            </div>
          )}
        </div>

        {/* Agent Info */}
        {listing.agent && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-2">
              {listing.agent.avatar ? (
                <Image
                  src={listing.agent.avatar}
                  alt={listing.agent.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                  {listing.agent.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                  {listing.agent.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {listing.agent.isOwner ? 'Egasi' : 'Agent'}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-green border-green hover:bg-green hover:text-accent-foreground"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Qo&apos;ng&apos;iroq</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Skeleton variant for loading state
export function ListingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-card animate-pulse" style={{ boxShadow: 'var(--shadow)' }}>
      <div className="aspect-[4/3] bg-secondary" />
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="h-6 w-2/3 bg-secondary rounded" />
        <div className="h-4 w-full bg-secondary rounded" />
        <div className="flex gap-3">
          <div className="h-4 w-16 bg-secondary rounded" />
          <div className="h-4 w-16 bg-secondary rounded" />
        </div>
        <div className="h-12 w-full bg-secondary rounded mt-2" />
      </div>
    </div>
  )
}
