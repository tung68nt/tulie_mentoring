import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail } from "lucide-react";
import Link from "next/link";

export default async function MenteesPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const userId = session.user.id;
    const role = (session.user as any).role;

    if (role !== "mentor" && role !== "admin" && role !== "viewer") {
        redirect("/");
    }

    try {
        const mentorFilter = (role === "admin" || role === "viewer") ? {} : { mentorId: userId };
        const mentorships = await prisma.mentorship.findMany({
            where: mentorFilter,
            include: {
                mentor: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    }
                },
                mentees: {
                    include: {
                        mentee: {
                            include: { menteeProfile: true }
                        }
                    }
                },
                programCycle: true,
            }
        });

        const allMentees = mentorships.flatMap(m =>
            m.mentees.map(mt => ({
                ...mt,
                mentorshipId: m.id,
                programName: m.programCycle?.name,
                mentorName: `${m.mentor?.firstName} ${m.mentor?.lastName}`,
                mentorAvatar: m.mentor?.avatar,
            }))
        );

        const serialized = JSON.parse(JSON.stringify(allMentees));

        return (
            <div className="space-y-8 pb-10 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {role === "mentor" ? "Mentees của tôi" : "Theo dõi Toàn bộ Mentees"}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                            {role === "mentor"
                                ? "Quản lý và theo dõi lộ trình phát triển của các sinh viên đang hướng dẫn."
                                : "Bảng tổng hợp tất cả sinh viên tham gia chương trình mentoring của Khoa."}
                        </p>
                    </div>
                </div>

                {serialized.length === 0 ? (
                    <div className="p-20 text-center bg-muted/20 rounded-2xl border border-dashed border-border/60">
                        <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-sm font-semibold text-muted-foreground">Hiện chưa có dữ liệu sinh viên trong đợt này.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {serialized.map((mt: any) => (
                            <Card key={mt.id} className="group overflow-hidden flex flex-col h-full border-border/80 shadow-none hover:border-primary/30 transition-all duration-300" hover padding="none">
                                <div className="p-6 flex-1">
                                    <div className="flex items-center justify-between mb-6">
                                        <Badge status={mt.status} size="sm" className="font-bold text-[9px]" />
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-full border border-border/40">
                                            <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[120px]">{mt.programName || "General"}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <Avatar
                                            firstName={mt.mentee?.firstName}
                                            lastName={mt.mentee?.lastName}
                                            src={mt.mentee?.avatar}
                                            size="lg"
                                            className="ring-2 ring-muted ring-offset-2 ring-offset-background"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold text-foreground leading-tight truncate mb-1">
                                                {mt.mentee?.firstName} {mt.mentee?.lastName}
                                            </h3>
                                            <p className="text-xs text-muted-foreground font-medium truncate mb-2">
                                                {mt.mentee?.menteeProfile?.studentId || "Student"} • {mt.mentee?.menteeProfile?.major || "No major"}
                                            </p>
                                        </div>
                                    </div>

                                    {(role === "admin" || role === "viewer") && (
                                        <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-2">
                                            <Avatar
                                                firstName={mt.mentorName?.split(' ')[0]}
                                                lastName={mt.mentorName?.split(' ').slice(1).join(' ')}
                                                src={mt.mentorAvatar}
                                                size="xs"
                                            />
                                            <p className="text-[11px] font-bold text-muted-foreground">
                                                Mentor: <span className="text-foreground">{mt.mentorName}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="px-6 py-4 bg-muted/30 border-t border-border/40 mt-auto">
                                    <Button variant="secondary" size="sm" asChild className="w-full font-bold text-xs shadow-none transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                                        <Link href={`/admin/mentorships/${mt.mentorshipId}`}>
                                            Xem hồ sơ & Tiến độ
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch mentees:", error);
        return (
            <div className="p-8 text-center bg-muted/30 rounded-xl border border-border">
                <p className="text-muted-foreground">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
            </div>
        );
    }
}
