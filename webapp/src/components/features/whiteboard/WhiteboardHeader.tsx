import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Cloud, Pencil, LayoutGrid, Globe, Lock, Link as LinkIcon, Check, Copy } from 'lucide-react';
import { SaveStatus } from './SaveStatusIndicator';

interface WhiteboardHeaderProps {
    title?: string;
    saveStatus: SaveStatus;
    onBack: () => void;
    onRename?: (newTitle: string) => void;
    isSidebarDocked?: boolean;
    gridEnabled?: boolean;
    onToggleGrid?: () => void;
    onSave?: () => Promise<void>;
    status?: 'public' | 'private';
    onStatusChange?: (newStatus: 'public' | 'private') => void;
    isReadOnly?: boolean;
    onMakeCopy?: () => void;
}

export default function WhiteboardHeader({
    title, saveStatus, onBack, onRename, isSidebarDocked,
    gridEnabled = true, onToggleGrid, onSave,
    status = 'private', onStatusChange,
    isReadOnly = false, onMakeCopy
}: WhiteboardHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState(title || 'Untitled Whiteboard');
    const [justCopied, setJustCopied] = useState(false);

    useEffect(() => {
        setTempTitle(title || 'Untitled Whiteboard');
    }, [title]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
            if (onRename && tempTitle.trim() !== title) {
                onRename(tempTitle);
            }
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (onRename && tempTitle.trim() !== title) {
            onRename(tempTitle);
        }
    };

    return (
        <>
            {/* TOP LEFT BRANDING GROUP */}
            <div className="absolute top-4 left-[60px] z-30">
                <div className="flex items-center gap-2.5 px-3 h-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md box-border overflow-hidden">
                    <div className="w-6 h-6 bg-zinc-900 rounded-md flex items-center justify-center">
                        <span className="text-white text-[10px] font-medium">T</span>
                    </div>
                    <div className="flex flex-col justify-center leading-none">
                        <span className="text-xl font-bold text-foreground" style={{ fontFamily: '"Virgil", "Excalifont", sans-serif' }}>
                            Tulie Whiteboard
                        </span>
                    </div>
                </div>
            </div>

            {/* BOTTOM CENTER CONTROLS GROUP */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 max-w-[95vw] sm:max-w-none">
                <div
                    className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl h-[52px] p-1 px-2 flex items-center gap-1.5 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-md"
                >
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 transition-all active:scale-95"
                        onClick={onBack}
                        title="Back to Dashboard"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                    {/* Title Input */}
                    <div className="flex items-center gap-2 px-2">
                        {isEditing && !isReadOnly ? (
                            <input
                                autoFocus
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                                className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 bg-transparent border-none outline-none min-w-[100px] max-w-[200px]"
                                style={{ fontFamily: '"Virgil", "Excalifont", sans-serif' }}
                            />
                        ) : (
                            <h1
                                className={`text-[13px] font-medium text-zinc-900 dark:text-zinc-100 max-w-[150px] sm:max-w-[300px] truncate flex items-center gap-2 ${!isReadOnly ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                                style={{ fontFamily: '"Virgil", "Excalifont", sans-serif' }}
                                onClick={() => !isReadOnly && setIsEditing(true)}
                                title={!isReadOnly ? "Click to rename" : title}
                            >
                                {title || 'Untitled Whiteboard'}
                                {!isReadOnly && <Pencil className="w-3 h-3 text-zinc-400 opacity-50" />}
                            </h1>
                        )}
                    </div>

                    <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                    {/* Read Only Indicator / Make Copy */}
                    {isReadOnly && (
                        <>
                            <div className="flex items-center px-3 py-1.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 border border-amber-200 dark:border-amber-800/50">
                                <span className="text-[11px] font-medium">View Only</span>
                            </div>
                            {onMakeCopy && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onMakeCopy}
                                    className="h-9 px-3 text-[11px] gap-1.5 rounded-xl border-zinc-200 dark:border-zinc-700"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    Make a copy
                                </Button>
                            )}
                            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
                        </>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 rounded-lg transition-all ${gridEnabled
                            ? 'bg-secondary text-foreground border border-border/60 transition-colors'
                            : 'text-muted-foreground hover:bg-muted/50 transition-colors'
                            }`}
                        onClick={onToggleGrid}
                        title={gridEnabled ? "Hide Grid" : "Show Grid"}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </Button>

                    <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

                    {/* Visibility Switch - Only explicit toggle if NOT read-only */}
                    {!isReadOnly ? (
                        <div className="flex items-center p-1 bg-muted/30 rounded-lg border border-border/60">
                            <div
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all duration-200 cursor-pointer text-[12px] font-medium ${status === 'private' ? 'bg-background text-foreground border border-border/40' : 'text-muted-foreground hover:bg-muted/50'}`}
                                onClick={() => onStatusChange?.('private')}
                            >
                                <Lock className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Riêng tư</span>
                            </div>
                            <div
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all duration-200 cursor-pointer text-[12px] font-medium ${status === 'public' ? 'bg-emerald-500 text-white' : 'text-muted-foreground hover:bg-muted/50'}`}
                                onClick={() => onStatusChange?.('public')}
                            >
                                <Globe className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Công khai</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-500 border border-emerald-100 dark:border-emerald-800/50">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium">Public</span>
                        </div>
                    )}

                    <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

                    {/* Copy Link Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted/50 transition-all border border-transparent hover:border-border/60"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setJustCopied(true);
                            setTimeout(() => setJustCopied(false), 2000);
                        }}
                        title="Copy Share Link"
                    >
                        {justCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4" />}
                    </Button>

                    {!isReadOnly && (
                        <div className="hidden sm:flex items-center gap-2 bg-muted/30 px-2.5 py-1 rounded-lg border border-border/60 ml-1">
                            {saveStatus === 'saving' && (
                                <>
                                    <div className="w-2 h-2 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[11px] text-zinc-500 font-medium">Saving</span>
                                </>
                            )}
                            {saveStatus === 'saved' && (
                                <button
                                    onClick={onSave}
                                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                                    title="Click to force save"
                                >
                                    <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-[11px] text-zinc-500 font-medium">Saved</span>
                                </button>
                            )}
                            {saveStatus === 'error' && (
                                <button
                                    onClick={onSave}
                                    className="flex items-center gap-1.5"
                                    title="Retry save"
                                >
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-[11px] text-red-500 font-medium">Retry</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
