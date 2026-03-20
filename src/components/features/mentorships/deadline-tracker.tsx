"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Countdown } from "@/components/ui/fomo-timer";

interface DeadlineTrackerProps {
    mentorships: any[];
}

export function DeadlineTracker({ mentorships }: DeadlineTrackerProps) {
    // Process mappings for Tabs
    const menteeMap = useMemo(() => {
        const map = new Map<string, { mentee: any; cycles: any[]; goals: any[] }>();

        for (const ms of mentorships) {
            const mentees = ms.mentees || [];
            for (const { mentee } of mentees) {
                if (!map.has(mentee.id)) {
                    map.set(mentee.id, { mentee, cycles: [], goals: [] });
                }
                const entry = map.get(mentee.id)!;
                
                // Add unique cycle if exists
                if (ms.programCycle?.endDate) {
                    if (!entry.cycles.some(c => c.id === ms.programCycle.id)) {
                        entry.cycles.push(ms.programCycle);
                    }
                }
                
                // Add goals
                for (const goal of ms.goals || []) {
                    if (!entry.goals.some(g => g.id === goal.id)) {
                        entry.goals.push({
                            ...goal,
                            menteeName: `${mentee.firstName} ${mentee.lastName}`
                        });
                    }
                }
            }
        }
        return map;
    }, [mentorships]);

    const menteesList = Array.from(menteeMap.values());
    const [activeTab, setActiveTab] = useState<string | "all">("all");

    // Gather items to display
    let displayedCycles: any[] = [];
    let displayedGoals: any[] = [];

    if (activeTab === "all") {
        const seenCycles = new Set<string>();
        // Deduplicate globally
        for (const { cycles, goals } of menteesList) {
            for (const c of cycles) {
                if (!seenCycles.has(c.id)) {
                    seenCycles.add(c.id);
                    displayedCycles.push(c);
                }
            }
            displayedGoals.push(...goals);
        }
    } else {
        const activeData = menteesList.find(m => m.mentee.id === activeTab);
        if (activeData) {
            displayedCycles = activeData.cycles;
            displayedGoals = activeData.goals;
        }
    }
    
    // Sort goals by upcoming
    displayedGoals.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    // Limit if we are showing all
    if (activeTab === "all") {
        displayedGoals = displayedGoals.slice(0, 6);
    }

    if (displayedCycles.length === 0 && displayedGoals.length === 0) {
        return (
            <div className="py-4 text-center text-xs text-muted-foreground">
                Chưa có chương trình hoặc mục tiêu hoạt động
            </div>
        );
    }

    // Fixed maxDays for consistent visual scale (180 days ≈ 6 months max scale)
    const fixedMaxDays = 180;

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
                {displayedCycles.map((cycle: any) => (
                    <Countdown
                        key={`cycle-${cycle.id}`}
                        targetDate={cycle.endDate}
                        label={`Thời gian còn lại: ${cycle.name}`}
                        maxDays={Math.max(fixedMaxDays, Math.ceil((new Date(cycle.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                    />
                ))}
                {displayedGoals.map((goal: any) => (
                    <Countdown
                        key={`goal-${goal.id}`}
                        targetDate={goal.dueDate}
                        label={goal.title}
                        subtitle={`Mentee: ${goal.menteeName}`}
                        maxDays={Math.max(fixedMaxDays, Math.ceil((new Date(goal.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                    />
                ))}
            </div>
        </div>
    );
}
