"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, cn } from "@/lib/utils";
import { confirmReflection } from "@/lib/actions/reflection";
import { Check, PenLine, ChevronDown, ChevronUp, Search, Clock, Calendar, CheckCircle2, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { blocksToText } from "@/components/ui/block-editor";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MentorReflectionViewProps {
    mentorships: any[];
}

export function MentorReflectionView({ mentorships }: MentorReflectionViewProps) {
    const router = useRouter();
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

    // Group meetings and reflections by Mentee
    const menteeMap = new Map<string, { mentee: any; meetings: any[] }>();

    for (const ms of mentorships || []) {
        for (const { mentee } of ms.mentees || []) {
            if (!menteeMap.has(mentee.id)) {
                menteeMap.set(mentee.id, { mentee, meetings: [] });
            }

            // Add all meetings of this mentorship
            for (const meeting of ms.meetings || []) {
                // Find reflection submitted by this mentee
                const ref = meeting.sessionReflections?.find((r: any) => r.menteeId === mentee.id);
                // Avoid duplicates
                if (!menteeMap.get(mentee.id)!.meetings.some((m: any) => m.id === meeting.id)) {
                    menteeMap.get(mentee.id)!.meetings.push({
                        ...meeting,
                        reflection: ref || null
                    });
                }
            }
        }
    }

    const menteesList = Array.from(menteeMap.values());
    const [activeMenteeId, setActiveMenteeId] = useState<string | undefined>(menteesList[0]?.mentee.id);

    if (menteesList.length === 0) {
        return (
            <Card className="p-12 text-center">
                <PenLine className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                    Chưa có mentee nào trong chương trình của bạn.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Mentee Tabs at the top */}
            <Tabs value={activeMenteeId} onValueChange={setActiveMenteeId} className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
                        {menteesList.map(({ mentee }) => (
                            <TabsTrigger 
                                key={mentee.id} 
                                value={mentee.id}
                                className="gap-2.5 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <Avatar 
                                    src={mentee.avatar} 
                                    firstName={mentee.firstName} 
                                    lastName={mentee.lastName} 
                                    size="xs" 
                                />
                                <span className="font-semibold">{mentee.firstName} {mentee.lastName}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {menteesList.map(({ mentee, meetings }) => (
                    <TabsContent key={mentee.id} value={mentee.id} className="mt-0 outline-none">
                        <MenteeSidebarView 
                            meetings={meetings} 
                            onConfirm={handleConfirm} 
                            isLoading={isLoading} 
                            mentee={mentee}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

function MenteeSidebarView({ meetings, onConfirm, isLoading, mentee }: { meetings: any[], onConfirm: any, isLoading: any, mentee: any }) {
    // Process meetings: calculate session numbers (oldest = #1)
    const processedMeetings = useMemo(() => {
        return meetings.slice().sort((a, b) => {
            return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
        }).map((m, idx) => ({ ...m, sessionNumber: idx + 1 })).reverse();
    }, [meetings]);

    // Track selected meeting
    const [selectedId, setSelectedId] = useState<string | null>(processedMeetings[0]?.id || null);
    const selectedMeeting = processedMeetings.find(m => m.id === selectedId);

    if (processedMeetings.length === 0) {
        return (
            <Card className="p-10 text-center bg-muted/20 border-border/40 border-dashed">
                <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">Mentee này chưa có buổi học nào.</p>
            </Card>
        );
    }

    // Split meetings for sidebar groups: Pending Review, Pending Submission, Scheduled
    const pendingMentorReview = processedMeetings.filter(m => m.reflection && !m.reflection.mentorConfirmed);
    const confirmedList = processedMeetings.filter(m => m.reflection && m.reflection.mentorConfirmed);
    const pendingMenteeSubmission = processedMeetings.filter(m => !m.reflection && m.status !== "scheduled");
    const scheduledList = processedMeetings.filter(m => !m.reflection && m.status === "scheduled");

    return (
        <Card className="flex border-border/60 overflow-hidden h-[calc(100vh-280px)] min-h-[600px] animate-fade-in shadow-sm">
            {/* ─── LEFT SIDEBAR: Meeting list ─── */}
            <div className="w-[320px] shrink-0 border-r border-border/40 flex flex-col bg-muted/5 relative">
                <div className="px-4 py-3 border-b border-border/30 bg-background/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
                    <h2 className="text-sm font-semibold text-foreground">Danh sách buổi họp</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        {pendingMentorReview.length} chờ duyệt · {confirmedList.length} đã xong
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Chờ Mentor Xác Nhận */}
                    {pendingMentorReview.length > 0 && (
                        <div>
                            <div className="px-4 py-2 bg-blue-500/5 border-b border-border/20 border-t border-t-border/20 sticky top-0 backdrop-blur-md">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Cần xác nhận ngay ({pendingMentorReview.length})</span>
                            </div>
                            {pendingMentorReview.map(m => (
                                <SidebarItem 
                                    key={m.id} 
                                    meeting={m} 
                                    isSelected={selectedId === m.id} 
                                    onClick={() => setSelectedId(m.id)} 
                                />
                            ))}
                        </div>
                    )}

                    {/* Đã Xác Nhận */}
                    {confirmedList.length > 0 && (
                        <div>
                            <div className="px-4 py-2 bg-emerald-500/5 border-b border-border/20 border-t border-t-border/20 sticky top-0 backdrop-blur-md">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Đã xác nhận ({confirmedList.length})</span>
                            </div>
                            {confirmedList.map(m => (
                                <SidebarItem 
                                    key={m.id} 
                                    meeting={m} 
                                    isSelected={selectedId === m.id} 
                                    onClick={() => setSelectedId(m.id)} 
                                />
                            ))}
                        </div>
                    )}

                    {/* Chờ Mentee Nộp */}
                    {pendingMenteeSubmission.length > 0 && (
                        <div>
                            <div className="px-4 py-2 bg-amber-500/5 border-b border-border/20 border-t border-t-border/20 sticky top-0 backdrop-blur-md">
                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Chờ mentee nộp ({pendingMenteeSubmission.length})</span>
                            </div>
                            {pendingMenteeSubmission.map(m => (
                                <SidebarItem 
                                    key={m.id} 
                                    meeting={m} 
                                    isSelected={selectedId === m.id} 
                                    onClick={() => setSelectedId(m.id)} 
                                />
                            ))}
                        </div>
                    )}

                    {/* Đã Lên Lịch (Chưa Gặp) */}
                    {scheduledList.length > 0 && (
                        <div>
                            <div className="px-4 py-2 bg-muted/30 border-b border-border/20 border-t border-t-border/20 sticky top-0 backdrop-blur-md">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chưa gặp ({scheduledList.length})</span>
                            </div>
                            {scheduledList.map(m => (
                                <SidebarItem 
                                    key={m.id} 
                                    meeting={m} 
                                    isSelected={selectedId === m.id} 
                                    onClick={() => setSelectedId(m.id)} 
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── RIGHT DETAIL PANEL ─── */}
            <div className="flex-1 min-w-0 flex flex-col bg-background relative">
                {selectedMeeting ? (
                    <MeetingDetail 
                        meeting={selectedMeeting} 
                        mentee={mentee} 
                        onConfirm={onConfirm} 
                        isLoading={isLoading === selectedMeeting.reflection?.id} 
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageSquare className="w-10 h-10 text-muted-foreground/15 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground font-medium">Chọn một buổi học bên trái để xem nội dung</p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}

// ─── Sidebar Item (Mentor View) ───
function SidebarItem({ meeting, isSelected, onClick }: { meeting: any; isSelected: boolean; onClick: () => void }) {
    const hasReflection = !!meeting.reflection;
    const isConfirmed = hasReflection && meeting.reflection.mentorConfirmed;

    const contentText = hasReflection
        ? (meeting.reflection.content.startsWith("[") ? blocksToText(meeting.reflection.content) : meeting.reflection.content)
        : "";

    let iconStatus = null;
    if (meeting.status === "scheduled") {
        iconStatus = <Clock className="w-3.5 h-3.5 text-muted-foreground/40" />;
    } else if (!hasReflection) {
        iconStatus = <Clock className="w-3.5 h-3.5 text-amber-500" />;
    } else if (isConfirmed) {
        iconStatus = <Check className="w-3.5 h-3.5 text-emerald-500" />;
    } else {
        iconStatus = <span className="w-2 h-2 rounded-full bg-blue-500 block animate-pulse" />;
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left px-4 py-3 border-b border-border/15 transition-all hover:bg-muted/30 focus:outline-none",
                isSelected && "bg-primary/5 border-l-2 border-l-primary hover:bg-primary/5 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]"
            )}
        >
            <div className="flex items-start gap-3">
                {/* Date badge */}
                <div className={cn(
                    "w-9 h-9 rounded-md flex flex-col items-center justify-center shrink-0 border border-foreground/5",
                    !hasReflection ? "bg-amber-500/10 text-amber-600" : isConfirmed ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"
                )}>
                    <span className="text-[8px] font-bold leading-none uppercase tracking-widest mt-0.5">
                        {meeting.scheduledAt ? formatDate(meeting.scheduledAt, "MMM") : "—"}
                    </span>
                    <span className="text-xs font-bold leading-none mt-0.5">
                        {meeting.scheduledAt ? formatDate(meeting.scheduledAt, "dd") : "—"}
                    </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[36px]">
                    <p className={cn(
                        "text-sm truncate leading-tight",
                        isSelected ? "font-bold text-foreground" : "font-medium text-foreground/80"
                    )}>
                        {meeting.sessionNumber && <span className="text-primary/70 mr-1">Buổi #{meeting.sessionNumber}:</span>}
                        {meeting.title}
                    </p>
                    {hasReflection && (
                        <p className="text-[11px] text-muted-foreground mt-1 truncate max-w-[90%] opacity-80">
                            {contentText}
                        </p>
                    )}
                </div>

                {/* Status indicator */}
                <div className="shrink-0 mt-1">
                    {iconStatus}
                </div>
            </div>
        </button>
    );
}

// ─── Detail View (Mentor View) ───
function MeetingDetail({ meeting, mentee, onConfirm, isLoading }: { meeting: any; mentee: any; onConfirm: any; isLoading: boolean }) {
    const hasReflection = !!meeting.reflection;
    const isConfirmed = hasReflection && meeting.reflection.mentorConfirmed;

    const contentText = hasReflection
        ? (meeting.reflection.content.startsWith("[") ? blocksToText(meeting.reflection.content) : meeting.reflection.content)
        : "";

    return (
        <div className="flex flex-col h-full absolute inset-0">
            {/* Header */}
            <div className="px-8 py-6 border-b border-border/30 bg-muted/5 shrink-0 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="flex items-start justify-between relative z-10">
                    <div className="min-w-0 pr-6">
                        <div className="flex items-center gap-2 mb-2">
                            {meeting.status === "scheduled" ? (
                                <Badge className="bg-background text-muted-foreground border-border text-[10px] px-2 py-0.5 shadow-sm">
                                    <Clock className="w-3 h-3 mr-1" /> Chưa gặp (Đã lên lịch)
                                </Badge>
                            ) : !hasReflection ? (
                                <Badge className="bg-amber-500/10 text-amber-600 border-amber-200/50 text-[10px] px-2 py-0.5 shadow-sm">
                                    <Clock className="w-3 h-3 mr-1" /> Chờ mentee nộp
                                </Badge>
                            ) : isConfirmed ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200/50 text-[10px] px-2 py-0.5 shadow-sm">
                                    <Check className="w-3 h-3 mr-1" /> Đã xác nhận
                                </Badge>
                            ) : (
                                <Badge className="bg-blue-500/10 text-blue-600 border-blue-200/50 text-[10px] px-2 py-0.5 shadow-sm animate-pulse">
                                    <PenLine className="w-3 h-3 mr-1" /> Chờ duyệt
                                </Badge>
                            )}
                            
                            <span className="text-muted-foreground/30">·</span>
                            <span className="text-[12px] text-muted-foreground font-medium flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {meeting.scheduledAt ? formatDate(meeting.scheduledAt, "HH:mm, dd/MM/yyyy") : "Chưa gắn lịch"}
                            </span>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-foreground tracking-tight leading-tight mt-1">
                            {meeting.sessionNumber && <span className="text-primary/70 font-semibold">Buổi #{meeting.sessionNumber}: </span>}
                            {meeting.title}
                        </h2>
                    </div>

                    <div className="shrink-0 flex items-center">
                        {hasReflection && !isConfirmed && (
                            <Button
                                onClick={() => onConfirm(meeting.reflection.id)}
                                disabled={isLoading}
                                className="shadow-md h-10 px-5 gap-2 rounded-xl"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {isLoading ? "Đang xử lý..." : "Xác nhận ngay"}
                            </Button>
                        )}
                        {isConfirmed && (
                            <div className="h-10 px-5 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-600 rounded-xl font-medium border border-emerald-500/20 shadow-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                Đã duyệt
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
                {!hasReflection ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Chưa có bài thu hoạch</h3>
                        <p className="text-sm text-muted-foreground max-w-[300px]">
                            {meeting.status === "scheduled" 
                                ? "Buổi họp này chưa diễn ra nên mentee chưa thể nộp thu hoạch." 
                                : "Buổi họp đã diễn ra nhưng mentee chưa nộp bài thu hoạch lên hệ thống."}
                        </p>
                    </div>
                ) : (
                    <div className="p-8 max-w-4xl mx-auto w-full">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <Avatar src={mentee.avatar} firstName={mentee.firstName} size="sm" className="ring-2 ring-background border border-border" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground leading-none">{mentee.firstName} {mentee.lastName}</p>
                                    <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">Tác giả</p>
                                </div>
                            </div>
                            {meeting.reflection.createdAt && (
                                <p className="text-xs text-muted-foreground/60 font-medium bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors">
                                    Nộp lúc {formatDate(meeting.reflection.createdAt, "HH:mm, dd/MM/yyyy")}
                                </p>
                            )}
                        </div>

                        <div className="prose prose-slate max-w-none text-foreground/90 leading-[1.8] text-[15px]">
                            {meeting.reflection.content.startsWith('[') ? (
                                <div className="space-y-4">
                                    {blocksToText(meeting.reflection.content).split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                                        <p key={i} className="mb-4 text-justify">{line}</p>
                                    ))}
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap">{contentText}</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
