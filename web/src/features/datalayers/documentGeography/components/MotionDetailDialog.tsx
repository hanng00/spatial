"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Building2,
    Calendar,
    ExternalLink,
    FileText,
    Loader2,
} from "lucide-react"
import { useEffect, useState } from "react"
import {
    getMotionHtmlUrl,
    getMotionUrl,
    partyColors,
    partyNames,
    type Motion,
} from "../lib/motionsApi"

interface MotionDetailDialogProps {
  motion: Motion | null
  open: boolean
  onClose: () => void
}

export function MotionDetailDialog({
  motion,
  open,
  onClose,
}: MotionDetailDialogProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [contentError, setContentError] = useState<string | null>(null)

  // Fetch motion HTML content when dialog opens
  useEffect(() => {
    if (!motion || !open) {
      setHtmlContent(null)
      setContentError(null)
      return
    }

    async function fetchContent() {
      if (!motion) return
      
      setIsLoadingContent(true)
      setContentError(null)

      try {
        // Fetch the HTML content from Riksdagen's API
        const response = await fetch(getMotionHtmlUrl(motion.dok_id))
        
        if (!response.ok) {
          throw new Error("Kunde inte ladda dokumentet")
        }

        const html = await response.text()
        
        // Extract just the body content and clean it up
        const cleanedHtml = cleanHtmlContent(html)
        setHtmlContent(cleanedHtml)
      } catch (error) {
        console.error("Error fetching motion content:", error)
        setContentError(
          error instanceof Error ? error.message : "Ett fel uppstod"
        )
      } finally {
        setIsLoadingContent(false)
      }
    }

    fetchContent()
  }, [motion, open])

  if (!motion) return null

  const partyColor = motion.party ? partyColors[motion.party] || "bg-muted" : "bg-muted"
  const partyName = motion.party ? partyNames[motion.party] || motion.party : null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden border-primary/20 bg-card">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-linear-to-b from-card to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-serif text-foreground leading-tight pr-8">
                {motion.document_title}
              </DialogTitle>
              <DialogDescription className="mt-2 flex items-center gap-3 flex-wrap">
                {motion.party && (
                  <Badge
                    variant="secondary"
                    className={`${partyColor} text-white text-xs`}
                  >
                    {motion.party}
                  </Badge>
                )}
                
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(motion.document_date)}
                </span>
                
                {motion.committee && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    {motion.committee}
                  </span>
                )}
                
                {motion.parliamentary_session && (
                  <span className="text-xs text-muted-foreground">
                    Riksmöte: {motion.parliamentary_session}
                  </span>
                )}
              </DialogDescription>
              
              {partyName && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {partyName}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => window.open(getMotionUrl(motion.dok_id), "_blank")}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Öppna på riksdagen.se
            </Button>
            <span className="text-xs text-muted-foreground">
              Dok-ID: {motion.dok_id}
            </span>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 h-[calc(90vh-220px)]">
          <div className="p-6 pt-4">
            {isLoadingContent ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Laddar dokumentinnehåll...</span>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : contentError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <div className="text-destructive mb-2">{contentError}</div>
                <p className="text-sm text-muted-foreground mb-4">
                  Du kan fortfarande läsa dokumentet på riksdagen.se
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getMotionUrl(motion.dok_id), "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Öppna på riksdagen.se
                </Button>
              </div>
            ) : htmlContent ? (
              <article
                className="motion-content prose prose-invert prose-sm max-w-none
                  prose-headings:font-serif prose-headings:text-foreground
                  prose-p:text-foreground/90 prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground
                  prose-li:text-foreground/90
                  [&_table]:border-collapse [&_table]:w-full
                  [&_td]:border [&_td]:border-border [&_td]:p-2
                  [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  Inget innehåll tillgängligt
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Clean up HTML content from Riksdagen's API
 * Removes scripts, styles, and extracts the main content
 */
function cleanHtmlContent(html: string): string {
  // Create a temporary element to parse HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  
  // Remove scripts, styles, and other unwanted elements
  const removeSelectors = [
    "script",
    "style",
    "link",
    "meta",
    "header",
    "footer",
    "nav",
    ".header",
    ".footer",
    ".navigation",
    "#header",
    "#footer",
  ]
  
  removeSelectors.forEach((selector) => {
    doc.querySelectorAll(selector).forEach((el) => el.remove())
  })
  
  // Try to find the main content
  const mainContent =
    doc.querySelector(".dokument-text") ||
    doc.querySelector(".document-content") ||
    doc.querySelector("article") ||
    doc.querySelector("main") ||
    doc.body
  
  if (!mainContent) {
    return "<p>Kunde inte extrahera dokumentinnehållet.</p>"
  }
  
  // Get the inner HTML
  let content = mainContent.innerHTML
  
  // Clean up extra whitespace
  content = content.replace(/\s+/g, " ").trim()
  
  return content
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return dateStr
  }
}

