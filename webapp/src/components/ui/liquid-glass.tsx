'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUiStyle } from '@/components/providers/ui-style-provider';
import { cn } from '@/lib/utils';

// Dynamically load LiquidGlass with ssr disabled to prevent hydration mismatch
const LiquidGlassCore = dynamic(() => import('liquid-glass-react'), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-white/20 rounded-2xl" />,
});

export interface LiquidGlassProps {
    children: React.ReactNode;
    displacementScale?: number;
    blurAmount?: number;
    saturation?: number;
    aberrationIntensity?: number;
    elasticity?: number;
    cornerRadius?: number;
    className?: string;
    padding?: string;
    style?: React.CSSProperties;
    overLight?: boolean;
    mode?: "standard" | "polar" | "prominent" | "shader";
    onClick?: () => void;
    forceGlass?: boolean;
}

export function LiquidGlass({
    children,
    displacementScale = 60,
    blurAmount = 0.08,
    saturation = 135,
    aberrationIntensity = 2,
    elasticity = 0.25,
    cornerRadius = 20,
    className,
    padding,
    style,
    overLight = true,
    mode = "standard",
    onClick,
    forceGlass = false,
}: LiquidGlassProps) {
    const { isLiquidGlass } = useUiStyle();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // If flat style is active and not forced, render standard container
    if (!forceGlass && (!isLiquidGlass || !mounted)) {
        return (
            <div
                className={cn("transition-all duration-300", className)}
                style={{ padding, ...style }}
                onClick={onClick}
            >
                {children}
            </div>
        );
    }

    // When Liquid Glass is active
    return (
        <div className={cn("relative transition-all duration-500", className)} style={style} onClick={onClick}>
            <LiquidGlassCore
                displacementScale={displacementScale}
                blurAmount={blurAmount}
                saturation={saturation}
                aberrationIntensity={aberrationIntensity}
                elasticity={elasticity}
                cornerRadius={cornerRadius}
                padding={padding}
                overLight={overLight}
                mode={mode}
            >
                {children}
            </LiquidGlassCore>
        </div>
    );
}
