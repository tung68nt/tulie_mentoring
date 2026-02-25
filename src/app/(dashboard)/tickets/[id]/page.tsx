"use server";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getTicketDetail, addTicketComment, updateTicketStatus } from "@/lib/actions/ticket";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Clock, MessageSquare, Send, CheckCircle, Zap } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    let ticket;
    try {
        ticket = await getTicketDetail(params.id);
    } catch (e) {
        return notFound();
    }

    const role = (session.user as any).role;
    const canManage = role !== "mentee";

    async function handleAddComment(formData: FormData) {
        "use server";
        const content = formData.get("content") as string;
        if (!content) return;

        await addTicketComment(params.id, content);
        revalidatePath(`/tickets/${params.id}`);
    }

    async function handleUpdateStatus(status: string) {
        "use server";
        await updateTicketStatus(params.id, status);
        revalidatePath(`/tickets/${params.id}`);
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10 animate-fade-in">
            {/* Ticket Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                        <Badge status={ticket.status} size="lg" className="rounded-xl px-4 h-7" />
                        <Badge variant={ticket.priority === 'high' ? 'error' : ticket.priority === 'medium' ? 'warning' : 'secondary'} size="lg" className="rounded-xl px-4 h-7">
                            Ưu tiên: {ticket.priority === 'high' ? 'Cao' : ticket.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground no-uppercase tracking-tight leading-tight">{ticket.title}</h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground/60 font-medium">
                        <Clock className="w-4 h-4" />
                        <span>Đã tạo {formatDate(ticket.createdAt, "dd/MM/yyyy HH:mm")}</span>
                    </div>
                </div>

                {canManage && (
                    <div className="flex gap-2">
                        {ticket.status === 'open' && (
                            <form action={() => handleUpdateStatus('in_progress')}>
                                <Button className="rounded-xl no-uppercase gap-2" size="sm">
                                    <Zap className="w-4 h-4" />
                                    Xử lý ngay
                                </Button>
                            </form>
                        )}
                        {ticket.status !== 'resolved' && (
                            <form action={() => handleUpdateStatus('resolved')}>
                                <Button variant="secondary" className="rounded-xl no-uppercase gap-2 border-border shadow-sm" size="sm">
                                    <CheckCircle className="w-4 h-4" />
                                    Giải quyết
                                </Button>
                            </form>
                        )}
                    </div>
                )}
            </div>

            <Card className="p-8 rounded-xl border-none shadow-none bg-muted/20">
                <div className="flex items-start gap-4 mb-6">
                    <Avatar className="w-10 h-10 border border-background ring-2 ring-muted/50">
                        <AvatarImage src={ticket.user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{ticket.user.firstName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <p className="text-sm font-bold no-uppercase">{ticket.user.firstName} {ticket.user.lastName}</p>
                        <p className="text-[11px] font-bold text-primary/60 no-uppercase tracking-wider">{ticket.user.role}</p>
                    </div>
                </div>
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                </div>
            </Card>

            {/* Comments Section */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold no-uppercase">Thảo luận ({ticket.comments.length})</h2>
                </div>

                <div className="space-y-4">
                    {ticket.comments.map((comment: any) => (
                        <div
                            key={comment.id}
                            className={`flex gap-4 ${comment.userId === session.user.id ? 'flex-row-reverse' : ''}`}
                        >
                            <Avatar className="w-8 h-8 shrink-0 mt-1">
                                <AvatarImage src={comment.user.avatar} />
                                <AvatarFallback className="text-[10px]">{comment.user.firstName[0]}</AvatarFallback>
                            </Avatar>
                            <div className={`space-y-2 max-w-[80%] ${comment.userId === session.user.id ? 'items-end' : ''}`}>
                                <div className={`p-4 rounded-xl shadow-none border border-border/40 ${comment.userId === session.user.id
                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                    : 'bg-background rounded-tl-none'
                                    }`}>
                                    <p className="text-sm leading-relaxed no-uppercase">{comment.content}</p>
                                </div>
                                <div className="flex items-center gap-2 px-1">
                                    <span className="text-[10px] font-bold text-muted-foreground/60 no-uppercase">
                                        {comment.user.firstName}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground/40 italic">
                                        {formatDate(comment.createdAt, "HH:mm, dd/MM")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {ticket.status !== 'closed' && (
                    <form action={handleAddComment} className="pt-6 relative">
                        <Textarea
                            name="content"
                            placeholder="Nhập phản hồi của bạn..."
                            className="rounded-xl border-border/50 focus:border-primary/30 min-h-[100px] pr-12 pt-4 bg-background px-4"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="absolute bottom-4 right-4 rounded-lg shadow-none"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
