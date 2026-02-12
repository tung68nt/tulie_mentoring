import { auth } from "@/lib/auth";
import { getUserProfile } from "@/lib/actions/user";
import { getMeetings } from "@/lib/actions/meeting";
import { ProfileEditor } from "@/components/features/profile/profile-editor";

export default async function ProfilePage() {
    const session = await auth();
    const userId = session?.user?.id;
    const role = (session?.user as any).role;

    const user = await getUserProfile(userId!);
    if (!user) return null;

    // Get real meeting count
    const meetings = await getMeetings({ role, userId });
    const meetingCount = meetings.length;

    return <ProfileEditor user={user} meetingCount={meetingCount} />;
}
