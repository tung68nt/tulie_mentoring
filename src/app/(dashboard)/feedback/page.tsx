import { auth } from "@/lib/auth";
import { getReceivedFeedback, getGivenFeedback } from "@/lib/actions/feedback";
import { getMentorships } from "@/lib/actions/mentorship";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Star, MessageSquare, Send, Quote } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { FeedbackForm } from "@/components/features/feedback/feedback-form";
import { FeedbackRadar } from "@/components/features/feedback/feedback-radar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { redirect } from "next/navigation";

export default async function FeedbackPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const userId = session.user.id;
    const role = (session.user as any).role;

    const [received, given, mentorships] = await Promise.all([
        getReceivedFeedback(userId!),
        getGivenFeedback(userId!),
        getMentorships(),
    ]);

    const relevantMentorships = role === "admin"
        ? mentorships
        : role === "mentor"
            ? mentorships.filter((m: any) => m.mentorId === userId)
            : mentorships.filter((m: any) => m.mentees.some((mt: any) => mt.menteeId === userId));

    return (
        <div className="space-y-8 pb-10">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Hệ thống Phản hồi</h1>
                <p className="text-sm text-muted-foreground mt-1">Đánh giá và đóng góp ý kiến để cải thiện chất lượng đào tạo</p>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-8">
                    <Tabs defaultValue="received" className="w-full">
                        <TabsList className="bg-muted/50 w-full justify-start rounded-lg h-auto p-1 border border-border/40">
                            <TabsTrigger value="received" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-xs font-semibold gap-2">
                                <MessageSquare className="w-3.5 h-3.5" />
                                Phản hồi nhận được
                                <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-4 min-w-4 text-[9px] rounded-full">{received.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="given" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-xs font-semibold gap-2">
                                <Send className="w-3.5 h-3.5" />
                                Đã gửi
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="received" className="mt-6 space-y-6">
                            {received.length === 0 ? (
                                <Card className="py-12 flex flex-col items-center justify-center text-center shadow-none border-dashed">
                                    <p className="text-muted-foreground font-medium text-sm">Chưa có phản hồi nào dành cho bạn.</p>
                                </Card>
                            ) : (
                                <div className="space-y-6">
                                    {received.map((fb: any) => (
                                        <Card key={fb.id} className="relative overflow-visible">
                                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-none">
                                                <Quote className="w-4 h-4 fill-current" />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            firstName={fb.fromUser.firstName}
                                                            lastName={fb.fromUser.lastName}
                                                            src={fb.fromUser.avatar}
                                                            size="md"
                                                        />
                                                        <div>
                                                            <p className="text-sm font-semibold text-foreground">
                                                                {fb.fromUser.firstName} {fb.fromUser.lastName}
                                                            </p>
                                                            <p className="text-[10px] font-medium text-muted-foreground">{fb.fromUser.role}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3.5 h-3.5 ${i < (fb.rating || 0) ? "text-foreground fill-current" : "text-border"}`} />
                                                        ))}
                                                    </div>
                                                </div>

                                                <blockquote className="text-sm text-foreground leading-relaxed bg-muted p-4 rounded-lg border-l-4 border-foreground">
                                                    "{fb.content}"
                                                </blockquote>

                                                {(fb.strengths || fb.improvements) && (
                                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                                        {fb.strengths && (
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-medium text-primary">Điểm mạnh</p>
                                                                <p className="text-xs text-muted-foreground">{fb.strengths}</p>
                                                            </div>
                                                        )}
                                                        {fb.improvements && (
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-medium text-muted-foreground">Góp ý</p>
                                                                <p className="text-xs text-muted-foreground">{fb.improvements}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                                    <span className="text-[10px] font-medium text-muted-foreground">{fb.mentorship.programCycle.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{formatDate(fb.createdAt)}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="given" className="mt-6 space-y-6">
                            {given.length === 0 ? (
                                <Card className="py-12 flex flex-col items-center justify-center text-center shadow-none border-dashed bg-muted/10">
                                    <p className="text-muted-foreground font-medium text-sm">Bạn chưa gửi phản hồi nào.</p>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {given.map((fb: any) => (
                                        <div key={fb.id} className="p-4 rounded-lg border border-border/60 flex flex-col gap-3 bg-card shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        firstName={fb.toUser.firstName}
                                                        lastName={fb.toUser.lastName}
                                                        src={fb.toUser.avatar}
                                                        size="sm"
                                                    />
                                                    <div>
                                                        <p className="text-[13px] font-semibold text-foreground leading-none mb-1">
                                                            <span className="text-muted-foreground font-normal">Đến:</span> {fb.toUser.firstName} {fb.toUser.lastName}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground font-medium">{formatDate(fb.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-full border border-border/40 w-fit">
                                                    {[...Array(fb.rating || 0)].map((_, i) => (
                                                        <Star key={i} className="w-3 h-3 text-primary fill-current" />
                                                    ))}
                                                </div>
                                            </div>
                                            {fb.content && (
                                                <p className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/30 line-clamp-3">
                                                    "{fb.content}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar: Dashboard & Give Feedback */}
                <div className="space-y-6">
                    <FeedbackRadar feedbacks={received} />
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Gửi phản hồi mới</h3>
                        {relevantMentorships.map((m: any) => {
                            // Determine who to send feedback to
                            const targetMentees = m.mentees.filter((mt: any) => mt.menteeId !== userId).map((mt: any) => mt.mentee);
                            const targetMentor = m.mentorId !== userId ? m.mentor : null;

                            const targets = [...(targetMentor ? [targetMentor] : []), ...targetMentees];

                            return (
                                <div key={m.id} className="space-y-4 bg-muted/10 p-4 rounded-xl border border-border/40">
                                    <p className="text-xs font-semibold text-muted-foreground border-b border-border/50 pb-2">
                                        {m.programCycle.name} - Nhóm {m.mentor.lastName}
                                    </p>
                                    {targets.map(target => (
                                        <div key={target.id} className="pt-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Avatar src={target.avatar} firstName={target.firstName} lastName={target.lastName} size="sm" />
                                                <span className="text-xs font-semibold">Đánh giá {target.firstName} {target.lastName}</span>
                                            </div>
                                            <FeedbackForm mentorshipId={m.id} toUserId={target.id} />
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
