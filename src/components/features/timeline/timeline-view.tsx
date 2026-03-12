"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calendar, Flag, Star, CheckCircle2, Users, Award,
    Plus, Clock, Trash2, Milestone as MilestoneIcon
} from "lucide-react";
import { toast } from "sonner";
import { createMilestone, deleteMilestone } from "@/lib/actions/milestone";
import { formatDate } from "@/lib/utils";

const iconMap: Record<string, any> = {
    calendar: Calendar,
    flag: Flag,
    star: Star,
    check: CheckCircle2,
    users: Users,
    award: Award,
};

const colorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-900", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
    green: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-900", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
    amber: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-900", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
    purple: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-900", text: "text-purple-600 dark:text-purple-400", dot: "bg-purple-500" },
    rose: { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-900", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
};

function CountdownCard({ targetDate, label }: { targetDate: string; label: string }) {
    const diff = useMemo(() => {
        const now = new Date();
        const target = new Date(targetDate);
        const diffMs = target.getTime() - now.getTime();
        if (diffMs <= 0) return null;
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return { days, hours };
    }, [targetDate]);

    if (!diff) return null;

    return (
        <Card className="p-5 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent shadow-none">
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground/60 no-uppercase">Sự kiện sắp tới</p>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-[10px] text-muted-foreground/50">{formatDate(targetDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary leading-none">{diff.days}</div>
                        <div className="text-[10px] font-medium text-muted-foreground/60 mt-1">ngày</div>
                    </div>
                    <div className="text-xl font-bold text-muted-foreground/30">:</div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary/70 leading-none">{diff.hours}</div>
                        <div className="text-[10px] font-medium text-muted-foreground/60 mt-1">giờ</div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function AddMilestoneDialog({ programCycleId }: { programCycleId: string }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        date: "",
        icon: "calendar",
        color: "blue",
    });

    const handleCreate = async () => {
        if (!form.title || !form.date) { toast.error("Tên và ngày là bắt buộc"); return; }
        setIsLoading(true);
        try {
            await createMilestone({ ...form, programCycleId });
            toast.success("Đã thêm mốc sự kiện");
            setOpen(false);
            setForm({ title: "", description: "", date: "", icon: "calendar", color: "blue" });
        } catch {
            toast.error("Lỗi khi thêm");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" /> Thêm mốc</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Thêm mốc sự kiện</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    <div>
                        <Label>Tên sự kiện *</Label>
                        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ví dụ: Kickoff, Mid-review..." className="mt-1" />
                    </div>
                    <div>
                        <Label>Mô tả</Label>
                        <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Chi tiết..." className="mt-1" />
                    </div>
                    <div>
                        <Label>Ngày *</Label>
                        <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Icon</Label>
                            <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="calendar">📅 Lịch</SelectItem>
                                    <SelectItem value="flag">🚩 Cờ</SelectItem>
                                    <SelectItem value="star">⭐ Sao</SelectItem>
                                    <SelectItem value="check">✅ Hoàn thành</SelectItem>
                                    <SelectItem value="users">👥 Nhóm</SelectItem>
                                    <SelectItem value="award">🏆 Giải thưởng</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Màu</Label>
                            <Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="blue">🔵 Xanh dương</SelectItem>
                                    <SelectItem value="green">🟢 Xanh lá</SelectItem>
                                    <SelectItem value="amber">🟡 Vàng</SelectItem>
                                    <SelectItem value="purple">🟣 Tím</SelectItem>
                                    <SelectItem value="rose">🌹 Hồng</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2 pt-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Hủy</Button>
                    <Button onClick={handleCreate} disabled={isLoading}>
                        {isLoading ? "Đang thêm..." : "Thêm mốc"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface TimelineViewProps {
    milestones: any[];
    programCycle: any;
    isAdmin: boolean;
}

export function TimelineView({ milestones, programCycle, isAdmin }: TimelineViewProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Find next upcoming milestone for countdown
    const nextMilestone = useMemo(() => {
        const now = new Date();
        return milestones.find(m => new Date(m.date) > now);
    }, [milestones]);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await deleteMilestone(id);
            toast.success("Đã xoá mốc sự kiện");
        } catch {
            toast.error("Lỗi khi xoá");
        } finally {
            setDeletingId(null);
        }
    };

    if (!programCycle) {
        return (
            <EmptyState
                icon={Calendar}
                title="Chưa có chương trình"
                description="Cần tạo chương trình Mentoring trước khi thêm mốc sự kiện."
            />
        );
    }

    return (
        <div className="space-y-8">
            {/* Countdown to next event */}
            {nextMilestone && (
                <CountdownCard targetDate={nextMilestone.date} label={nextMilestone.title} />
            )}

            {/* Admin: Add milestone */}
            {isAdmin && (
                <div className="flex justify-end">
                    <AddMilestoneDialog programCycleId={programCycle.id} />
                </div>
            )}

            {/* Timeline */}
            {milestones.length === 0 ? (
                <EmptyState
                    icon={MilestoneIcon}
                    title="Chưa có mốc sự kiện"
                    description={isAdmin ? "Nhấn \"Thêm mốc\" để tạo lộ trình chương trình." : "Lộ trình chương trình chưa được thiết lập."}
                />
            ) : (
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                    <div className="space-y-6">
                        {milestones.map((milestone, index) => {
                            const isPast = new Date(milestone.date) < new Date();
                            const color = colorMap[milestone.color] || colorMap.blue;
                            const Icon = iconMap[milestone.icon] || Calendar;

                            return (
                                <div key={milestone.id} className="relative flex items-start gap-4 pl-0">
                                    {/* Dot */}
                                    <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                                        isPast ? "bg-muted border-border" : `${color.bg} ${color.border}`
                                    }`}>
                                        <Icon className={`w-5 h-5 ${isPast ? "text-muted-foreground/40" : color.text}`} />
                                    </div>

                                    {/* Content */}
                                    <Card className={`flex-1 p-4 shadow-none transition-all ${
                                        isPast ? "opacity-60 bg-muted/20" : "border-border/60"
                                    }`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className={`font-semibold ${isPast ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                                        {milestone.title}
                                                    </h3>
                                                    {isPast && (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                    )}
                                                </div>
                                                {milestone.description && (
                                                    <p className="text-sm text-muted-foreground/70">{milestone.description}</p>
                                                )}
                                                <p className={`text-xs font-medium ${isPast ? "text-muted-foreground/40" : color.text}`}>
                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                    {formatDate(milestone.date)}
                                                </p>
                                            </div>

                                            {isAdmin && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground/40 hover:text-destructive shrink-0"
                                                    onClick={() => handleDelete(milestone.id)}
                                                    disabled={deletingId === milestone.id}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Program info */}
            <Card className="p-4 bg-muted/20 border-border/40 shadow-none">
                <div className="flex items-center justify-between text-xs text-muted-foreground/60">
                    <span>Bắt đầu: <strong className="text-foreground">{formatDate(programCycle.startDate)}</strong></span>
                    <span>Kết thúc: <strong className="text-foreground">{formatDate(programCycle.endDate)}</strong></span>
                </div>
            </Card>
        </div>
    );
}
