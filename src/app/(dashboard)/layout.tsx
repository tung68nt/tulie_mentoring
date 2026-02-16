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

    const [notifications, unreadCount] = await Promise.all([
        getNotifications(15),
        getUnreadCount(),
    ]);

    return (
        <div className="min-h-screen bg-card">
            <Sidebar role={user.role} />

            <div className="lg:ml-[var(--sidebar-width)] min-h-screen flex flex-col">
                <Header
                    userName={`${user.firstName} ${user.lastName || ""}`}
                    userRole={user.role}
                    avatar={user.avatar}
                    notifications={JSON.parse(JSON.stringify(notifications))}
                    unreadCount={unreadCount}
                />

                <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-[72px] pb-10 max-w-[1200px] mx-auto w-full">
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>

                <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border">
                    © {new Date().getFullYear()} Tulie TSS. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
