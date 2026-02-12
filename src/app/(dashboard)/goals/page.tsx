import { auth } from "@/lib/auth";
import { getMentorships } from "@/lib/actions/mentorship";
import { getGoals } from "@/lib/actions/goal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, Search, Filter } from "lucide-react";
import { GoalCard } from "@/components/features/goals/goal-card";
import { GoalForm } from "@/components/features/goals/goal-form";


export default async function GoalsPage() {
    const session = await auth();
    const userId = session?.user?.id;
    const role = (session?.user as any).role;

    // For mentees, they only see goals for their current mentorship
    // For mentors, they might have multiple mentorships
    const mentorships = await getMentorships();
    const relevantMentorships = role === "admin"
        ? mentorships
        : role === "mentor"
            ? mentorships.filter(m => m.mentorId === userId)
            : mentorships.filter(m => m.mentees.some(mt => mt.menteeId === userId));

    // Fetch all goals for all relevant mentorships
    const allGoalsPromises = relevantMentorships.map(m => getGoals(m.id));
    const results = await Promise.all(allGoalsPromises);
    const allGoals = results.flat();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mục tiêu đào tạo</h1>
                    <p className="text-gray-500 mt-1">Theo dõi tiến độ phát triển năng lực của Mentee</p>
                </div>
            </div>

            {relevantMentorships.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
                        <Target className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Chưa có mục tiêu nào</h3>
                    <p className="text-gray-500 max-w-sm mt-2 font-medium">
                        Mục tiêu sẽ được thiết lập sau khi bạn tham gia vào một chương trình Mentoring.
                    </p>
                </Card>
            ) : (
                <div className="space-y-8">
                    {relevantMentorships.map(mentorship => {
                        const mentorshipGoals = allGoals.filter(g => g.mentorshipId === mentorship.id);

                        return (
                            <div key={mentorship.id} className="space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white">
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">
                                                {mentorship.programCycle.name} - {mentorship.mentor.lastName} ➔ {mentorship.mentees[0]?.mentee.lastName}...
                                            </h2>
                                            <p className="text-xs text-gray-500 font-bold">{mentorshipGoals.length} mục tiêu</p>
                                        </div>
                                    </div>
                                    {role !== "mentee" && (
                                        <Button size="sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Thêm mục tiêu
                                        </Button>
                                    )}
                                </div>

                                {mentorshipGoals.length === 0 ? (
                                    <div className="p-10 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center">
                                        <p className="text-sm text-gray-500 font-medium">Chưa có mục tiêu nào cho mentorship này.</p>
                                        {role !== "mentee" && (
                                            <div className="mt-4 max-w-md w-full">
                                                <GoalForm mentorshipId={mentorship.id} />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {mentorshipGoals.map(goal => (
                                            <GoalCard key={goal.id} goal={goal} userRole={role} />
                                        ))}
                                        {role !== "mentee" && (
                                            <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex items-center justify-center group hover:border-gray-900 transition-colors cursor-pointer">
                                                <Plus className="w-8 h-8 text-gray-300 group-hover:text-gray-900 transition-colors" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
