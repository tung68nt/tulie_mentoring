import { auth } from "@/lib/auth";
import { getUserDetail } from "@/lib/actions/user";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import {
    ChevronLeft, Mail, Phone, Building2, Calendar,
    Users, Target, Star, MessageSquare, Briefcase
} from "lucide-react";
import Link from "next/link";
import { formatDate, getRoleLabel, getStatusLabel, getStatusColor } from "@/lib/utils";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
    const session = await auth();
    if ((session?.user as any).role !== "admin") redirect("/");

    const { id } = await params;
    const user = await getUserDetail(id);
    if (!user) notFound();

    const attendanceTotal = user.attendances.length;
    const attendancePresent = user.attendances.filter(a => a.status === "present").length;
    const attendanceRate = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 0;

    const avgRating = user.feedbackReceived.length > 0
        ? (user.feedbackReceived.reduce((sum, f) => sum + (f.rating || 0), 0) / user.feedbackReceived.filter(f => f.rating).length).toFixed(1)
        : null;

    return (
        <div className="space-y-6 pb-10">
            {/* Back */}
            <Button variant="ghost" size="sm" asChild className="-ml-2">
                <Link href="/admin/users">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Quay lại danh sách
                </Link>
            </Button>

            {/* Profile Header */}
            <Card className="p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <Avatar
                        firstName={user.firstName}
                        lastName={user.lastName}
                        src={user.avatar}
                        size="xl"
                        className="w-20 h-20"
                    />
                    <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-black">{user.firstName} {user.lastName}</h1>
                                <p className="text-sm text-[#666] mt-0.5">{getRoleLabel(user.role)}</p>
                            </div>
                            <Badge className={user.isActive ? "bg-black text-white" : "bg-[#fafafa] text-[#999] border border-[#eaeaea]"}>
                                {user.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#666]">
                            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{user.email}</span>
                            {user.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{user.phone}</span>}
                            {user.mentorProfile?.company && (
                                <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{user.mentorProfile.company}</span>
                            )}
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Tham gia {formatDate(user.createdAt)}</span>
                        </div>

                        {user.bio && <p className="text-sm text-[#666] leading-relaxed max-w-2xl">{user.bio}</p>}
                    </div>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-5 text-center" hover>
                    <p className="text-2xl font-bold text-black">
                        {user.role === "mentor" ? user.mentorships.length : user.menteeships.length}
                    </p>
                    <p className="text-xs text-[#999] mt-1">Mentorship</p>
                </Card>
                <Card className="p-5 text-center" hover>
                    <p className="text-2xl font-bold text-black">{attendanceRate}%</p>
                    <p className="text-xs text-[#999] mt-1">Tỉ lệ tham gia</p>
                </Card>
                <Card className="p-5 text-center" hover>
                    <p className="text-2xl font-bold text-black">{avgRating || "—"}</p>
                    <p className="text-xs text-[#999] mt-1">Đánh giá TB</p>
                </Card>
                <Card className="p-5 text-center" hover>
                    <p className="text-2xl font-bold text-black">{attendanceTotal}</p>
                    <p className="text-xs text-[#999] mt-1">Buổi tham gia</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Mentorships */}
                <Card className="lg:col-span-3">
                    <h3 className="text-base font-semibold text-black mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#999]" />
                        {user.role === "mentor" ? "Các nhóm Mentoring" : "Mentor của tôi"}
                    </h3>

                    {user.role === "mentor" ? (
                        user.mentorships.length === 0 ? (
                            <EmptyState icon={<Users className="w-5 h-5" />} title="Chưa có nhóm Mentoring nào" className="py-8" />
                        ) : (
                            <div className="space-y-3">
                                {user.mentorships.map(ms => (
                                    <Link
                                        key={ms.id}
                                        href={`/admin/mentorships/${ms.id}`}
                                        className="flex items-center justify-between p-4 rounded-md border border-[#eaeaea] hover:border-black/20 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {ms.mentees.slice(0, 3).map(mt => (
                                                    <Avatar key={mt.id} firstName={mt.mentee.firstName} lastName={mt.mentee.lastName} src={mt.mentee.avatar} size="xs" className="ring-2 ring-white" />
                                                ))}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-black">{ms.mentees.length} Mentees</p>
                                                <p className="text-xs text-[#999]">{ms.programCycle?.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-[#999]">
                                            <span>{ms._count.meetings} buổi</span>
                                            <span>{ms._count.goals} mục tiêu</span>
                                            <Badge className={getStatusColor(ms.status)} size="sm">{getStatusLabel(ms.status)}</Badge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )
                    ) : (
                        user.menteeships.length === 0 ? (
                            <EmptyState icon={<Users className="w-5 h-5" />} title="Chưa được ghép Mentor" className="py-8" />
                        ) : (
                            <div className="space-y-3">
                                {user.menteeships.map(ms => (
                                    <Link
                                        key={ms.id}
                                        href={`/admin/mentorships/${ms.mentorship.id}`}
                                        className="flex items-center justify-between p-4 rounded-md border border-[#eaeaea] hover:border-black/20 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar firstName={ms.mentorship.mentor.firstName} lastName={ms.mentorship.mentor.lastName} src={ms.mentorship.mentor.avatar} size="sm" />
                                            <div>
                                                <p className="text-sm font-medium text-black">{ms.mentorship.mentor.firstName} {ms.mentorship.mentor.lastName}</p>
                                                <p className="text-xs text-[#999]">{ms.mentorship.programCycle?.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-[#999]">
                                            <span>{ms.mentorship._count.meetings} buổi</span>
                                            <Badge className={getStatusColor(ms.mentorship.status)} size="sm">{getStatusLabel(ms.mentorship.status)}</Badge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )
                    )}
                </Card>

                {/* Feedback & Ratings */}
                <Card className="lg:col-span-2">
                    <h3 className="text-base font-semibold text-black mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#999]" />
                        Phản hồi gần đây
                    </h3>

                    {user.feedbackReceived.length === 0 ? (
                        <EmptyState icon={<Star className="w-5 h-5" />} title="Chưa có phản hồi" className="py-8" />
                    ) : (
                        <div className="space-y-4">
                            {user.feedbackReceived.map((fb, i) => (
                                <div key={i} className="p-3 bg-[#fafafa] rounded-md space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-medium text-black">{fb.fromUser.firstName} {fb.fromUser.lastName}</p>
                                        {fb.rating && (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-black fill-black" />
                                                <span className="text-xs font-medium text-black">{fb.rating}/5</span>
                                            </div>
                                        )}
                                    </div>
                                    {fb.content && <p className="text-xs text-[#666] line-clamp-3">{fb.content}</p>}
                                    <p className="text-[10px] text-[#bbb]">{formatDate(fb.createdAt)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Role-specific Info */}
            {user.mentorProfile && (
                <Card>
                    <h3 className="text-base font-semibold text-black mb-4 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#999]" />
                        Hồ sơ Mentor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {user.mentorProfile.jobTitle && (
                            <div><span className="text-[#999]">Chức danh:</span> <span className="text-black font-medium">{user.mentorProfile.jobTitle}</span></div>
                        )}
                        {user.mentorProfile.company && (
                            <div><span className="text-[#999]">Công ty:</span> <span className="text-black font-medium">{user.mentorProfile.company}</span></div>
                        )}
                        {user.mentorProfile.experience && (
                            <div><span className="text-[#999]">Kinh nghiệm:</span> <span className="text-black font-medium">{user.mentorProfile.experience}</span></div>
                        )}
                        {user.mentorProfile.expertise && (
                            <div className="md:col-span-2">
                                <span className="text-[#999]">Chuyên môn:</span>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {JSON.parse(user.mentorProfile.expertise || "[]").map((skill: string) => (
                                        <span key={skill} className="px-2 py-0.5 bg-[#fafafa] border border-[#eaeaea] rounded-md text-xs text-[#666]">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
