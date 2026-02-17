import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
  active: { variant: "default", label: "Đang hoạt động" },
  completed: { variant: "default", label: "Hoàn thành" },
  in_progress: { variant: "default", label: "Đang diễn ra" },
  scheduled: { variant: "secondary", label: "Đã lên lịch" },
  pending: { variant: "secondary", label: "Chờ duyệt" },
  cancelled: { variant: "destructive", label: "Đã hủy" },
  inactive: { variant: "secondary", label: "Ngừng hoạt động" },
  offline: { variant: "secondary", label: "Ngoại tuyến" },
  draft: { variant: "secondary", label: "Nháp" },
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {
  status?: string
}

function Badge({ className, variant, status, children, ...props }: BadgeProps) {
  let finalVariant = variant || "default";
  let displayChildren = children;

  if (status && statusConfig[status]) {
    finalVariant = statusConfig[status].variant;
    if (!displayChildren) {
      displayChildren = statusConfig[status].label;
    }
  }

  return (
    <div className={cn(badgeVariants({ variant: finalVariant }), className)} {...props}>
      {displayChildren}
    </div>
  )
}

export { Badge, badgeVariants }
