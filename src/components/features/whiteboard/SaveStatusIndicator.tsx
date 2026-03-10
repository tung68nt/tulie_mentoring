import React, { memo } from 'react';
import { Check, Cloud, Loader2, AlertCircle } from 'lucide-react';

export type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';

interface SaveStatusIndicatorProps {
    status: SaveStatus;
}

const SaveStatusIndicator = memo(({ status }: SaveStatusIndicatorProps) => {
    return (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-border text-xs font-medium transition-all duration-300">
            {status === 'saving' && (
                <>
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Saving...</span>
                </>
            )}
            {status === 'saved' && (
                <>
                    <Cloud className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">Saved</span>
                </>
            )}
            {status === 'unsaved' && (
                <>
                    <div className="h-2 w-2 rounded-full bg-orange-400" />
                    <span className="text-orange-600 dark:text-orange-400">Unsaved changes</span>
                </>
            )}
            {status === 'error' && (
                <>
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">Save failed</span>
                </>
            )}
        </div>
    );
});

SaveStatusIndicator.displayName = 'SaveStatusIndicator';

export default SaveStatusIndicator;
