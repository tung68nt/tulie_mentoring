"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Leaf, Wind, Waves, Coffee, Music, Sparkles, Settings2, Plus, Minus, Check } from "lucide-react";
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

const SOUNDS = [
    { id: "rain", label: "Mưa rơi", icon: Waves, url: "https://www.soundjay.com/nature/rain-07.mp3" },
    { id: "wind", label: "Gió thổi", icon: Wind, url: "https://www.soundjay.com/nature/wind-01.mp3" },
    { id: "forest", label: "Rừng xanh", icon: Leaf, url: "https://www.soundjay.com/nature/forest-01.mp3" },
];

const AMBIANCE_MUSICS = [
    { id: "lofi", label: "Lofi Study", icon: Music, url: "https://p.scdn.co/mp3-preview/74384de1e4b85c2c77f0a911765c924765796a55?cid=null" },
    { id: "coffee", label: "Coffee Shop", icon: Coffee, url: "https://p.scdn.co/mp3-preview/df88e999c0da9890479f67a3ed1464dd4cd37e01?cid=null" },
    { id: "zen", label: "Zen Space", icon: Sparkles, url: "https://p.scdn.co/mp3-preview/e530997327ef80e8e63da248cd9b52a4e2315779?cid=null" },
];

export function PomodoroTimer() {
    // Configurable state
    const [focusMinutes, setFocusMinutes] = useState(25);
    const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
    const [longBreakMinutes, setLongBreakMinutes] = useState(15);
    const [targetCycles, setTargetCycles] = useState(4);

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
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const musicRef = useRef<HTMLAudioElement | null>(null);

    // Sync timer with config when mode changes or config updates (if not active)
    useEffect(() => {
        if (!isActive) {
            if (mode === "focus") setTimeLeft(focusMinutes * 60);
            else if (mode === "short") setTimeLeft(shortBreakMinutes * 60);
            else setTimeLeft(longBreakMinutes * 60);
        }
    }, [focusMinutes, shortBreakMinutes, longBreakMinutes, mode, isActive]);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
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
                toast.info("Xong một hiệp! Hãy nghỉ ngơi chút.");
                switchMode("short");
                if (autoStart) setTimeout(() => setIsActive(true), 1500);
            }
        } else {
            toast.info("Hết giờ nghỉ. Quay lại tập trung nhé?");
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

    const toggleSound = (url: string, id: string) => {
        if (activeSound === id) {
            audioRef.current?.pause();
            setActiveSound(null);
        } else {
            if (audioRef.current) audioRef.current.pause();
            audioRef.current = new Audio(url);
            audioRef.current.loop = true;
            audioRef.current.volume = 0.35;
            audioRef.current.play().catch(console.error);
            setActiveSound(id);
        }
    };

    const toggleMusic = (url: string, id: string) => {
        if (activeMusic === id) {
            musicRef.current?.pause();
            setActiveMusic(null);
        } else {
            if (musicRef.current) musicRef.current.pause();
            musicRef.current = new Audio(url);
            musicRef.current.loop = true;
            musicRef.current.volume = 0.45;
            musicRef.current.play().catch(console.error);
            setActiveMusic(id);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in duration-1000 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="space-y-1 px-1">
                    <h1 className="text-2xl font-bold text-foreground/90">Không gian tập trung</h1>
                    <p className="text-[14px] text-muted-foreground/70 font-medium">Tìm lại nhịp điệu riêng của bạn trong sự tĩnh lặng.</p>
                </div>

                {/* Session Progress - More elegant, no uppercase */}
                <div className="flex items-center gap-5 bg-background border border-border/40 px-6 py-3 rounded-2xl shadow-sm backdrop-blur-md">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-muted-foreground/40 no-uppercase tracking-normal">Tiến độ phiên</span>
                        <span className="text-[14px] font-bold text-foreground/80">{cycleCount}/{targetCycles} hiệp</span>
                    </div>
                    <div className="flex gap-2">
                        {Array.from({ length: targetCycles }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-all duration-700",
                                    i < cycleCount ? "bg-primary shadow-lg shadow-primary/20" : "bg-muted-foreground/10"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                {/* Sidebar Left: Sounds (Compact) */}
                <div className="md:col-span-3 flex flex-col gap-6">
                    <div className="p-6 rounded-3xl border border-border/40 bg-card/60 space-y-8">
                        {/* Nature Sounds */}
                        <div className="space-y-4">
                            <p className="text-[12px] font-bold text-muted-foreground/40 no-uppercase tracking-normal px-1">Âm thanh tự nhiên</p>
                            <div className="grid grid-cols-1 gap-2">
                                {SOUNDS.map((sound) => {
                                    const Icon = sound.icon;
                                    const isSelected = activeSound === sound.id;
                                    return (
                                        <button
                                            key={sound.id}
                                            onClick={() => toggleSound(sound.url, sound.id)}
                                            className={cn(
                                                "flex items-center gap-3 w-full p-3 px-4 rounded-xl transition-all border text-left",
                                                isSelected
                                                    ? "bg-primary/5 border-primary/20 text-primary"
                                                    : "bg-muted/5 border-transparent hover:bg-muted/20 text-muted-foreground/60"
                                            )}
                                        >
                                            <Icon className="w-4 h-4 opacity-70" />
                                            <span className="text-[13px] font-bold flex-1">{sound.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Ambiance Music */}
                        <div className="space-y-4">
                            <p className="text-[12px] font-bold text-muted-foreground/40 no-uppercase tracking-normal px-1">Nhạc nền không gian</p>
                            <div className="grid grid-cols-1 gap-2">
                                {AMBIANCE_MUSICS.map((music) => {
                                    const Icon = music.icon;
                                    const isSelected = activeMusic === music.id;
                                    return (
                                        <button
                                            key={music.id}
                                            onClick={() => toggleMusic(music.url, music.id)}
                                            className={cn(
                                                "flex items-center gap-3 w-full p-3 px-4 rounded-xl transition-all border text-left",
                                                isSelected
                                                    ? "bg-primary/5 border-primary/20 text-primary"
                                                    : "bg-muted/5 border-transparent hover:bg-muted/20 text-muted-foreground/60"
                                            )}
                                        >
                                            <Icon className="w-4 h-4 opacity-70" />
                                            <span className="text-[13px] font-bold flex-1">{music.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center: Main Timer */}
                <div className="md:col-span-5 group relative rounded-[40px] border border-border/40 bg-card overflow-hidden flex flex-col items-center justify-center p-8 py-20 min-h-[500px] shadow-sm">

                    {/* Breathing Motion Circles */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] border border-primary/5 rounded-full transition-opacity duration-1000",
                            isActive ? "animate-breathing" : "opacity-0"
                        )} />
                        <div className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] border border-primary/10 rounded-full transition-opacity duration-1000",
                            isActive ? "animate-breathing-slow" : "opacity-0"
                        )} />
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex gap-2 mb-12 relative z-10 p-1.5 bg-muted/20 rounded-2xl border border-border/10">
                        {(['focus', 'short', 'long'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => switchMode(m)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-[13px] font-bold transition-all",
                                    mode === m
                                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/20"
                                        : "text-muted-foreground/50 hover:text-foreground"
                                )}
                            >
                                {m === "focus" ? "Tập trung" : m === "short" ? "Nghỉ ngắn" : "Nghỉ dài"}
                            </button>
                        ))}
                    </div>

                    {/* Timer Display with Text Breathing */}
                    <div className="relative z-10 text-center space-y-16">
                        <div className={cn(
                            "text-[120px] font-bold tracking-tight tabular-nums text-foreground leading-none select-none transition-all duration-1000",
                            isActive ? "animate-text-pulse" : "scale-100"
                        )}>
                            {formatTime(timeLeft)}
                        </div>

                        <div className="flex items-center justify-center gap-8">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-14 h-14 rounded-full text-muted-foreground/30 hover:text-foreground hover:bg-muted transition-all"
                                onClick={resetTimer}
                            >
                                <RotateCcw className="w-6 h-6" />
                            </Button>

                            <button
                                onClick={toggleTimer}
                                className={cn(
                                    "w-24 h-24 rounded-full flex items-center justify-center transition-all bg-foreground text-background hover:scale-105 active:scale-95 shadow-lg"
                                )}
                            >
                                {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 ml-1.5 fill-current" />}
                            </button>

                            {/* Settings Modal */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-14 h-14 rounded-full text-muted-foreground/30 hover:text-foreground hover:bg-muted transition-all"
                                    >
                                        <Settings2 className="w-6 h-6" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md rounded-[28px]">
                                    <DialogHeader>
                                        <DialogTitle className="no-uppercase font-bold">Cài đặt hiệp tập trung</DialogTitle>
                                    </DialogHeader>
                                    <div className="p-6 space-y-8">
                                        <div className="space-y-4">
                                            <p className="text-[12px] font-bold text-muted-foreground/60 no-uppercase px-1">Thời gian (phút)</p>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-muted-foreground/60 ml-2">Tập trung</label>
                                                    <Input type="number" value={focusMinutes} onChange={(e) => setFocusMinutes(Number(e.target.value))} className="rounded-xl border-border/40" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-muted-foreground/60 ml-2">Nghỉ ngắn</label>
                                                    <Input type="number" value={shortBreakMinutes} onChange={(e) => setShortBreakMinutes(Number(e.target.value))} className="rounded-xl border-border/40" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-muted-foreground/60 ml-2">Nghỉ dài</label>
                                                    <Input type="number" value={longBreakMinutes} onChange={(e) => setLongBreakMinutes(Number(e.target.value))} className="rounded-xl border-border/40" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[12px] font-bold text-muted-foreground/60 no-uppercase px-1">Mục tiêu phiên</p>
                                            <div className="flex items-center justify-between bg-muted/10 p-4 rounded-2xl border border-border/40">
                                                <span className="text-[14px] font-medium text-foreground/70">Số hiệp mục tiêu</span>
                                                <div className="flex items-center gap-3">
                                                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg" onClick={() => setTargetCycles(Math.max(1, targetCycles - 1))}><Minus className="w-3 h-3" /></Button>
                                                    <span className="font-bold text-[16px] w-6 text-center">{targetCycles}</span>
                                                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg" onClick={() => setTargetCycles(targetCycles + 1)}><Plus className="w-3 h-3" /></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Right: Notes (Wider) */}
                <div className="md:col-span-4 flex flex-col h-full">
                    <div className="flex-1 p-8 rounded-[40px] border border-border/40 bg-card flex flex-col space-y-4 shadow-sm min-h-[500px]">
                        <div className="flex items-center justify-between px-1">
                            <p className="text-[12px] font-bold text-muted-foreground/40 no-uppercase tracking-normal">Ghi chú nhanh</p>
                            {notes.length > 0 && <Check className="w-4 h-4 text-primary opacity-50" />}
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Điều gì lướt qua tâm trí bạn? Ghi lại đây để giải tỏa bộ não và tiếp tục dòng chảy công việc..."
                            className="flex-1 w-full bg-muted/5 border-none rounded-2xl p-6 text-[14px] font-medium focus:ring-1 focus:ring-primary/10 transition-all resize-none placeholder:text-muted-foreground/20 leading-relaxed custom-scrollbar"
                        />
                    </div>
                </div>
            </div>

            {/* Global Styles with Animations */}
            <style jsx global>{`
                @keyframes breathing {
                    0%, 100% { transform: translate(-50%, -50%) scale(0.96); opacity: 0.1; }
                    50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.3; }
                }
                @keyframes breathing-slow {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.05; }
                    50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.2; }
                }
                @keyframes text-pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.03); opacity: 0.85; }
                }
                .animate-breathing {
                    animation: breathing 4s ease-in-out infinite;
                }
                .animate-breathing-slow {
                    animation: breathing-slow 6.5s ease-in-out infinite;
                }
                .animate-text-pulse {
                    animation: text-pulse 4s ease-in-out infinite;
                }
                .no-uppercase { text-transform: none !important; }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.05);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
