"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
    ChevronLeft, BarChart, Trash, Eye, FileText, Star, Hash, Calendar,
    Users, TrendingUp
} from "lucide-react";
import { deleteFormResponse } from "@/lib/actions/evaluation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserInfo {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    image: string | null;
}

interface Answer {
    id: string;
    value: string;
    score: number | null;
    question: { id: string; label: string; type: string };
}

interface Response {
    id: string;
    createdAt: string;
    submitter: UserInfo;
    targetMentee: UserInfo | null;
    answers: Answer[];
}

interface QuestionStat {
    questionId: string;
    label: string;
    type: string;
    count: number;
    avg?: number;
    min?: number;
    max?: number;
    distribution?: Record<string, number>;
    sampleAnswers?: string[];
}

interface ResponsesPageProps {
    form: { id: string; title: string; description: string | null };
    responses: Response[];
    analytics: { totalResponses: number; questionStats: QuestionStat[] };
}

export function ResponsesClient({ form, responses: initialResponses, analytics }: ResponsesPageProps) {
    const router = useRouter();
    const [responses, setResponses] = useState(initialResponses);
    const [viewingResponse, setViewingResponse] = useState<Response | null>(null);
    const [tab, setTab] = useState<"summary" | "individual">("summary");

    const handleDelete = async (responseId: string) => {
        try {
            await deleteFormResponse(responseId, form.id);
            setResponses(responses.filter(r => r.id !== responseId));
            setViewingResponse(null);
            toast.success("Đã xóa phản hồi");
        } catch {
            toast.error("Lỗi khi xóa");
        }
    };

    const getUserName = (user: UserInfo) =>
        [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

    const getInitials = (user: UserInfo) =>
        [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("").toUpperCase() || user.email[0].toUpperCase();

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            {/* Navigation */}
            <div className="mb-6 flex items-center justify-between gap-4">
                <Link href={`/facilitator/forms/${form.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                        <ChevronLeft className="w-4 h-4" /> Trở lại
                    </Button>
                </Link>
                <Link href={`/facilitator/forms/${form.id}/fill`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Điền đánh giá
                    </Button>
                </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold">{form.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">Tổng hợp {analytics.totalResponses} phản hồi</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
                <button
                    onClick={() => setTab("summary")}
                    className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${tab === "summary" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                    <BarChart className="w-3.5 h-3.5 inline mr-1.5" /> Tổng hợp
                </button>
                <button
                    onClick={() => setTab("individual")}
                    className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${tab === "individual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                    <Users className="w-3.5 h-3.5 inline mr-1.5" /> Từng phản hồi ({responses.length})
                </button>
            </div>

            {analytics.totalResponses === 0 ? (
                <EmptyState
                    icon={<FileText className="w-6 h-6" />}
                    title="Chưa có phản hồi nào"
                    description="Hãy chia sẻ biểu mẫu để nhận phản hồi."
                    action={
                        <Link href={`/facilitator/forms/${form.id}/fill`}>
                            <Button size="sm" className="gap-1.5">
                                <Eye className="w-3.5 h-3.5" /> Điền đánh giá đầu tiên
                            </Button>
                        </Link>
                    }
                />
            ) : tab === "summary" ? (
                /* ═══ Summary Tab ═══ */
                <div className="space-y-4">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <Card className="shadow-none p-5">
                            <p className="text-[11px] font-medium text-muted-foreground mb-1">Tổng phản hồi</p>
                            <p className="text-3xl font-bold">{analytics.totalResponses}</p>
                        </Card>
                        <Card className="shadow-none p-5">
                            <p className="text-[11px] font-medium text-muted-foreground mb-1">Câu hỏi</p>
                            <p className="text-3xl font-bold">{analytics.questionStats.length}</p>
                        </Card>
                        <Card className="shadow-none p-5">
                            <p className="text-[11px] font-medium text-muted-foreground mb-1">Điểm trung bình</p>
                            <p className="text-3xl font-bold">
                                {(() => {
                                    const ratingStats = analytics.questionStats.filter(q => q.avg !== undefined);
                                    if (ratingStats.length === 0) return "—";
                                    const avg = ratingStats.reduce((s, q) => s + (q.avg || 0), 0) / ratingStats.length;
                                    return avg.toFixed(1);
                                })()}
                            </p>
                        </Card>
                    </div>

                    {/* Per-Question Analysis */}
                    {analytics.questionStats.map((stat, idx) => (
                        <Card key={stat.questionId} className="shadow-none">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Câu {idx + 1}</p>
                                        <p className="font-medium text-foreground text-sm">{stat.label}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">{stat.type}</Badge>
                                </div>

                                {(stat.type === "RATING" || stat.type === "SCALE") && stat.avg !== undefined && (
                                    <div className="mt-3 flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-primary" />
                                            <span className="text-2xl font-bold">{stat.avg}</span>
                                            <span className="text-xs text-muted-foreground">/ {stat.type === "RATING" ? 5 : 10}</span>
                                        </div>
                                        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${(stat.avg / (stat.type === "RATING" ? 5 : 10)) * 100}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {stat.count} trả lời · Min: {stat.min} · Max: {stat.max}
                                        </div>
                                    </div>
                                )}

                                {stat.distribution && (
                                    <div className="mt-3 space-y-2">
                                        {Object.entries(stat.distribution).sort((a, b) => b[1] - a[1]).map(([choice, count]) => {
                                            const pct = Math.round((count / stat.count) * 100);
                                            return (
                                                <div key={choice} className="flex items-center gap-3">
                                                    <span className="text-xs text-foreground min-w-[120px] truncate">{choice}</span>
                                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground font-mono min-w-[60px] text-right">{count} ({pct}%)</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {stat.sampleAnswers && (
                                    <div className="mt-3 space-y-1.5">
                                        {stat.sampleAnswers.map((answer, i) => (
                                            <div key={i} className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                                                &quot;{answer}&quot;
                                            </div>
                                        ))}
                                        {stat.count > 5 && (
                                            <p className="text-[10px] text-muted-foreground/60">Và {stat.count - 5} câu trả lời khác...</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                /* ═══ Individual Responses Tab ═══ */
                <Card className="shadow-none">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Người gửi</TableHead>
                                <TableHead>Đánh giá cho</TableHead>
                                <TableHead>Thời gian</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {responses.map(r => (
                                <TableRow key={r.id} className="cursor-pointer" onClick={() => setViewingResponse(r)}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-7 h-7">
                                                <AvatarImage src={r.submitter.image || undefined} />
                                                <AvatarFallback className="text-[10px] font-bold">{getInitials(r.submitter)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">{getUserName(r.submitter)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {r.targetMentee ? (
                                            <span className="text-sm">{getUserName(r.targetMentee)}</span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Chung</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(r.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
                                            <Button size="icon-xs" variant="ghost" onClick={() => setViewingResponse(r)}>
                                                <Eye className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button size="icon-xs" variant="ghost" className="text-destructive/50 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(r.id)}>
                                                <Trash className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Response Detail Dialog */}
            <Dialog open={!!viewingResponse} onOpenChange={() => setViewingResponse(null)}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chi tiết phản hồi</DialogTitle>
                    </DialogHeader>
                    {viewingResponse && (
                        <div className="space-y-4 py-2">
                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={viewingResponse.submitter.image || undefined} />
                                    <AvatarFallback className="text-[10px] font-bold">{getInitials(viewingResponse.submitter)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{getUserName(viewingResponse.submitter)}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {new Date(viewingResponse.createdAt).toLocaleString("vi-VN")}
                                        {viewingResponse.targetMentee && ` · Đánh giá: ${getUserName(viewingResponse.targetMentee)}`}
                                    </p>
                                </div>
                            </div>

                            {viewingResponse.answers.map((a, idx) => (
                                <div key={a.id} className="space-y-1">
                                    <p className="text-xs text-muted-foreground font-medium">Câu {idx + 1}: {a.question.label}</p>
                                    <div className="p-3 bg-muted/20 rounded-lg">
                                        {a.question.type === "RATING" ? (
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} className={`w-4 h-4 ${parseInt(a.value) >= s ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} />
                                                ))}
                                                <span className="ml-2 text-sm font-semibold">{a.value}/5</span>
                                            </div>
                                        ) : a.question.type === "SCALE" ? (
                                            <span className="text-sm font-semibold">{a.value}/10</span>
                                        ) : (
                                            <p className="text-sm">{a.value}</p>
                                        )}
                                        {a.score !== null && <p className="text-[10px] text-muted-foreground mt-1">Điểm: {a.score}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setViewingResponse(null)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
