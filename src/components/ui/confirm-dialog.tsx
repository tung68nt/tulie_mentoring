"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    onConfirm: () => void;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    variant = "default",
    onConfirm,
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-sm text-muted-foreground">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => onOpenChange(false)}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "destructive" ? "destructive" : "default"}
                        className="rounded-lg"
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ConfirmState {
    open: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    onConfirm: () => void;
}

let confirmCallback: ((result: boolean) => void) | null = null;

export function confirm(options: {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
}): Promise<boolean> {
    return new Promise((resolve) => {
        confirmCallback = resolve;
        window.dispatchEvent(
            new CustomEvent("show-confirm-dialog", {
                detail: {
                    title: options.title,
                    description: options.description,
                    confirmText: options.confirmText,
                    cancelText: options.cancelText,
                    variant: options.variant,
                },
            })
        );
    });
}

export function ConfirmDialogContainer() {
    const [state, setState] = useState<ConfirmState>({
        open: false,
        title: "",
        description: "",
        onConfirm: () => {},
    });

    useEffect(() => {
        const handleShowDialog = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setState({
                open: true,
                title: detail.title,
                description: detail.description,
                confirmText: detail.confirmText,
                cancelText: detail.cancelText,
                variant: detail.variant,
                onConfirm: () => {
                    if (confirmCallback) confirmCallback(true);
                },
            });
        };

        const handleCloseDialog = () => {
            if (confirmCallback) confirmCallback(false);
            setState((prev) => ({ ...prev, open: false }));
        };

        window.addEventListener("show-confirm-dialog", handleShowDialog);
        window.addEventListener("close-confirm-dialog", handleCloseDialog);

        return () => {
            window.removeEventListener("show-confirm-dialog", handleShowDialog);
            window.removeEventListener("close-confirm-dialog", handleCloseDialog);
        };
    }, []);

    return (
        <ConfirmDialog
            open={state.open}
            onOpenChange={(open) => {
                if (!open && confirmCallback) {
                    confirmCallback(false);
                }
                setState((prev) => ({ ...prev, open }));
            }}
            title={state.title}
            description={state.description}
            confirmText={state.confirmText}
            cancelText={state.cancelText}
            variant={state.variant}
            onConfirm={state.onConfirm}
        />
    );
}
