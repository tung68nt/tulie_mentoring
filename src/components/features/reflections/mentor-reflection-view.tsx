"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, cn } from "@/lib/utils";
import { confirmReflection } from "@/lib/actions/reflection";
import { Check, PenLine, ChevronDown, ChevronUp, Search, Clock, Calendar } from "lucide-react";
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
                // Avoid duplicates if a mentee is in multiple mentorships linking to same meetings (unlikely but safe)
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
    const [activeTab, setActiveTab] = useState<string | undefined>(menteesList[0]?.mentee.id);

    // Apply search filter
    const activeMenteeData = menteesList.find(m => m.mentee.id === activeTab);
    const filteredMeetings = activeMenteeData?.meetings.filter(m => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return m.title.toLowerCase().includes(q) || 
               (m.reflection?.content && m.reflection.content.toLowerCase().includes(q));
    }) || [];

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
        <div className="space-y-6">
            {/* Mentee Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

                    {/* Search inside the active tab */}
                    <div className="relative w-full sm:w-64 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                        <Input
                            placeholder="Tìm buổi họp hoặc nội dung..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 h-9 text-sm bg-background border-border focus:border-primary shadow-sm rounded-lg"
                        />
                    </div>
                </div>

                {menteesList.map(({ mentee }) => (
                    <TabsContent key={mentee.id} value={mentee.id} className="mt-0 outline-none">
                        {filteredMeetings.length === 0 ? (
                            <Card className="p-10 text-center bg-muted/20 border-border/40 border-dashed">
                                <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">
                                    {search ? "Không tìm thấy buổi họp nào khớp với tìm kiếm." : "Mentee này chưa có buổi họp nào."}
                                </p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {filteredMeetings.map(meeting => (
                                    <MeetingReflectionCard 
                                        key={meeting.id} 
                                        meeting={meeting} 
                                        onConfirm={handleConfirm} 
                                        isLoading={isLoading === meeting.reflection?.id} 
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

function MeetingReflectionCard({ 
    meeting, 
    onConfirm, 
    isLoading 
}: { 
    meeting: any; 
    onConfirm: (id: string) => void; 
    isLoading: boolean; 
}) {
    const [expanded, setExpanded] = useState(false);
    const hasReflection = !!meeting.reflection;
    const isConfirmed = hasReflection && meeting.reflection.mentorConfirmed;

    const contentText = hasReflection
        ? (meeting.reflection.content.startsWith("[") ? blocksToText(meeting.reflection.content) : meeting.reflection.content)
        : "";

    // Determine status badge
    let StatusBadge = null;
    if (meeting.status === "scheduled") {
        StatusBadge = (
            <Badge variant="outline" className="bg-background text-muted-foreground font-medium">
                <Clock className="w-3 h-3 mr-1" />
                Chưa gặp (Đã lên lịch)
            </Badge>
        );
    } else if (!hasReflection) {
        StatusBadge = (
            <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/20 font-medium">
                <Clock className="w-3 h-3 mr-1" />
                Chờ Mentee nộp
            </Badge>
        );
    } else if (isConfirmed) {
        StatusBadge = (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-medium">
                <Check className="w-3 h-3 mr-1" />
                Đã xác nhận
            </Badge>
        );
    } else {
        StatusBadge = (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 font-medium animate-pulse">
                <PenLine className="w-3 h-3 mr-1" />
                Chờ Mentor xác nhận
            </Badge>
        );
    }

    return (
        <Card className={cn(
            "overflow-hidden transition-all duration-200 border-border/60",
            expanded ? "ring-1 ring-primary/20 shadow-md" : "hover:border-foreground/20 hover:shadow-sm"
        )}>
            {/* Header: Click to expand if reflection exists */}
            <div 
                onClick={() => hasReflection && setExpanded(!expanded)}
                className={cn(
                    "flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4",
                    hasReflection ? "cursor-pointer hover:bg-muted/10" : "bg-muted/5 opacity-80"
                )}
            >
                {/* Date Icon */}
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex flex-col items-center justify-center shrink-0 border border-purple-500/20">
                    <span className="text-[10px] font-bold text-purple-600 leading-none uppercase tracking-wider">
                        {meeting.scheduledAt ? formatDate(meeting.scheduledAt, "MMM") : "—"}
                    </span>
                    <span className="text-lg font-black text-purple-600 leading-none mt-0.5">
                        {meeting.scheduledAt ? formatDate(meeting.scheduledAt, "dd") : "—"}
                    </span>
                </div>

                {/* Meeting Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-semibold text-foreground truncate">{meeting.title}</h4>
                        {StatusBadge}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {meeting.scheduledAt ? formatDate(meeting.scheduledAt, "HH:mm, dd/MM/yyyy") : "Chưa rõ thời gian"}
                    </p>
                    
                    {/* Snippet if not expanded */}
                    {hasReflection && !expanded && (
                        <p className="text-sm text-muted-foreground/80 line-clamp-1 mt-2 pl-3 border-l-2 border-primary/30 italic">
                            "{contentText.substring(0, 100)}{contentText.length > 100 ? "..." : ""}"
                        </p>
                    )}
                </div>

                {/* Action / Chevron */}
                <div className="flex items-center gap-3 shrink-0 mt-3 sm:mt-0">
                    {hasReflection && !isConfirmed && (
                        <Button
                            size="sm"
                            className="h-8 gap-1.5 shadow-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onConfirm(meeting.reflection.id);
                            }}
                            disabled={isLoading}
                        >
                            <Check className="w-3.5 h-3.5" />
                            Xác nhận ngay
                        </Button>
                    )}
                    
                    {hasReflection && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/40 text-muted-foreground">
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && hasReflection && (
                <div className="px-5 pb-5 pt-2 border-t border-border/40 bg-muted/5 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="rounded-xl bg-background border border-border/50 p-5 mt-4 shadow-sm">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
                            <div className="flex items-center gap-2">
                                <PenLine className="w-4 h-4 text-primary" />
                                <span className="text-xs font-bold text-foreground uppercase tracking-wider">Nội dung thu hoạch</span>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                                Nộp lúc {formatDate(meeting.reflection.createdAt, "HH:mm dd/MM/yyyy")}
                            </span>
                        </div>
                        <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed max-w-none">
                            {contentText || <span className="text-muted-foreground italic">Trống...</span>}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
