"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { usePathname } from "next/navigation";

interface DashboardContainerProps {
    children: React.ReactNode;
    user: {
        firstName: string;
        lastName: string;
        role: "admin" | "mentor" | "mentee" | "viewer";
        avatar: string | null;
    };
    notifications: any[];
    unreadCount: number;
}

export function DashboardContainer({
    children,
    user,
    notifications,
    unreadCount
}: DashboardContainerProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar with mobile state */}
            <Sidebar
                role={user.role}
                isMobileOpen={isSidebarOpen}
                onMobileClose={() => setIsSidebarOpen(false)}
            />

            <div className="lg:ml-[var(--sidebar-width)] min-h-screen flex flex-col transition-all duration-300">
                <Header
                    userName={`${user.firstName} ${user.lastName || ""}`}
                    userRole={user.role}
                    avatar={user.avatar}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-[88px] pb-10 max-w-[1400px] mx-auto w-full">
                    <div className="animate-fade-in text-foreground">
                        {children}
                    </div>
                </main>

                <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-[13px] text-muted-foreground/60 no-uppercase">
                        © {new Date().getFullYear()} Tulie Mentoring. All rights reserved.
                    </div>
                </footer>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/40 backdrop-blur-[2px] z-[45] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
