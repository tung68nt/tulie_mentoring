"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { useCallback, useEffect, useRef } from "react";
import type { Block, PartialBlock } from "@blocknote/core";

interface BlockEditorProps {
    /** Initial content as JSON string or Block array */
    initialContent?: string | PartialBlock[];
    /** Called when content changes, returns JSON string */
    onChange?: (content: string) => void;
    /** Whether the editor is read-only */
    editable?: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** CSS class for the wrapper */
    className?: string;
}

export function BlockEditor({
    initialContent,
    onChange,
    editable = true,
    placeholder = "Bắt đầu viết...",
    className = "",
}: BlockEditorProps) {
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // Parse initial content
    let parsedContent: PartialBlock[] | undefined;
    if (typeof initialContent === "string" && initialContent) {
        try {
            parsedContent = JSON.parse(initialContent) as PartialBlock[];
        } catch {
            parsedContent = undefined;
        }
    } else if (Array.isArray(initialContent)) {
        parsedContent = initialContent;
    }

    const editor = useCreateBlockNote({
        initialContent: parsedContent && parsedContent.length > 0 ? parsedContent : undefined,
    });

    const handleChange = useCallback(() => {
        if (onChangeRef.current) {
            const blocks = editor.document;
            onChangeRef.current(JSON.stringify(blocks));
        }
    }, [editor]);

    useEffect(() => {
        // Subscribe to changes
        // BlockNote fires onChange on mount too, which we ignore via ref
    }, []);

    return (
        <div className={`block-editor-wrapper rounded-lg border border-border overflow-hidden bg-background ${className}`}>
            <BlockNoteView
                editor={editor}
                editable={editable}
                onChange={handleChange}
                theme="light"
                data-theming-css-variables-demo
            />
            <style jsx global>{`
                .block-editor-wrapper .bn-editor {
                    font-family: var(--font-sans), Inter, system-ui, sans-serif;
                    padding: 2rem 1rem 10rem 3.5rem; /* Large bottom padding for focus */
                    max-width: 900px;
                    margin: 0 auto;
                }
                .block-editor-wrapper .bn-editor [class*="blockContent"] {
                    font-size: 12px !important; /* Following Notion Guideline */
                    line-height: 1.65;
                    color: hsl(var(--foreground));
                    margin-top: 2px;
                    margin-bottom: 2px;
                    text-transform: none !important;
                    font-style: normal !important;
                    letter-spacing: 0 !important;
                }
                .block-editor-wrapper .bn-editor [class*="heading"] h1 {
                    font-size: 16px !important; /* Notion Title H1 */
                    font-weight: 700 !important;
                    margin-top: 2rem !important;
                    margin-bottom: 0.5rem !important;
                    border: none !important;
                    letter-spacing: 0 !important;
                    text-transform: none !important;
                    font-style: normal !important;
                }
                .block-editor-wrapper .bn-editor [class*="heading"] h2 {
                    font-size: 14px !important; /* Notion Section H2 */
                    font-weight: 600 !important;
                    margin-top: 1.5rem !important;
                    margin-bottom: 0.5rem !important;
                    border: none !important;
                    letter-spacing: 0 !important;
                    text-transform: none !important;
                    font-style: normal !important;
                }
                .block-editor-wrapper .bn-editor [class*="heading"] h3 {
                    font-size: 13px !important; /* Notion Subsection H3 */
                    font-weight: 600 !important;
                    margin-top: 1.25rem !important;
                    margin-bottom: 0.5rem !important;
                    border: none !important;
                    letter-spacing: 0 !important;
                    text-transform: none !important;
                    font-style: normal !important;
                }
                /* Spacing between blocks */
                .block-editor-wrapper .bn-editor .bn-block-outer {
                    margin-top: 0.25rem;
                }
                /* List refinement */
                .block-editor-wrapper .bn-editor [data-content-type="bulletListItem"],
                .block-editor-wrapper .bn-editor [data-content-type="numberedListItem"] {
                    margin-top: 1px;
                    margin-bottom: 1px;
                    font-size: 12px !important;
                }
                /* Remove any uppercase from blocknote */
                .block-editor-wrapper * {
                    text-transform: none !important;
                    letter-spacing: normal !important;
                    box-shadow: none !important;
                }
                /* Selection color */
                .block-editor-wrapper .bn-editor ::selection {
                    background-color: hsl(var(--primary) / 0.15);
                }
            `}</style>
        </div>
    );
}

/**
 * Helper to convert BlockNote JSON to plain text (for previews/search)
 */
export function blocksToText(content: string): string {
    try {
        const blocks = JSON.parse(content) as Block[];
        return blocks
            .map((block: any) => {
                if (block.content && Array.isArray(block.content)) {
                    return block.content
                        .map((item: any) => (typeof item === "string" ? item : item.text || ""))
                        .join("");
                }
                return "";
            })
            .filter(Boolean)
            .join("\n");
    } catch {
        return content || "";
    }
}
