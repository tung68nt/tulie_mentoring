'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ConfirmDialogContainer } from '@/components/ui/confirm-dialog';
import { UiStyleProvider } from '@/components/providers/ui-style-provider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <UiStyleProvider>
                <TooltipProvider>
                    {children}
                    <Toaster position="top-right" richColors />
                    <ConfirmDialogContainer />
                </TooltipProvider>
            </UiStyleProvider>
        </SessionProvider>
    );
}
