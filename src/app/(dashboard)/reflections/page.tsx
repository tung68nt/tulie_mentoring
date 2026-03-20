import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRecentMeetingsForReflection, getReflections, getMentorReflections, getMentorReflectionStats } from "@/lib/actions/reflection";
import { ReflectionEditor } from "@/components/features/reflections/reflection-editor";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, History, MessageSquareText, PenLine, Check, CheckCircle2, Clock, Users, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ReflectionCard } from "@/components/features/reflections/reflection-card";
import { MentorReflectionView } from "@/components/features/reflections/mentor-reflection-view";

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
            const [reflections, stats] = await Promise.all([
                getMentorReflections().catch(e => { console.error("Mentor reflections error:", e); return []; }),
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                <PenLine className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.totalSubmitted}</p>
                                <p className="text-xs text-muted-foreground font-medium">Bài đã nộp</p>
                            </div>
                        </Card>
                        <Card className="p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.totalConfirmed}</p>
                                <p className="text-xs text-muted-foreground font-medium">Đã xác nhận</p>
                            </div>
                        </Card>
                        <Card className="p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.pendingConfirmation}</p>
                                <p className="text-xs text-muted-foreground font-medium">Chờ xác nhận</p>
                            </div>
                        </Card>
                        <Card className="p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{stats.submissionRate}%</p>
                                <p className="text-xs text-muted-foreground font-medium">Tỷ lệ nộp bài</p>
                            </div>
                        </Card>
                    </div>

                    {/* Mentor reflections list */}
                    <MentorReflectionView reflections={reflections} />
                </div>
            );
        }

        // ─── MENTEE VIEW ───
        const [pendingMeetings, reflections] = await Promise.all([
            getRecentMeetingsForReflection().catch(e => { console.error("Recent meetings fetch error:", e); return []; }),
            getReflections().catch(e => { console.error("Reflections fetch error:", e); return []; }),
        ]);

        return (
            <div className="space-y-6 pb-20 animate-fade-in">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Thu hoạch Mentoring</h1>
                    <p className="text-sm text-muted-foreground/60 font-medium">
                        Ghi lại những bài học và cảm nhận sau mỗi buổi mentoring.
                    </p>
                </div>

                <Tabs defaultValue={pendingMeetings.length > 0 ? "new" : "history"} className="w-full">
                    <TabsList className="bg-muted/50 p-1 rounded-lg mb-6 h-auto">
                        <TabsTrigger value="new" className="rounded-md px-5 py-2 data-[state=active]:bg-background shadow-none transition-all">
                            <BookOpen className="w-4 h-4 mr-2" />
                            <span className="font-medium text-sm">Viết thu hoạch mới</span>
                            {pendingMeetings.length > 0 && (
                                <span className="ml-1.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">{pendingMeetings.length}</span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="rounded-md px-5 py-2 data-[state=active]:bg-background shadow-none transition-all">
                            <History className="w-4 h-4 mr-2" />
                            <span className="font-medium text-sm">Lịch sử thu hoạch ({reflections.length})</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="new" className="space-y-4 animate-in fade-in duration-500">
                        {pendingMeetings.length > 0 ? (
                            <div className="space-y-4">
                                {pendingMeetings.map((meeting: any) => (
                                    <div key={meeting.id}>
                                        <ReflectionEditor
                                            meetingId={meeting.id}
                                            meetingTitle={meeting.title}
                                            mentorName={meeting.mentorship?.mentor?.firstName + " " + meeting.mentorship?.mentor?.lastName}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-10 text-center bg-muted/20 border-border/50 rounded-lg flex flex-col items-center gap-3 shadow-none">
                                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground shadow-none">
                                    <MessageSquareText className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-foreground">Không có buổi học mới nào cần viết thu hoạch</p>
                                    <p className="text-xs text-muted-foreground">Hãy tham gia các buổi mentoring và điểm danh để viết bài thu hoạch tại đây.</p>
                                </div>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="animate-in fade-in duration-500">
                        {reflections.length > 0 ? (
                            <Card className="p-0 overflow-hidden">
                                <div className="divide-y divide-border/30">
                                    {reflections.map((ref: any) => (
                                        <ReflectionCard key={ref.id} reflection={ref} userRole={role} />
                                    ))}
                                </div>
                            </Card>
                        ) : (
                            <div className="py-16 text-center">
                                <PenLine className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">Bạn chưa có bài thu hoạch nào.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
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
