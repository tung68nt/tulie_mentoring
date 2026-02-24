import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRecentMeetingsForReflection, getReflections } from "@/lib/actions/reflection";
import { ReflectionEditor } from "@/components/features/reflections/reflection-editor";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, History, MessageSquareText } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ReflectionsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const pendingMeetings = await getRecentMeetingsForReflection();
    const reflections = await getReflections();

    return (
        <div className="space-y-10 pb-20 animate-fade-in">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground no-uppercase">Thu hoạch & Nhật ký</h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                    Ghi lại những bài học kinh nghiệm và cảm nhận sau mỗi buổi mentoring để theo dõi hành trình phát triển bản thân.
                </p>
            </div>

            <Tabs defaultValue={pendingMeetings.length > 0 ? "new" : "history"} className="w-full">
                <TabsList className="bg-muted/50 p-1.5 rounded-2xl mb-8 h-auto">
                    <TabsTrigger value="new" className="rounded-xl px-6 py-3 data-[state=active]:bg-background shadow-none transition-all">
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span className="no-uppercase font-medium">Viết thu hoạch mới</span>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl px-6 py-3 data-[state=active]:bg-background shadow-none transition-all">
                        <History className="w-4 h-4 mr-2" />
                        <span className="no-uppercase font-medium">Lịch sử nhật ký</span>
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
                        <Card className="p-16 text-center bg-muted/20 border-border/50 rounded-2xl flex flex-col items-center gap-4">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
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
                                <Card key={ref.id} className="p-6 rounded-2xl border-border/50 hover:shadow-md transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <History className="w-4 h-4 text-muted-foreground/30" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">
                                                    {formatDate(ref.createdAt)}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                                                {ref.meeting?.title}
                                            </h4>
                                            <p className="text-[12px] text-muted-foreground/60">
                                                Mentor: {ref.meeting?.mentorship?.mentor?.firstName} {ref.meeting?.mentorship?.mentor?.lastName}
                                            </p>
                                        </div>
                                        <div className="pt-2 border-t border-border/10">
                                            <p className="text-[13px] text-muted-foreground line-clamp-3 leading-relaxed italic">
                                                "Vào trang chi tiết để xem đầy đủ nội dung thu hoạch này..."
                                            </p>
                                        </div>
                                    </div>
                                </Card>
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
    );
}
