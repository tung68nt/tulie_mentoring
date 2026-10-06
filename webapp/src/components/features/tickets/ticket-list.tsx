"use client";

import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Clock, User } from "lucide-react";
import Link from "next/link";

interface TicketListProps {
    tickets: any[];
}

export function TicketList({ tickets }: TicketListProps) {
    if (tickets.length === 0) {
        return (
            <div className="p-16 text-center bg-card rounded-2xl border border-dashed border-border/70 mt-6 shadow-xs">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground">Chưa có yêu cầu hỗ trợ nào</p>
                <p className="text-xs text-muted-foreground mt-1">Khi bạn gửi yêu cầu hỗ trợ hoặc báo lỗi, danh sách sẽ hiển thị tại đây.</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs mt-6">
            <Table>
                <TableHeader className="bg-muted/40">
                    <TableRow className="border-border/60 hover:bg-transparent">
                        <TableHead className="w-[45%] font-semibold text-xs text-muted-foreground py-4">Nội dung yêu cầu</TableHead>
                        <TableHead className="font-semibold text-xs text-muted-foreground py-4">Trạng thái</TableHead>
                        <TableHead className="font-semibold text-xs text-muted-foreground py-4">Ưu tiên</TableHead>
                        <TableHead className="font-semibold text-xs text-muted-foreground py-4">Ngày tạo</TableHead>
                        <TableHead className="font-semibold text-xs text-muted-foreground py-4 text-right px-6">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.map((ticket) => (
                        <TableRow key={ticket.id} className="border-border/50 hover:bg-muted/20 transition-colors group/row">
                            <TableCell className="py-4">
                                <Link href={`/tickets/${ticket.id}`} className="space-y-1 block">
                                    <p className="font-semibold text-sm text-foreground group-hover/row:text-primary transition-colors">{ticket.title}</p>
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80 font-medium">
                                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 font-medium border-border/60">
                                            {ticket.category === 'system' ? 'Hệ thống' : ticket.category === 'mentor' ? 'Mentor' : 'Admin'}
                                        </Badge>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span>{ticket.user.firstName} {ticket.user.lastName}</span>
                                        {ticket._count.comments > 0 && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <div className="flex items-center gap-1 text-primary font-semibold">
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    <span>{ticket._count.comments} phản hồi</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Badge status={ticket.status} className="rounded-full px-3 text-xs" />
                            </TableCell>
                            <TableCell>
                                <Badge variant={ticket.priority === 'high' ? 'error' : ticket.priority === 'medium' ? 'warning' : 'secondary'} size="sm" className="rounded-full px-2.5">
                                    {ticket.priority === 'high' ? 'Cao' : ticket.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium tabular-nums">
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                                    {formatDate(ticket.createdAt, "dd/MM/yyyy")}
                                </div>
                            </TableCell>
                            <TableCell className="text-right px-6">
                                <Link
                                    href={`/tickets/${ticket.id}`}
                                    className="inline-flex items-center justify-center rounded-xl h-8 px-3 text-xs font-semibold border border-border/60 hover:bg-muted/40 text-foreground transition-all"
                                >
                                    Chi tiết
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
