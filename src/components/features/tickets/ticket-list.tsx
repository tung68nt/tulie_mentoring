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
            <div className="p-16 text-center bg-muted/10 rounded-xl border border-dashed border-border/60 mt-8">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground font-medium">Chưa có yêu cầu hỗ trợ nào.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/60 bg-background overflow-hidden shadow-none mt-8">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="border-border/60 hover:bg-transparent">
                        <TableHead className="w-[40%] font-semibold text-[11px] text-muted-foreground py-5">Nội dung yêu cầu</TableHead>
                        <TableHead className="font-semibold text-[11px] text-muted-foreground py-5">Trạng thái</TableHead>
                        <TableHead className="font-semibold text-[11px] text-muted-foreground py-5">Ưu tiên</TableHead>
                        <TableHead className="font-semibold text-[11px] text-muted-foreground py-5">Ngày tạo</TableHead>
                        <TableHead className="font-semibold text-[11px] text-muted-foreground py-5 text-right px-8">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.map((ticket) => (
                        <TableRow key={ticket.id} className="border-border/40 hover:bg-muted/10 transition-colors group/row">
                            <TableCell className="py-5">
                                <Link href={`/tickets/${ticket.id}`} className="space-y-1 block">
                                    <p className="font-semibold text-sm text-foreground group-hover/row:text-primary transition-colors">{ticket.title}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-medium">
                                        <User className="w-3 h-3" />
                                        <span>{ticket.user.firstName} {ticket.user.lastName}</span>
                                        {ticket._count.comments > 0 && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" />
                                                    <span>{ticket._count.comments} phản hồi</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Badge status={ticket.status} />
                            </TableCell>
                            <TableCell>
                                <Badge variant={ticket.priority === 'high' ? 'error' : ticket.priority === 'medium' ? 'warning' : 'secondary'} size="sm">
                                    {ticket.priority === 'high' ? 'Cao' : ticket.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60 font-medium tabular-nums">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatDate(ticket.createdAt, "dd/MM/yyyy")}
                                </div>
                            </TableCell>
                            <TableCell className="text-right px-8">
                                <Link
                                    href={`/tickets/${ticket.id}`}
                                    className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors"
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
