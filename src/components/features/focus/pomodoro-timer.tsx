"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Leaf, Wind, Waves, Coffee, Music, Sparkles, Settings2, Plus, Minus, Check, Youtube, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const SOUNDS = [
    { id: "rain", label: "Mưa rơi", icon: Waves, url: "/sounds/rain.mp3" },
    { id: "wind", label: "Gió thổi", icon: Wind, url: "/sounds/wind.mp3" },
    { id: "forest", label: "Rừng xanh", icon: Leaf, url: "/sounds/forest.mp3" },
    { id: "clock", label: "Kim đồng hồ", icon: Timer, url: "/sounds/clock.mp3" },
];

const AMBIANCE_MUSICS = [
    { id: "lofi", label: "Lofi Study", icon: Music, url: "/sounds/lofi.mp3" },
    { id: "coffee", label: "Coffee Shop", icon: Coffee, url: "/sounds/coffee.mp3" },
    { id: "zen", label: "Zen Space", icon: Sparkles, url: "/sounds/zen.mp3" },
];

/* ── Breathing Gradient Component ── */
function BreathingGradient({ isActive }: { isActive: boolean }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            {/* Outer soft glow */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 340,
                    height: 340,
                    background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 50%, transparent 70%)",
                }}
                animate={isActive ? {
                    scale: [1, 1.15, 1],
                    opacity: [0.5, 1, 0.5],
                } : { scale: 1, opacity: 0.3 }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            {/* Inner concentrated glow */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 180,
                    height: 180,
                    background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 50%, transparent 70%)",
                }}
                animate={isActive ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6],
                } : { scale: 1, opacity: 0.25 }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3,
                }}
            />
        </div>
    );
}

export function PomodoroTimer() {
    // Configurable state
    const [focusMinutes, setFocusMinutes] = useState(25);
    const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
    const [longBreakMinutes, setLongBreakMinutes] = useState(15);
    const [targetCycles, setTargetCycles] = useState(4);
    const [longBreakInterval, setLongBreakInterval] = useState(4);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<"focus" | "short" | "long">("focus");

    // Session state
    const [cycleCount, setCycleCount] = useState(0);
    const [autoStart, setAutoStart] = useState(true);

    // UI state
    const [notes, setNotes] = useState("");
    const [activeSound, setActiveSound] = useState<string | null>(null);
    const [activeMusic, setActiveMusic] = useState<string | null>(null);
    const [ytLink, setYtLink] = useState("");
    const [ytVideoId, setYtVideoId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const musicRef = useRef<HTMLAudioElement | null>(null);

    const handleAddYt = () => {
        const match = ytLink.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
        if (match) {
            setYtVideoId(match[1]);
            toast.success("Đã nạp nhạc từ YouTube thành công.");
            if (activeMusic) { musicRef.current?.pause(); setActiveMusic(null); }
        } else {
            toast.error("Link YouTube không hợp lệ.");
        }
    };

    useEffect(() => {
        if (!isActive) {
            if (mode === "focus") setTimeLeft(focusMinutes * 60);
            else if (mode === "short") setTimeLeft(shortBreakMinutes * 60);
            else setTimeLeft(longBreakMinutes * 60);
        }
    }, [focusMinutes, shortBreakMinutes, longBreakMinutes, mode, isActive]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (timeLeft === 0 && isActive) {
            handleSessionEnd();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleSessionEnd = () => {
        setIsActive(false);
        new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play().catch(() => { });

        if (mode === "focus") {
            const nextCycles = cycleCount + 1;
            setCycleCount(nextCycles);
            if (nextCycles >= targetCycles) {
                toast.success("Tuyệt vời! Bạn đã hoàn thành trọn bộ phiên làm việc.");
                setCycleCount(0);
                switchMode("focus");
            } else {
                if (nextCycles % longBreakInterval === 0) {
                    toast.info("Giai đoạn tập trung dài! Hãy nghỉ ngơi thật lâu thôi.");
                    switchMode("long");
                } else {
                    toast.info("Xong một hiệp! Nghỉ xả hơi một chút.");
                    switchMode("short");
                }
                if (autoStart) setTimeout(() => setIsActive(true), 1500);
            }
        } else {
            toast.info("Đã đến lúc quay lại nhịp độ công việc!");
            switchMode("focus");
            if (autoStart) setTimeout(() => setIsActive(true), 1500);
        }
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === "focus" ? focusMinutes * 60 : mode === "short" ? shortBreakMinutes * 60 : longBreakMinutes * 60);
    };

    const switchMode = (newMode: "focus" | "short" | "long") => {
        setMode(newMode);
        setIsActive(false);
        if (newMode === "focus") setTimeLeft(focusMinutes * 60);
        else if (newMode === "short") setTimeLeft(shortBreakMinutes * 60);
        else setTimeLeft(longBreakMinutes * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const totalSeconds = mode === "focus" ? focusMinutes * 60 : mode === "short" ? shortBreakMinutes * 60 : longBreakMinutes * 60;
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

    const toggleSound = (url: string, id: string) => {
        if (activeSound === id) { audioRef.current?.pause(); setActiveSound(null); }
        else {
            if (audioRef.current) audioRef.current.pause();
            audioRef.current = new Audio(url);
            audioRef.current.loop = true;
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(err => {
                if (err.name === "NotAllowedError") toast.error("Vui lòng tương tác với trang để bật âm thanh.");
            });
            setActiveSound(id);
        }
    };

    const toggleMusic = (url: string, id: string) => {
        if (ytVideoId) setYtVideoId(null);
        if (activeMusic === id) { musicRef.current?.pause(); setActiveMusic(null); }
        else {
            if (musicRef.current) musicRef.current.pause();
            musicRef.current = new Audio(url);
            musicRef.current.loop = true;
            musicRef.current.volume = 0.6;
            musicRef.current.play().catch(err => {
                if (err.name === "NotAllowedError") toast.error("Vui lòng tương tác với trang để bật nhạc.");
            });
            setActiveMusic(id);
        }
    };

    return (
        <div className="max-w-[1240px] mx-auto animate-in fade-in duration-700 pb-16">
            {/* YouTube Player - Hidden */}
            {ytVideoId && (
                <div className="sr-only">
                    <iframe width="1" height="1" src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&loop=1&playlist=${ytVideoId}`} allow="autoplay" />
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="space-y-1">
                    <h1 className="text-[18px] font-bold text-foreground tracking-tight">Không gian tập trung</h1>
                    <p className="text-[12px] text-muted-foreground/60 font-medium">Tìm lại trạng thái tập trung tuyệt đối của bạn.</p>
                </div>

                {/* Session Progress */}
                <div className="flex items-center gap-4 bg-background rounded-xl border border-border/40 px-5 py-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground/40">Tiến độ phiên</span>
                        <span className="text-[13px] font-bold text-foreground tabular-nums">{cycleCount}/{targetCycles} hiệp</span>
                    </div>
                    <div className="flex gap-1.5">
                        {Array.from({ length: targetCycles }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-2.5 h-2.5 rounded-full transition-all duration-500",
                                    i < cycleCount ? "bg-emerald-500" : "bg-muted-foreground/10"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">

                {/* Left: Control Panel */}
                <div className="md:col-span-3 flex flex-col gap-5">
                    <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-6 flex-1">

                        {/* Nature Sounds */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-muted-foreground/40 px-1">Âm thanh tự nhiên</p>
                            <div className="space-y-1.5">
                                {SOUNDS.map((sound) => {
                                    const Icon = sound.icon;
                                    const isSelected = activeSound === sound.id;
                                    return (
                                        <button
                                            key={sound.id}
                                            onClick={() => toggleSound(sound.url, sound.id)}
                                            className={cn(
                                                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all border text-left",
                                                isSelected
                                                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
                                                    : "bg-transparent border-transparent hover:bg-muted/30 text-muted-foreground/70"
                                            )}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            <span className="text-[12px] font-bold flex-1">{sound.label}</span>
                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Music */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-muted-foreground/40 px-1">Giai điệu thư giãn</p>
                            <div className="space-y-1.5">
                                {AMBIANCE_MUSICS.map((music) => {
                                    const Icon = music.icon;
                                    const isSelected = activeMusic === music.id;
                                    return (
                                        <button
                                            key={music.id}
                                            onClick={() => toggleMusic(music.url, music.id)}
                                            className={cn(
                                                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all border text-left",
                                                isSelected
                                                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
                                                    : "bg-transparent border-transparent hover:bg-muted/30 text-muted-foreground/70"
                                            )}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            <span className="text-[12px] font-bold flex-1">{music.label}</span>
                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* YouTube */}
                        <div className="pt-4 border-t border-border/20 space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <p className="text-[10px] font-bold text-muted-foreground/40">YouTube Music</p>
                                {ytVideoId && <button onClick={() => setYtVideoId(null)} className="text-[9px] text-destructive font-bold hover:underline">Tắt</button>}
                            </div>
                            <div className="relative group">
                                <Youtube className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30 group-focus-within:text-red-500 transition-colors" />
                                <Input
                                    placeholder="Dán link bài hát..."
                                    value={ytLink}
                                    onChange={(e) => setYtLink(e.target.value)}
                                    className="pl-8 h-8 rounded-lg bg-muted/10 border-border/20 focus:border-red-500/30 text-[11px]"
                                />
                                {ytLink && (
                                    <button onClick={handleAddYt} className="absolute right-1.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                                        <Check className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                            {ytVideoId && <p className="text-[9px] text-emerald-500 font-bold text-center">Đang phát từ YouTube...</p>}
                        </div>
                    </div>
                </div>

                {/* Center: Timer with Orbiting Elements */}
                <div className="md:col-span-5 relative rounded-2xl border border-border/40 bg-card overflow-hidden flex flex-col items-center justify-center p-6 min-h-[480px]">

                    {/* Breathing gradient effect */}
                    <BreathingGradient isActive={isActive} />

                    {/* Timer Content */}
                    <div className="relative z-10 flex flex-col items-center w-full gap-8">
                        {/* Mode Selectors */}
                        <div className="flex gap-1 p-1 bg-muted/20 rounded-xl border border-border/20">
                            {(['focus', 'short', 'long'] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => switchMode(m)}
                                    className={cn(
                                        "px-5 py-2 rounded-lg text-[12px] font-bold transition-all",
                                        mode === m
                                            ? "bg-background text-foreground border border-border/30"
                                            : "text-muted-foreground/50 hover:text-foreground border border-transparent"
                                    )}
                                >
                                    {m === "focus" ? "Tập trung" : m === "short" ? "Nghỉ ngắn" : "Nghỉ dài"}
                                </button>
                            ))}
                        </div>

                        {/* Timer Display */}
                        <div className="relative flex items-center justify-center">
                            <div
                                className={cn(
                                    "text-[80px] md:text-[100px] font-bold tracking-tight tabular-nums leading-none select-none transition-colors duration-500",
                                    isActive ? "text-foreground" : "text-muted-foreground/25"
                                )}
                            >
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-48 h-1 bg-muted/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-center gap-8">
                            <button
                                className="w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground/30 hover:text-foreground hover:bg-muted/30 transition-all"
                                onClick={resetTimer}
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>

                            <button
                                onClick={toggleTimer}
                                className={cn(
                                    "w-20 h-20 rounded-full flex items-center justify-center transition-all bg-foreground text-background hover:scale-105 active:scale-95"
                                )}
                            >
                                {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 ml-1 fill-current" />}
                            </button>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground/30 hover:text-foreground hover:bg-muted/30 transition-all">
                                        <Settings2 className="w-5 h-5" />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md rounded-2xl border-border/40 p-6">
                                    <DialogHeader>
                                        <DialogTitle className="text-[16px] font-bold">Thiết lập kịch bản</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6 pt-2">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-bold text-muted-foreground/40">Thời lượng nhịp độ (phút)</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-muted-foreground/60 ml-1">Tập trung</label>
                                                    <Input type="number" value={focusMinutes} onChange={(e) => setFocusMinutes(Number(e.target.value))} className="rounded-lg border-border/40 h-9 text-[12px]" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-muted-foreground/60 ml-1">Nghỉ ngắn</label>
                                                    <Input type="number" value={shortBreakMinutes} onChange={(e) => setShortBreakMinutes(Number(e.target.value))} className="rounded-lg border-border/40 h-9 text-[12px]" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-muted-foreground/60 ml-1">Nghỉ dài</label>
                                                    <Input type="number" value={longBreakMinutes} onChange={(e) => setLongBreakMinutes(Number(e.target.value))} className="rounded-lg border-border/40 h-9 text-[12px]" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[10px] font-bold text-muted-foreground/40">Thông số phiên</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between bg-muted/10 p-4 rounded-xl border border-border/30">
                                                    <span className="text-[12px] font-bold text-foreground/70">Tổng số hiệp</span>
                                                    <div className="flex items-center gap-3">
                                                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" onClick={() => setTargetCycles(Math.max(1, targetCycles - 1))}><Minus className="w-3.5 h-3.5" /></Button>
                                                        <span className="font-bold text-[14px] w-5 text-center tabular-nums">{targetCycles}</span>
                                                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" onClick={() => setTargetCycles(targetCycles + 1)}><Plus className="w-3.5 h-3.5" /></Button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between bg-muted/10 p-4 rounded-xl border border-border/30">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[12px] font-bold text-foreground/70 block">Nghỉ dài sau mỗi...</span>
                                                        <span className="text-[9px] text-muted-foreground/50 font-medium">VD: 4 hiệp tập trung = 1 nghỉ dài</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" onClick={() => setLongBreakInterval(Math.max(1, longBreakInterval - 1))}><Minus className="w-3.5 h-3.5" /></Button>
                                                        <span className="font-bold text-[14px] w-5 text-center tabular-nums">{longBreakInterval}</span>
                                                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" onClick={() => setLongBreakInterval(longBreakInterval + 1)}><Plus className="w-3.5 h-3.5" /></Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-[11px] font-bold text-muted-foreground/70">Tự động bắt đầu hiệp mới</span>
                                            <button
                                                onClick={() => setAutoStart(!autoStart)}
                                                className={cn("w-10 h-5 rounded-full p-0.5 transition-colors relative", autoStart ? "bg-emerald-500" : "bg-muted")}
                                            >
                                                <div className={cn("w-4 h-4 rounded-full bg-white transition-all", autoStart ? "translate-x-5" : "translate-x-0")} />
                                            </button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Right: Notes */}
                <div className="md:col-span-4 h-full flex flex-col">
                    <div className="flex-1 p-5 rounded-2xl border border-border/40 bg-card flex flex-col space-y-4 min-h-[480px]">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-muted-foreground/40">Ghi chú tập trung</p>
                            {notes.trim().length > 0 && (
                                <span className="text-[9px] font-bold text-emerald-500 px-2 py-0.5 bg-emerald-500/10 rounded-full">Synced</span>
                            )}
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Điều gì lướt qua tâm trí bạn? Ghi chú tại đây để giải tải bộ não và duy trì dòng chảy công việc..."
                            className="flex-1 w-full bg-transparent border-none p-0 text-[13px] font-medium focus:ring-0 transition-all resize-none placeholder:text-muted-foreground/20 leading-relaxed custom-scrollbar outline-none"
                        />
                        <div className="pt-3 border-t border-border/10 flex items-center justify-between opacity-30 select-none">
                            <span className="text-[9px] font-bold">{notes.length} ký tự</span>
                            <Sparkles className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
