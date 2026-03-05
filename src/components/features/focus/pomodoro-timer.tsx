"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Music, Leaf, Wind, Waves, Coffee, Brain, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SOUNDS = [
    { id: "rain", label: "Mưa rơi", icon: Waves, url: "https://www.soundjay.com/nature/rain-07.mp3" },
    { id: "wind", label: "Gió thổi", icon: Wind, url: "https://www.soundjay.com/nature/wind-01.mp3" },
    { id: "forest", label: "Rừng xanh", icon: Leaf, url: "https://www.soundjay.com/nature/forest-01.mp3" },
];

export function PomodoroTimer() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<"focus" | "short" | "long">("focus");
    const [notes, setNotes] = useState("");
    const [activeSound, setActiveSound] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play alert sound or switch mode
            new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play().catch(() => { });
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-light tracking-tight text-foreground/80">Không gian tập trung</h1>
                <p className="text-muted-foreground font-light">Tĩnh lặng để sáng tạo, nhịp nhàng để vươn xa.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Timer Section */}
                <Card className="lg:col-span-12 xl:col-span-8 p-12 bg-white/40 backdrop-blur-xl border-white/20 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px] shadow-2xl shadow-indigo-500/5">

                    {/* Breathing / Orbit Animation Background */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {/* Orbit rings */}
                        <div className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-primary/10 rounded-full transition-all duration-[3000ms] ease-in-out",
                            isActive ? "scale-110 opacity-100" : "scale-100 opacity-20"
                        )} />
                        <div className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-primary/5 rounded-full transition-all duration-[4000ms] ease-in-out",
                            isActive ? "scale-125 opacity-100" : "scale-100 opacity-20"
                        )} />

                        {/* Breating gradient */}
                        <div className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 blur-3xl rounded-full transition-all duration-[4000ms] ease-in-out",
                            isActive ? "scale-[3] opacity-30" : "scale-100 opacity-0"
                        )} />
                    </div>

                    {/* Mode Selector */}
                    <div className="flex bg-muted/30 p-1 rounded-full mb-12 relative z-10 backdrop-blur-md border border-white/20">
                        {(['focus', 'short', 'long'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => switchMode(m)}
                                className={cn(
                                    "px-6 py-2 rounded-full text-xs font-medium transition-all duration-300",
                                    mode === m ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {m === "focus" ? "Tập trung" : m === "short" ? "Nghỉ ngắn" : "Nghỉ dài"}
                            </button>
                        ))}
                    </div>

                    {/* Timer Display */}
                    <div className="relative z-10 text-center space-y-8">
                        <div className="text-[140px] font-extralight tracking-tighter tabular-nums text-foreground select-none leading-none drop-shadow-sm">
                            {formatTime(timeLeft)}
                        </div>

                        <div className="flex items-center justify-center gap-6">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-16 h-16 rounded-full border-none bg-muted/20 hover:bg-muted/40 transition-all active:scale-95 shadow-none"
                                onClick={resetTimer}
                            >
                                <RotateCcw className="w-6 h-6 text-muted-foreground" />
                            </Button>

                            <button
                                onClick={toggleTimer}
                                className={cn(
                                    "w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-primary/20",
                                    isActive ? "bg-muted/10 border border-primary/20 text-primary" : "bg-primary text-primary-foreground"
                                )}
                            >
                                {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 ml-1 fill-current" />}
                            </button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="w-16 h-16 rounded-full border-none bg-muted/20 hover:bg-muted/40 transition-all active:scale-95 shadow-none"
                            >
                                <Music className="w-6 h-6 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Sidebar Controls */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-8">
                    {/* Soundscape Card */}
                    <Card className="p-6 bg-white/60 backdrop-blur-md border border-white/40 shadow-xl shadow-slate-200/50">
                        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                            Âm thanh thiên nhiên
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            {SOUNDS.map((sound) => {
                                const Icon = sound.icon;
                                const isSelected = activeSound === sound.id;
                                return (
                                    <button
                                        key={sound.id}
                                        onClick={() => toggleSound(sound.url, sound.id)}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-xl transition-all border",
                                            isSelected
                                                ? "bg-primary/5 border-primary/20 text-primary shadow-sm"
                                                : "bg-muted/10 border-transparent hover:bg-muted/30 text-muted-foreground"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center",
                                            isSelected ? "bg-primary/10" : "bg-muted/50"
                                        )}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium flex-1 text-left">{sound.label}</span>
                                        {isSelected && <Volume2 className="w-4 h-4 animate-pulse" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Lo-fi Embed Placeholder Link */}
                        <div className="mt-6 pt-6 border-t border-muted/30">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3">Nguồn nhạc gợi ý</p>
                            <a
                                href="https://www.youtube.com/watch?v=jfKfPfyJRdk"
                                target="_blank"
                                className="flex items-center gap-3 p-3 text-xs bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                            >
                                <Music className="w-4 h-4" />
                                Mở Lo-fi Girl (YouTube)
                            </a>
                        </div>
                    </Card>

                    {/* Quick Notes Card */}
                    <Card className="p-6 bg-white/60 backdrop-blur-md border border-white/40 shadow-xl shadow-slate-200/50">
                        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                            Ghi chú nhanh khi tập trung
                        </h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Nhớ ra điều gì đó? Note ngay tại đây để không xao nhãng..."
                            className="w-full h-40 bg-muted/20 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-primary/20 transition-all font-light resize-none placeholder:text-muted-foreground/40"
                        />
                        <p className="text-[11px] text-muted-foreground/60 mt-3 italic">
                            Ghi chú này sẽ được lưu tạm thời để bạn xử lý sau giờ làm việc.
                        </p>
                    </Card>
                </div>
            </div>

            {/* Breathing Animation CSS */}
            <style jsx global>{`
                @keyframes orbit {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                .orbit-ring {
                    animation: orbit 20s linear infinite;
                }
            `}</style>
        </div>
    );
}
