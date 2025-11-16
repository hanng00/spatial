'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MapPin, Filter, X, Calendar } from 'lucide-react'

interface MapControlsPanelProps {
  onClose: () => void
  selectedYear: number
  selectedMonth?: number
  onYearChange: (year: number) => void
  onMonthChange: (month: number | undefined) => void
}

const YEARS = [2025, 2024, 2023, 2022, 2021]
const MONTHS = [
  { value: undefined, label: 'All months' },
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

export function MapControlsPanel({
  onClose,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}: MapControlsPanelProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-10 sm:right-auto sm:w-80">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Map Controls
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Time Filter
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Year
                </label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => onYearChange(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Month
                </label>
                <Select
                  value={selectedMonth?.toString() || 'all'}
                  onValueChange={(value) =>
                    onMonthChange(value === 'all' ? undefined : parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem
                        key={month.value || 'all'}
                        value={month.value?.toString() || 'all'}
                      >
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="mb-2 text-sm font-medium">Data Source</h4>
            <div className="text-xs text-muted-foreground">
              <p>Swedish Riksdagen Documents</p>
              <p className="mt-1">
                Electoral districts with document activity
              </p>
            </div>
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground">
            <p>Hover over districts to see details</p>
            <p className="mt-1">Click to explore further</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

