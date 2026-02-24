import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  padding = "default",
  hover = false,
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm",
  padding?: "none" | "sm" | "default" | "lg",
  hover?: boolean
}) {
  const paddingClasses = {
    none: "p-0",
    sm: "p-3",
    default: "p-5",
    lg: "p-8",
  };

  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "ring-foreground/10 bg-card text-card-foreground gap-4 overflow-hidden rounded-xl text-sm ring-1 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 group/card flex flex-col",
        paddingClasses[padding],
        hover && "hover:border-foreground/20 transition-all cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3 group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("bg-muted/50 rounded-b-xl border-t p-4 group-data-[size=sm]/card:p-3 flex items-center", className)}
      {...props}
    />
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: { value: number; label: string }
  className?: string
}) {
  return (
    <Card className={cn("p-6 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground/60 no-uppercase tracking-normal">{title}</p>
          <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground/60 no-uppercase font-medium">{subtitle}</p>}
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center text-foreground/60 shrink-0 shadow-sm transition-all hover:bg-muted">
            {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground/60 font-medium no-uppercase">
          <span className="text-foreground font-bold tabular-nums">+{trend.value}%</span>
          <span>{trend.label}</span>
        </div>
      )}
    </Card>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  StatCard,
}
