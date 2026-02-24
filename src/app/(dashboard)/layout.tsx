import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { redirect } from "next/navigation";
import { getNotifications, getUnreadCount } from "@/lib/actions/notification";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const role = (session.user as any).role;
    const user = {
        id: session.user.id!,
        firstName: (session.user as any).firstName,
        lastName: (session.user as any).lastName,
        role: role,
        avatar: session.user.image,
    };

    let notifications: any[] = [];
    let unreadCount = 0;

    try {
        const [notifsResult, unreadResult] = await Promise.all([
            getNotifications(15),
            getUnreadCount(),
        ]);
        notifications = notifsResult;
        unreadCount = unreadResult;
    } catch (error) {
        console.error("Failed to fetch layout data:", error);
        // Fallback to empty data to prevent page crash
    }

    return (
        <div className="min-h-screen bg-background">
            <Sidebar role={user.role} />

            <div className="lg:ml-[var(--sidebar-width)] min-h-screen flex flex-col transition-all duration-300">
                <Header
                    userName={`${user.firstName} ${user.lastName || ""}`}
                    userRole={user.role}
                    avatar={user.avatar}
                    notifications={JSON.parse(JSON.stringify(notifications))}
                    unreadCount={unreadCount}
                />

                <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-[88px] pb-10 max-w-[1400px] mx-auto w-full">
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>

                <footer className="py-8 text-center text-[13px] text-muted-foreground/60 border-t border-border no-uppercase">
                    © {new Date().getFullYear()} Tulie Mentoring. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
