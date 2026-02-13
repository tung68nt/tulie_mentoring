"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, id, type, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === "password";
        const inputType = isPassword ? (showPassword ? "text" : "password") : type;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={id}
                        className="block text-[12px] font-medium text-[#666]"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        id={id}
                        type={inputType}
                        className={cn(
                            "w-full h-10 px-3 rounded-[6px] border border-[#eaeaea] bg-white text-black text-sm",
                            "placeholder:text-[#999]",
                            "transition-all duration-200",
                            "focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5",
                            "disabled:opacity-50 disabled:bg-[#fafafa]",
                            isPassword && "pr-10",
                            error
                                ? "border-[#ee0000] focus:border-[#ee0000] focus:ring-[#ee0000]/5"
                                : "hover:border-[#999]",
                            className
                        )}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-[#999] hover:text-black transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="text-[12px] text-[#ee0000] font-medium">{error}</p>
                )}
                {hint && !error && (
                    <p className="text-[12px] text-[#888] font-medium">{hint}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };
