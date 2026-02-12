"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";

interface Option {
    value: string | number;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: Option[];
    placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
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
                    <select
                        ref={ref}
                        id={id}
                        className={cn(
                            "w-full h-10 pl-3 pr-10 rounded-[6px] border border-[#eaeaea] bg-white text-black text-sm appearance-none cursor-pointer",
                            "transition-all duration-200",
                            "focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5",
                            "disabled:opacity-50 disabled:bg-[#fafafa]",
                            error
                                ? "border-[#ee0000] focus:border-[#ee0000] focus:ring-[#ee0000]/5"
                                : "hover:border-[#999]",
                            className
                        )}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#999]">
                        <ChevronDown className="w-4 h-4" />
                    </div>
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

Select.displayName = "Select";

export { Select };
