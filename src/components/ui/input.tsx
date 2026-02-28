import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  label,
  error,
  endIcon,
  ...props
}: React.ComponentProps<"input"> & {
  label?: string;
  error?: string;
  endIcon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-[12px] font-medium text-muted-foreground px-0.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          data-slot="input"
          className={cn(
            "bg-background border-border/40 focus-visible:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary h-10 rounded-xl border px-4 py-1 text-sm transition-all file:h-6 file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/40 w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 shadow-none",
            endIcon ? "pr-10" : "",
            error && "border-destructive focus-visible:ring-destructive/10",
            className,
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
  );
}

export { Input };
