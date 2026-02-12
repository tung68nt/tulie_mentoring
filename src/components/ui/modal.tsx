"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = "md",
    className,
}: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[1px] animate-fade-in"
                onClick={onClose}
            />

            {/* Dialog */}
            <div
                className={cn(
                    "relative w-full bg-white rounded-[8px] border border-[#eaeaea] shadow-[0_30px_60px_rgba(0,0,0,0.12)] overflow-hidden animate-scale-in",
                    sizes[size],
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#eaeaea]">
                    {title ? (
                        <h3 className="text-base font-semibold text-black leading-none">
                            {title}
                        </h3>
                    ) : (
                        <div />
                    )}
                    <button
                        onClick={onClose}
                        className="p-1 rounded-[6px] text-[#999] hover:text-black hover:bg-[#fafafa] transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#fafafa] border-t border-[#eaeaea]">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
