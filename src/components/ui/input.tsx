import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  label,
  error,
  endIcon,
  ...props
}: React.ComponentProps<"input"> & {
  label?: string
  error?: string
  endIcon?: React.ReactNode
}) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-[12px] font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          data-slot="input"
          className={cn(
            "bg-muted/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-9 rounded-lg border px-4 py-1 text-sm transition-all file:h-6 file:text-sm file:font-medium focus-visible:ring-3 aria-invalid:ring-3 file:text-foreground placeholder:text-muted-foreground/60 w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            endIcon ? "pr-10" : "",
            error && "border-destructive focus-visible:ring-destructive/20",
            className
          )}
          {...props}
        />
        {endIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {endIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[12px] text-destructive font-medium">{error}</p>
      )}
    </div>
  )
}

export { Input }
