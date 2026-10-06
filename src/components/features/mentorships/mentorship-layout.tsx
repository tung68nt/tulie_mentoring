"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Plus, Users, Calendar, User, UsersRound, ChevronRight } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MentorshipLayoutProps {
    mentorships: any[];
}

export function MentorshipLayout({ mentorships }: MentorshipLayoutProps) {
    const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

    // Group mentorships by mentor
    const mentorGroups = useMemo(() => {
        const groups: Record<string, { mentor: any; mentorships: any[] }> = {};
        for (const m of mentorships) {
            const mentorId = m.mentor?.id || "unknown";
            if (!groups[mentorId]) {
                groups[mentorId] = { mentor: m.mentor, mentorships: [] };
            }
            groups[mentorId].mentorships.push(m);
        }
        return Object.values(groups);
    }, [mentorships]);

    const totalMentees = mentorships.reduce((acc: number, m: any) => acc + (m.mentees?.length || 0), 0);

    // Auto-select first mentor
    const activeMentorId = selectedMentorId || mentorGroups[0]?.mentor?.id || null;
    const activeGroup = mentorGroups.find(g => g.mentor?.id === activeMentorId);

    // Split active group's mentorships into 1:1 and 1:n
    const oneOnOne = activeGroup?.mentorships.filter(m => m.mentees?.length <= 1) || [];
    const oneToMany = activeGroup?.mentorships.filter(m => m.mentees?.length > 1) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">Quản lý Mentorship</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {mentorGroups.length} mentor · {mentorships.length} mentorship · {totalMentees} mentee
                    </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/admin/mentorships/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo Mentorship mới
                    </Link>
                </Button>
            </div>

            {mentorships.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-4 border border-border">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Chưa có mentorship nào</h3>
                    <p className="text-muted-foreground max-w-xs mt-1 text-sm">
                        Hãy bắt đầu bằng cách gán mentor cho các mentees.
                    </p>
                    <Button variant="outline" className="mt-6" asChild>
                        <Link href="/admin/mentorships/new">Tạo ngay</Link>
                    </Button>
                </Card>
            ) : (
                <div className="flex gap-6 min-h-[600px]">
                    {/* Sidebar — Mentor List */}
                    <div className="w-[260px] shrink-0 hidden md:flex flex-col border border-border/40 rounded-xl bg-card overflow-hidden">
                        <div className="px-4 py-3 border-b border-border/40 bg-muted/30">
                            <h3 className="text-[13px] font-bold text-foreground">Danh sách Mentor</h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{mentorGroups.length} mentor</p>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-1.5 space-y-0.5">
                                {mentorGroups.map((group) => {
                                    const isSelected = group.mentor?.id === activeMentorId;
                                    const menteeCount = group.mentorships.reduce((acc: number, m: any) => acc + (m.mentees?.length || 0), 0);
                                    const has11 = group.mentorships.some((m: any) => m.mentees?.length <= 1);
                                    const has1n = group.mentorships.some((m: any) => m.mentees?.length > 1);

                                    return (
                                        <button
                                            key={group.mentor?.id || "unknown"}
                                            onClick={() => setSelectedMentorId(group.mentor?.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group",
                                                isSelected
                                                    ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                                                    : "hover:bg-muted/50 text-foreground"
                                            )}
                                        >
                                            <Avatar
                                                firstName={group.mentor?.firstName}
                                                lastName={group.mentor?.lastName}
                                                src={group.mentor?.avatar}
                                                size="sm"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-[13px] font-semibold truncate",
                                                    isSelected ? "text-primary" : "text-foreground"
                                                )}>
                                                    {group.mentor?.firstName} {group.mentor?.lastName}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {group.mentorships.length} MS · {menteeCount} mentee
                                                    </span>
                                                    {has11 && (
                                                        <span className="text-[9px] bg-blue-500/10 text-blue-600 px-1 py-0.5 rounded font-medium">1:1</span>
                                                    )}
                                                    {has1n && (
                                                        <span className="text-[9px] bg-violet-500/10 text-violet-600 px-1 py-0.5 rounded font-medium">1:n</span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className={cn(
                                                "w-3.5 h-3.5 shrink-0 transition-transform",
                                                isSelected ? "text-primary" : "text-muted-foreground/30"
                                            )} />
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Mobile mentor select */}
                    <div className="md:hidden w-full">
                        <select
                            value={activeMentorId || ""}
                            onChange={(e) => setSelectedMentorId(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground mb-4"
                        >
                            {mentorGroups.map((group) => (
                                <option key={group.mentor?.id} value={group.mentor?.id}>
                                    {group.mentor?.firstName} {group.mentor?.lastName} — {group.mentorships.length} MS
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Content — Mentorship Details */}
                    <div className="flex-1 min-w-0 hidden md:block">
                        {activeGroup ? (
                            <div className="space-y-6">
                                {/* Mentor Header */}
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        firstName={activeGroup.mentor?.firstName}
                                        lastName={activeGroup.mentor?.lastName}
                                        src={activeGroup.mentor?.avatar}
                                        size="lg"
                                    />
                                    <div>
                                        <h2 className="text-lg font-bold text-foreground">
                                            {activeGroup.mentor?.firstName} {activeGroup.mentor?.lastName}
                                        </h2>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {activeGroup.mentorships.length} mentorship · {activeGroup.mentorships.reduce((a: number, m: any) => a + (m.mentees?.length || 0), 0)} mentee
                                        </p>
                                    </div>
                                </div>

                                {/* 1:1 Section */}
                                {oneOnOne.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-500" />
                                            <h3 className="text-[13px] font-bold text-foreground">
                                                Cá nhân 1:1
                                            </h3>
                                            <span className="text-[11px] text-muted-foreground bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                                                {oneOnOne.length}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                            {oneOnOne.map((m: any) => (
                                                <MentorshipCard key={m.id} mentorship={m} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 1:n Section */}
                                {oneToMany.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <UsersRound className="w-4 h-4 text-violet-500" />
                                            <h3 className="text-[13px] font-bold text-foreground">
                                                Nhóm 1:n
                                            </h3>
                                            <span className="text-[11px] bg-violet-500/10 text-violet-600 px-1.5 py-0.5 rounded-full font-medium">
                                                {oneToMany.length}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                            {oneToMany.map((m: any) => (
                                                <MentorshipCard key={m.id} mentorship={m} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {oneOnOne.length === 0 && oneToMany.length === 0 && (
                                    <div className="py-12 text-center text-sm text-muted-foreground">
                                        Mentor này chưa có mentorship nào.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                Chọn một mentor từ danh sách bên trái
                            </div>
                        )}
                    </div>

                    {/* Mobile Content */}
                    <div className="md:hidden flex-1 min-w-0">
                        {activeGroup && (
                            <div className="space-y-6">
                                {oneOnOne.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-500" />
                                            <h3 className="text-[13px] font-bold text-foreground">Cá nhân 1:1</h3>
                                            <span className="text-[11px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">{oneOnOne.length}</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {oneOnOne.map((m: any) => (
                                                <MentorshipCard key={m.id} mentorship={m} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {oneToMany.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <UsersRound className="w-4 h-4 text-violet-500" />
                                            <h3 className="text-[13px] font-bold text-foreground">Nhóm 1:n</h3>
                                            <span className="text-[11px] bg-violet-500/10 text-violet-600 px-1.5 py-0.5 rounded-full font-medium">{oneToMany.length}</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {oneToMany.map((m: any) => (
                                                <MentorshipCard key={m.id} mentorship={m} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function MentorshipCard({ mentorship: m }: { mentorship: any }) {
    return (
        <Card hover padding="none" className="overflow-hidden flex flex-col">
            <div className="p-4 flex-1 space-y-3">
                <div className="flex items-center justify-between">
                    <Badge status={m.status} />
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border truncate max-w-[140px]">
                        {m.programCycle?.name || "Program"}
                    </span>
                </div>

                {/* Mentees */}
                <div className="flex items-center gap-3">
                    <AvatarGroup>
                        {m.mentees?.slice(0, 3).map((mt: any) => (
                            <Avatar
                                key={mt.mentee?.id}
                                firstName={mt.mentee?.firstName}
                                lastName={mt.mentee?.lastName}
                                src={mt.mentee?.avatar}
                                size="sm"
                            />
                        ))}
                        {m.mentees?.length > 3 && (
                            <AvatarGroupCount>
                                +{m.mentees.length - 3}
                            </AvatarGroupCount>
                        )}
                    </AvatarGroup>
                    <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-foreground">
                            {m.mentees?.length || 0} Mentee{m.mentees?.length > 1 ? "s" : ""}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                            {m.mentees?.map((mt: any) => mt.mentee?.firstName).join(", ")}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-muted/50 px-4 py-2.5 border-t border-border flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(m.programCycle?.startDate)} - {formatDate(m.programCycle?.endDate)}</span>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                    <Link href={`/admin/mentorships/${m.id}`}>Chi tiết</Link>
                </Button>
            </div>
        </Card>
    );
}
