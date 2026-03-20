"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { PenLine, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReflectionTrackerProps {
    reflections: any[];
}

export function ReflectionTracker({ reflections }: ReflectionTrackerProps) {
    // Process mappings for Tabs
    const menteeMap = useMemo(() => {
        const map = new Map<string, { mentee: any; meetings: any[] }>();
        const unassignedMentees: any[] = [];

        for (const meeting of reflections) {
            const mentees = meeting.mentorship?.mentees || [];
            if (mentees.length === 0) {
                unassignedMentees.push(meeting);
            } else {
                for (const { mentee } of mentees) {
                    if (!map.has(mentee.id)) {
                        map.set(mentee.id, { mentee, meetings: [] });
                    }
                    if (!map.get(mentee.id)!.meetings.some(m => m.id === meeting.id)) {
                        map.get(mentee.id)!.meetings.push(meeting);
                    }
                }
            }
        }
        return { map, unassignedMentees };
    }, [reflections]);

    const menteesList = Array.from(menteeMap.map.values());
    const [activeTab, setActiveTab] = useState<string | "all">("all");

    let displayedMeetings = activeTab === "all" ? reflections : menteesList.find(m => m.mentee.id === activeTab)?.meetings || [];

    if (reflections.length === 0) {
        return (
            <Card className="p-6 text-center">
                <PenLine className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Chưa có buổi họp nào để theo dõi thu hoạch.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {menteesList.length > 0 && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-muted/50 p-1 flex-wrap h-auto mb-2">
                        {menteesList.length > 1 && (
                            <TabsTrigger value="all" className="gap-2.5 px-5 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg font-medium">
                                Tất cả
                            </TabsTrigger>
                        )}
                        {menteesList.map(({ mentee }) => (
                            <TabsTrigger 
                                key={mentee.id} 
                                value={mentee.id}
                                className="gap-2.5 px-5 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
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
                </Tabs>
            )}

            <Card className="p-0 overflow-hidden">
                <div className="divide-y divide-border/30 animate-fade-in">
                    {displayedMeetings.slice(0, 8).map((meeting: any) => {
                        const mentees = meeting.mentorship?.mentees || [];
                        const reflectionMap = new Map<string, any>(
                            (meeting.sessionReflections || []).map((r: any) => [r.menteeId, r])
                        );
                        
                        // If we are filtering by mentee, only check that specific mentee's submission status!
                        const relevantMentees = activeTab === "all" ? mentees : mentees.filter((mt: any) => mt.mentee.id === activeTab);
                        
                        if (relevantMentees.length === 0) return null;

                        const submittedCount = relevantMentees.filter((mt: any) => reflectionMap.has(mt.mentee.id)).length;
                        const allSubmitted = submittedCount === relevantMentees.length;
                        const confirmedCount = relevantMentees.filter((mt: any) => reflectionMap.get(mt.mentee.id)?.mentorConfirmed).length;

                        return (
                            <div key={meeting.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                                {/* Date badge - grayscale instead of purple */}
                                <div className="w-9 h-9 rounded-md bg-muted flex flex-col items-center justify-center shrink-0 border border-border">
                                    <span className="text-[8px] font-bold text-muted-foreground leading-none">{formatDate(meeting.scheduledAt, "MMM")}</span>
                                    <span className="text-xs font-bold text-foreground leading-none mt-0.5">{formatDate(meeting.scheduledAt, "dd")}</span>
                                </div>
                                {/* Meeting info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {meeting.sessionNumber && !meeting.title.startsWith("Buổi") ? <span className="font-bold mr-1 text-muted-foreground">Buổi #{meeting.sessionNumber}:</span> : ""}
                                        {meeting.title}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {formatDate(meeting.scheduledAt, "HH:mm")} · {submittedCount}/{relevantMentees.length} đã nộp
                                    </p>
                                </div>
                                {/* Mentee avatars inline */}
                                <div className="flex items-center -space-x-1.5 shrink-0">
                                    {relevantMentees.slice(0, 4).map((mt: any) => {
                                        const ref = reflectionMap.get(mt.mentee.id);
                                        const hasSubmitted = !!ref;
                                        return (
                                            <div key={mt.mentee.id} className={`relative ring-2 ring-background rounded-full ${!hasSubmitted ? 'opacity-40' : ''}`}>
                                                <Avatar
                                                    firstName={mt.mentee.firstName}
                                                    lastName={mt.mentee.lastName}
                                                    src={mt.mentee.avatar}
                                                    size="xs"
                                                />
                                                {ref?.mentorConfirmed && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-background" />
                                                )}
                                            </div>
                                        );
                                    })}
                                    {relevantMentees.length > 4 && (
                                        <span className="text-[10px] text-muted-foreground ml-2">+{relevantMentees.length - 4}</span>
                                    )}
                                </div>
                                {/* Status badge - grayscale adjustments */}
                                <div className="shrink-0">
                                    {allSubmitted ? (
                                        confirmedCount === relevantMentees.length ? (
                                            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10">
                                                <Check className="w-3 h-3" />
                                                Xong
                                            </span>
                                        ) : (
                                            <Badge className="bg-foreground text-background border-border text-[10px] px-1.5 py-0">
                                                Chờ duyệt
                                            </Badge>
                                        )
                                    ) : (
                                        <Badge className="bg-muted text-muted-foreground border-border text-[10px] px-1.5 py-0">
                                            Chờ {relevantMentees.length - submittedCount} bài
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {displayedMeetings.length > 8 && (
                    <div className="border-t border-border/30 px-4 py-2 text-center">
                        <Link href="/reflections" className="text-xs text-foreground font-medium hover:underline">
                            Xem thêm {displayedMeetings.length - 8} buổi →
                        </Link>
                    </div>
                )}
            </Card>
        </div>
    );
}
