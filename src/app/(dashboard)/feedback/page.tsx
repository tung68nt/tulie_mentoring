import { auth } from "@/lib/auth";
import { getReceivedFeedback, getGivenFeedback } from "@/lib/actions/feedback";
import { getMentorships } from "@/lib/actions/mentorship";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Star, MessageSquare, Send, Quote } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { FeedbackForm } from "@/components/features/feedback/feedback-form";

export default async function FeedbackPage() {
    const session = await auth();
    const userId = session?.user?.id;
    const role = (session?.user as any).role;

    const [received, given, mentorships] = await Promise.all([
        getReceivedFeedback(userId!),
        getGivenFeedback(userId!),
        getMentorships(),
    ]);

    const relevantMentorships = role === "admin"
        ? mentorships
        : role === "mentor"
            ? mentorships.filter(m => m.mentorId === userId)
            : mentorships.filter(m => m.mentees.some(mt => mt.menteeId === userId));

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Hệ thống Phản hồi</h1>
                <p className="text-gray-500 mt-1">Đánh giá và đóng góp ý kiến để cải thiện chất lượng đào tạo</p>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Phản hồi nhận được
                        </h3>

                        {received.length === 0 ? (
                            <Card className="py-12 flex flex-col items-center justify-center text-center">
                                <p className="text-gray-400 font-medium italic">Chưa có phản hồi nào dành cho bạn.</p>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {received.map(fb => (
                                    <Card key={fb.id} className="relative overflow-visible">
                                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white shadow-lg">
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
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {fb.fromUser.firstName} {fb.fromUser.lastName}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{fb.fromUser.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < (fb.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-200"}`} />
                                                    ))}
                                                </div>
                                            </div>

                                            <blockquote className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border-l-4 border-gray-900 italic">
                                                "{fb.content}"
                                            </blockquote>

                                            {(fb.strengths || fb.improvements) && (
                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    {fb.strengths && (
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Điểm mạnh</p>
                                                            <p className="text-xs text-gray-600">{fb.strengths}</p>
                                                        </div>
                                                    )}
                                                    {fb.improvements && (
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Góp ý</p>
                                                            <p className="text-xs text-gray-600">{fb.improvements}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{fb.mentorship.programCycle.name}</span>
                                                <span className="text-[10px] text-gray-400">{formatDate(fb.createdAt)}</span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Send className="w-5 h-5" />
                            Lịch sử gửi phản hồi
                        </h3>
                        <div className="space-y-4">
                            {given.map(fb => (
                                <div key={fb.id} className="p-4 rounded-xl border border-gray-50 flex items-center justify-between bg-white shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            firstName={fb.toUser.firstName}
                                            lastName={fb.toUser.lastName}
                                            src={fb.toUser.avatar}
                                            size="sm"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">Đến: {fb.toUser.firstName} {fb.toUser.lastName}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formatDate(fb.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[...Array(fb.rating || 0)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Give Feedback */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Gửi phản hồi mới</h3>
                        {relevantMentorships.map(m => {
                            // Determine who to send feedback to
                            const targetMentees = m.mentees.filter(mt => mt.menteeId !== userId).map(mt => mt.mentee);
                            const targetMentor = m.mentorId !== userId ? m.mentor : null;

                            const targets = [...(targetMentor ? [targetMentor] : []), ...targetMentees];

                            return (
                                <div key={m.id} className="space-y-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                                        {m.programCycle.name} - {m.mentor.lastName} ➔ {m.mentees[0]?.mentee.lastName}...
                                    </p>
                                    {targets.map(target => (
                                        <FeedbackForm key={target.id} mentorshipId={m.id} toUserId={target.id} />
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
