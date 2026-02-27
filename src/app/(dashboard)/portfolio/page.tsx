import { auth } from "@/lib/auth";
import { getPortfolio } from "@/lib/actions/portfolio";
import { getMentorships } from "@/lib/actions/mentorship";
import { getGoals } from "@/lib/actions/goal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { PortfolioForm } from "@/components/features/portfolio/portfolio-form";
import { CheckCircle2, BookOpen, Target, Brain, Award, ArrowRight, ShieldCheck, Star } from "lucide-react";

import { redirect } from "next/navigation";

export default async function PortfolioPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const userId = session.user.id;
    const role = (session.user as any).role;
    let portfolio = null;

    try {
        portfolio = await getPortfolio();
    } catch (error) {
        console.error("Failed to fetch portfolio:", error);
    }

    // Fetch mentorship goals to integrate into portfolio
    let mentorshipGoals: any[] = [];
    try {
        const mentorships = await getMentorships();
        const userMentorships = role === "mentor"
            ? mentorships.filter((m: any) => m.mentorId === userId)
            : mentorships.filter((m: any) => m.mentees.some((mt: any) => mt.menteeId === userId));

        const goalPromises = userMentorships.map((m: any) => getGoals(m.id));
        const results = await Promise.all(goalPromises);
        mentorshipGoals = results.flat();
    } catch (error) {
        console.error("Failed to fetch mentorship goals:", error);
    }

    const hasInitialAssessment = !!portfolio?.initialCompletedAt;
    const hasFinalPortfolio = !!portfolio?.finalCompletedAt;

    // Helper to safely parse JSON
    const safeJsonParse = (str: string | null | undefined, fallback: any = []) => {
        if (!str) return fallback;
        try {
            const parsed = JSON.parse(str);
            return Array.isArray(parsed) ? parsed : fallback;
        } catch (e) {
            return fallback;
        }
    };

    const shortTermGoals = safeJsonParse(portfolio?.shortTermGoals);
    const longTermGoals = safeJsonParse(portfolio?.longTermGoals);
    const skillsGained = safeJsonParse(portfolio?.finalSkillsGained);

    return (
        <div className="space-y-8 pb-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Hồ sơ năng lực</h1>
                    <p className="text-muted-foreground max-w-2xl">Quản lý mục tiêu cá nhân, theo dõi tiến độ và đánh giá kết quả phát triển trong suốt lộ trình Mentoring.</p>
                </div>

                {/* Visual Progress Steps */}
                <div className="flex items-center bg-muted/30 p-1.5 rounded-xl border border-border/50">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${hasInitialAssessment ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-muted-foreground'}`}>
                        {hasInitialAssessment ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
                        Giai đoạn đầu
                    </div>
                    <div className="px-2 opacity-30">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${hasFinalPortfolio ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-muted-foreground'}`}>
                        {hasFinalPortfolio ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
                        Giai đoạn cuối
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Action Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Mentee Profile Insights - Always visible if profile exists */}
                    {(portfolio?.mentee?.menteeProfile || portfolio?.initialChallenges) && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="p-6 border-border/40 space-y-4">
                                    <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-primary" />
                                        Điểm mạnh & Điểm yếu (Giai đoạn đầu)
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground/60 mb-1 uppercase">Điểm mạnh</p>
                                            <p className="text-sm font-medium">{portfolio?.initialStrengths || portfolio?.mentee?.menteeProfile?.strengths || "Chưa cập nhật"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground/60 mb-1 uppercase">Hạn chế / Điểm yếu</p>
                                            <p className="text-sm font-medium">{portfolio?.initialWeaknesses || portfolio?.mentee?.menteeProfile?.weaknesses || "Chưa cập nhật"}</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6 border-border/40 space-y-4">
                                    <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Target className="w-4 h-4 text-emerald-500" />
                                        Khát vọng & Khó khăn (Giai đoạn đầu)
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground/60 mb-1 uppercase">Ý tưởng / Startup</p>
                                            <p className="text-sm font-medium">{portfolio?.initialStartupIdeas || portfolio?.mentee?.menteeProfile?.startupIdeas || "Chưa cập nhật"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground/60 mb-1 uppercase">Khó khăn đang gặp</p>
                                            <p className="text-sm font-medium line-clamp-2">{portfolio?.initialChallenges || portfolio?.mentee?.menteeProfile?.currentChallenges || "Chưa cập nhật"}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Comparison results if final is done */}
                            {hasFinalPortfolio && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="p-6 border-emerald-500/20 bg-emerald-50/10 space-y-4">
                                        <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                            <Award className="w-4 h-4" />
                                            Cập nhật cuối kỳ (Điểm mạnh)
                                        </h3>
                                        <p className="text-sm font-medium">{portfolio?.finalStrengths || "Không có thay đổi"}</p>
                                    </Card>
                                    <Card className="p-6 border-amber-500/20 bg-amber-50/10 space-y-4">
                                        <h3 className="text-[11px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Khó khăn còn lại
                                        </h3>
                                        <p className="text-sm font-medium">{portfolio?.finalChallenges || "Đã vượt qua tất cả khó khăn"}</p>
                                    </Card>
                                </div>
                            )}

                            <Card className="p-6 border-border/40">
                                <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    Tâm sự & Mong muốn
                                </h3>
                                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/20 italic text-sm">
                                    {portfolio?.initialPersonalNotes || portfolio?.mentee?.menteeProfile?.personalNotes || "Chưa có tâm sự nào được ghi lại."}
                                </div>
                            </Card>
                        </div>
                    )}

                    {!hasInitialAssessment ? (
                        <Card className="p-8 border-border/40 shadow-none relative overflow-hidden group rounded-xl">
                            <div className="flex items-start gap-4 mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Bắt đầu đánh giá ban đầu</h3>
                                    <p className="text-muted-foreground mt-1">Hãy dành ít phút để định hình lộ trình phát triển của bạn. Thông tin này giúp Mentor hiểu rõ hơn về bạn.</p>
                                </div>
                            </div>
                            <PortfolioForm type="initial" portfolio={portfolio ? JSON.parse(JSON.stringify(portfolio)) : null} />
                        </Card>
                    ) : (
                        <div className="space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card className="p-6 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 shadow-none border-indigo-100/50">
                                    <p className="text-[11px] font-bold text-indigo-500 tracking-widest mb-2">MBTI Type</p>
                                    <p className="text-3xl font-black text-foreground">{portfolio?.personalityMbti || "N/A"}</p>
                                </Card>
                                <Card className="p-6 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 shadow-none border-emerald-100/50">
                                    <p className="text-[11px] font-bold text-emerald-500 tracking-widest mb-2">DISC Profile</p>
                                    <p className="text-3xl font-black text-foreground">{portfolio?.personalityDisc || "N/A"}</p>
                                </Card>
                                <Card className="p-6 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 shadow-none border-amber-100/50">
                                    <p className="text-[11px] font-bold text-amber-500 tracking-widest mb-2">Holland Code</p>
                                    <p className="text-3xl font-black text-foreground">{portfolio?.personalityHolland || "N/A"}</p>
                                </Card>
                            </div>

                            {/* Mentee's Goals from Initial Assessment */}
                            <Card className="p-6 overflow-hidden">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Target className="w-4 h-4 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold">Mục tiêu phát triển cá nhân</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[12px] font-bold text-muted-foreground flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-primary" />
                                            Ngắn hạn
                                        </h4>
                                        {shortTermGoals.length > 0 ? (
                                            <ul className="space-y-3">
                                                {shortTermGoals.map((goal: string, i: number) => (
                                                    <li key={i} className="group flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                                        <div className="mt-1 flex-shrink-0 text-[10px] font-bold text-muted-foreground bg-white dark:bg-zinc-800 border rounded w-5 h-5 flex items-center justify-center shadow-sm">{i + 1}</div>
                                                        <p className="text-sm font-medium leading-normal">{goal}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">Chưa thiết lập mục tiêu ngắn hạn</p>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[12px] font-bold text-muted-foreground flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-zinc-400" />
                                            Dài hạn
                                        </h4>
                                        {longTermGoals.length > 0 ? (
                                            <ul className="space-y-3">
                                                {longTermGoals.map((goal: string, i: number) => (
                                                    <li key={i} className="group flex items-start gap-3 p-3 rounded-xl border border-dashed border-border/60 hover:border-primary/40 transition-colors">
                                                        <div className="mt-1 flex-shrink-0 text-[10px] font-bold text-muted-foreground bg-muted w-5 h-5 flex items-center justify-center rounded shadow-none">{i + 1}</div>
                                                        <p className="text-sm font-medium leading-normal">{goal}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">Chưa thiết lập mục tiêu dài hạn</p>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Final Assessment Section */}
                            {!hasFinalPortfolio && role === "mentee" ? (
                                <Card className="p-8 border-dashed bg-muted/20 hover:bg-muted/30 transition-all">
                                    <div className="flex items-start gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                                            <Award className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">Hoàn thành Portfolio cuối kỳ</h3>
                                            <p className="text-muted-foreground mt-1">Đã đến lúc nhìn lại hành trình vừa qua và ghi nhận những thành tựu bạn đã đạt được.</p>
                                        </div>
                                    </div>
                                    <PortfolioForm type="final" portfolio={portfolio ? JSON.parse(JSON.stringify(portfolio)) : null} />
                                </Card>
                            ) : hasFinalPortfolio ? (
                                <Card className="p-0 overflow-hidden relative border-primary/20 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900 shadow-xl shadow-primary/5">
                                    <div className="bg-primary/5 px-8 pt-8 pb-4 border-b border-primary/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <Award className="w-8 h-8 text-primary" />
                                                <h3 className="text-2xl font-black tracking-tight">Tổng kết cuối kỳ</h3>
                                            </div>
                                            <Badge variant="outline" className="bg-white/80 dark:bg-black/50 border-primary/30 text-primary animate-pulse">
                                                Completed
                                            </Badge>
                                        </div>
                                        <div className="space-y-3 mt-6">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-bold flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                    Mục tiêu đã hoàn thành
                                                </span>
                                                <span className="font-black text-xl text-primary">{portfolio?.finalGoalsAchieved || 0}%</span>
                                            </div>
                                            <Progress value={portfolio?.finalGoalsAchieved || 0} size="lg" className="h-3 shadow-inner bg-primary/10" />
                                        </div>
                                    </div>

                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-8">
                                            <div>
                                                <h4 className="text-[11px] font-black text-muted-foreground tracking-widest mb-4 flex items-center gap-2">
                                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                    Tự đánh giá
                                                </h4>
                                                <div className="text-sm leading-relaxed text-foreground/80 italic p-5 bg-white dark:bg-zinc-800 rounded-2xl border border-border/50 shadow-sm relative">
                                                    <span className="absolute -top-4 left-6 text-4xl text-primary/10 font-serif">"</span>
                                                    {portfolio?.finalSelfAssessment}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-[11px] font-black text-muted-foreground tracking-widest mb-4 flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-indigo-500" />
                                                    Kỹ năng đạt được
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {skillsGained.map((skill: string) => (
                                                        <Badge key={skill} variant="secondary" className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 relative">
                                                <h4 className="text-[11px] font-black text-primary tracking-widest mb-4">Nhận xét từ Mentor</h4>
                                                <p className="text-sm leading-relaxed font-medium">
                                                    {portfolio?.finalMentorFeedback || "Đang chờ nhận xét từ Mentor..."}
                                                </p>
                                            </div>

                                            <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-800/50">
                                                <h4 className="text-[11px] font-black text-amber-600 dark:text-amber-400 tracking-widest mb-4">Đề xuất lộ trình tiếp theo</h4>
                                                <p className="text-sm leading-relaxed text-foreground/80">
                                                    {portfolio?.finalRecommendations || "Đang chờ đề xuất từ Mentor..."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* Sidebar: Integrated Program Goals */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-none">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-md font-bold text-foreground flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                Tiến độ đào tạo
                            </h3>
                        </div>

                        {mentorshipGoals.length > 0 ? (
                            <div className="space-y-6">
                                {mentorshipGoals.map((goal: any) => (
                                    <div key={goal.id} className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold truncate max-w-[200px]">{goal.title}</p>
                                            <Badge variant="outline" className="text-[10px] font-black px-1.5 h-5 border-zinc-200 dark:border-zinc-800">
                                                {goal.currentValue}%
                                            </Badge>
                                        </div>
                                        <Progress value={goal.currentValue} size="xs" color={goal.currentValue >= 100 ? "success" : "default"} />
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium tracking-tighter">
                                            <span>{goal.category}</span>
                                            <span>Deadline: {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : "No date"}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed rounded-2xl bg-muted/30">
                                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
                                    <Target size={20} />
                                </div>
                                <p className="text-xs text-muted-foreground font-bold tracking-widest">Chưa bắt đầu</p>
                                <p className="text-[11px] text-muted-foreground mt-1 px-4">Các mục tiêu từ Mentorship sẽ được tự động hiển thị tại đây.</p>
                            </div>
                        )}
                    </Card>


                </div>
            </div>
        </div>
    );
}

