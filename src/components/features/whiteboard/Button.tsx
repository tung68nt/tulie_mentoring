import * as React from "react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary" | "inverted" | "light" | "white"
    size?: "default" | "sm" | "lg" | "icon"
    as?: React.ElementType
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "default", size = "default", as: Component = "button", ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]"

        const variants = {
            default: "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm",
            destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/10",
            secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200/50 dark:border-zinc-700/50",
            outline: "border border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-foreground",
            ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-foreground",
            link: "text-primary underline-offset-4 hover:underline",
            inverted: "bg-foreground text-background hover:bg-foreground/90 shadow-md",
            light: "bg-white/80 backdrop-blur-sm text-zinc-900 border border-zinc-200/50 hover:bg-zinc-50 shadow-sm",
            white: "bg-white text-zinc-900 hover:bg-zinc-50 border border-zinc-200 shadow-sm"
        }

        const sizes = {
            default: "h-11 px-5 py-2.5 text-sm",
            sm: "h-9 rounded-lg px-3.5 text-[13px]",
            lg: "h-12 rounded-xl px-8 text-base",
            icon: "h-11 w-11"
        }

        return (
            <Component
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
