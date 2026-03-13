import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNotifications, getUnreadCount } from "@/lib/actions/notification";
import { DashboardContainer } from "@/components/layout/dashboard-container";
import { getSystemSettings } from "@/lib/actions/settings";
import { getImpersonatedUser } from "@/lib/actions/impersonation";
import { ImpersonationBanner } from "@/components/layout/impersonation-banner";

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

    // Check impersonation
    const impersonatedUser = await getImpersonatedUser();
    const isImpersonating = !!impersonatedUser;

    const realAdmin = {
        firstName: (session.user as any).firstName,
        lastName: (session.user as any).lastName,
    };

    // Use impersonated user data for display, or real session user
    const displayUser = impersonatedUser
        ? {
            id: impersonatedUser.id,
            firstName: impersonatedUser.firstName,
            lastName: impersonatedUser.lastName,
            role: impersonatedUser.role as "admin" | "mentor" | "mentee" | "manager" | "program_manager" | "facilitator",
            avatar: impersonatedUser.avatar || impersonatedUser.image || null,
        }
        : {
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
        <>
            {isImpersonating && impersonatedUser && (
                <ImpersonationBanner
                    targetUser={impersonatedUser}
                    realAdmin={realAdmin}
                />
            )}
            <div className={isImpersonating ? "pt-10" : ""}>
                <DashboardContainer
                    user={displayUser}
                    notifications={JSON.parse(JSON.stringify(notifications))}
                    unreadCount={unreadCount}
                    logoUrl={settings.sidebar_logo}
                    siteName={settings.site_name}
                >
                    {children}
                </DashboardContainer>
            </div>
        </>
    );
}
