import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Plus, Users, Calendar, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function MentorshipsPage() {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || !["admin", "program_manager", "manager"].includes(role)) {
        redirect("/login");
    }
    try {
        const mentorshipsData = await prisma.mentorship.findMany({
            include: {
                mentor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                mentees: {
                    include: {
                        mentee: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                },
                programCycle: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const mentorships = JSON.parse(JSON.stringify(mentorshipsData));

        // Group mentorships by mentor
        const mentorGroups: Record<string, { mentor: any; mentorships: any[] }> = {};
        for (const m of mentorships) {
            const mentorId = m.mentor?.id || "unknown";
            if (!mentorGroups[mentorId]) {
                mentorGroups[mentorId] = { mentor: m.mentor, mentorships: [] };
            }
            mentorGroups[mentorId].mentorships.push(m);
        }
        const groups = Object.values(mentorGroups);

        const totalMentees = mentorships.reduce((acc: number, m: any) => acc + (m.mentees?.length || 0), 0);

        return (
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-foreground">Quản lý Mentorship</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {groups.length} mentor · {mentorships.length} mentorship · {totalMentees} mentee
                        </p>
                    </div>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/admin/mentorships/new">
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo Mentorship mới
                        </Link>
                    </Button>
                </div>

                {mentorships.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-4 border border-border">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Chưa có mentorship nào</h3>
                        <p className="text-muted-foreground max-w-xs mt-1 text-sm">
                            Hãy bắt đầu bằng cách gán mentor cho các mentees.
                        </p>
                        <Button variant="outline" className="mt-6" asChild>
                            <Link href="/admin/mentorships/new">Tạo ngay</Link>
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-10">
                        {groups.map((group) => {
                            const allMenteeCount = group.mentorships.reduce(
                                (acc: number, m: any) => acc + (m.mentees?.length || 0), 0
                            );
                            return (
                                <div key={group.mentor?.id || "unknown"} className="space-y-4">
                                    {/* Mentor Section Header */}
                                    <div className="flex items-center gap-4 pb-3 border-b border-border">
                                        <Avatar
                                            firstName={group.mentor?.firstName}
                                            lastName={group.mentor?.lastName}
                                            src={group.mentor?.avatar}
                                            size="lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-base font-semibold text-foreground">
                                                {group.mentor?.firstName} {group.mentor?.lastName}
                                            </h2>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {group.mentorships.length} mentorship · {allMenteeCount} mentee
                                            </p>
                                        </div>
                                    </div>

                                    {/* Mentorship Cards for this Mentor */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-0 md:pl-2">
                                        {group.mentorships.map((m: any) => (
                                            <Card key={m.id} hover padding="none" className="overflow-hidden flex flex-col">
                                                <div className="p-5 flex-1 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Badge status={m.status} />
                                                        <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border truncate max-w-[140px]">
                                                            {m.programCycle?.name || "Program"}
                                                        </span>
                                                    </div>

                                                    {/* Mentees */}
                                                    <div className="flex items-center gap-3">
                                                        <AvatarGroup>
                                                            {m.mentees?.slice(0, 3).map((mt: any) => (
                                                                <Avatar
                                                                    key={mt.mentee?.id}
                                                                    firstName={mt.mentee?.firstName}
                                                                    lastName={mt.mentee?.lastName}
                                                                    src={mt.mentee?.avatar}
                                                                    size="sm"
                                                                />
                                                            ))}
                                                            {m.mentees?.length > 3 && (
                                                                <AvatarGroupCount>
                                                                    +{m.mentees.length - 3}
                                                                </AvatarGroupCount>
                                                            )}
                                                        </AvatarGroup>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold text-foreground">
                                                                {m.mentees?.length || 0} Mentees
                                                            </p>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                {m.type === "one_on_one" ? "Cá nhân 1:1" : "Nhóm 1:n"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-muted/50 px-5 py-3 border-t border-border flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{formatDate(m.programCycle?.startDate)} - {formatDate(m.programCycle?.endDate)}</span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                                                        <Link href={`/admin/mentorships/${m.id}`}>Chi tiết</Link>
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    } catch (error: any) {
        console.error("Failed to fetch mentorships:", error);
        return (
            <div className="p-8 border border-destructive/20 rounded-xl bg-destructive/5">
                <p className="text-destructive font-semibold mb-2">Đã có lỗi xảy ra khi tải dữ liệu Mentorship:</p>
                <code className="text-xs bg-background p-2 rounded block overflow-auto whitespace-pre-wrap">
                    {error?.message || String(error)}
                </code>
            </div>
        );
    }
}
