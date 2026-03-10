'use client';

import Script from 'next/script';

export default function ExcalidrawConfig() {
    return (
        <Script id="excalidraw-config" strategy="beforeInteractive">
            {`
                window.EXCALIDRAW_ASSET_PATH = "/excalidraw-assets/";
            `}
        </Script>
    );
}
