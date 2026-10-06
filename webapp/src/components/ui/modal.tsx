"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
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
    const sizes = {
        sm: "sm:max-w-sm",
        md: "sm:max-w-lg",
        lg: "sm:max-w-2xl",
        xl: "sm:max-w-4xl",
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={cn(sizes[size], className)}>
                {title && (
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                )}
                <div className="py-4">
                    {children}
                </div>
                {footer && (
                    <DialogFooter>
                        {footer}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
