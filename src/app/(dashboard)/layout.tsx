import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNotifications, getUnreadCount } from "@/lib/actions/notification";
import { DashboardContainer } from "@/components/layout/dashboard-container";
import { getSystemSettings } from "@/lib/actions/settings";

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
        role: role as "admin" | "mentor" | "mentee" | "manager" | "program_manager" | "facilitator",
        avatar: session.user.image || null,
    };

    let notifications: any[] = [];
    let unreadCount = 0;
    let settings: any = {};

    try {
        const [notifsResult, unreadResult, settingsResult] = await Promise.all([
            getNotifications(15),
            getUnreadCount(),
            getSystemSettings()
        ]);
        notifications = notifsResult;
        unreadCount = unreadResult;
        settings = settingsResult;
    } catch (error) {
        console.error("Failed to fetch layout data:", error);
    }

    return (
        <DashboardContainer
            user={user}
            notifications={JSON.parse(JSON.stringify(notifications))}
            unreadCount={unreadCount}
            logoUrl={settings.sidebar_logo}
            siteName={settings.site_name}
        >
            {children}
        </DashboardContainer>
    );
}
