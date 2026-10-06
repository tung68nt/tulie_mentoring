"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
    Users,
    Search,
    Compass,
    Sparkles,
    Phone,
    ExternalLink,
    Github,
    Linkedin,
    Target,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { DISC_TRAITS } from "@/lib/disc-questions";
import { ImpersonateButton } from "@/components/features/admin/impersonate-button";

interface MenteeItem {
    id: string;
    mentorshipId: string;
    programName?: string;
    mentorName?: string;
    status: string;
    mentee: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
        phone: string | null;
        avatar: string | null;
        menteeProfile?: {
            id: string;
            major?: string | null;
            year?: number | null;
            age?: number | null;
            zalo?: string | null;
            telegram?: string | null;
            facebookUrl?: string | null;
            linkedinUrl?: string | null;
            githubUrl?: string | null;
            portraitPhoto?: string | null;
            personalityType?: string | null;
            personalityScores?: string | null;
            strengths?: string | null;
            weaknesses?: string | null;
            careerGoals?: string | null;
            expectations?: string | null;
            personalNeeds?: string | null;
            isOnboardingComplete?: boolean;
        } | null;
    };
}

interface JuniorMenteeMatrixProps {
    mentees: MenteeItem[];
    role: string;
}

export function JuniorMenteeMatrix({ mentees, role }: JuniorMenteeMatrixProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDisc, setSelectedDisc] = useState<string>("all");
    const [filterOnboarding, setFilterOnboarding] = useState<string>("all");

    // Tính toán phân bố DISC
    const discCounts: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 };
    let completedOnboardingCount = 0;

    mentees.forEach((m) => {
        const type = m.mentee.menteeProfile?.personalityType;
        if (type && discCounts[type] !== undefined) {
            discCounts[type]++;
        }
        if (m.mentee.menteeProfile?.isOnboardingComplete) {
            completedOnboardingCount++;
        }
    });

    const filteredMentees = mentees.filter((m) => {
        const profile = m.mentee.menteeProfile;
        const fullName = `${m.mentee.firstName || ""} ${m.mentee.lastName || ""}`.toLowerCase();
        const major = (profile?.major || "").toLowerCase();
        const searchMatch = fullName.includes(searchTerm.toLowerCase()) || major.includes(searchTerm.toLowerCase());

        const discMatch = selectedDisc === "all" || profile?.personalityType === selectedDisc;
        const onboardingMatch =
            filterOnboarding === "all" ||
            (filterOnboarding === "completed" && profile?.isOnboardingComplete) ||
            (filterOnboarding === "pending" && !profile?.isOnboardingComplete);

        return searchMatch && discMatch && onboardingMatch;
    });

    return (
        <div className="space-y-6">
            {/* Header KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-4 border-border bg-card">
                    <p className="text-xs text-muted-foreground font-medium">Tổng số Mentee</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{mentees.length}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">2 nhóm Junior</p>
                </Card>

                <Card className="p-4 border-border bg-card">
                    <p className="text-xs text-muted-foreground font-medium">Đã hoàn tất khảo sát</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                        {completedOnboardingCount}/{mentees.length}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                        {mentees.length > 0 ? Math.round((completedOnboardingCount / mentees.length) * 100) : 0}% hoàn thành
                    </p>
                </Card>

                <Card className="p-4 border-border bg-card col-span-2">
                    <p className="text-xs text-muted-foreground font-medium mb-1.5">Phân bổ phong cách làm việc DISC</p>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                        <div className="p-1.5 rounded-lg bg-red-500/10 text-red-600 font-semibold border border-red-200/50 dark:border-red-900/40">
                            D: {discCounts.D}
                        </div>
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 font-semibold border border-amber-200/50 dark:border-amber-900/40">
                            I: {discCounts.I}
                        </div>
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-200/50 dark:border-emerald-900/40">
                            S: {discCounts.S}
                        </div>
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 font-semibold border border-blue-200/50 dark:border-blue-900/40">
                            C: {discCounts.C}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl border border-border">
                <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên, ngành học..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 text-xs h-9"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* DISC Selector */}
                    <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border text-xs">
                        {["all", "D", "I", "S", "C"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setSelectedDisc(t)}
                                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                                    selectedDisc === t
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {t === "all" ? "Tất cả DISC" : `Nhóm ${t}`}
                            </button>
                        ))}
                    </div>

                    {/* Onboarding Status Selector */}
                    <select
                        value={filterOnboarding}
                        onChange={(e) => setFilterOnboarding(e.target.value)}
                        className="h-9 px-3 text-xs rounded-lg border border-input bg-background text-foreground"
                    >
                        <option value="all">Tất cả khảo sát</option>
                        <option value="completed">Đã xong khảo sát</option>
                        <option value="pending">Chưa xong khảo sát</option>
                    </select>
                </div>
            </div>

            {/* Mentee Cards Grid */}
            {filteredMentees.length === 0 ? (
                <div className="p-16 text-center bg-muted/20 rounded-xl border border-dashed border-border">
                    <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-xs font-medium text-muted-foreground">Không tìm thấy mentee nào phù hợp với bộ lọc.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMentees.map((m) => {
                        const profile = m.mentee.menteeProfile;
                        const discType = profile?.personalityType as ("D" | "I" | "S" | "C" | undefined);
                        const discInfo = discType && DISC_TRAITS[discType] ? DISC_TRAITS[discType] : null;

                        return (
                            <Card
                                key={m.id}
                                className="p-5 border-border bg-card flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all shadow-xs"
                            >
                                <div className="space-y-3">
                                    {/* Header avatar & DISC badge */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Avatar
                                                    firstName={m.mentee.firstName || undefined}
                                                    lastName={m.mentee.lastName || undefined}
                                                    src={profile?.portraitPhoto || m.mentee.avatar || undefined}
                                                    size="md"
                                                    className="border-2 border-border"
                                                />
                                                {profile?.isOnboardingComplete && (
                                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]" title="Đã hoàn thành khảo sát">
                                                        ✓
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-foreground leading-tight">
                                                    {m.mentee.firstName} {m.mentee.lastName}
                                                </h3>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    {profile?.major || "Chưa có ngành"} {profile?.age ? `• ${profile.age} tuổi` : ""}
                                                </p>
                                            </div>
                                        </div>

                                        {discInfo ? (
                                            <Badge className={`text-[10px] ${discInfo.badgeColor}`}>
                                                DISC: {discType}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                                Chưa test
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Điểm mạnh & Điểm yếu */}
                                    <div className="space-y-1.5 pt-1 text-xs">
                                        {profile?.strengths && (
                                            <div className="bg-muted/30 p-2 rounded-lg space-y-0.5">
                                                <span className="text-[10px] font-semibold text-emerald-600 block">Thế mạnh:</span>
                                                <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                                                    {profile.strengths}
                                                </p>
                                            </div>
                                        )}

                                        {profile?.weaknesses && (
                                            <div className="bg-muted/20 p-2 rounded-lg space-y-0.5">
                                                <span className="text-[10px] font-semibold text-amber-600 block">Cần cải thiện:</span>
                                                <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                                                    {profile.weaknesses}
                                                </p>
                                            </div>
                                        )}

                                        {profile?.personalNeeds && (
                                            <div className="bg-primary/5 p-2 rounded-lg border border-primary/10 space-y-0.5">
                                                <span className="text-[10px] font-semibold text-primary block">Nhu cầu cá nhân:</span>
                                                <p className="text-foreground text-[11px] line-clamp-2 leading-relaxed">
                                                    {profile.personalNeeds}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Social & Contact footer */}
                                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        {(profile?.zalo || m.mentee.phone) && (
                                            <a
                                                href={`tel:${m.mentee.phone || profile?.zalo}`}
                                                title="Gọi điện / Zalo"
                                                className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
                                            >
                                                <Phone className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                        {profile?.facebookUrl && (
                                            <a
                                                href={profile.facebookUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="Facebook"
                                                className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                        {profile?.githubUrl && (
                                            <a
                                                href={profile.githubUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="GitHub"
                                                className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
                                            >
                                                <Github className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                        {profile?.linkedinUrl && (
                                            <a
                                                href={profile.linkedinUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="LinkedIn"
                                                className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
                                            >
                                                <Linkedin className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {["admin", "program_manager"].includes(role) && (
                                            <ImpersonateButton
                                                targetUserId={m.mentee.id}
                                                targetName={`${m.mentee.firstName} ${m.mentee.lastName}`}
                                                compact
                                            />
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="text-xs h-7 px-2.5 font-medium"
                                        >
                                            <Link href={role === "mentor" ? `/mentees/${m.mentorshipId}` : `/admin/mentorships/${m.mentorshipId}`}>
                                                Hồ sơ
                                                <ChevronRight className="w-3 h-3 ml-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
