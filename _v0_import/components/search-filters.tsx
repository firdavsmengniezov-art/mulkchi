"use client"

import { useState } from 'react'
import { Search, SlidersHorizontal, MapPin, Home, DollarSign, BedDouble, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { regions } from '@/lib/mock-data'
import type { SearchFilters as SearchFiltersType, PropertyType, PropertyPurpose } from '@/lib/types'

interface SearchFiltersProps {
  onSearch?: (filters: SearchFiltersType) => void
  className?: string
}

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Kvartira' },
  { value: 'house', label: 'Uy' },
  { value: 'office', label: 'Ofis' },
  { value: 'land', label: 'Yer' },
  { value: 'commercial', label: 'Tijoriy' },
]

const purposes: { value: PropertyPurpose; label: string }[] = [
  { value: 'sale', label: 'Sotish' },
  { value: 'rent', label: 'Ijara' },
]

const roomOptions = ['1', '2', '3', '4', '5+']

export function SearchFilters({ onSearch, className }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFiltersType>({})
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeRooms, setActiveRooms] = useState<string[]>([])

  const handleFilterChange = (key: keyof SearchFiltersType, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const handleRoomToggle = (room: string) => {
    const newRooms = activeRooms.includes(room)
      ? activeRooms.filter(r => r !== room)
      : [...activeRooms, room]
    setActiveRooms(newRooms)
  }

  const handleSearch = () => {
    onSearch?.(filters)
  }

  const clearFilters = () => {
    setFilters({})
    setActiveRooms([])
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length + activeRooms.length

  return (
    <div className={cn('bg-card rounded-xl p-4 md:p-6', className)} style={{ boxShadow: 'var(--shadow)' }}>
      {/* Main Search Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Region */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Select onValueChange={(value) => handleFilterChange('region', value)}>
            <SelectTrigger className="pl-10 bg-secondary border-0 h-12">
              <SelectValue placeholder="Viloyat" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <div className="relative">
          <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Select onValueChange={(value) => handleFilterChange('propertyType', value as PropertyType)}>
            <SelectTrigger className="pl-10 bg-secondary border-0 h-12">
              <SelectValue placeholder="Mulk turi" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Select onValueChange={(value) => {
            const [min, max] = value.split('-').map(Number)
            handleFilterChange('priceMin', min)
            handleFilterChange('priceMax', max)
          }}>
            <SelectTrigger className="pl-10 bg-secondary border-0 h-12">
              <SelectValue placeholder="Narx" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-50000">$50,000 gacha</SelectItem>
              <SelectItem value="50000-100000">$50,000 - $100,000</SelectItem>
              <SelectItem value="100000-200000">$100,000 - $200,000</SelectItem>
              <SelectItem value="200000-500000">$200,000 - $500,000</SelectItem>
              <SelectItem value="500000-999999999">$500,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rooms */}
        <div className="relative">
          <BedDouble className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Select onValueChange={(value) => handleFilterChange('roomsMin', parseInt(value))}>
            <SelectTrigger className="pl-10 bg-secondary border-0 h-12">
              <SelectValue placeholder="Xonalar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 xona</SelectItem>
              <SelectItem value="2">2 xona</SelectItem>
              <SelectItem value="3">3 xona</SelectItem>
              <SelectItem value="4">4 xona</SelectItem>
              <SelectItem value="5">5+ xona</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          className="h-12 bg-primary hover:bg-primary-dark text-primary-foreground gap-2"
        >
          <Search className="h-4 w-4" />
          <span>Qidirish</span>
        </Button>
      </div>

      {/* Purpose Toggle & Advanced Filters Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        {/* Purpose Toggle */}
        <div className="flex items-center gap-2">
          {purposes.map((purpose) => (
            <Button
              key={purpose.value}
              variant={filters.purpose === purpose.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('purpose', purpose.value)}
              className={cn(
                filters.purpose === purpose.value 
                  ? 'bg-primary hover:bg-primary-dark text-primary-foreground' 
                  : 'hover:bg-secondary'
              )}
            >
              {purpose.label}
            </Button>
          ))}
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="h-3 w-3" />
              Tozalash
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filtrlar</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          {/* Room Quick Select */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Xonalar soni</label>
            <div className="flex flex-wrap gap-2">
              {roomOptions.map((room) => (
                <Button
                  key={room}
                  variant={activeRooms.includes(room) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRoomToggle(room)}
                  className={cn(
                    'min-w-[48px]',
                    activeRooms.includes(room)
                      ? 'bg-primary hover:bg-primary-dark text-primary-foreground'
                      : 'hover:bg-secondary'
                  )}
                >
                  {room}
                </Button>
              ))}
            </div>
          </div>

          {/* Area Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Maydon (m²) dan</label>
              <Input
                type="number"
                placeholder="20"
                className="bg-secondary border-0"
                onChange={(e) => handleFilterChange('areaMin', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">gacha</label>
              <Input
                type="number"
                placeholder="500"
                className="bg-secondary border-0"
                onChange={(e) => handleFilterChange('areaMax', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
