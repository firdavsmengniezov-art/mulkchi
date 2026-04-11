"use client"

import { LayoutGrid, Map, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'list' | 'map'

interface ViewToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  showMap?: boolean
}

export function ViewToggle({ currentView, onViewChange, showMap = true }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg border border-border p-1 bg-card">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('grid')}
        className={cn(
          'gap-2 h-8 px-3',
          currentView === 'grid' && 'bg-secondary'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Galereya</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('list')}
        className={cn(
          'gap-2 h-8 px-3',
          currentView === 'list' && 'bg-secondary'
        )}
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">Ro&apos;yxat</span>
      </Button>
      {showMap && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewChange('map')}
          className={cn(
            'gap-2 h-8 px-3',
            currentView === 'map' && 'bg-secondary'
          )}
        >
          <Map className="h-4 w-4" />
          <span className="hidden sm:inline">Xarita</span>
        </Button>
      )}
    </div>
  )
}
