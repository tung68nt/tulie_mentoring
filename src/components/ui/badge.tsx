import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        primary: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        success: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        warning: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        error: "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        destructive: "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-5 px-2 py-0.5 text-xs",
        sm: "h-4 px-1.5 py-0 text-[10px]",
        lg: "h-6 px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const statusConfig: Record<string, { variant: "primary" | "secondary" | "destructive" | "outline", label: string }> = {
  active: { variant: "primary", label: "Đang hoạt động" },
  completed: { variant: "primary", label: "Hoàn thành" },
  in_progress: { variant: "primary", label: "Đang diễn ra" },
  scheduled: { variant: "secondary", label: "Đã lên lịch" },
  pending: { variant: "secondary", label: "Chờ duyệt" },
  cancelled: { variant: "destructive", label: "Đã hủy" },
  inactive: { variant: "secondary", label: "Ngừng hoạt động" },
  offline: { variant: "secondary", label: "Ngoại tuyến" },
  draft: { variant: "secondary", label: "Nháp" },
};

function Badge({
  className,
  variant,
  size = "default",
  status,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    status?: string
  }) {
  const Comp = asChild ? Slot.Root : "span"

  let finalVariant = variant || "default";
  let displayChildren = children;

  if (status && statusConfig[status]) {
    finalVariant = statusConfig[status].variant;
    if (!displayChildren) {
      displayChildren = statusConfig[status].label;
    }
  }

  return (
    <Comp
      data-slot="badge"
      data-variant={finalVariant}
      data-size={size}
      className={cn(badgeVariants({ variant: finalVariant, size }), className)}
      {...props}
    >
      {displayChildren}
    </Comp>
  )
}

export { Badge, badgeVariants }
