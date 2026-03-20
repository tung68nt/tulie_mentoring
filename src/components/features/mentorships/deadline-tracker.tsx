"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { differenceInDays } from "date-fns";
import { cn, formatDate } from "@/lib/utils";

interface DeadlineTrackerProps {
    mentorships: any[];
}

function SemiCircleGauge({ days, maxDays, colorClass }: { days: number, maxDays: number, colorClass: string }) {
    const percent = maxDays > 0 ? Math.min(100, Math.max(0, (days / maxDays) * 100)) : 0;
    
    // SVG geometry
    const r = 40;
    const cx = 50;
    const cy = 50;
    const strokeWidth = 10;
    
    const circumference = Math.PI * r;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative w-16 h-10 flex flex-col items-center justify-end overflow-visible shrink-0">
            <svg viewBox="0 0 100 55" className="absolute top-0 w-full overflow-visible drop-shadow-sm">
                <path 
                    d={`M 10 50 A ${r} ${r} 0 0 1 90 50`}
                    stroke="currentColor" 
                    strokeWidth={strokeWidth} 
                    fill="none" 
                    strokeLinecap="round" 
                    className="text-muted/60"
                />
                <path 
                    d={`M 10 50 A ${r} ${r} 0 0 1 90 50`}
                    stroke="currentColor" 
                    strokeWidth={strokeWidth} 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={cn("transition-all duration-1000 ease-out", colorClass)}
                />
            </svg>
            <div className="relative z-10 flex flex-col items-center leading-none mt-2">
                <span className="text-lg font-black tracking-tight text-foreground">{days}</span>
                <span className="text-[8px] font-bold uppercase text-muted-foreground">Ngày</span>
            </div>
        </div>
    );
}

function GanttItem({ 
    label, 
    subtitle, 
    itemStart, 
    itemEnd, 
    globalStart, 
    globalEnd,
    barColorClass 
}: { 
    label: string, 
    subtitle?: string, 
    itemStart: Date, 
    itemEnd: Date, 
    globalStart: Date, 
    globalEnd: Date,
    barColorClass?: string 
}) {
    const now = new Date();
    
    const totalMs = globalEnd.getTime() - globalStart.getTime() || 1;
    
    // Clamp values to ensure they fit in the 100% container visually
    const itemStartMs = Math.max(globalStart.getTime(), Math.min(globalEnd.getTime(), itemStart.getTime()));
    const itemEndMs = Math.max(globalStart.getTime(), Math.min(globalEnd.getTime(), itemEnd.getTime()));
    const nowMs = Math.max(globalStart.getTime(), Math.min(globalEnd.getTime(), now.getTime()));

    const leftPercent = ((itemStartMs - globalStart.getTime()) / totalMs) * 100;
    const widthPercent = ((itemEndMs - itemStartMs) / totalMs) * 100;
    const todayPercent = ((nowMs - globalStart.getTime()) / totalMs) * 100;

    const daysLeft = Math.max(0, differenceInDays(itemEnd, now));
    const totalDays = Math.max(1, differenceInDays(itemEnd, itemStart));

    let colorClass = "text-emerald-500";
    if (daysLeft <= 3) {
        colorClass = "text-rose-500";
    } else if (daysLeft <= 7) {
        colorClass = "text-orange-500";
    } else if (daysLeft <= 14) {
        colorClass = "text-amber-400";
    }
    
    // Default fallback for program cycles
    const finalBarColor = barColorClass || "bg-cyan-500";

    return (
        <div className="relative flex items-center gap-6 p-4 rounded-xl border border-border/60 bg-card hover:border-border transition-all">
            <SemiCircleGauge days={daysLeft} maxDays={totalDays} colorClass={colorClass} />

            <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-sm font-semibold truncate text-foreground leading-snug">{label}</h4>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}

                {/* Gantt Track */}
                <div className="relative mt-7 mb-5 h-2 bg-muted/40 rounded-full w-full">
                    {/* The specific item bar */}
                    <div 
                        className={cn("absolute top-0 h-full rounded-full opacity-80 backdrop-blur-sm", finalBarColor)}
                        style={{ left: `${leftPercent}%`, width: `${Math.max(2, widthPercent)}%` }}
                    >
                        {/* Edge Dates Markers inside the bar so they track with it */}
                        <span className="absolute -top-5 left-0 text-[10px] text-muted-foreground font-semibold tabular-nums whitespace-nowrap">
                            {formatDate(itemStart, "dd/MM")}
                        </span>
                        <span className="absolute -top-5 right-0 text-[10px] text-muted-foreground font-semibold tabular-nums whitespace-nowrap">
                            {formatDate(itemEnd, "dd/MM/yyyy")}
                        </span>
                    </div>
                    
                    {/* Today Line */}
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 w-[2px] h-[20px] bg-rose-500 rounded-full z-10 shadow-[0_0_4px_rgba(244,63,94,0.5)]"
                        style={{ left: `${todayPercent}%` }}
                    >
                        <span className="absolute top-[14px] left-1/2 -translate-x-1/2 text-[9px] font-bold text-rose-500 px-1 bg-background rounded-sm whitespace-nowrap">Hôm nay</span>
                    </div>
                </div>
            </div>
            
            {/* Extreme Global bounds visually faintly (optional context) */}
            {/* <div className="absolute top-2 right-2 flex text-[9px] text-muted-foreground/30 gap-1 opacity-50">
                <span>Trục thời gian: {formatDate(globalStart, "dd/MM/yy")} - {formatDate(globalEnd, "dd/MM/yy")}</span>
            </div> */}
        </div>
    );
}

export function DeadlineTracker({ mentorships }: DeadlineTrackerProps) {
    const menteeMap = useMemo(() => {
        const map = new Map<string, { mentee: any; cycles: any[]; goals: any[] }>();

        for (const ms of mentorships) {
            const mentees = ms.mentees || [];
            for (const { mentee } of mentees) {
                if (!map.has(mentee.id)) {
                    map.set(mentee.id, { mentee, cycles: [], goals: [] });
                }
                const entry = map.get(mentee.id)!;
                
                if (ms.programCycle?.startDate && ms.programCycle?.endDate) {
                    if (!entry.cycles.some(c => c.id === ms.programCycle.id)) {
                        entry.cycles.push(ms.programCycle);
                    }
                }
                
                for (const goal of ms.goals || []) {
                    if (goal.createdAt && goal.dueDate) {
                        if (!entry.goals.some(g => g.id === goal.id)) {
                            entry.goals.push({
                                ...goal,
                                programStartDate: ms.programCycle?.startDate || goal.createdAt, // fallback
                                menteeName: `${mentee.firstName} ${mentee.lastName}`
                            });
                        }
                    }
                }
            }
        }
        return map;
    }, [mentorships]);

    const menteesList = Array.from(menteeMap.values());
    const [activeTab, setActiveTab] = useState<string | "all">("all");

    let displayedCycles: any[] = [];
    let displayedGoals: any[] = [];

    if (activeTab === "all") {
        const seenCycles = new Set<string>();
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
    
    displayedGoals.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    if (activeTab === "all") {
        displayedGoals = displayedGoals.slice(0, 6);
    }

    if (displayedCycles.length === 0 && displayedGoals.length === 0) {
        return (
            <div className="py-4 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                Chưa có chương trình hoặc mục tiêu hoạt động
            </div>
        );
    }

    // Compute global timeline based on displayed items
    const allStarts = [
        ...displayedCycles.map(c => new Date(c.startDate).getTime()),
        ...displayedGoals.map(g => new Date(g.programStartDate).getTime()) // align goal's axis to its program cycle start
    ];
    const allEnds = [
        ...displayedCycles.map(c => new Date(c.endDate).getTime()),
        ...displayedGoals.map(g => new Date(g.dueDate).getTime())
    ];

    allStarts.push(Date.now());
    allEnds.push(Date.now() + 86400000 * 30); // At least 30 days buffer end

    const globalStart = new Date(Math.min(...allStarts));
    let globalEnd = new Date(Math.max(...allEnds));

    // Ensure min width
    if (globalEnd.getTime() - globalStart.getTime() < 86400000 * 7) {
        globalEnd = new Date(globalStart.getTime() + 86400000 * 7);
    }

    // Mentee colors
    const menteeColors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"];

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

            <div className="flex flex-col gap-3 animate-fade-in">
                {displayedCycles.map((cycle: any) => (
                    <GanttItem
                        key={`cycle-${cycle.id}`}
                        label={`Dự án/Chương trình: ${cycle.name}`}
                        itemStart={new Date(cycle.startDate)}
                        itemEnd={new Date(cycle.endDate)}
                        globalStart={globalStart}
                        globalEnd={globalEnd}
                        barColorClass="bg-primary/70"
                    />
                ))}
                {displayedGoals.map((goal: any) => {
                    const menteeIndex = menteesList.findIndex(m => m.mentee.id === goal.menteeId) % menteeColors.length;
                    const bColor = menteeIndex >= 0 ? menteeColors[menteeIndex] : "bg-cyan-500";
                    
                    return (
                        <GanttItem
                            key={`goal-${goal.id}`}
                            label={goal.title}
                            subtitle={`Mentee: ${goal.menteeName} — Mục tiêu`}
                            itemStart={new Date(goal.createdAt)}
                            itemEnd={new Date(goal.dueDate)}
                            globalStart={globalStart}
                            globalEnd={globalEnd}
                            barColorClass={bColor}
                        />
                    );
                })}
            </div>
        </div>
    );
}
