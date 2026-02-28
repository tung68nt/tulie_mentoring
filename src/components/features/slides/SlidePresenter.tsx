"use client";

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SlidePresenterProps {
    content: string;
    theme?: string;
    onClose: () => void;
}

export default function SlidePresenter({ content, theme = 'black', onClose }: SlidePresenterProps) {
    const revealRef = useRef<HTMLDivElement>(null);
    const revealInstanceRef = useRef<any>(null);

    useEffect(() => {
        const initReveal = async () => {
            if (typeof window === 'undefined') return;

            const Reveal = (await import('reveal.js')).default;
            const Markdown = (await import('reveal.js/plugin/markdown/markdown.esm.js')).default;

            // Load Reveal CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css`;
            document.head.appendChild(link);

            const themeLink = document.createElement('link');
            themeLink.rel = 'stylesheet';
            themeLink.id = 'reveal-theme';
            themeLink.href = `https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/theme/${theme.startsWith('#') ? 'black' : theme}.css`;
            document.head.appendChild(themeLink);

            try {
                if (revealRef.current) {
                    const slidesContainer = revealRef.current.querySelector('.slides');
                    if (slidesContainer) {
                        slidesContainer.innerHTML = '';
                        const section = document.createElement('section');
                        section.setAttribute('data-markdown', '');

                        // Flexible splitting: 3 or more dashes/asterisks on their own line OR an HR element
                        section.setAttribute('data-separator', '(?:<hr\\s*\\/?>)|(?:(?:\\r?\\n|^)[-*]{3,}\\s*(?:\\r?\\n|$))');
                        section.setAttribute('data-separator-vertical', '(?:\\r?\\n|^)-{2}\\s*(?:\\r?\\n|$)');

                        const textarea = document.createElement('textarea');
                        textarea.setAttribute('data-template', '');

                        // Pre-process content for custom layout tags that survive BlockNote
                        // Handling both [cols] and escaped variations like \[cols\] or \\[[cols\\]
                        // We use a more permissive regex but still targeted
                        let processedContent = content
                            .replace(/\[([^\]]+)\]\(textColor=([^\)]+)\)/g, '<span class="bn-color-$2">$1</span>')
                            .replace(/\\*\[cols-3\]\\*/gi, '\n<div class="grid grid-cols-3 gap-6">\n')
                            .replace(/\\*\[cols\]\\*/gi, '\n<div class="grid grid-cols-2 gap-8">\n')
                            .replace(/\\*\[col\]\\*/gi, '\n<div class="column-item">\n')
                            .replace(/\\*\[\/col\]\\*/gi, '\n</div>\n')
                            .replace(/\\*\[\/cols\]\\*/gi, '\n</div>\n')
                            .replace(/<p>\s*\[cols-3\]\s*<\/p>/gi, '\n<div class="grid grid-cols-3 gap-6">\n')
                            .replace(/<p>\s*\[cols\]\s*<\/p>/gi, '\n<div class="grid grid-cols-2 gap-8">\n')
                            .replace(/<p>\s*\[col\]\s*<\/p>/gi, '\n<div class="column-item">\n')
                            .replace(/<p>\s*\[\/col\]\s*<\/p>/gi, '\n</div>\n')
                            .replace(/<p>\s*\[\/cols\]\s*<\/p>/gi, '\n</div>\n');

                        // Final cleanup: if any standalone backslashes remain near our tag locations, remove them
                        processedContent = processedContent.replace(/\\+(?=\s*<div)/g, '');

                        textarea.defaultValue = processedContent;

                        section.appendChild(textarea);
                        slidesContainer.appendChild(section);
                    }
                }

                const deck = new Reveal(revealRef.current, {
                    plugins: [Markdown],
                    embedded: false,
                    hash: false,
                    respondToHashChanges: false,
                    history: false,
                    controls: true,
                    progress: true,
                    center: true,
                    transition: 'slide',
                    backgroundTransition: 'fade',
                    // Force markdown plugin to parse HTML
                    markdown: {
                        smartypants: true
                    }
                });

                await deck.initialize();
                revealInstanceRef.current = deck;
            } catch (err) {
                console.error("Reveal init error:", err);
            }
        };

        const timer = setTimeout(initReveal, 100);

        return () => {
            clearTimeout(timer);
            if (revealInstanceRef.current) {
                try {
                    revealInstanceRef.current.destroy();
                } catch (e) { }
            }
            const themeLink = document.getElementById('reveal-theme');
            if (themeLink) themeLink.remove();
        };
    }, [theme, content]);

    const themeColor = (() => {
        if (theme.startsWith('#')) return theme;
        const themeColors: Record<string, string> = {
            white: '#ffffff',
            black: '#191919',
            sky: '#f7f3f3', // Sky is actually light-ish in reveal
            beige: '#f7f2d3',
            simple: '#ffffff',
            serif: '#F0F1EB',
            night: '#111111',
            moon: '#002b36',
            solarized: '#fdf6e3',
            blood: '#221111',
            league: '#2b2b2b'
        };
        return themeColors[theme] || '#ffffff';
    })();

    const isDark = (() => {
        if (theme.startsWith('#')) {
            const r = parseInt(theme.slice(1, 3), 16);
            const g = parseInt(theme.slice(3, 5), 16);
            const b = parseInt(theme.slice(5, 7), 16);
            return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
        }
        return ['black', 'night', 'moon', 'blood', 'league'].includes(theme);
    })();

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
                    {/* Content injected dynamically */}
                </div>
            </div>

            <style jsx global>{`
                .reveal-viewport {
                    background-color: ${themeColor} !important;
                }
                .reveal {
                    background-color: ${themeColor} !important;
                    color: ${isDark ? '#ffffff' : '#1a1a1a'} !important;
                }
                
                /* Smaller arrows and better positioning */
                .reveal .controls {
                    bottom: 24px !important; /* Move up slightly from the progress bar */
                    right: 12px !important;
                    transform: scale(0.7) !important; /* Make arrows smaller */
                }
                
                .reveal .progress {
                    height: 4px !important;
                    margin-bottom: 0px !important;
                }

                .reveal .controls button {
                    opacity: 0.8 !important;
                    color: ${isDark ? '#ffffff' : '#000000'} !important;
                }
                .reveal .controls .controls-arrow {
                    color: currentColor !important;
                }
                .reveal .slides section {
                    text-align: left;
                    padding: 80px !important;
                    box-sizing: border-box;
                    color: ${isDark ? '#ffffff' : '#1a1a1a'};
                }
                .reveal h1, .reveal h2, .reveal h3, .reveal h4, .reveal h5, .reveal h6,
                .reveal p, .reveal li, .reveal span, .reveal div, .reveal strong, .reveal em {
                    text-transform: none !important;
                    margin-bottom: 0.5em !important;
                }
                .reveal p, .reveal li {
                    line-height: 1.4 !important;
                }
                
                /* Support for custom text colors - remove global color:inherit to let inline styles through */
                .reveal span[style*="color"] {
                    color: initial !important; 
                }

                /* BlockNote specific color support */
                .reveal .bn-color-red, .reveal [data-text-color="red"] { color: #e53e3e !important; }
                .reveal .bn-color-orange, .reveal [data-text-color="orange"] { color: #dd6b20 !important; }
                .reveal .bn-color-yellow, .reveal [data-text-color="yellow"] { color: #d69e2e !important; }
                .reveal .bn-color-green, .reveal [data-text-color="green"] { color: #38a169 !important; }
                .reveal .bn-color-blue, .reveal [data-text-color="blue"] { color: #3182ce !important; }
                .reveal .bn-color-purple, .reveal [data-text-color="purple"] { color: #805ad5 !important; }
                .reveal .bn-color-pink, .reveal [data-text-color="pink"] { color: #d53f8c !important; }
                .reveal .bn-color-gray, .reveal [data-text-color="gray"] { color: #718096 !important; }
                .reveal .bn-color-brown, .reveal [data-text-color="brown"] { color: #a52a2a !important; }
                .reveal [data-text-color="default"] { color: inherit !important; }
                
                /* Column layouts */
                .reveal .grid {
                    display: grid !important;
                    gap: 3rem !important;
                    align-items: start !important;
                    width: 100% !important;
                    margin: 2rem 0 !important;
                    padding-bottom: 2rem !important;
                }
                .reveal .grid-cols-2 { 
                    grid-template-columns: 1fr 1fr !important; 
                }
                .reveal .grid-cols-3 { 
                    grid-template-columns: 1fr 1fr 1fr !important; 
                }
                
                .reveal .column-item {
                    display: block !important;
                    flex: 1 !important;
                }

                .reveal ul, .reveal ol {
                    margin-left: 1.5em !important;
                    margin-top: 0.5em !important;
                }

                /* Ensure arrows are icons */
                .reveal .controls .navigate-left:after { border-right-color: currentColor !important; }
                .reveal .controls .navigate-right:after { border-left-color: currentColor !important; }
                .reveal .controls .navigate-up:after { border-bottom-color: currentColor !important; }
                .reveal .controls .navigate-up:active { border-bottom-color: currentColor !important; }
                .reveal .controls .navigate-down:after { border-top-color: currentColor !important; }
            `}</style>
        </div>
    );
}
