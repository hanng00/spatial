"use client";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";
import Link from "next/link";

interface MapHeaderProps {
  onToggleControls: () => void;
}

export function MapHeader({ onToggleControls }: MapHeaderProps) {
  return (
    <div className="absolute left-0 right-0 top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* LEFT LOGO */}
        <Link href="/">
          <Logo size="lg" />
        </Link>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onToggleControls}>
            <Layers className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
