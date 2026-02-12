"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
    asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, asChild = false, children, disabled, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";

        const base =
            "inline-flex items-center justify-center gap-2 rounded-[6px] font-medium transition-all duration-200 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none";

        const variants = {
            primary: "bg-black text-white hover:bg-[#333] border border-black",
            secondary: "bg-white text-[#666] border border-[#eaeaea] hover:border-black hover:text-black",
            ghost: "text-[#666] hover:bg-[#fafafa] hover:text-black",
            destructive: "bg-[#000] text-[#ee0000] border border-[#ee0000] hover:bg-[#ee0000] hover:text-white hover:border-[#ee0000]",
            outline: "border border-[#eaeaea] bg-white text-[#666] hover:border-black hover:text-black",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10",
        };

        return (
            <Comp
                ref={ref}
                className={cn(base, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {asChild ? (
                    children
                ) : (
                    <>
                        {isLoading && (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        {children}
                    </>
                )}
            </Comp>
        );
    }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
