/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { exportToBlob } from '@excalidraw/excalidraw';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Lock, FileX } from 'lucide-react';

import ExcalidrawWrapper from './ExcalidrawWrapper';
import * as actions from '@/lib/actions/whiteboard';
import { SaveStatus } from './SaveStatusIndicator';
import WhiteboardHeader from './WhiteboardHeader';

interface WhiteboardEditorProps {
    id: string;
}

export default function WhiteboardEditor({ id }: WhiteboardEditorProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user;
    const [whiteboard, setWhiteboard] = useState<any>(null);
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Optimized UI State
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
    const [showWelcome, setShowWelcome] = useState(false);
    const [isSidebarDocked, setIsSidebarDocked] = useState(false);
    const [gridEnabled, setGridEnabled] = useState(true); // Default true
    const [parsedInitialData, setParsedInitialData] = useState<{ elements?: any[]; appState?: any } | undefined>(undefined);

    // Access Control State
    const [accessError, setAccessError] = useState<'PRIVATE' | 'NOT_FOUND' | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false); // Guest Save Prompt

    // Refs for performance (avoid state updates during drawing)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastEmitTimeRef = useRef<number>(0);
    const lastPointerUpdateRef = useRef<number>(0);
    const socketRef = useRef<any>(null);
    const creatingRef = useRef(false);
    const whiteboardRef = useRef<any>(null);
    const currentElementsRef = useRef<readonly any[]>([]);

    // Keep ref in sync
    useEffect(() => {
        whiteboardRef.current = whiteboard;
    }, [whiteboard]);

    // Initial Load Data
    useEffect(() => {
        console.log('WhiteboardEditor mounted with ID:', id);

        const loadWhiteboard = async () => {
            setAccessError(null);

            if (id === 'new') {
                if (creatingRef.current) return;

                // GUEST RESTORATION LOGIC
                // Check if we have a saved draft from a previous session (e.g. before login redirect)
                // We only restore if we are on 'new' route.
                const savedDraft = localStorage.getItem('tulie_guest_draft');
                let restoredElements: any[] = [];
                let restoredAppState: any = {};

                if (savedDraft) {
                    try {
                        console.log('Restoring guest draft...');
                        const draftData = JSON.parse(savedDraft);
                        restoredElements = draftData.elements || [];
                        restoredAppState = draftData.appState || {};

                        setParsedInitialData(draftData);
                        currentElementsRef.current = restoredElements;
                        setIsLoaded(true);
                    } catch (e) {
                        console.error('Failed to restore draft:', e);
                        localStorage.removeItem('tulie_guest_draft');
                    }
                }

                creatingRef.current = true;
                console.log('Attempting to create new whiteboard...');
                try {
                    const newWhiteboard = await actions.createWhiteboard({ title: 'Untitled Whiteboard' });

                    // If we have a restored draft, save it to the new board immediately!
                    if (restoredElements.length > 0 && newWhiteboard.artboards?.[0]?.id) {
                        console.log('Saving restored draft to new board...');
                        await actions.saveArtboard(newWhiteboard.artboards[0].id, {
                            elements: restoredElements,
                            appState: restoredAppState
                        });
                        // Clear draft after successful save
                        localStorage.removeItem('tulie_guest_draft');
                    }

                    setWhiteboard(newWhiteboard);
                    router.replace(`/whiteboard/${newWhiteboard.id}`);
                    return;
                } catch (error: any) {
                    console.error('Failed to create new whiteboard:', error);
                    creatingRef.current = false;
                    // If 401 (guest), allow them to draw in "draft" mode without a backend ID yet.
                    if (error.status === 401) {
                        console.log('Guest mode: Starting local session');
                        // Only clear/init if we didn't just restore it
                        if (!savedDraft) {
                            setParsedInitialData({ elements: [], appState: { gridModeEnabled: true, theme: 'light', viewBackgroundColor: '#ffffff' } });
                        }
                        setIsLoaded(true);
                        return;
                    }
                }
            } else {
                console.log('Loading existing whiteboard:', id);
            }

            try {
                const data = await actions.getWhiteboardDetail(id);
                setWhiteboard(data);
                setIsReadOnly(data.status === 'private' && data.creatorId !== user?.id);

                // Parse initial data for Excalidraw
                const rawElements = data.artboards?.[0]?.elements;
                console.log('=== PARSING INITIAL DATA ===');

                if (rawElements) {
                    try {
                        const parsed = typeof rawElements === 'string'
                            ? JSON.parse(rawElements)
                            : rawElements;

                        let elements: any[] = [];
                        let appState = {};

                        if (Array.isArray(parsed)) {
                            elements = parsed; // Legacy
                        } else if (parsed && parsed.elements) {
                            elements = parsed.elements;
                            appState = parsed.appState || {};
                        }

                        if (elements.length > 0) {
                            setParsedInitialData({ elements, appState: { ...appState, gridModeEnabled: true, theme: 'light', viewBackgroundColor: '#ffffff' } });
                            currentElementsRef.current = elements;
                        } else {
                            setParsedInitialData({ elements: [], appState: { gridModeEnabled: true, theme: 'light', viewBackgroundColor: '#ffffff' } });
                            setShowWelcome(true);
                        }
                    } catch (e) {
                        console.error('Failed to parse elements:', e);
                        setShowWelcome(true);
                    }
                } else {
                    setParsedInitialData({ elements: [], appState: { gridModeEnabled: true } });
                    setShowWelcome(true);
                }
            } catch (error: any) {
                console.error('Failed to load whiteboard:', error);
                if (error.status === 403 || error.message?.includes('Access denied') || error.message?.includes('private')) {
                    setAccessError('PRIVATE');
                } else if (error.status === 404) {
                    setAccessError('NOT_FOUND');
                }
            } finally {
                setIsLoaded(true);
            }
        };

        if (id) {
            loadWhiteboard();
        }
    }, [id, router]);

    // Socket Connection
    useEffect(() => {
        if (!id || id === 'new') return;

        // Initialize socket
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
            query: { whiteboardId: id },
            transports: ['websocket'],
            reconnection: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('draw_synced', (data: any) => {
            if (excalidrawAPI && data.elements) {
                // Update scene from remote
                // Check if we have active changes to avoid conflict? Use versioning ideally.
                // For now, straightforward update
                excalidrawAPI.updateScene({
                    elements: data.elements,
                    commitToHistory: false
                });
            }
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [id, excalidrawAPI]);

    // Handle initial data for Excalidraw
    useEffect(() => {
        if (!excalidrawAPI || !whiteboard?.artboards?.[0]) return;

        const rawElements = whiteboard.artboards[0].elements;
        console.log('=== DEBUG: Data Loading ===');
        console.log('1. Raw elements from API:', rawElements);
        console.log('2. Type of rawElements:', typeof rawElements);

        if (!rawElements) {
            console.log('3. No elements found, skipping load');
            return;
        }

        console.log('Loading data into Excalidraw', whiteboard.title);

        try {
            const elementsData = typeof rawElements === 'string'
                ? JSON.parse(rawElements)
                : rawElements;

            console.log('4. Parsed elementsData:', elementsData);
            console.log('5. elementsData type:', typeof elementsData);
            console.log('6. Is array?:', Array.isArray(elementsData));

            let finalElements: any[] = [];
            let finalAppState: any = {};

            if (Array.isArray(elementsData)) {
                // Recovery: Handle data saved during bug period (just array of elements)
                console.warn('7. Recovering legacy array data format');
                finalElements = elementsData;
            } else if (elementsData && elementsData.elements) {
                // Correct format: { elements: [...], appState: {...} }
                console.log('7. Using correct format with elements key');
                finalElements = elementsData.elements;
                finalAppState = elementsData.appState || {};
            } else if (elementsData && typeof elementsData === 'object') {
                // Maybe double-stringified?
                console.warn('7. Unknown format, trying to extract elements:', Object.keys(elementsData));
            }

            console.log('8. Final elements count:', finalElements?.length);
            console.log('9. Sample element:', finalElements?.[0]);

            if (finalElements && finalElements.length > 0) {
                console.log('10. Calling updateScene with', finalElements.length, 'elements');
                excalidrawAPI.updateScene({
                    elements: finalElements,
                    appState: {
                        ...finalAppState,
                        theme: 'light',
                        gridModeEnabled: finalAppState.gridModeEnabled !== undefined ? finalAppState.gridModeEnabled : true,
                        viewBackgroundColor: '#ffffff'
                    }
                });
                currentElementsRef.current = finalElements;
                console.log('11. updateScene called successfully');
            } else {
                console.warn('10. No elements to load');
                // Ensure grid and background are set even if no elements
                excalidrawAPI.updateScene({
                    appState: { ...finalAppState, gridModeEnabled: true, viewBackgroundColor: '#f9f9f9' }
                });
            }
        } catch (e) {
            console.error('Failed to parse whiteboard elements:', e);
            console.error('Raw data was:', rawElements);
        }

    }, [excalidrawAPI, whiteboard]);

    // Style HintViewer text with kbd tags (Layout fixes only)
    useEffect(() => {
        const styleHintViewer = () => {
            const hintViewer = document.querySelector('.HintViewer span');
            if (!hintViewer || hintViewer.querySelector('kbd')) return;

            const text = hintViewer.textContent || '';
            // Regex to match keys: Modifiers, named keys, or single letters (A-Z) and numbers (0-9)
            // Avoid matching common words unless they are specifically capitalised key names like 'Space'
            const keyRegex = /\b(Scroll wheel|Space|Option|Cmd|Ctrl|Alt|Shift|Enter|Delete|Backspace|Esc|Tab|Return|PgUp|PgDn|End|Home|Ins|Del|Arrow [A-Za-z]+|[A-Z0-9])\b/g;

            let styledText = text
                .replace(/mouse wheel/gi, 'Scroll wheel')
                .replace(/spacebar/gi, 'Space');

            styledText = styledText.replace(keyRegex, (match) => `<kbd class="excalidraw-kbd">${match}</kbd>`);

            if (styledText !== text) {
                hintViewer.innerHTML = styledText;
            }

            // Layout fix: Ensure margin bottom for hint viewer (Reduced from 40px as requested)
            const hintViewerEl = document.querySelector('.excalidraw .HintViewer');
            if (hintViewerEl) {
                (hintViewerEl as HTMLElement).style.marginBottom = '24px';
            }
        };

        // Observer to watch for HintViewer changes
        const observer = new MutationObserver(() => {
            styleHintViewer();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // Initial run
        styleHintViewer();

        return () => observer.disconnect();
    }, []);

    // --- OPTIMIZED HANDLERS ---

    const handleStartDrawing = useCallback(() => {
        setShowWelcome(false);
    }, []);

    const onChange = useCallback((elements: readonly any[], appState: any) => {
        // Fast path: Update ref immediately
        currentElementsRef.current = elements;

        // Sync grid state for UI toggle
        if (appState.gridModeEnabled !== gridEnabled) {
            setGridEnabled(appState.gridModeEnabled);
        }

        // Debounce Network Operations (Save & Sync)
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Hide welcome screen if elements exist
        // check ref to avoid dependency
        if (elements.length > 0) {
            setShowWelcome((prev) => {
                if (prev) return false;
                return prev;
            });
        }

        saveTimeoutRef.current = setTimeout(async () => {
            // THROTTLED SOCKET EMISSION: 500ms
            const now = Date.now();
            if (now - lastEmitTimeRef.current > 500) {
                lastEmitTimeRef.current = now;
                if (socketRef.current?.connected) {
                    socketRef.current.emit('draw_change', {
                        whiteboardId: id,
                        changes: {
                            elements: elements,
                            appState: {
                                viewBackgroundColor: appState.viewBackgroundColor
                            }
                        }
                    });
                }
            }


            // Update Sidebar State
            if (appState.isSidebarDocked !== isSidebarDocked) {
                setIsSidebarDocked(!!appState.isSidebarDocked);
            }

            // AUTO-SAVE to API
            const currentWhiteboard = whiteboardRef.current;
            if (currentWhiteboard?.artboards?.[0]?.id) {
                // Guard: Don't save if empty (prevents overwriting with blank state on load)
                if (!elements || elements.length === 0) {
                    console.log('Skipping auto-save: No elements to save');
                    return;
                }

                // Check if we have only deleted elements (optional, depends on behavior)
                const hasNonDeleted = elements.some((el: any) => !el.isDeleted);
                if (!hasNonDeleted && elements.length > 0) {
                    // We allow saving "all deleted" if the user actually deleted everything.
                    // But strictly speaking, on initial load, it might be empty.
                }

                setSaveStatus('saving');

                const snapshot = {
                    elements: elements,
                    appState: {
                        viewBackgroundColor: appState.viewBackgroundColor,
                        gridModeEnabled: appState.gridModeEnabled, // Persist grid state
                        currentItemFontFamily: appState.currentItemFontFamily,
                        currentItemFontSize: appState.currentItemFontSize,
                        // Add other necessary appState props
                    }
                };

                try {
                    // Generate Thumbnail
                    const blob = await exportToBlob({
                        elements,
                        mimeType: 'image/jpeg',
                        appState: {
                            ...appState,
                            viewBackgroundColor: appState.viewBackgroundColor || '#ffffff',
                        },
                        files: excalidrawAPI.getFiles(),
                        quality: 0.5, // Low quality for thumbnail
                    });

                    // Convert blob to base64
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = async () => {
                        const base64data = reader.result;
                        await actions.updateWhiteboard(currentWhiteboard.id, { thumbnail: base64data as string });
                    }

                    await actions.saveArtboard(currentWhiteboard.artboards[0].id, snapshot);
                    setSaveStatus('saved');
                } catch (err: any) {
                    console.error('Auto-save failed:', err);
                    setSaveStatus('error');
                }
            }

        }, 500); // Increased debounce to 500ms for better perf
    }, [id, excalidrawAPI, whiteboard]); // Added whiteboard back to fix stale closure bug

    // Throttle: 200ms (Reduced frequency)
    const onPointerUpdate = useCallback((activeTool: any, pointerData: any) => {
        const now = Date.now();
        if (now - lastPointerUpdateRef.current > 200) {
            lastPointerUpdateRef.current = now;
            if (socketRef.current?.connected) {
                socketRef.current.emit('cursor_move', {
                    whiteboardId: id,
                    point: { x: pointerData.x, y: pointerData.y },
                    userName: 'User'
                });
            }
        }
    }, [id]);

    const handleRename = async (newTitle: string) => {
        if (!whiteboard || !newTitle.trim()) return;

        // Optimistic update
        setWhiteboard((prev: any) => ({ ...prev, title: newTitle }));

        try {
            await actions.updateWhiteboard(id, { title: newTitle });
        } catch (error) {
            console.error('Failed to rename whiteboard:', error);
            // Revert on error (optional, or just show toast)
        }
    };

    const handleStatusChange = async (newStatus: 'public' | 'private') => {
        if (!whiteboard || isReadOnly) return; // Guard against read-only

        // Optimistic update
        setWhiteboard((prev: any) => ({ ...prev, status: newStatus }));

        try {
            await actions.updateWhiteboard(id, { status: newStatus });
        } catch (error) {
            console.error('Failed to update whiteboard status:', error);
            // Revert on error
            setWhiteboard((prev: any) => ({ ...prev, status: whiteboard.status }));
        }
    };

    const handleMakeCopy = async () => {
        if (!user) {
            // Redirect to login with return URL
            const returnUrl = encodeURIComponent(window.location.pathname);
            router.push(`/login?returnUrl=${returnUrl}`);
            return;
        }

        const elements = currentElementsRef.current;
        if (!elements || elements.length === 0) return;

        setSaveStatus('saving');
        try {
            const newBoard = await actions.createWhiteboard({
                title: `${whiteboard?.title || 'Untitled'} (Copy)`
            });

            // Wait for creation to propagate if needed, then save content
            if (newBoard?.artboards?.[0]?.id) {
                await actions.saveArtboard(newBoard.artboards[0].id, {
                    elements,
                    appState: excalidrawAPI?.getAppState() || {}
                });
                router.push(`/whiteboard/${newBoard.id}`);
            }
        } catch (error) {
            console.error('Failed to copy whiteboard:', error);
            setSaveStatus('error');
        }
    };

    const handleManualSave = async () => {
        const currentArtboard = whiteboard?.artboards?.[0]; // Current implementation only supports 1 artboard in stable version
        const elements = currentElementsRef.current;

        // Validating minimal requirements for save
        if (!elements) return;

        setSaveStatus('saving');
        try {
            // Guest check: If id='new' and we don't have a real board ID yet
            if (id === 'new' && !currentArtboard?.id) {
                const error: any = new Error('Unauthorized');
                error.status = 401;
                throw error;
            }

            if (!currentArtboard?.id) return;

            const snapshot = {
                elements,
                appState: excalidrawAPI?.getAppState() || {}
            };
            await actions.saveArtboard(currentArtboard.id, snapshot);
            setSaveStatus('saved');

            // Clear draft if successful
            localStorage.removeItem('tulie_guest_draft');
        } catch (err: any) {
            console.error('Manual save failed:', err);

            if (err.status === 401 || err.message === 'Unauthorized') {
                // Guest Save Logic
                localStorage.setItem('tulie_guest_draft', JSON.stringify({
                    elements,
                    appState: excalidrawAPI?.getAppState() || {}
                }));
                setSaveStatus('saved'); // Pretend it saved locally
                setShowLoginModal(true);
                return;
            }

            setSaveStatus('error');
        }
    };

    const handleToggleGrid = () => {
        if (!excalidrawAPI) return;
        const current = excalidrawAPI.getAppState().gridModeEnabled;
        excalidrawAPI.updateScene({
            appState: { gridModeEnabled: !current }
        });
        setGridEnabled(!current);
    };

    if (accessError === 'PRIVATE') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center max-w-md">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h1 className="text-2xl font-semibold mb-3">Bảng trắng riêng tư</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                        This whiteboard is set to private. Please contact the owner if you believe you should have access.
                    </p>
                    <Button onClick={() => router.push('/dashboard')}>
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    if (accessError === 'NOT_FOUND') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4">
                <div className="text-center">
                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileX className="w-10 h-10 text-zinc-400" />
                    </div>
                    <h1 className="text-2xl font-semibold mb-2">Không tìm thấy bảng trắng</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto">
                        The whiteboard you are looking for does not exist or has been deleted.
                    </p>
                    <Button onClick={() => router.push('/dashboard')}>
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    if (!isLoaded && id !== 'new') {
        return (
            <div className="flex items-center justify-center w-full h-screen bg-background">
                {/* Tulie-style Loader: Simple Arc Spinner */}
                <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-50" />
            </div>
        );
    }

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <WhiteboardHeader
                title={whiteboard?.title}
                saveStatus={saveStatus}
                onBack={() => router.push('/whiteboard')}
                onRename={!isReadOnly ? handleRename : undefined}
                onSave={!isReadOnly ? handleManualSave : undefined}
                isSidebarDocked={isSidebarDocked}
                gridEnabled={gridEnabled}
                onToggleGrid={handleToggleGrid}
                status={whiteboard?.status}
                onStatusChange={!isReadOnly ? handleStatusChange : undefined}
                isReadOnly={isReadOnly}
                onMakeCopy={isReadOnly ? handleMakeCopy : undefined}
            />

            <ExcalidrawWrapper
                excalidrawAPI={setExcalidrawAPI}
                onChange={onChange}
                onPointerUpdate={onPointerUpdate}
                onBack={() => router.back()}
                title={whiteboard?.title}
                initialData={parsedInitialData}
                viewModeEnabled={isReadOnly}
            />

            {/* Login Modal for Guest Save */}
            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full border border-zinc-200 dark:border-zinc-800 text-center">
                        <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Đăng nhập để lưu</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                            You need to be logged in to save your whiteboard. Your work has been saved locally and will be restored after you log in.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button
                                className="w-full"
                                onClick={() => {
                                    // Redirect to login with return URL
                                    // We need to pass a query param to know to look for local storage restoration?
                                    // Actually we just check `localStorage` on mount of `id='new'`
                                    // But if we are redirected to `id='new'`, it works.
                                    const returnUrl = encodeURIComponent('/whiteboard/new');
                                    router.push(`/login?returnUrl=${returnUrl}`);
                                }}
                            >
                                Login / Register
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => setShowLoginModal(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
