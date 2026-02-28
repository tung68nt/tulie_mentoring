import { auth } from "@/lib/auth";
import { getPortfolio } from "@/lib/actions/portfolio";
import { getMentorships } from "@/lib/actions/mentorship";
import { getGoals } from "@/lib/actions/goal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { PortfolioForm } from "@/components/features/portfolio/portfolio-form";
import { Target, Brain, ArrowRight, ShieldCheck, History, BookMarked, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";

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

    // Fetch mentorship goals
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

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">Nhật ký hành trình</h1>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        Nơi ghi lại những bước tiến trong tư duy và sự trưởng thành qua từng mục tiêu.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <Tabs defaultValue="diary" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 h-11 border-none">
                            <TabsTrigger value="diary" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary transition-all">Nhật ký tiến bộ</TabsTrigger>
                            <TabsTrigger value="assessment" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary transition-all">Đánh giá hiện tại</TabsTrigger>
                            <TabsTrigger value="history" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary transition-all">Lịch sử thay đổi</TabsTrigger>
                        </TabsList>

                        <TabsContent value="diary" className="space-y-6 pt-6">
                            <Card className="p-6 border-border/60 shadow-none rounded-xl">
                                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                                    <PlusCircle className="w-4 h-4 text-primary" />
                                    Ghi chú mới
                                </h3>
                                <PortfolioForm type="entry" portfolio={portfolio} />
                            </Card>

                            <div className="space-y-4">
                                <h3 className="text-base font-semibold flex items-center gap-2">
                                    <BookMarked className="w-4 h-4 text-primary" />
                                    Dòng thời gian phát triển
                                </h3>
                                {portfolio?.entries && portfolio.entries.length > 0 ? (
                                    <div className="space-y-4">
                                        {portfolio.entries.map((entry: any) => (
                                            <Card key={entry.id} className="p-5 border-border/40 shadow-none hover:border-border transition-colors rounded-xl">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-medium text-foreground">{entry.title}</h4>
                                                    <span className="text-[10px] text-muted-foreground">{formatDate(entry.createdAt)}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                                    {entry.content}
                                                </p>
                                                {entry.type && (
                                                    <Badge variant="secondary" className="mt-3 text-[10px] bg-muted/50 border-none font-normal">
                                                        {entry.type}
                                                    </Badge>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="Chưa có ghi chú nào"
                                        description="Hãy bắt đầu ghi lại những thay đổi trong tư duy của bạn."
                                        icon={<BookMarked className="w-6 h-6" />}
                                    />
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="assessment" className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Card className="p-8 border-border/60 shadow-none rounded-xl">
                                <PortfolioForm type="full" portfolio={portfolio} />
                            </Card>
                        </TabsContent>

                        <TabsContent value="history" className="space-y-6 pt-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold flex items-center gap-2">
                                        <History className="w-4 h-4 text-primary" />
                                        Các phiên bản đã lưu
                                    </h3>
                                    <PortfolioForm type="snapshot" portfolio={portfolio} />
                                </div>

                                {portfolio?.snapshots && portfolio.snapshots.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {portfolio.snapshots.map((snapshot: any) => (
                                            <Card key={snapshot.id} className="p-4 border-border/40 shadow-none hover:border-border transition-all rounded-xl cursor-not-allowed opacity-80">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="text-sm font-medium">{snapshot.title}</h4>
                                                    <span className="text-[10px] text-muted-foreground">{formatDate(snapshot.createdAt)}</span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">Bản sao lưu các chỉ số năng lực tại thời điểm này.</p>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="Chưa có bản lưu nào"
                                        description="Bạn có thể lưu lại trạng thái hiện tại của hồ sơ để đối chiếu sau này."
                                        icon={<History className="w-6 h-6" />}
                                    />
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 border-border/60 shadow-none rounded-xl">
                        <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Tiến độ đào tạo
                        </h3>

                        {mentorshipGoals.length > 0 ? (
                            <div className="space-y-6">
                                {mentorshipGoals.map((goal: any) => (
                                    <div key={goal.id} className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium truncate max-w-[200px]">{goal.title}</p>
                                            <span className="text-xs font-semibold text-primary">
                                                {goal.currentValue}%
                                            </span>
                                        </div>
                                        <Progress value={goal.currentValue} className="h-1.5" />
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                            <span>{goal.category}</span>
                                            <span>Hạn: {goal.dueDate ? formatDate(goal.dueDate) : "N/A"}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 border border-dashed rounded-xl bg-muted/20">
                                <p className="text-xs text-muted-foreground">Chưa có mục tiêu Mentorship.</p>
                            </div>
                        )}
                    </Card>

                    <Card className="p-6 border-border/60 shadow-none rounded-xl space-y-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Brain className="w-5 h-5 text-primary" />
                            Chỉ số tính cách
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="p-3 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">MBTI</p>
                                <p className="text-lg font-bold">{portfolio?.personalityMbti || "—"}</p>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">DISC</p>
                                <p className="text-lg font-bold">{portfolio?.personalityDisc || "—"}</p>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg">
                                <p className="text-[10px] text-muted-foreground mb-1">Holland</p>
                                <p className="text-lg font-bold">{portfolio?.personalityHolland || "—"}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

