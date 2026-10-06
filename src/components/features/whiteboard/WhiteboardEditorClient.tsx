"use client";

import dynamic from "next/dynamic";

const WhiteboardEditor = dynamic(() => import("./WhiteboardEditor"), {
    ssr: false,
    loading: () => (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm font-medium text-muted-foreground">Đang tải bảng trắng...</p>
            </div>
        </div>
    )
});

export default function WhiteboardEditorClient({ id }: { id: string }) {
    return <WhiteboardEditor id={id} />;
}
