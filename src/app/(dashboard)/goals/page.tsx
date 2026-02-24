import { auth } from "@/lib/auth";
import { getMentorships } from "@/lib/actions/mentorship";
import { getGoals } from "@/lib/actions/goal";
import { GoalsList } from "@/components/features/goals/goals-list";

import { redirect } from "next/navigation";

export default async function GoalsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const userId = session.user.id;
    const role = (session.user as any).role;

    const mentorships = await getMentorships();
    const relevantMentorships = role === "admin"
        ? mentorships
        : role === "mentor"
            ? mentorships.filter((m: any) => m.mentorId === userId)
            : mentorships.filter((m: any) => m.mentees.some((mt: any) => mt.menteeId === userId));

    const allGoalsPromises = relevantMentorships.map((m: any) => getGoals(m.id));
    const results = await Promise.all(allGoalsPromises);
    const allGoals = results.flat();

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Mục tiêu đào tạo</h1>
                <p className="text-sm text-muted-foreground mt-1">Theo dõi tiến độ phát triển năng lực của Mentee</p>
            </div>

            <GoalsList
                mentorships={JSON.parse(JSON.stringify(relevantMentorships))}
                allGoals={JSON.parse(JSON.stringify(allGoals))}
                userRole={role}
            />
        </div>
    );
}
