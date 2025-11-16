'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function MapInfoPanel() {
  return (
    <div className="absolute right-4 top-20 z-10 hidden sm:block">
      <Card className="w-64">
        <CardHeader>
          <CardTitle className="text-base">Map Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            This map visualizes connections between political figures,
            corporations, and regulatory bodies using open data sources.
          </p>
          <p className="pt-2 text-xs">
            Click on markers to explore relationships and view detailed
            information.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

