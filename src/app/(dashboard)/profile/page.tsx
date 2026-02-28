import { auth, signOut } from "@/lib/auth";
import { getUserProfile } from "@/lib/actions/user";
import { getMeetings } from "@/lib/actions/meeting";
import { ProfileEditor } from "@/components/features/profile/profile-editor";
import { Button } from "@/components/ui/button";

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
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <p className="text-muted-foreground">Không tìm thấy thông tin người dùng (hoặc phiên đăng nhập đã cũ).</p>
                    <form action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/login" });
                    }}>
                        <Button variant="outline">Đăng xuất</Button>
                    </form>
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
                <p className="text-destructive font-semibold">Không thể tải thông tin hồ sơ do lỗi hệ thống (có thể do database chưa cập nhật).</p>
                <code className="text-xs bg-muted p-4 rounded max-w-2xl overflow-auto whitespace-pre-wrap max-h-[200px]">
                    {error?.message || String(error)}
                </code>
                <form action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                }}>
                    <Button variant="outline">Đăng xuất</Button>
                </form>
            </div>
        );
    }
}
