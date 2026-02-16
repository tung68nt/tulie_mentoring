import { auth } from "@/lib/auth";
import { getUserProfile } from "@/lib/actions/user";
import { getMeetings } from "@/lib/actions/meeting";
import { ProfileEditor } from "@/components/features/profile/profile-editor";

import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const userId = session.user.id;
    const role = (session.user as any).role;

    try {
        const user = await getUserProfile(userId!);
        if (!user) {
            return (
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-muted-foreground">Không tìm thấy thông tin người dùng.</p>
                </div>
            );
        }

        // Get real meeting count
        const meetings = await getMeetings({ role, userId });
        const meetingCount = meetings.length;

        // Serialize data to avoid "Server Component Render" error when passing Date objects to Client Components
        const serializedUser = JSON.parse(JSON.stringify(user));

        return <ProfileEditor user={serializedUser} meetingCount={meetingCount} />;
    } catch (error) {
        console.error("Failed to fetch profile:", error);
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.</p>
            </div>
        );
    }
}
