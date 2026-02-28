import { MeetingForm } from "@/components/features/meetings/meeting-form";
import { getMentorships } from "@/lib/actions/mentorship";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewMeetingPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const role = (session.user as any).role;

    // Fetch mentorships the user is allowed to create meetings for
    const allMentorships = await getMentorships();
    const filteredMentorships = role === "admin"
        ? allMentorships
        : role === "mentor"
            ? allMentorships.filter((m: any) => m.mentorId === session?.user?.id)
            : allMentorships.filter((m: any) => m.mentees.some((mentee: any) => mentee.menteeId === session?.user?.id));

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Lên lịch cuộc họp mới</h1>
                <p className="text-muted-foreground mt-1 text-sm">Thiết lập thời gian và địa điểm cho buổi Mentoring</p>
            </div>

            <MeetingForm mentorships={filteredMentorships} />
        </div>
    );
}
