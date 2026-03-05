"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Leaf, Wind, Waves, Coffee, Brain, Timer, Settings2, Music, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    // Timer state
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<"focus" | "short" | "long">("focus");

    // Session state
    const [cycleCount, setCycleCount] = useState(0);
    const [targetCycles, setTargetCycles] = useState(4);
    const [autoStart, setAutoStart] = useState(true);

    // UI state
    const [notes, setNotes] = useState("");
    const [activeSound, setActiveSound] = useState<string | null>(null);
    const [activeMusic, setActiveMusic] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const musicRef = useRef<HTMLAudioElement | null>(null);

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
                toast.success("Tuyệt vời! Bạn đã hoàn thành 2 tiếng tập trung.");
                setCycleCount(0);
                switchMode("focus");
            } else {
                toast.info("Xong một hiệp! Nghỉ xả hơi chút nào.");
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
        setTimeLeft(mode === "focus" ? 25 * 60 : mode === "short" ? 5 * 60 : 15 * 60);
    };

    const switchMode = (newMode: "focus" | "short" | "long") => {
        setMode(newMode);
        setIsActive(false);
        if (newMode === "focus") setTimeLeft(25 * 60);
        else if (newMode === "short") setTimeLeft(5 * 60);
        else setTimeLeft(15 * 60);
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
            audioRef.current.volume = 0.4;
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
            musicRef.current.volume = 0.5;
            musicRef.current.play().catch(console.error);
            setActiveMusic(id);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-1000">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground/90">Không gian tập trung</h1>
                    <p className="text-[13px] text-muted-foreground font-medium">Tìm lại nhịp điệu riêng của bạn trong sự tĩnh lặng.</p>
                </div>

                {/* Session Progress - Detailed for 4 cycles */}
                <div className="flex items-center gap-4 bg-muted/10 px-6 py-3 rounded-2xl border border-border/40 backdrop-blur-sm">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground/60 tracking-wider">TIẾN ĐỘ PHIÊN</span>
                        <span className="text-[12px] font-bold text-foreground/70">{cycleCount}/{targetCycles} hiệp (≈ 2 giờ)</span>
                    </div>
                    <div className="flex gap-2 h-2.5 items-center">
                        {Array.from({ length: targetCycles }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-2.5 h-2.5 rounded-full transition-all duration-700",
                                    i < cycleCount ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.3)]" : "bg-muted-foreground/20"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">

                {/* Main Timer Section */}
                <div className="md:col-span-8 group relative rounded-[32px] border border-border/40 bg-card overflow-hidden flex flex-col items-center justify-center p-8 py-20 min-h-[480px]">

                    {/* Breathing Motion - Gentle and persistent */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-primary/5 rounded-full transition-opacity duration-1000",
                            isActive ? "animate-breathing" : "opacity-0"
                        )} />
                        <div className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] border border-primary/10 rounded-full transition-opacity duration-1000",
                            isActive ? "animate-breathing-slow" : "opacity-0"
                        )} />
                    </div>

                    {/* Mode Selectors - No Uppercase, No Spacing */}
                    <div className="flex gap-3 mb-12 relative z-10 p-1.5 bg-muted/20 rounded-2xl border border-border/20">
                        {(['focus', 'short', 'long'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => switchMode(m)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-[13px] font-bold transition-all",
                                    mode === m
                                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/40"
                                        : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
                                )}
                            >
                                {m === "focus" ? "Tập trung" : m === "short" ? "Nghỉ ngắn" : "Nghỉ dài"}
                            </button>
                        ))}
                    </div>

                    {/* Timer Display */}
                    <div className="relative z-10 text-center space-y-12">
                        <div className="text-[120px] font-bold tracking-tight tabular-nums text-foreground leading-none select-none">
                            {formatTime(timeLeft)}
                        </div>

                        <div className="flex items-center justify-center gap-8">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-14 h-14 rounded-full text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-all"
                                onClick={resetTimer}
                            >
                                <RotateCcw className="w-6 h-6" />
                            </Button>

                            <button
                                onClick={toggleTimer}
                                className={cn(
                                    "w-24 h-24 rounded-full flex items-center justify-center transition-all bg-foreground text-background hover:scale-105 active:scale-95 shadow-lg group-hover:shadow-foreground/10"
                                )}
                            >
                                {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 ml-1.5 fill-current" />}
                            </button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-14 h-14 rounded-full text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-all"
                                onClick={() => toast.info("Tính năng cài đặt đang được phát triển.")}
                            >
                                <Settings2 className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="md:col-span-4 flex flex-col gap-6">

                    {/* Integrated Sound & Music Controls */}
                    <div className="p-6 rounded-[28px] border border-border/40 bg-card space-y-6">
                        <div className="space-y-4">
                            <p className="text-[11px] font-bold text-muted-foreground/50 tracking-[0.05em] uppercase px-1">Âm thanh thiên nhiên</p>
                            <div className="grid grid-cols-3 gap-3">
                                {SOUNDS.map((sound) => {
                                    const Icon = sound.icon;
                                    const isSelected = activeSound === sound.id;
                                    return (
                                        <button
                                            key={sound.id}
                                            onClick={() => toggleSound(sound.url, sound.id)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-3.5 rounded-2xl transition-all border",
                                                isSelected
                                                    ? "bg-primary/5 border-primary/20 text-primary"
                                                    : "bg-muted/5 border-transparent hover:bg-muted/20 text-muted-foreground/50 hover:text-muted-foreground"
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="text-[10px] font-bold">{sound.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="h-px bg-border/40 mx-2" />

                        <div className="space-y-4">
                            <p className="text-[11px] font-bold text-muted-foreground/50 tracking-[0.05em] uppercase px-1">Nhạc nền không gian</p>
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
                                                    : "bg-muted/5 border-transparent hover:bg-muted/20 text-muted-foreground/60 hover:text-foreground"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                                isSelected ? "bg-primary/10" : "bg-muted/10"
                                            )}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-[13px] font-bold flex-1">{music.label}</span>
                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Focus Note Area */}
                    <div className="flex-1 p-6 rounded-[28px] border border-border/40 bg-card flex flex-col space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <p className="text-[11px] font-bold text-muted-foreground/50 tracking-[0.05em] uppercase">Ghi chú nhanh</p>
                            {notes.trim() && <span className="text-[9px] text-primary/60 font-bold uppercase tracking-widest">Đã lưu</span>}
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Nhớ ra điều gì đó? Note ngay tại đây để không xao nhãng..."
                            className="flex-1 w-full bg-muted/5 border-none rounded-2xl p-4 text-[13px] font-medium focus:ring-1 focus:ring-primary/10 transition-all resize-none placeholder:text-muted-foreground/30 custom-scrollbar leading-relaxed"
                        />
                    </div>
                </div>
            </div>

            {/* Global Style overrides */}
            <style jsx global>{`
                @keyframes breathing {
                    0%, 100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.1; }
                    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.3; }
                }
                @keyframes breathing-slow {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.05; }
                    50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.2; }
                }
                .animate-breathing {
                    animation: breathing 5s ease-in-out infinite;
                }
                .animate-breathing-slow {
                    animation: breathing-slow 8s ease-in-out infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.05);
                    border-radius: 10px;
                }
                /* Ensure no generic shadow/uppercase styles from global system bleed in unwantedly */
                .no-uppercase { text-transform: none !important; }
                .no-spacing { letter-spacing: normal !important; }
            `}</style>
        </div>
    );
}
