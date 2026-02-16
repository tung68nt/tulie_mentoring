import { getMeetingDetail } from "@/lib/actions/meeting";
import { getMinutes } from "@/lib/actions/minutes";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { QRManager } from "@/components/features/meetings/qr-manager";
import { QRSentry } from "@/components/features/meetings/qr-sentry";
import { MinutesSection } from "@/components/features/meetings/minutes-section";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, Video, Clock, ChevronLeft, Users } from "lucide-react";
import Link from "next/link";
import { Button as UIButton } from "@/components/ui/button";

interface PageProps {
    params: Promise<{ id: string }>;
}

import { redirect } from "next/navigation";

export default async function MeetingDetailPage({ params }: PageProps) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const userId = session.user.id;
    const role = (session.user as any).role;

    const { id } = await params;
    const meeting = await getMeetingDetail(id);

    if (!meeting) notFound();

    const minutes = await getMinutes(id);

    const isMentor = meeting.mentorship.mentorId === userId || role === "admin";
    const isParticipant = meeting.mentorship.mentees.some(m => m.menteeId === userId) || isMentor;

    if (!isParticipant) notFound();

    return (
        <div className="space-y-8 pb-10">
            <UIButton variant="ghost" size="sm" asChild className="-ml-2">
                <Link href="/calendar">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Quay lại lịch
                </Link>
            </UIButton>

            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
                {/* Left: Meeting Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8">
                        <div className="flex items-start justify-between mb-8">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge status={meeting.status} />
                                    <span className="text-xs font-medium text-muted-foreground">{meeting.meetingType}</span>
                                </div>
                                <h1 className="text-3xl font-semibold text-foreground leading-tight">{meeting.title}</h1>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-y border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[8px] bg-muted flex items-center justify-center text-muted-foreground">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground leading-none mb-1">Thời gian</p>
                                    <p className="text-sm font-semibold text-foreground">{formatDate(meeting.scheduledAt, "EEEE, dd/MM/yyyy")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[8px] bg-muted flex items-center justify-center text-muted-foreground">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground leading-none mb-1">Giờ họp</p>
                                    <p className="text-sm font-semibold text-foreground">{formatDate(meeting.scheduledAt, "HH:mm")} ({meeting.duration} phút)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[8px] bg-muted flex items-center justify-center text-muted-foreground">
                                    {meeting.type === "online" ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-muted-foreground leading-none mb-1">Địa điểm</p>
                                    <p className="text-sm font-semibold text-foreground truncate">
                                        {meeting.location || (meeting.type === "online" ? "Link họp trực tuyến" : "Chưa xác định")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[8px] bg-muted flex items-center justify-center text-muted-foreground">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground leading-none mb-1">Mentorship</p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {meeting.mentorship.mentor.firstName} ➔ {meeting.mentorship.mentees.length} Mentees
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Nội dung buổi họp</h3>
                            <div className="p-5 bg-muted rounded-[8px] text-sm text-muted-foreground leading-relaxed min-h-[100px] border border-border">
                                {meeting.description || "Không có mô tả chi tiết."}
                            </div>
                        </div>
                    </Card>

                    {/* Attendance List (Visible to all participants) */}
                    <Card>
                        <h3 className="text-lg font-semibold text-foreground mb-6">Danh sách điểm danh</h3>
                        <div className="space-y-4">
                            {meeting.attendances.map((attendance) => (
                                <div key={attendance.id} className="flex items-center justify-between p-4 rounded-[8px] border border-border bg-card">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            firstName={attendance.user.firstName}
                                            lastName={attendance.user.lastName}
                                            src={attendance.user.avatar}
                                            size="md"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {attendance.user.firstName} {attendance.user.lastName}
                                            </p>
                                            <p className="text-[10px] font-medium text-muted-foreground">Mentee</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge status={attendance.status} size="sm" />
                                        {attendance.checkInTime && (
                                            <p className="text-[10px] font-medium text-muted-foreground mt-1">
                                                Check-in: {formatDate(attendance.checkInTime, "HH:mm")}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right: Check-in Actions */}
                <div className="space-y-6">
                    {isMentor ? (
                        <QRManager
                            meetingId={meeting.id}
                            qrToken={meeting.qrToken}
                            expiresAt={meeting.qrExpiresAt || new Date()}
                        />
                    ) : (
                        <QRSentry meetingId={meeting.id} />
                    )}

                    <MinutesSection meetingId={meeting.id} minutes={minutes} isMentor={isMentor} />
                </div>
            </div>
        </div>
    );
}
