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
        <div className={`block-editor-wrapper rounded-xl border border-border overflow-hidden bg-background ${className}`}>
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
                    padding: 1rem 1.25rem;
                }
                .block-editor-wrapper .bn-editor [class*="blockContent"] {
                    font-size: 14px;
                    line-height: 1.7;
                    color: hsl(var(--foreground));
                }
                .block-editor-wrapper .bn-editor [class*="heading"] h1 {
                    font-size: 1.5rem !important;
                    font-weight: 600 !important;
                }
                .block-editor-wrapper .bn-editor [class*="heading"] h2 {
                    font-size: 1.25rem !important;
                    font-weight: 600 !important;
                }
                .block-editor-wrapper .bn-editor [class*="heading"] h3 {
                    font-size: 1.1rem !important;
                    font-weight: 600 !important;
                }
                /* Remove any uppercase from blocknote */
                .block-editor-wrapper * {
                    text-transform: none !important;
                    letter-spacing: normal !important;
                }
                /* Match our monochrome theme */
                .block-editor-wrapper .bn-editor [data-content-type="bulletListItem"]::before,
                .block-editor-wrapper .bn-editor [data-content-type="numberedListItem"]::before {
                    color: hsl(var(--muted-foreground));
                }
                /* Toolbar theme overrides */
                .block-editor-wrapper [class*="toolbar"],
                .block-editor-wrapper [class*="menu"] {
                    border-color: hsl(var(--border)) !important;
                    background: hsl(var(--background)) !important;
                }
                .block-editor-wrapper .bn-editor .bn-block-group > .bn-block-outer:first-child {
                    margin-top: 0;
                }
                /* Placeholder color */
                .block-editor-wrapper .bn-editor [data-placeholder]::before {
                    color: hsl(var(--muted-foreground)) !important;
                    opacity: 0.5;
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
