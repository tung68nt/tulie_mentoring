"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, cn } from "@/lib/utils";
import { confirmReflection } from "@/lib/actions/reflection";
import { Check, Eye, PenLine, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { blocksToText } from "@/components/ui/block-editor";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface MentorReflectionViewProps {
    reflections: any[];
}

export function MentorReflectionView({ reflections }: MentorReflectionViewProps) {
    const router = useRouter();
    const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("all");
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleConfirm = async (id: string) => {
        setIsLoading(id);
        try {
            await confirmReflection(id);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(null);
        }
    };

    // Group reflections by meeting
    const meetingGroups = new Map<string, { meeting: any; reflections: any[] }>();
    for (const ref of reflections) {
        const meetingId = ref.meeting?.id || "unknown";
        if (!meetingGroups.has(meetingId)) {
            meetingGroups.set(meetingId, { meeting: ref.meeting, reflections: [] });
        }
        meetingGroups!.get(meetingId)!.reflections.push(ref);
    }

    // Filter & search
    const filteredGroups = Array.from(meetingGroups.values()).filter(group => {
        const matchesSearch = !search.trim() ||
            group.meeting?.title?.toLowerCase().includes(search.toLowerCase()) ||
            group.reflections.some(r =>
                `${r.mentee?.firstName} ${r.mentee?.lastName}`.toLowerCase().includes(search.toLowerCase())
            );

        const matchesFilter = filter === "all" ||
            (filter === "pending" && group.reflections.some(r => !r.mentorConfirmed)) ||
            (filter === "confirmed" && group.reflections.every(r => r.mentorConfirmed));

        return matchesSearch && matchesFilter;
    });

    const pendingCount = reflections.filter(r => !r.mentorConfirmed).length;
    const confirmedCount = reflections.filter(r => r.mentorConfirmed).length;

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                    <Input
                        placeholder="Tìm theo buổi họp hoặc mentee..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 h-9 text-sm bg-muted/30 border-transparent focus:border-border/40 focus:bg-background shadow-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("all")}
                        className="h-9 text-xs"
                    >
                        Tất cả ({reflections.length})
                    </Button>
                    <Button
                        variant={filter === "pending" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("pending")}
                        className="h-9 text-xs"
                    >
                        Chờ xác nhận ({pendingCount})
                    </Button>
                    <Button
                        variant={filter === "confirmed" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("confirmed")}
                        className="h-9 text-xs"
                    >
                        Đã xác nhận ({confirmedCount})
                    </Button>
                </div>
            </div>

            {/* Grouped by meeting */}
            {filteredGroups.length === 0 ? (
                <Card className="p-12 text-center">
                    <PenLine className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">
                        {search ? "Không tìm thấy bài thu hoạch nào." : "Chưa có bài thu hoạch nào từ mentees."}
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredGroups.map(({ meeting, reflections: refs }) => (
                        <MeetingReflectionGroup
                            key={meeting?.id || "unknown"}
                            meeting={meeting}
                            reflections={refs}
                            onConfirm={handleConfirm}
                            isLoading={isLoading}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function MeetingReflectionGroup({
    meeting,
    reflections,
    onConfirm,
    isLoading,
}: {
    meeting: any;
    reflections: any[];
    onConfirm: (id: string) => void;
    isLoading: string | null;
}) {
    const [expanded, setExpanded] = useState(true);
    const confirmedCount = reflections.filter(r => r.mentorConfirmed).length;
    const allConfirmed = confirmedCount === reflections.length;

    return (
        <Card className="p-0 overflow-hidden">
            {/* Meeting header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-4 px-5 py-4 bg-muted/20 border-b border-border/30 text-left hover:bg-muted/30 transition-colors"
            >
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-purple-600 leading-none">
                        {meeting?.scheduledAt ? formatDate(meeting.scheduledAt, "MMM") : "—"}
                    </span>
                    <span className="text-sm font-bold text-purple-600 leading-none mt-0.5">
                        {meeting?.scheduledAt ? formatDate(meeting.scheduledAt, "dd") : "—"}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{meeting?.title || "Buổi họp"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {meeting?.scheduledAt ? formatDate(meeting.scheduledAt, "HH:mm dd/MM/yyyy") : ""}
                        {" · "}{reflections.length} bài thu hoạch
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {allConfirmed ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200/50 text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Đã xác nhận tất cả
                        </Badge>
                    ) : (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-200/50 text-xs">
                            {confirmedCount}/{reflections.length} đã xác nhận
                        </Badge>
                    )}
                    {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
            </button>

            {/* Reflection rows */}
            {expanded && (
                <div className="divide-y divide-border/20">
                    {reflections.map(ref => (
                        <ReflectionRow
                            key={ref.id}
                            reflection={ref}
                            onConfirm={onConfirm}
                            isLoading={isLoading === ref.id}
                        />
                    ))}
                </div>
            )}
        </Card>
    );
}

function ReflectionRow({
    reflection,
    onConfirm,
    isLoading,
}: {
    reflection: any;
    onConfirm: (id: string) => void;
    isLoading: boolean;
}) {
    const contentText = reflection.content
        ? (reflection.content.startsWith("[") ? blocksToText(reflection.content) : reflection.content)
        : "Chưa có nội dung.";

    return (
        <Dialog>
            <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/10 transition-colors">
                <Avatar
                    firstName={reflection.mentee?.firstName}
                    lastName={reflection.mentee?.lastName}
                    src={reflection.mentee?.avatar}
                    size="sm"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                        {reflection.mentee?.firstName} {reflection.mentee?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {contentText.substring(0, 100)}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground/50">
                        {formatDate(reflection.createdAt)}
                    </span>

                    {reflection.mentorConfirmed ? (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10">
                            <Check className="w-3 h-3" />
                            Đã xác nhận
                        </span>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs rounded-lg gap-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                onConfirm(reflection.id);
                            }}
                            disabled={isLoading}
                            isLoading={isLoading}
                        >
                            <Check className="w-3 h-3" />
                            Xác nhận
                        </Button>
                    )}

                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                            <Eye className="w-3.5 h-3.5" />
                        </Button>
                    </DialogTrigger>
                </div>
            </div>

            <DialogContent className="max-w-2xl rounded-2xl border border-border/60 p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-8 bg-muted/20 border-b border-border/40">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Avatar
                                firstName={reflection.mentee?.firstName}
                                lastName={reflection.mentee?.lastName}
                                src={reflection.mentee?.avatar}
                                size="md"
                            />
                            <div>
                                <p className="text-base font-semibold text-foreground">
                                    {reflection.mentee?.firstName} {reflection.mentee?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(reflection.createdAt)} · {reflection.meeting?.title}
                                </p>
                            </div>
                            {reflection.mentorConfirmed && (
                                <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-200/50 text-xs ml-auto">
                                    Đã xác nhận
                                </Badge>
                            )}
                        </div>
                        <DialogTitle className="text-xl font-bold tracking-tight text-foreground no-uppercase">
                            Thu hoạch: {reflection.meeting?.title}
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="prose prose-slate max-w-none">
                        <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
                            {contentText || "Chưa có nội dung ghi chép."}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
