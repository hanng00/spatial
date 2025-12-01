import { cva, type VariantProps } from "class-variance-authority"
import { Hexagon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const logoVariants = cva(
  "flex flex-row items-center gap-2",
  {
    variants: {
      size: {
        sm: "gap-1.5 [&_svg]:size-4 [&_h3]:text-sm",
        md: "gap-2 [&_svg]:size-5 [&_h3]:text-base",
        lg: "gap-2.5 [&_svg]:size-6 [&_h3]:text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

function Logo({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof logoVariants>) {
  return (
    <div
      data-slot="logo"
      className={cn(logoVariants({ size }), className)}
      {...props}
    >
      <Hexagon className="text-primary" />
      <h3 className="font-serif font-medium text-foreground">
        Spatial
      </h3>
    </div>
  )
}

export { Logo, logoVariants }
