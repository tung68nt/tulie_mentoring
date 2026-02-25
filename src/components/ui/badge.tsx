import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "h-5 gap-1 rounded-md border border-transparent px-2.5 py-0.5 text-[11px] font-semibold transition-all inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-hidden no-uppercase",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-foreground border-border shadow-none",
        success: "bg-primary text-primary-foreground",
        warning: "bg-secondary text-foreground border-border shadow-none",
        error: "bg-destructive/10 text-destructive border-destructive/20",
        destructive: "bg-destructive/10 text-destructive border-destructive/20",
        outline: "border-border text-foreground/60 hover:text-foreground hover:bg-muted font-medium",
        ghost: "hover:bg-muted text-foreground/60 hover:text-foreground",
        link: "text-foreground font-semibold underline-offset-4 hover:underline",
      },
      size: {
        default: "h-5 px-2.5 text-[11px] rounded-md",
        sm: "h-4 px-1.5 min-w-[1rem] text-[10px] rounded-full",
        lg: "h-6 px-3 text-xs rounded-md",
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
  open: { variant: "secondary", label: "Đang mở" },
  resolved: { variant: "primary", label: "Đã giải quyết" },
  closed: { variant: "outline", label: "Đã đóng" },
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
  const Comp = asChild ? Slot : "span"

  let finalVariant = variant || "default";
  let displayChildren = children;

  if (status && statusConfig[status]) {
    finalVariant = statusConfig[status].variant;
    if (!displayChildren) {
      displayChildren = statusConfig[status].label;
    }
  } else if (!displayChildren && !variant) {
    // If no status, no children, and no variant, provide a fallback to prevent empty render crash
    displayChildren = "Unknown";
    finalVariant = "outline";
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
