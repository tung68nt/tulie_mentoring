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
        const mentorFilter = (role === "admin" || role === "viewer") ? { status: "active" } : { mentorId: userId, status: "active" };
        const mentorships = await prisma.mentorship.findMany({
            where: mentorFilter,
            include: {
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
            }))
        );

        const serialized = JSON.parse(JSON.stringify(allMentees));

        return (
            <div className="space-y-8 pb-10 animate-fade-in">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">
                        {role === "mentor" ? "Mentees của tôi" : "Danh sách Mentee"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {role === "mentor"
                            ? "Theo dõi tiến bộ và quản lý mentees trong chương trình"
                            : "Theo dõi toàn bộ sinh viên đang tham gia chương trình mentoring"}
                    </p>
                </div>

                {serialized.length === 0 ? (
                    <div className="p-16 text-center bg-muted/30 rounded-xl border border-dashed border-border space-y-3">
                        <Users className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                        <p className="text-sm text-muted-foreground font-medium">Chưa có mentee nào được phân công.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {serialized.map((mt: any) => (
                            <Card key={mt.id} className="p-6 space-y-4 group" hover>
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        firstName={mt.mentee?.firstName}
                                        lastName={mt.mentee?.lastName}
                                        src={mt.mentee?.avatar}
                                        size="lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">
                                            {mt.mentee?.firstName} {mt.mentee?.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {mt.mentee?.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Badge status={mt.status} size="sm" />
                                    {mt.programName && (
                                        <span className="text-[11px] text-muted-foreground font-medium truncate">{mt.programName}</span>
                                    )}
                                </div>
                                <Button variant="outline" size="sm" asChild className="w-full opacity-80 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/admin/mentorships/${mt.mentorshipId}`}>Xem hồ sơ & tiến bộ</Link>
                                </Button>
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
