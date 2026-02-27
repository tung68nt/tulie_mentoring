"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import "@blocknote/core/fonts/inter.css";
import { useEffect, useState } from "react";

interface SlideBlockEditorProps {
    content: string;
    onChange: (markdown: string) => void;
    currentSlideIdx?: number;
}

export default function SlideBlockEditor({ content, onChange, currentSlideIdx = 0 }: SlideBlockEditorProps) {
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const editor = useCreateBlockNote();

    // Load initial content
    useEffect(() => {
        if (content && isInitialLoad && editor) {
            try {
                const blocks = editor.tryParseMarkdownToBlocks(content);
                editor.replaceBlocks(editor.document, blocks);
                setIsInitialLoad(false);
            } catch (e) {
                console.error("Failed to parse markdown", e);
            }
        }
    }, [content, editor, isInitialLoad]);

    // Update content if it changes externally (e.g. adding a slide from parent)
    useEffect(() => {
        if (!isInitialLoad && editor) {
            const updateExternal = async () => {
                const currentMarkdown = await editor.blocksToMarkdownLossy(editor.document);
                if (content !== currentMarkdown) {
                    try {
                        const blocks = editor.tryParseMarkdownToBlocks(content);
                        editor.replaceBlocks(editor.document, blocks);
                    } catch (e) {
                        console.error("Failed to update markdown externally", e);
                    }
                }
            };
            updateExternal();
        }
    }, [content, editor, isInitialLoad]);

    // Scroll to current slide when navigator clicked
    useEffect(() => {
        if (editor && !isInitialLoad) {
            const blocks = editor.document;
            let slideCount = 0;
            let targetBlock = blocks[0];

            for (const block of blocks) {
                if (slideCount === currentSlideIdx) {
                    targetBlock = block;
                    break;
                }
                if (block.type === "divider") {
                    slideCount++;
                }
            }

            if (targetBlock) {
                // Focus and scroll to the block
                editor.focus();
                // We use a small timeout to ensure editor is ready
                setTimeout(() => {
                    const blockElement = document.querySelector(`[data-id="${targetBlock.id}"]`);
                    if (blockElement) {
                        blockElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 50);
            }
        }
    }, [currentSlideIdx, editor, isInitialLoad]);

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
            <BlockNoteView
                editor={editor}
                theme="light"
                onChange={async () => {
                    if (isInitialLoad) return;
                    const markdown = await editor.blocksToMarkdownLossy(editor.document);
                    onChange(markdown);
                }}
                className="min-h-full p-8"
            />
            <style jsx global>{`
                .bn-editor {
                    padding-left: 50px !important;
                    padding-right: 50px !important;
                }
                .bn-block-content {
                    font-size: 16px !important;
                }
                /* Customize divider to look like a slide break */
                .bn-block-outer[data-content-type="divider"] {
                    margin-top: 40px !important;
                    margin-bottom: 40px !important;
                    border-top: 2px dashed hsl(var(--primary) / 0.3) !important;
                    position: relative;
                }
                .bn-block-outer[data-content-type="divider"]::after {
                    content: "Slide Break";
                    position: absolute;
                    left: 50%;
                    top: -10px;
                    transform: translateX(-50%);
                    background: hsl(var(--background));
                    padding: 0 10px;
                    font-size: 10px;
                    color: hsl(var(--muted-foreground));
                }
            `}</style>
        </div>
    );
}
