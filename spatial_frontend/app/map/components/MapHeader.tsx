'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, Layers } from 'lucide-react'
import Link from 'next/link'

interface MapHeaderProps {
  onToggleControls: () => void
}

export function MapHeader({ onToggleControls }: MapHeaderProps) {
  return (
    <div className="absolute left-0 right-0 top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <h3 className="font-serif text-xl">Spatial</h3>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <Badge variant="outline">Map View</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggleControls}>
            <Layers className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

