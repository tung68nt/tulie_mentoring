"use client";

import dynamic from "next/dynamic";

const SlideEditor = dynamic(() => import("./SlideEditor"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[calc(100vh-88px-40px)] w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm font-medium text-muted-foreground">Đang tải slide...</p>
            </div>
        </div>
    )
});

export default function SlideEditorClient({ id }: { id: string }) {
    return <SlideEditor id={id} />;
}
