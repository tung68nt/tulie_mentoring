"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Trash2, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { deleteReflection } from "@/lib/actions/reflection";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ReflectionCardProps {
    reflection: any;
    userRole: string;
}

export function ReflectionCard({ reflection, userRole }: ReflectionCardProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa nhật ký này?")) return;
        setIsLoading(true);
        try {
            await deleteReflection(reflection.id);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-6 rounded-lg border border-border/60 transition-all group overflow-hidden relative bg-card shadow-none">
            <div className="absolute top-0 right-0 p-4 flex items-center gap-1">
                {reflection.mentorConfirmed && (
                    <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-200/50 text-[10px] rounded-md font-semibold">Đã xác nhận</Badge>
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {!(userRole === "mentee" && reflection.mentorConfirmed) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/5 rounded-md"
                            onClick={handleDelete}
                            disabled={isLoading}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                    <History className="w-4 h-4 text-muted-foreground/30 mr-1" />
                </div>
            </div>
            <div className="space-y-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-muted-foreground/40">
                            {formatDate(reflection.createdAt)}
                        </span>
                    </div>
                    <h4 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors pr-8">
                        {reflection.meeting?.title}
                    </h4>
                    <p className="text-[12px] text-muted-foreground/60">
                        Mentor: {reflection.meeting?.mentorship?.mentor?.firstName} {reflection.meeting?.mentorship?.mentor?.lastName}
                    </p>
                </div>
                <div className="pt-2 border-t border-border/10">
                    <p className="text-[13px] text-muted-foreground line-clamp-3 leading-relaxed italic">
                        "Vào trang chi tiết để xem đầy đủ nội dung thu hoạch này..."
                    </p>
                </div>
            </div>
        </Card>
    );
}
