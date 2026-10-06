import React from "react";
import { getWikiStructure } from "@/lib/actions/wiki";
import { WikiTreeSidebar } from "@/components/features/wiki/wiki-tree-sidebar";

export default async function WikiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let structure: any[] = [];
    try {
        structure = await getWikiStructure();
    } catch (error) {
        console.error("Failed to fetch wiki structure for sidebar:", error);
    }

    return (
        <div className="flex gap-0 -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 min-h-[calc(100vh-var(--header-height))]">
            {/* Tree sidebar */}
            <WikiTreeSidebar structure={structure} />

            {/* Main content */}
            <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar">
                <div className="px-6 py-8 md:px-10 lg:px-14 max-w-[1000px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
