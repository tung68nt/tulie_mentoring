"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Leaf, Wind, Waves, Coffee, Brain, Timer, Settings2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SOUNDS = [
    { id: "rain", label: "Mưa", icon: Waves, url: "https://www.soundjay.com/nature/rain-07.mp3" },
    { id: "wind", label: "Gió", icon: Wind, url: "https://www.soundjay.com/nature/wind-01.mp3" },
    { id: "forest", label: "Rừng", icon: Leaf, url: "https://www.soundjay.com/nature/forest-01.mp3" },
];

export function PomodoroTimer() {
    // Timer state
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<"focus" | "short" | "long">("focus");

    // Session state
    const [cycleCount, setCycleCount] = useState(0);
    const [targetCycles, setTargetCycles] = useState(4); // Default 4 cycles for a session
    const [autoStart, setAutoStart] = useState(true);

    // UI state
    const [notes, setNotes] = useState("");
    const [activeSound, setActiveSound] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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
                toast.success("Chúc mừng! Bạn đã hoàn thành mục tiêu phiên làm việc.");
                setCycleCount(0); // Reset or stop
                switchMode("focus");
            } else {
                toast.info("Đã xong một hiệp! Hãy nghỉ ngơi chút.");
                switchMode("short");
                if (autoStart) setTimeout(() => setIsActive(true), 1000);
            }
        } else {
            toast.info("Thời gian nghỉ đã hết. Sẵn sàng quay lại tập trung?");
            switchMode("focus");
            if (autoStart) setTimeout(() => setIsActive(true), 1000);
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
            audioRef.current.play().catch(console.error);
            setActiveSound(id);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700">
            {/* Minimal Header */}
            <div className="flex items-center justify-between px-2">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground/80">Không gian tập trung</h1>
                    <p className="text-[12px] text-muted-foreground font-medium">Tìm lại nhịp điệu riêng của bạn.</p>
                </div>

                {/* Session Progress Indicators */}
                <div className="flex items-center gap-2 bg-muted/20 px-4 py-2 rounded-full border border-border/40">
                    <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">TIẾN ĐỘ PHIÊN:</span>
                    <div className="flex gap-1.5">
                        {Array.from({ length: targetCycles }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-500",
                                    i < cycleCount ? "bg-primary" : "bg-muted-foreground/20"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

                {/* Main Timer Section - More compact height */}
                <div className="md:col-span-8 group relative rounded-3xl border border-border/40 bg-card overflow-hidden flex flex-col items-center justify-center p-8 py-16 min-h-[420px]">

                    {/* Breathing Motion (Orbit Circles) - Improved timing for meditation feel */}
                    <div className="absolute inset-0 pointer-events-none opacity-40">
                        <div className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-primary/20 rounded-full",
                            isActive ? "animate-breathing" : "opacity-10 scale-90"
                        )} />
                        <div className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-primary/10 rounded-full",
                            isActive ? "animate-breathing-slow" : "opacity-5 scale-95"
                        )} />
                    </div>

                    {/* Mode Indicators */}
                    <div className="flex gap-2 mb-8 relative z-10">
                        {(['focus', 'short', 'long'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => switchMode(m)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border",
                                    mode === m
                                        ? "bg-primary border-primary text-primary-foreground shadow-sm"
                                        : "bg-muted/10 border-transparent text-muted-foreground hover:bg-muted/30"
                                )}
                            >
                                {m === "focus" ? "TẢI TRỌNG" : m === "short" ? "NGHỈ NGẮN" : "NGHỈ DÀI"}
                            </button>
                        ))}
                    </div>

                    {/* Timer Display - Balanced size */}
                    <div className="relative z-10 text-center space-y-8">
                        <div className="text-[100px] font-bold tracking-tighter tabular-nums text-foreground leading-none drop-shadow-sm select-none">
                            {formatTime(timeLeft)}
                        </div>

                        <div className="flex items-center justify-center gap-6">
                            <Button
                                variant="outline"
                                size="icon"
                                className="w-12 h-12 rounded-full border-border/40 hover:bg-muted transition-all"
                                onClick={resetTimer}
                            >
                                <RotateCcw className="w-5 h-5 text-muted-foreground" />
                            </Button>

                            <button
                                onClick={toggleTimer}
                                className={cn(
                                    "w-20 h-20 rounded-full flex items-center justify-center transition-all bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-sm"
                                )}
                            >
                                {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 ml-1 fill-current" />}
                            </button>

                            <Button
                                variant="outline"
                                size="icon"
                                className="w-12 h-12 rounded-full border-border/40 hover:bg-muted transition-all"
                                onClick={() => toast.info("Tính năng cài đặt đang được phát triển.")}
                            >
                                <Settings2 className="w-5 h-5 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column - Notes and Sound Controls Mixed */}
                <div className="md:col-span-4 flex flex-col gap-6">
                    {/* Compact Sound Bar */}
                    <div className="p-4 rounded-2xl border border-border/40 bg-card space-y-3">
                        <p className="text-[10px] font-bold text-muted-foreground/60 tracking-widest uppercase px-1">Âm thanh</p>
                        <div className="flex justify-between gap-2">
                            {SOUNDS.map((sound) => {
                                const Icon = sound.icon;
                                const isSelected = activeSound === sound.id;
                                return (
                                    <button
                                        key={sound.id}
                                        onClick={() => toggleSound(sound.url, sound.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 flex-1 p-3 rounded-xl transition-all border",
                                            isSelected
                                                ? "bg-primary/5 border-primary/30 text-primary"
                                                : "bg-muted/10 border-transparent hover:bg-muted/30 text-muted-foreground/40"
                                        )}
                                        title={sound.label}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[9px] font-bold uppercase">{sound.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Integrated Note Box */}
                    <div className="flex-1 p-5 rounded-2xl border border-border/40 bg-card flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-muted-foreground/60 tracking-widest uppercase px-1">Ghi chú nhanh</p>
                            {notes.length > 0 && <span className="text-[9px] text-primary font-bold">LƯU TỰ ĐỘNG</span>}
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ý tưởng bất chợt? Note lại đây để tiếp tục tập trung..."
                            className="flex-1 w-full bg-muted/5 border-none rounded-xl p-4 text-[13px] font-medium focus:ring-1 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/30 custom-scrollbar"
                        />
                    </div>
                </div>
            </div>

            {/* Global Custom CSS for Meditation Motion */}
            <style jsx global>{`
                @keyframes breathing {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.15; }
                    50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.4; }
                }
                @keyframes breathing-slow {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
                    50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.3; }
                }
                .animate-breathing {
                    animation: breathing 4s ease-in-out infinite;
                }
                .animate-breathing-slow {
                    animation: breathing-slow 6s ease-in-out infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: transparent;
                }
                .group:hover .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.05);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
