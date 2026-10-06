'use client';

import React from 'react';
import { useUiStyle } from '@/components/providers/ui-style-provider';
import { Sparkles, Square } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface UiStyleSwitchProps {
    variant?: 'compact' | 'segmented';
    className?: string;
}

export function UiStyleSwitch({ variant = 'compact', className }: UiStyleSwitchProps) {
    const { uiStyle, setUiStyle, toggleUiStyle, isLiquidGlass } = useUiStyle();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Use server default before client mount to guarantee hydration match
    const currentStyle = mounted ? uiStyle : 'liquid-glass';
    const activeLiquidGlass = mounted ? isLiquidGlass : true;

    if (variant === 'segmented') {
        return (
            <div
                className={cn(
                    "inline-flex items-center p-1 rounded-full border border-border/80 bg-background/70 backdrop-blur-md shadow-xs text-xs font-medium",
                    className
                )}
            >
                <button
                    type="button"
                    onClick={() => setUiStyle('flat')}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer",
                        currentStyle === 'flat'
                            ? "bg-foreground text-background font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Square className="w-3.5 h-3.5" />
                    <span>Flat UI</span>
                </button>

                <button
                    type="button"
                    onClick={() => setUiStyle('liquid-glass')}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer",
                        currentStyle === 'liquid-glass'
                            ? "bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 text-foreground border border-sky-400/40 shadow-xs font-semibold backdrop-blur-md"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                    <span>Liquid Glass</span>
                </button>
            </div>
        );
    }

    // Default compact button for Header
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    onClick={toggleUiStyle}
                    aria-label="Toggle UI Style"
                    className={cn(
                        "p-2 rounded-lg transition-all duration-300 flex items-center gap-1.5 cursor-pointer text-xs font-medium shrink-0",
                        activeLiquidGlass
                            ? "bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 border border-sky-400/30 shadow-xs backdrop-blur-md"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent",
                        className
                    )}
                >
                    {activeLiquidGlass ? (
                        <>
                            <Sparkles className="w-4 h-4 text-sky-500" />
                            <span className="hidden md:inline font-medium">Liquid Glass</span>
                        </>
                    ) : (
                        <>
                            <Square className="w-4 h-4" />
                            <span className="hidden md:inline font-medium">Flat UI</span>
                        </>
                    )}
                </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <p>
                    {activeLiquidGlass
                        ? "Đang bật Liquid Glass (Apple trend) - Nhấp để chuyển về Flat UI"
                        : "Đang bật Flat UI - Nhấp để chuyển sang Liquid Glass (Apple trend)"}
                </p>
            </TooltipContent>
        </Tooltip>
    );
}
