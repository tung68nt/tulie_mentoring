import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRecentMeetingsForReflection, getReflections } from "@/lib/actions/reflection";
import { ReflectionEditor } from "@/components/features/reflections/reflection-editor";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, History, MessageSquareText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ReflectionCard } from "@/components/features/reflections/reflection-card";
import { getMenteeStats } from "@/lib/actions/report";
import { StatsCards } from "@/components/features/reports/stats-cards";
import { ActivityFeed } from "@/components/features/reports/activity-feed";
import { getActivityLogs } from "@/lib/actions/activity";

export default async function ReflectionsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    try {
        const pendingMeetings = await getRecentMeetingsForReflection();
        const reflections = await getReflections();
        const stats = await getMenteeStats();
        const logs = await getActivityLogs(10);

        return (
            <div className="space-y-10 pb-20 animate-fade-in">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Báo cáo & Phân tích</h1>
                    <p className="text-sm text-muted-foreground/60 font-medium">
                        Theo dõi tiến độ học tập và rèn luyện của bạn thông qua các số liệu thống kê chi tiết.
                    </p>
                </div>

                <StatsCards stats={stats} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                        <Tabs defaultValue={pendingMeetings.length > 0 ? "new" : "history"} className="w-full">
                            <TabsList className="bg-muted/50 p-1 rounded-lg mb-8 h-auto">
                                <TabsTrigger value="new" className="rounded-md px-6 py-2.5 data-[state=active]:bg-background shadow-none transition-all">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Viết thu hoạch mới</span>
                                </TabsTrigger>
                                <TabsTrigger value="history" className="rounded-md px-6 py-2.5 data-[state=active]:bg-background shadow-none transition-all">
                                    <History className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Lịch sử nhật ký</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="new" className="space-y-8 animate-in fade-in duration-500">
                                {pendingMeetings.length > 0 ? (
                                    <div className="space-y-10">
                                        {pendingMeetings.map((meeting: any) => (
                                            <div key={meeting.id} className="space-y-4">
                                                <ReflectionEditor
                                                    meetingId={meeting.id}
                                                    meetingTitle={meeting.title}
                                                    mentorName={meeting.mentorship?.mentor?.firstName + " " + meeting.mentorship?.mentor?.lastName}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="p-12 text-center bg-muted/20 border-border/50 rounded-lg flex flex-col items-center gap-4 shadow-none">
                                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground shadow-none">
                                            <MessageSquareText className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-foreground">Không có buổi học mới nào cần viết thu hoạch</p>
                                            <p className="text-[13px] text-muted-foreground">Hãy tham gia các buổi mentoring và điểm danh để viết nhật ký tại đây.</p>
                                        </div>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {reflections.length > 0 ? (
                                        reflections.map((ref: any) => (
                                            <ReflectionCard key={ref.id} reflection={ref} userRole={session.user.role} />
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 text-center">
                                            <p className="text-sm text-muted-foreground">Bạn chưa có nhật ký thu hoạch nào.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="lg:col-span-4">
                        <ActivityFeed logs={logs} />
                    </div>
                </div>
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
