"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
    const [toc, setToc] = useState<TOCItem[]>([]);

    useEffect(() => {
        const updateTOC = () => {
            const editorEl = document.querySelector(".bn-editor");
            if (!editorEl) return;

            const headingElements = editorEl.querySelectorAll("h1, h2, h3");
            const items: TOCItem[] = [];

            headingElements.forEach((el, index) => {
                const text = el.textContent || "";
                const id = `heading-${index}`;
                el.setAttribute("id", id);

                let level = 1;
                if (el.tagName === "H2") level = 2;
                if (el.tagName === "H3") level = 3;

                items.push({ id, text, level });
            });

            setToc(items);
        };

        // Delay to ensure BlockNote has rendered
        const timer = setTimeout(updateTOC, 800);

        // Observe for changes
        const observer = new MutationObserver(updateTOC);
        const editorWrapper = document.querySelector(".block-editor-wrapper");
        if (editorWrapper) {
            observer.observe(editorWrapper, { childList: true, subtree: true });
        }

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [content]);

    if (toc.length === 0) return null;

    return (
        <div className="hidden xl:block sticky top-24 w-64 shrink-0 h-fit space-y-4 py-8">
            <div className="flex items-center gap-2 px-2 text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Mục lục</span>
            </div>
            <nav className="space-y-0.5 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                {toc.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            const el = document.getElementById(item.id);
                            if (el) {
                                const offset = 100;
                                const bodyRect = document.body.getBoundingClientRect().top;
                                const elementRect = el.getBoundingClientRect().top;
                                const elementPosition = elementRect - bodyRect;
                                const offsetPosition = elementPosition - offset;

                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: "smooth"
                                });
                            }
                        }}
                        className={cn(
                            "block w-full text-left px-3 py-1.5 text-[13px] rounded-lg transition-all border-l-2 border-transparent",
                            item.level === 1 ? "font-bold text-foreground/80 mt-2 first:mt-0" :
                                item.level === 2 ? "ml-3 text-muted-foreground font-medium" :
                                    "ml-6 text-muted-foreground/60",
                            "hover:text-primary hover:bg-primary/5 hover:border-primary/20"
                        )}
                    >
                        <span className="line-clamp-2">{item.text}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
