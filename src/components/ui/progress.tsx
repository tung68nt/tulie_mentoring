"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  size = "default",
  color = "default",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  size?: "default" | "xs" | "sm" | "lg"
  color?: "default" | "primary" | "success"
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-muted relative h-2 w-full overflow-hidden rounded-full",
        size === "xs" && "h-1",
        size === "sm" && "h-1.5",
        size === "lg" && "h-3",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "bg-primary h-full w-full flex-1 transition-all",
          color === "success" && "bg-primary"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
