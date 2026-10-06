'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type UiStyle = 'flat' | 'liquid-glass';

interface UiStyleContextType {
    uiStyle: UiStyle;
    setUiStyle: (style: UiStyle) => void;
    toggleUiStyle: () => void;
    isLiquidGlass: boolean;
}

const UiStyleContext = createContext<UiStyleContextType | undefined>(undefined);

const STORAGE_KEY = 'tulie_ui_style';

export function UiStyleProvider({ children }: { children: React.ReactNode }) {
    // Default to 'liquid-glass' for the current Apple trend, with easy toggle to 'flat'
    const [uiStyle, setUiStyleState] = useState<UiStyle>('liquid-glass');

    useEffect(() => {
        try {
            // Always set liquid-glass as default while preserving style infrastructure
            const targetStyle: UiStyle = 'liquid-glass';
            setUiStyleState(targetStyle);
            localStorage.setItem(STORAGE_KEY, targetStyle);
            document.documentElement.setAttribute('data-ui-style', targetStyle);
        } catch {
            document.documentElement.setAttribute('data-ui-style', 'liquid-glass');
        }
    }, []);

    const setUiStyle = (style: UiStyle) => {
        setUiStyleState(style);
        try {
            localStorage.setItem(STORAGE_KEY, style);
        } catch {}
        document.documentElement.setAttribute('data-ui-style', style);
    };

    const toggleUiStyle = () => {
        const next = uiStyle === 'liquid-glass' ? 'flat' : 'liquid-glass';
        setUiStyle(next);
    };

    return (
        <UiStyleContext.Provider
            value={{
                uiStyle,
                setUiStyle,
                toggleUiStyle,
                isLiquidGlass: uiStyle === 'liquid-glass',
            }}
        >
            {children}
        </UiStyleContext.Provider>
    );
}

export function useUiStyle() {
    const context = useContext(UiStyleContext);
    if (!context) {
        return {
            uiStyle: 'flat' as UiStyle,
            setUiStyle: () => {},
            toggleUiStyle: () => {},
            isLiquidGlass: false,
        };
    }
    return context;
}
