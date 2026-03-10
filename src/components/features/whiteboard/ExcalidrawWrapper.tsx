'use client';

import React from 'react';
import { Excalidraw, MainMenu, WelcomeScreen } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

interface ExcalidrawWrapperProps {
    excalidrawAPI: (api: any) => void;
    onChange: (elements: readonly any[], appState: any) => void;
    onPointerUpdate: (activeTool: any, pointerData: any) => void;
    onBack: () => void;
    title?: string;
    initialData?: {
        elements?: readonly any[];
        appState?: any;
    };
    viewModeEnabled?: boolean;
}

const ExcalidrawWrapper = React.memo(({
    excalidrawAPI,
    onChange,
    onPointerUpdate,
    initialData,
    viewModeEnabled = false
}: ExcalidrawWrapperProps) => {
    // Capture API locally to handle UI events
    const [localAPI, setLocalAPI] = React.useState<any>(null);

    const handleAPI = React.useCallback((api: any) => {
        setLocalAPI(api);
        excalidrawAPI(api);
    }, [excalidrawAPI]);

    // Force close menu when clicking on canvas
    const handlePointerDown = React.useCallback(() => {
        if (localAPI && localAPI.getAppState().openMenu) {
            localAPI.updateScene({ appState: { openMenu: null } });
        }
    }, [localAPI]);

    console.log('=== ExcalidrawWrapper render ===');
    console.log('initialData:', initialData?.elements?.length, 'elements');

    return (
        <Excalidraw
            excalidrawAPI={handleAPI}
            onChange={onChange}
            onPointerUpdate={onPointerUpdate as any}
            onPointerDown={handlePointerDown}
            initialData={initialData}
            viewModeEnabled={viewModeEnabled}
            UIOptions={{
                canvasActions: {
                    toggleTheme: true,
                    changeViewBackgroundColor: true,
                    clearCanvas: !viewModeEnabled,
                    saveAsImage: true,
                    export: { saveFileToDisk: true },
                    loadScene: !viewModeEnabled,
                    saveToActiveFile: !viewModeEnabled,
                },
            }}
        >
            <MainMenu>
                <MainMenu.DefaultItems.LoadScene />
                <MainMenu.DefaultItems.SaveToActiveFile />
                <MainMenu.DefaultItems.Export />
                <MainMenu.DefaultItems.SaveAsImage />
                <MainMenu.DefaultItems.Help />
                <MainMenu.DefaultItems.ClearCanvas />
                <MainMenu.Separator />
                <MainMenu.DefaultItems.ToggleTheme />
                <MainMenu.DefaultItems.ChangeCanvasBackground />
            </MainMenu>
            <WelcomeScreen>
                <WelcomeScreen.Hints.MenuHint />
                <WelcomeScreen.Hints.ToolbarHint />
                <WelcomeScreen.Hints.HelpHint />
                <WelcomeScreen.Center>
                    <WelcomeScreen.Center.Heading>
                        <span
                            className="text-foreground font-semibold tracking-tight"
                            style={{
                                fontSize: '42px',
                                fontFamily: '"Virgil", "Excalifont", sans-serif',
                                display: 'block',
                                marginBottom: '8px'
                            }}
                        >
                            Tulie Whiteboard
                        </span>
                    </WelcomeScreen.Center.Heading>
                    <WelcomeScreen.Center.Menu>
                        <WelcomeScreen.Center.MenuItemLoadScene />
                        <WelcomeScreen.Center.MenuItemHelp />
                    </WelcomeScreen.Center.Menu>
                </WelcomeScreen.Center>
            </WelcomeScreen>
        </Excalidraw>
    );
}, (prev, next) => {
    // IMPORTANT: Must compare initialData to reload when data changes
    const prevElementsLength = prev.initialData?.elements?.length ?? 0;
    const nextElementsLength = next.initialData?.elements?.length ?? 0;

    // Re-render if initialData changes from empty to non-empty
    if (prevElementsLength === 0 && nextElementsLength > 0) {
        console.log('ExcalidrawWrapper: Triggering re-render for initialData change');
        return false;
    }

    return prev.excalidrawAPI === next.excalidrawAPI &&
        prev.onChange === next.onChange &&
        prev.onPointerUpdate === next.onPointerUpdate;
});

ExcalidrawWrapper.displayName = 'ExcalidrawWrapper';

export default ExcalidrawWrapper;

