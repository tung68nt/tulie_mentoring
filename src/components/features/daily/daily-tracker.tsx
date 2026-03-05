"use client";

import { useEffect, useState, useCallback } from "react";
import { format, addDays, subDays, isBefore, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Save, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { ProgramGrid } from "@/components/features/daily/program-grid";
import {
    getDiariesAndHabits,
    toggleHabitLog,
    createHabit,
    deleteHabit,
    updateDailyDiary
} from "@/lib/actions/daily";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

interface ProgramInfo {
    startDate: string;
    endDate: string;
    totalDays: number;
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
    const [submittedDates, setSubmittedDates] = useState<{ date: string; level: number }[]>([]);
    const [deadlines, setDeadlines] = useState<any[]>([]);
    const [programInfo, setProgramInfo] = useState<ProgramInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [newHabitTitle, setNewHabitTitle] = useState("");
    const [isAddingHabit, setIsAddingHabit] = useState(false);

    // Form fields specific to standard theory
    const [diaryGratitude, setDiaryGratitude] = useState("");
    const [diaryFocus, setDiaryFocus] = useState("");
    const [diaryLessons, setDiaryLessons] = useState("");
    const [diaryNotes, setDiaryNotes] = useState("");

    const [diaryMood, setDiaryMood] = useState<string>("neutral");
    const [isSavingDiary, setIsSavingDiary] = useState(false);

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getDiariesAndHabits(dateStr);
            setHabits(data.habits || []);
            setDiary(data.diary || null);
            setSubmittedDates(data.submittedDates || []);
            setDeadlines(data.deadlines || []);
            setProgramInfo(data.programInfo || null);
            setDiaryMood(data.diary?.mood || "neutral");

            const rawContent = data.diary?.content || "";
            try {
                if (rawContent.trim().startsWith('{')) {
                    const parsed = JSON.parse(rawContent);
                    setDiaryGratitude(parsed.gratitude || "");
                    setDiaryFocus(parsed.focus || "");
                    setDiaryLessons(parsed.lessons || "");
                    setDiaryNotes(parsed.notes || "");
                } else {
                    setDiaryGratitude("");
                    setDiaryFocus("");
                    setDiaryLessons("");
                    setDiaryNotes(rawContent);
                }
            } catch {
                setDiaryGratitude("");
                setDiaryFocus("");
                setDiaryLessons("");
                setDiaryNotes(rawContent);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải dữ liệu sổ tay.");
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
            loadData();
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

    const payloadStringified = JSON.stringify({
        gratitude: diaryGratitude,
        focus: diaryFocus,
        lessons: diaryLessons,
        notes: diaryNotes,
    });
    const hasChanges = (diary?.content || JSON.stringify({ gratitude: "", focus: "", lessons: "", notes: "" })) !== payloadStringified || diary?.mood !== diaryMood;

    const handleSaveDiary = async () => {
        setIsSavingDiary(true);
        try {
            await updateDailyDiary(dateStr, payloadStringified, diaryMood);
            await loadData();
            toast.success("Đã lưu ghi chép.");
        } catch (error) {
            toast.error("Lỗi khi lưu ghi chép.");
        } finally {
            setIsSavingDiary(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {!isLoading && programInfo && (
                <Card className="p-6 shadow-none border-border/60 bg-background/50 backdrop-blur-sm">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground no-uppercase">Tiến độ rèn luyện</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5 no-uppercase">
                                    Nhấn vào ô bất kỳ để chuyển ngày. Theo dõi sự kỷ luật qua từng ngày.
                                </p>
                            </div>
                        </div>
                        <ProgramGrid
                            startDate={programInfo.startDate}
                            endDate={programInfo.endDate}
                            submittedDates={submittedDates}
                            deadlines={deadlines}
                            selectedDate={selectedDate}
                            onCellClick={(date) => setSelectedDate(date)}
                        />
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-4 space-y-6">
                    <Card>
                        <CardHeader className="pb-3 px-4 pt-4 border-b border-border/50">
                            <div className="flex items-center justify-between">
                                <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-8 w-8">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                <div className="flex flex-col items-center cursor-pointer hover:bg-accent/50 px-3 py-1 rounded-md transition-colors" onClick={handleToday}>
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

                <div className="xl:col-span-8">
                    <Card className="h-full flex flex-col xl:min-h-[500px]">
                        <CardHeader className="pb-3 border-b border-border/50 bg-muted/10">
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Ghi chép & Bài học</CardTitle>
                                    <CardDescription>Viết daily routine theo chuẩn lý thuyết giúp bạn phát triển bản thân</CardDescription>
                                </div>

                                {!isLoading && (
                                    <div className="flex gap-1 bg-background p-1.5 rounded-xl border border-border/50 shadow-sm">
                                        {MOODS.map(mood => (
                                            <button
                                                key={mood.value}
                                                type="button"
                                                onClick={() => setDiaryMood(mood.value)}
                                                className={`w-9 h-9 flex items-center justify-center rounded-lg text-xl transition-all ${diaryMood === mood.value ? 'bg-primary/10 shadow-sm ring-1 ring-primary/30 scale-110 z-10' : 'opacity-60 grayscale hover:grayscale-0 hover:bg-muted'}`}
                                                title={mood.label}
                                            >
                                                {mood.emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col p-6 space-y-6 bg-card">
                            {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="w-full h-24 rounded-lg" />
                                    <Skeleton className="w-full h-32 rounded-lg" />
                                    <Skeleton className="w-full h-24 rounded-lg" />
                                </div>
                            ) : (
                                <div className="space-y-6 flex-1 flex flex-col">
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span>🙏 Thực hành Lòng biết ơn</span>
                                            <span className="text-xs text-muted-foreground font-normal">Điều khiến bạn cảm thấy trân trọng ngày hôm nay?</span>
                                        </div>
                                        <Textarea
                                            className="resize-none min-h-[80px] bg-background border-border"
                                            placeholder="Ví dụ: Biết ơn vì đã hoàn thành dự án đúng hạn, biết ơn bữa sáng ngon lành..."
                                            value={diaryGratitude}
                                            onChange={(e) => setDiaryGratitude(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span>🎯 Mục tiêu trọng tâm</span>
                                            <span className="text-xs text-muted-foreground font-normal">Việc quan trọng nhất bạn đã làm được?</span>
                                        </div>
                                        <Input
                                            className="resize-none bg-background border-border"
                                            placeholder="Ghi nhận lại ít nhất một thành tựu quan trọng nhất..."
                                            value={diaryFocus}
                                            onChange={(e) => setDiaryFocus(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span>💡 Bài học rút ra</span>
                                            <span className="text-xs text-muted-foreground font-normal">Kinh nghiệm từ những vấp ngã hay trải nghiệm mới?</span>
                                        </div>
                                        <Textarea
                                            className="resize-none min-h-[80px] bg-background border-border"
                                            placeholder="Tôi học được rằng cần phải kiên tâm hơn vào những lúc mệt mỏi..."
                                            value={diaryLessons}
                                            onChange={(e) => setDiaryLessons(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2.5 flex-1 flex flex-col min-h-[120px]">
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span>📝 Ghi chú tự do (Free-writing)</span>
                                            <span className="text-xs text-muted-foreground font-normal">Tâm tư, kế hoạch, ý tưởng sáng tạo...</span>
                                        </div>
                                        <Textarea
                                            className="resize-none flex-1 min-h-[120px] bg-background border-border"
                                            placeholder="Hãy để dòng suy nghĩ của bạn tự do tuôn chảy mà không cần phán xét..."
                                            value={diaryNotes}
                                            onChange={(e) => setDiaryNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex justify-end pt-2 mt-auto border-t border-border/50 border-dashed m-[-24px] px-6 py-4 bg-muted/5 rounded-b-xl">
                                        <Button
                                            onClick={handleSaveDiary}
                                            disabled={isSavingDiary || !hasChanges}
                                            className="min-w-[140px]"
                                            size="lg"
                                        >
                                            {isSavingDiary ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                                    Đang lưu...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Save className="w-5 h-5" />
                                                    Lưu ghi chép
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
