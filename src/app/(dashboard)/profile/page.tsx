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
        const meetings = await getMeetings({ role, userId: userId! });
        const meetingCount = meetings.length;

        return <ProfileEditor user={user} meetingCount={meetingCount} />;
    } catch (error: any) {
        console.error("Failed to fetch profile:", error);
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-destructive font-semibold">Không thể tải thông tin hồ sơ.</p>
                <code className="text-xs bg-muted p-4 rounded max-w-2xl overflow-auto whitespace-pre-wrap">
                    {error?.message || String(error)}
                </code>
            </div>
        );
    }
}
