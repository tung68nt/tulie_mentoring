import { MeetingForm } from "@/components/features/meetings/meeting-form";
import { getMentorships } from "@/lib/actions/mentorship";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewMeetingPage() {
    const session = await auth();
    const role = (session?.user as any).role;

    if (role === "mentee") {
        redirect("/calendar");
    }

    // Fetch mentorships the user is allowed to create meetings for
    // For mentors, only their own groups. For admin, all groups.
    const allMentorships = await getMentorships();
    const filteredMentorships = role === "admin"
        ? allMentorships
        : allMentorships.filter(m => m.mentorId === session?.user?.id);

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Lên lịch cuộc họp mới</h1>
                <p className="text-gray-500 mt-1">Thiết lập thời gian và địa điểm cho buổi Mentoring</p>
            </div>

            <MeetingForm mentorships={filteredMentorships} />
        </div>
    );
}
