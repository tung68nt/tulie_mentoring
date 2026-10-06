import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, StatCard, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList, Users, CheckCircle2, FileText, LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FacilitatorDashboard() {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "facilitator")) {
        redirect("/login");
    }

    try {
        const userId = session.user.id;

        // Fetch facilitator specific data
        const [
            assignments,
            forms,
            recentResponses
        ] = await Promise.all([
            prisma.facilitatorAssignment.findMany({
                where: { facilitatorId: userId },
                include: {
                    programCycle: true,
                    mentorship: {
                        include: {
                            mentor: true,
                            mentees: {
                                include: {
                                    mentee: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.evaluationForm.findMany({
                where: { isActive: true },
                take: 5
            }),
            prisma.evaluationResponse.findMany({
                where: { submitterId: userId },
                include: {
                    form: true,
                    targetMentee: true
                },
                orderBy: { createdAt: "desc" },
                take: 5
            })
        ]);

        return (
            <div className="space-y-8 pb-10 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-foreground">Bảng điều khiển Facilitator</h1>
                        <p className="text-sm text-muted-foreground mt-1">Quản lý đánh giá và hỗ trợ các nhóm mentoring.</p>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        title="Chương trình hỗ trợ"
                        value={assignments.filter(a => a.programCycleId).length}
                        icon={<LayoutDashboard className="w-5 h-5" />}
                    />
                    <StatCard
                        title="Nhóm phụ trách"
                        value={assignments.filter(a => a.mentorshipId).length}
                        icon={<Users className="w-5 h-5" />}
                    />
                    <StatCard
                        title="Đánh giá đã thực hiện"
                        value={recentResponses.length}
                        icon={<ClipboardList className="w-5 h-5" />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Active Assignments */}
                    <Card className="lg:col-span-7 bg-card shadow-none" padding="lg">
                        <CardHeader className="mb-6">
                            <CardTitle className="text-xl flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-none">
                                    <Users className="w-5 h-5" />
                                </div>
                                Phân công hiện tại
                            </CardTitle>
                        </CardHeader>
                        {assignments.length === 0 ? (
                            <EmptyState
                                icon={<Users className="w-8 h-8 text-muted-foreground" />}
                                title="Chưa có phân công nào"
                                description="Bạn sẽ thấy các chương trình và nhóm mình phụ trách tại đây."
                                className="py-16"
                            />
                        ) : (
                            <div className="space-y-4">
                                {assignments.map((assignment) => (
                                    <div key={assignment.id} className="p-4 rounded-xl border border-border bg-muted/30">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-foreground">
                                                    {assignment.programCycle?.name || "Nhóm Mentoring Riêng Biệt"}
                                                </p>
                                                {assignment.mentorship && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Mentor: {assignment.mentorship.mentor.firstName} {assignment.mentorship.mentor.lastName}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant="outline">
                                                {assignment.programCycleId ? "Chương trình" : "Nhóm"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Evaluation Forms */}
                    <Card className="lg:col-span-5 bg-muted border-none shadow-none" padding="lg">
                        <CardHeader className="mb-6">
                            <CardTitle className="text-xl flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-card text-foreground shadow-none border border-border">
                                    <FileText className="w-5 h-5" />
                                </div>
                                Biểu mẫu đánh giá
                            </CardTitle>
                        </CardHeader>
                        <div className="space-y-4">
                            {forms.length === 0 ? (
                                <EmptyState
                                    icon={<FileText className="w-8 h-8 text-muted-foreground" />}
                                    title="Không có biểu mẫu"
                                    className="py-10"
                                />
                            ) : (
                                forms.map(form => (
                                    <div key={form.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-none">
                                        <div>
                                            <p className="font-semibold text-foreground">{form.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Cập nhật: {new Date(form.updatedAt).toLocaleDateString("vi-VN")}</p>
                                        </div>
                                        <Link href={`/facilitator/forms/${form.id}`}>
                                            <Button size="sm" variant="outline" className="rounded-lg">
                                                Sử dụng
                                            </Button>
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch facilitator dashboard data:", error);
        return (
            <div className="p-8 border border-destructive/20 rounded-xl bg-destructive/5">
                <p className="text-destructive font-semibold mb-2">Đã có lỗi xảy ra khi tải dữ liệu:</p>
                <code className="text-xs bg-background p-2 rounded block overflow-auto whitespace-pre-wrap">
                    {error instanceof Error ? error.message : String(error)}
                </code>
            </div>
        );
    }
}
