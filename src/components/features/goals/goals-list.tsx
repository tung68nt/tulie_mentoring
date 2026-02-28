/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus } from "lucide-react";
import { GoalCard } from "@/components/features/goals/goal-card";
import { GoalForm } from "@/components/features/goals/goal-form";


interface GoalsListProps {
    mentorships: any[];
    allGoals: any[];
    userRole: string;
}

export function GoalsList({ mentorships, allGoals, userRole }: GoalsListProps) {
    const [showFormFor, setShowFormFor] = useState<string | null>(null);

    if (mentorships.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-6 border border-border">
                    <Target className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Chưa có mục tiêu nào</h3>
                <p className="text-muted-foreground max-w-sm mt-2 font-medium text-sm">
                    Mục tiêu sẽ được thiết lập sau khi bạn tham gia vào một chương trình Mentoring.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            {mentorships.map(mentorship => {
                const mentorshipGoals = allGoals.filter(g => g.mentorshipId === mentorship.id);
                const isFormOpen = showFormFor === mentorship.id;

                return (
                    <div key={mentorship.id} className="space-y-6">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">
                                        {mentorship.programCycle.name} - {mentorship.mentor.firstName} {mentorship.mentor.lastName} ➔ {mentorship.mentees.map((m: any) => `${m.mentee.firstName} ${m.mentee.lastName}`).join(", ")}
                                    </h2>
                                    <p className="text-[10px] text-muted-foreground/60 font-semibold">{mentorshipGoals.length} mục tiêu</p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                className="h-10 px-5 rounded-xl font-medium"
                                variant={isFormOpen ? "outline" : undefined}
                                onClick={() => setShowFormFor(isFormOpen ? null : mentorship.id)}
                            >
                                {isFormOpen ? (
                                    "Đóng"
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm mục tiêu
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Inline GoalForm */}
                        {isFormOpen && (
                            <div className="animate-fade-in max-w-xl">
                                <GoalForm
                                    mentorshipId={mentorship.id}
                                    onSuccess={() => setShowFormFor(null)}
                                    onCancel={() => setShowFormFor(null)}
                                />
                            </div>
                        )}

                        {mentorshipGoals.length === 0 && !isFormOpen ? (
                            <div
                                className="p-10 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-foreground/20 transition-colors"
                                onClick={() => setShowFormFor(mentorship.id)}
                            >
                                <Plus className="w-8 h-8 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">Chưa có mục tiêu nào. Nhấn để thêm.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {mentorshipGoals.map(goal => (
                                    <GoalCard key={goal.id} goal={goal} userRole={userRole} />
                                ))}
                                {!isFormOpen && (
                                    <div
                                        className="border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center group hover:border-foreground/20 hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => setShowFormFor(mentorship.id)}
                                    >
                                        <Plus className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors mr-2" />
                                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Thêm mục tiêu mới</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
