"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, cn } from "@/lib/utils";
import { BlockEditor, blocksToText } from "@/components/ui/block-editor";
import { upsertReflection, deleteReflection } from "@/lib/actions/reflection";
import {
    PenLine, Check, CheckCircle2, Clock, Save, Loader2,
    Trash2, BookOpen, Calendar, ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface MeetingItem {
    id: string;
    type: "pending" | "submitted";
    meetingId: string;
    meetingTitle: string;
    mentorName: string;
    scheduledAt?: string;
    createdAt?: string;
    content?: string;
    mentorConfirmed?: boolean;
    reflectionId?: string;
}

interface MenteeReflectionLayoutProps {
    pendingMeetings: any[];
    reflections: any[];
    userRole: string;
}

export function MenteeReflectionLayout({ pendingMeetings, reflections, userRole }: MenteeReflectionLayoutProps) {
    const router = useRouter();

    // Build unified list of meetings
    const meetings = useMemo((): MeetingItem[] => {
        const pending: MeetingItem[] = pendingMeetings.map((m: any) => ({
            id: `pending-${m.id}`,
            type: "pending" as const,
            meetingId: m.id,
            meetingTitle: m.title,
            mentorName: `${m.mentorship?.mentor?.firstName || ""} ${m.mentorship?.mentor?.lastName || ""}`.trim(),
            scheduledAt: m.scheduledAt,
        }));

        const submitted: MeetingItem[] = reflections.map((r: any) => ({
            id: `submitted-${r.id}`,
            type: "submitted" as const,
            meetingId: r.meeting?.id || "",
            meetingTitle: r.meeting?.title || "Buổi học",
            mentorName: `${r.meeting?.mentorship?.mentor?.firstName || ""} ${r.meeting?.mentorship?.mentor?.lastName || ""}`.trim(),
            scheduledAt: r.meeting?.scheduledAt,
            createdAt: r.createdAt,
            content: r.content,
            mentorConfirmed: r.mentorConfirmed,
            reflectionId: r.id,
        }));

        return [...pending, ...submitted];
    }, [pendingMeetings, reflections]);

    const [selectedId, setSelectedId] = useState<string | null>(meetings[0]?.id || null);

    const selected = meetings.find(m => m.id === selectedId) || null;

    const pendingCount = meetings.filter(m => m.type === "pending").length;
    const submittedCount = meetings.filter(m => m.type === "submitted").length;

    return (
        <div className="flex gap-0 h-[calc(100vh-180px)] min-h-[500px] animate-fade-in">
            {/* ─── LEFT SIDEBAR: Meeting list ─── */}
            <div className="w-[320px] shrink-0 border-r border-border/40 flex flex-col bg-muted/5">
                {/* Sidebar header */}
                <div className="px-4 py-3 border-b border-border/30">
                    <h2 className="text-sm font-semibold text-foreground">Danh sách buổi học</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        {pendingCount > 0 && <span className="text-amber-600 font-medium">{pendingCount} chờ nộp</span>}
                        {pendingCount > 0 && submittedCount > 0 && " · "}
                        {submittedCount > 0 && <span>{submittedCount} đã nộp</span>}
                    </p>
                </div>

                {/* Meeting items */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Pending section */}
                    {pendingCount > 0 && (
                        <div>
                            <div className="px-4 py-2 bg-amber-500/5 border-b border-border/20">
                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Chờ nộp thu hoạch</span>
                            </div>
                            {meetings.filter(m => m.type === "pending").map(item => (
                                <SidebarItem
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedId === item.id}
                                    onClick={() => setSelectedId(item.id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Submitted section */}
                    {submittedCount > 0 && (
                        <div>
                            <div className="px-4 py-2 bg-muted/30 border-b border-border/20 border-t border-t-border/20">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Đã nộp</span>
                            </div>
                            {meetings.filter(m => m.type === "submitted").map(item => (
                                <SidebarItem
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedId === item.id}
                                    onClick={() => setSelectedId(item.id)}
                                />
                            ))}
                        </div>
                    )}

                    {meetings.length === 0 && (
                        <div className="p-6 text-center">
                            <PenLine className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Chưa có buổi học nào.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── RIGHT DETAIL PANEL ─── */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                {selected ? (
                    selected.type === "pending" ? (
                        <PendingEditor
                            key={selected.meetingId}
                            meetingId={selected.meetingId}
                            meetingTitle={selected.meetingTitle}
                            mentorName={selected.mentorName}
                            scheduledAt={selected.scheduledAt}
                        />
                    ) : (
                        <SubmittedView
                            key={selected.reflectionId}
                            item={selected}
                            userRole={userRole}
                        />
                    )
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <BookOpen className="w-10 h-10 text-muted-foreground/15 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground font-medium">Chọn một buổi học để xem hoặc viết thu hoạch</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Sidebar Item ───
function SidebarItem({ item, isSelected, onClick }: { item: MeetingItem; isSelected: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left px-4 py-3 border-b border-border/15 transition-all hover:bg-muted/30",
                isSelected && "bg-primary/5 border-l-2 border-l-primary hover:bg-primary/5"
            )}
        >
            <div className="flex items-start gap-3">
                {/* Date badge */}
                <div className={cn(
                    "w-9 h-9 rounded-md flex flex-col items-center justify-center shrink-0",
                    item.type === "pending" ? "bg-amber-500/10" : "bg-purple-500/10"
                )}>
                    <span className={cn(
                        "text-[8px] font-bold leading-none",
                        item.type === "pending" ? "text-amber-600" : "text-purple-600"
                    )}>
                        {item.scheduledAt ? formatDate(item.scheduledAt, "MMM") : "—"}
                    </span>
                    <span className={cn(
                        "text-xs font-bold leading-none mt-0.5",
                        item.type === "pending" ? "text-amber-600" : "text-purple-600"
                    )}>
                        {item.scheduledAt ? formatDate(item.scheduledAt, "dd") : "—"}
                    </span>
                </div>

                <div className="flex-1 min-w-0">
                    <p className={cn(
                        "text-sm truncate leading-tight",
                        isSelected ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                    )}>
                        {item.meetingTitle}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {item.mentorName}
                    </p>
                </div>

                {/* Status indicator */}
                <div className="shrink-0 mt-0.5">
                    {item.type === "pending" ? (
                        <span className="w-2 h-2 rounded-full bg-amber-500 block animate-pulse" />
                    ) : item.mentorConfirmed ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/40" />
                    )}
                </div>
            </div>
        </button>
    );
}

// ─── Editor for Pending Meetings ───
function PendingEditor({ meetingId, meetingTitle, mentorName, scheduledAt }: {
    meetingId: string;
    meetingTitle: string;
    mentorName: string;
    scheduledAt?: string;
}) {
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const router = useRouter();

    const handleSave = async () => {
        if (!content || isSaving) return;
        setIsSaving(true);
        try {
            await upsertReflection(meetingId, content);
            setLastSaved(new Date());
            router.refresh();
        } catch (error) {
            console.error("Failed to save reflection:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/30 bg-muted/5 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-200/50 text-[10px] px-1.5 py-0">
                                Chưa nộp
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">{mentorName}</span>
                            {scheduledAt && (
                                <>
                                    <span className="text-muted-foreground/30">·</span>
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(scheduledAt, "dd/MM/yyyy HH:mm")}
                                    </span>
                                </>
                            )}
                        </div>
                        <h2 className="text-lg font-semibold text-foreground truncate">{meetingTitle}</h2>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {lastSaved && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Đã lưu {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !content}
                            size="sm"
                            className="rounded-lg shadow-none h-8 text-xs px-3"
                        >
                            {isSaving ? (
                                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                            ) : (
                                <Save className="w-3 h-3 mr-1.5" />
                            )}
                            {isSaving ? "Đang lưu..." : "Lưu thu hoạch"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto p-6">
                <BlockEditor
                    initialContent={content}
                    onChange={setContent}
                    placeholder="Viết những gì bạn đã học được và những cảm nhận sau buổi học..."
                />
            </div>
        </div>
    );
}

// ─── View for Submitted Reflections ───
function SubmittedView({ item, userRole }: { item: MeetingItem; userRole: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const contentText = item.content
        ? (item.content.startsWith('[') ? blocksToText(item.content) : item.content)
        : "Chưa có nội dung ghi chép.";

    const handleDelete = async () => {
        if (!item.reflectionId) return;
        if (!confirm("Bạn có chắc chắn muốn xóa bài thu hoạch này?")) return;
        setIsDeleting(true);
        try {
            await deleteReflection(item.reflectionId);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/30 bg-muted/5 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {item.mentorConfirmed ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200/50 text-[10px] px-1.5 py-0">
                                    <Check className="w-3 h-3 mr-0.5" />
                                    Đã xác nhận
                                </Badge>
                            ) : (
                                <Badge className="bg-purple-500/10 text-purple-600 border-purple-200/50 text-[10px] px-1.5 py-0">
                                    Chờ xác nhận
                                </Badge>
                            )}
                            <span className="text-[11px] text-muted-foreground">{item.mentorName}</span>
                            {item.scheduledAt && (
                                <>
                                    <span className="text-muted-foreground/30">·</span>
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(item.scheduledAt, "dd/MM/yyyy HH:mm")}
                                    </span>
                                </>
                            )}
                        </div>
                        <h2 className="text-lg font-semibold text-foreground truncate">{item.meetingTitle}</h2>
                    </div>
                    <div className="shrink-0">
                        {!(userRole === "mentee" && item.mentorConfirmed) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/5 rounded-lg"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                Xóa
                            </Button>
                        )}
                    </div>
                </div>
                {item.createdAt && (
                    <p className="text-[11px] text-muted-foreground/50 mt-1">
                        Nộp lúc {formatDate(item.createdAt, "HH:mm dd/MM/yyyy")}
                    </p>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="prose prose-slate max-w-none">
                    <div className="whitespace-pre-wrap text-[15px] text-foreground/90 leading-relaxed">
                        {item.content && item.content.startsWith('[') ? (
                            <div className="space-y-3">
                                {blocksToText(item.content).split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        ) : (
                            contentText
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
