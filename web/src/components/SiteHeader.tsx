"use client";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SiteHeader() {
  return (
    <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/">
          <Logo size="lg" />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/map"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Map
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Documents
          </Link>
          <Link
            href="/accountability"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Accountability
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Leaderboard
          </Link>
          <Link
            href="/#data"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Data
          </Link>
          <Link href="/map">
            <Button size="sm" variant="default">
              Open Map
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

