"use client";

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Maximize2, X } from 'lucide-react';

interface SlidePresenterProps {
    content: string;
    theme?: string;
    onClose: () => void;
}

export default function SlidePresenter({ content, theme = 'black', onClose }: SlidePresenterProps) {
    const revealRef = useRef<HTMLDivElement>(null);
    const revealInstanceRef = useRef<any>(null);

    useEffect(() => {
        // Dynamic import Reveal.js
        const initReveal = async () => {
            if (typeof window === 'undefined') return;

            // Import Reveal and its CSS
            const Reveal = (await import('reveal.js')).default;

            // Add Reveal.js CSS to head
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css`;
            document.head.appendChild(link);

            const themeLink = document.createElement('link');
            themeLink.rel = 'stylesheet';
            themeLink.id = 'reveal-theme';
            themeLink.href = `https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/theme/${theme}.css`;
            document.head.appendChild(themeLink);

            try {
                const deck = new Reveal(revealRef.current, {
                    embedded: false,
                    hash: false,
                    respondToHashChanges: false,
                    history: false,
                    controls: true,
                    progress: true,
                    center: true,
                    transition: 'slide',
                });

                await deck.initialize();
                revealInstanceRef.current = deck;
            } catch (err) {
                console.error("Reveal init error:", err);
            }
        };

        initReveal();

        return () => {
            if (revealInstanceRef.current) {
                try {
                    revealInstanceRef.current.destroy();
                } catch (e) { }
            }
            // Cleanup CSS
            const themeLink = document.getElementById('reveal-theme');
            if (themeLink) themeLink.remove();
        };
    }, [theme]);

    // Parse Markdown content into Reveal sections
    // Simple separator: ---
    const slides = content.split('---').map(s => s.trim()).filter(s => s.length > 0);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
            <div className="absolute top-4 right-4 z-[110] flex gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white/10 hover:bg-white/20 text-white rounded-full h-10 w-10 backdrop-blur-md border border-white/20"
                    onClick={onClose}
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div className="reveal flex-1" ref={revealRef}>
                <div className="slides">
                    {slides.map((slide, idx) => {
                        // Check if it's a vertical slide group (nested ---?)
                        // For now we keep it simple: just individual slides

                        // Basic markdown to HTML conversion for title/content
                        const lines = slide.split('\n');
                        const title = lines[0].startsWith('#') ? lines[0].replace(/^#+\s*/, '') : '';
                        const rest = title ? lines.slice(1).join('\n') : slide;

                        return (
                            <section key={idx} data-markdown>
                                <textarea data-template>
                                    {slide}
                                </textarea>
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
