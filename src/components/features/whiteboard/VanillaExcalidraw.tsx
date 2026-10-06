'use client';

import React from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

/**
 * Vanilla Excalidraw - no custom UI, no custom CSS, no Socket.io
 * Used to diagnose if lag is from custom code or Excalidraw library itself
 */
export default function VanillaExcalidraw() {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Excalidraw
                langCode="vi-VN"
                theme="light"
            />
        </div>
    );
}
