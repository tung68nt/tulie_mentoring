import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRecentMeetingsForReflection, getReflections, getMentorMenteeReflections, getMentorReflectionStats } from "@/lib/actions/reflection";
import { Card } from "@/components/ui/card";
import { PenLine, CheckCircle2, Clock, Users } from "lucide-react";
import { MentorReflectionView } from "@/components/features/reflections/mentor-reflection-view";
import { MenteeReflectionLayout } from "@/components/features/reflections/mentee-reflection-layout";

export default async function ReflectionsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const role = (session.user as any).role;
    const isMentorOrAdmin = role === "mentor" || role === "admin" || role === "program_manager";

    try {
        // ─── MENTOR / ADMIN VIEW ───
        if (isMentorOrAdmin) {
            const [mentorships, stats] = await Promise.all([
                getMentorMenteeReflections().catch(e => { console.error("Mentor mentorships error:", e); return []; }),
                getMentorReflectionStats().catch(e => {
                    console.error("Stats error:", e);
                    return { totalExpected: 0, totalSubmitted: 0, totalConfirmed: 0, submissionRate: 0, confirmationRate: 0, pendingConfirmation: 0 };
                }),
            ]);

            return (
                <div className="space-y-8 pb-20 animate-fade-in">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Thu hoạch từ Mentees</h1>
                        <p className="text-sm text-muted-foreground/60 font-medium">
                            Theo dõi và xác nhận bài thu hoạch từ các mentee sau mỗi buổi mentoring.
                        </p>
                    </div>

                    {/* Mentor Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-6 flex flex-col items-center justify-center text-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 mb-1">
                                <PenLine className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-black tracking-tight text-foreground">{stats.totalSubmitted}</p>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Bài đã nộp</p>
                            </div>
                        </Card>
                        <Card className="p-6 flex flex-col items-center justify-center text-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 mb-1">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-black tracking-tight text-foreground">{stats.totalConfirmed}</p>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Đã xác nhận</p>
                            </div>
                        </Card>
                        <Card className="p-6 flex flex-col items-center justify-center text-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 mb-1">
                                <Clock className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-black tracking-tight text-foreground">{stats.pendingConfirmation}</p>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Chờ xác nhận</p>
                            </div>
                        </Card>
                        <Card className="p-6 flex flex-col items-center justify-center text-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 mb-1">
                                <Users className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-black tracking-tight text-foreground">{stats.submissionRate}%</p>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Tỷ lệ nộp bài</p>
                            </div>
                        </Card>
                    </div>

                    {/* Mentor reflections list by Mentee tab */}
                    <MentorReflectionView mentorships={mentorships} />
                </div>
            );
        }

        // ─── MENTEE VIEW ───
        const [pendingMeetings, reflections] = await Promise.all([
            getRecentMeetingsForReflection().catch(e => { console.error("Recent meetings fetch error:", e); return []; }),
            getReflections().catch(e => { console.error("Reflections fetch error:", e); return []; }),
        ]);

        return (
            <div className="pb-20 animate-fade-in">
                <div className="flex flex-col gap-1 mb-4">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Thu hoạch Mentoring</h1>
                    <p className="text-sm text-muted-foreground/60 font-medium">
                        Ghi lại những bài học và cảm nhận sau mỗi buổi mentoring.
                    </p>
                </div>

                <Card className="p-0 overflow-hidden">
                    <MenteeReflectionLayout
                        pendingMeetings={pendingMeetings}
                        reflections={reflections}
                        userRole={role}
                    />
                </Card>
            </div>
        );
    } catch (error) {
        console.error("Failed to load reflections page:", error);
        return (
            <div className="p-10 text-center bg-destructive/5 rounded-xl border border-destructive/20 mt-10">
                <p className="text-sm text-destructive font-medium">Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.</p>
            </div>
        );
    }
}
