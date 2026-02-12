import { MentorshipForm } from "@/components/features/mentorships/mentorship-form";
import { getProgramCycles, getEligibleMentors, getEligibleMentees } from "@/lib/actions/mentorship";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewMentorshipPage() {
    const session = await auth();
    if ((session?.user as any).role !== "admin") {
        redirect("/");
    }

    const [programs, mentors, mentees] = await Promise.all([
        getProgramCycles(),
        getEligibleMentors(),
        getEligibleMentees(),
    ]);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tạo Mentorship mới</h1>
                <p className="text-gray-500 mt-1">Gán mentor và mentees vào chương trình</p>
            </div>

            <MentorshipForm
                programs={programs}
                mentors={mentors}
                mentees={mentees}
            />
        </div>
    );
}
