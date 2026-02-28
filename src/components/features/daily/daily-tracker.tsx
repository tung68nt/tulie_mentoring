"use client";

import { useEffect, useState, useCallback } from "react";
import { format, addDays, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Save, Plus, Trash2, CheckCircle2 } from "lucide-react";
import {
    getDiariesAndHabits,
    toggleHabitLog,
    createHabit,
    deleteHabit,
    updateDailyDiary
} from "@/lib/actions/daily";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Habit {
    id: string;
    title: string;
    logs: HabitLog[];
}

interface HabitLog {
    id: string;
    completed: boolean;
    date: Date;
}

interface DailyDiary {
    id: string;
    content: string;
    mood: string | null;
}

const MOODS = [
    { value: "great", label: "Rất vui", emoji: "😁" },
    { value: "good", label: "Tốt", emoji: "🙂" },
    { value: "neutral", label: "Bình thường", emoji: "😐" },
    { value: "bad", label: "Tệ", emoji: "😟" },
    { value: "terrible", label: "Rất tệ", emoji: "😭" },
];

export function DailyTracker() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [habits, setHabits] = useState<Habit[]>([]);
    const [diary, setDiary] = useState<DailyDiary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form states
    const [newHabitTitle, setNewHabitTitle] = useState("");
    const [isAddingHabit, setIsAddingHabit] = useState(false);

    const [diaryContent, setDiaryContent] = useState("");
    const [diaryMood, setDiaryMood] = useState<string>("neutral");
    const [isSavingDiary, setIsSavingDiary] = useState(false);

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getDiariesAndHabits(dateStr);
            setHabits(data.habits || []);
            setDiary(data.diary || null);
            setDiaryContent(data.diary?.content || "");
            setDiaryMood(data.diary?.mood || "neutral");
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải dữ liệu nhật ký.");
        } finally {
            setIsLoading(false);
        }
    }, [dateStr]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
    const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
    const handleToday = () => setSelectedDate(new Date());

    const handleToggleHabit = async (habitId: string, currentStatus: boolean) => {
        try {
            // Optimistic UI update
            setHabits(prev => prev.map(h => {
                if (h.id === habitId) {
                    const hasLog = h.logs.length > 0;
                    const newLogs = hasLog
                        ? [{ ...h.logs[0], completed: !currentStatus }]
                        : [{ id: 'temp', completed: !currentStatus, date: new Date() }];
                    return { ...h, logs: newLogs };
                }
                return h;
            }));

            await toggleHabitLog(habitId, dateStr, !currentStatus);
        } catch (error) {
            toast.error("Không thể cập nhật thói quen.");
            loadData(); // Revert on error
        }
    };

    const handleAddHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabitTitle.trim()) return;

        setIsAddingHabit(true);
        try {
            await createHabit(newHabitTitle.trim());
            setNewHabitTitle("");
            await loadData();
            toast.success("Đã thêm thói quen mới.");
        } catch (error) {
            toast.error("Lỗi khi thêm thói quen.");
        } finally {
            setIsAddingHabit(false);
        }
    };

    const handleDeleteHabit = async (habitId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa thói quen này?")) return;

        try {
            await deleteHabit(habitId);
            await loadData();
            toast.success("Đã xóa thói quen.");
        } catch (error) {
            toast.error("Lỗi khi xóa thói quen.");
        }
    };

    const handleSaveDiary = async () => {
        setIsSavingDiary(true);
        try {
            await updateDailyDiary(dateStr, diaryContent, diaryMood);
            await loadData();
            toast.success("Đã lưu nhật ký.");
        } catch (error) {
            toast.error("Lỗi khi lưu nhật ký.");
        } finally {
            setIsSavingDiary(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Calendar Header & Habits */}
            <div className="md:col-span-1 space-y-6">
                <Card>
                    <CardHeader className="pb-3 px-4 pt-4 border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-8 w-8">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <div className="flex flex-col items-center cursor-pointer" onClick={handleToday}>
                                <span className="text-sm font-medium text-foreground">
                                    {format(selectedDate, "EEEE, dd/MM", { locale: vi })}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {format(selectedDate, "yyyy")}
                                </span>
                            </div>

                            <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-8 w-8">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                Theo dõi thói quen
                            </h3>
                        </div>

                        {isLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-10 w-full rounded-md" />
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                        ) : habits.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                                Chưa có thói quen nào.<br />Hãy tạo thói quen mới ở dưới.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {habits.map(habit => {
                                    const isCompleted = habit.logs?.[0]?.completed || false;
                                    return (
                                        <div key={habit.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors group">
                                            <label className="flex items-center gap-3 cursor-pointer flex-1">
                                                <input
                                                    type="checkbox"
                                                    checked={isCompleted}
                                                    onChange={() => handleToggleHabit(habit.id, isCompleted)}
                                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
                                                />
                                                <span className={`text-sm ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                    {habit.title}
                                                </span>
                                            </label>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="w-6 h-6 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteHabit(habit.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <form onSubmit={handleAddHabit} className="flex items-center gap-2 pt-2 border-t border-border/50">
                            <Input
                                placeholder="Thêm thói quen..."
                                value={newHabitTitle}
                                onChange={(e) => setNewHabitTitle(e.target.value)}
                                className="h-9 text-sm"
                            />
                            <Button type="submit" size="sm" disabled={isAddingHabit || !newHabitTitle.trim()}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Diary */}
            <div className="md:col-span-2">
                <Card className="h-full flex flex-col">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Tâm sự & Ghi chú</CardTitle>
                                <CardDescription>Bạn cảm thấy thế nào trong ngày hôm nay?</CardDescription>
                            </div>

                            {/* Mood selector */}
                            {!isLoading && (
                                <div className="flex gap-1 bg-muted/30 p-1 rounded-lg">
                                    {MOODS.map(mood => (
                                        <button
                                            key={mood.value}
                                            type="button"
                                            onClick={() => setDiaryMood(mood.value)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-md text-lg transition-transform hover:scale-110 ${diaryMood === mood.value ? 'bg-background shadow-sm ring-1 ring-border/50' : 'opacity-60 grayscale'}`}
                                            title={mood.label}
                                        >
                                            {mood.emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col p-6 pt-0 space-y-4">
                        {isLoading ? (
                            <Skeleton className="w-full flex-1 min-h-[300px] rounded-lg" />
                        ) : (
                            <>
                                <Textarea
                                    className="flex-1 min-h-[300px] resize-none border-border/50 bg-muted/10 p-4 leading-relaxed focus-visible:ring-1 focus-visible:ring-primary/30"
                                    placeholder="Viết những suy nghĩ, cảm xúc hay sự kiện diễn ra trong ngày..."
                                    value={diaryContent}
                                    onChange={(e) => setDiaryContent(e.target.value)}
                                />
                                <div className="flex justify-end pt-2">
                                    <Button
                                        onClick={handleSaveDiary}
                                        disabled={isSavingDiary || (diary?.content === diaryContent && diary?.mood === diaryMood)}
                                        className="min-w-[120px]"
                                    >
                                        {isSavingDiary ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                                Đang lưu...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                Lưu nhật ký
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
