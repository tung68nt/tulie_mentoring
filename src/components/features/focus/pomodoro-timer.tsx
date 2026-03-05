"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Leaf, Wind, Waves, Coffee, Music, Sparkles, Settings2, Plus, Minus, Check, Youtube, X } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

const SOUNDS = [
    { id: "rain", label: "Mưa rơi", icon: Waves, url: "https://www.soundjay.com/nature/rain-07.mp3" },
    { id: "wind", label: "Gió thổi", icon: Wind, url: "https://www.soundjay.com/nature/wind-01.mp3" },
    { id: "forest", label: "Rừng xanh", icon: Leaf, url: "https://www.soundjay.com/nature/forest-01.mp3" },
];

const AMBIANCE_MUSICS = [
    { id: "lofi", label: "Lofi Study", icon: Music, url: "https://www.soundjay.com/music/lofi-hip-hop-beat-01.mp3" },
    { id: "coffee", label: "Coffee Shop", icon: Coffee, url: "https://www.soundjay.com/misc/coffee-shop-ambience-1.mp3" },
    { id: "zen", label: "Zen Space", icon: Sparkles, url: "https://www.soundjay.com/misc/ambient-sleep-music-1.mp3" },
];

export function PomodoroTimer() {
    // Configurable state
    const [focusMinutes, setFocusMinutes] = useState(25);
    const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
    const [longBreakMinutes, setLongBreakMinutes] = useState(15);
    const [targetCycles, setTargetCycles] = useState(4);
    const [longBreakInterval, setLongBreakInterval] = useState(4); // Every 4th focus is a long break

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

    // YouTube helper
    const handleAddYt = () => {
        const match = ytLink.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
        if (match) {
            setYtVideoId(match[1]);
            toast.success("Đã nạp nhạc từ YouTube thành công.");
            // Reset other music if YouTube starts
            if (activeMusic) {
                musicRef.current?.pause();
                setActiveMusic(null);
            }
        } else {
            toast.error("Link YouTube không hợp lệ.");
        }
    };

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
                // Check if next is long break
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

    const toggleSound = (url: string, id: string) => {
        if (activeSound === id) {
            audioRef.current?.pause();
            setActiveSound(null);
        } else {
            if (audioRef.current) audioRef.current.pause();
            audioRef.current = new Audio(url);
            audioRef.current.loop = true;
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(err => {
                console.error(err);
                if (err.name === "NotAllowedError") toast.error("Vui lòng tương tác với trang để bật âm thanh.");
            });
            setActiveSound(id);
        }
    };

    const toggleMusic = (url: string, id: string) => {
        if (ytVideoId) setYtVideoId(null); // Clear YouTube if switching to predefined music

        if (activeMusic === id) {
            musicRef.current?.pause();
            setActiveMusic(null);
        } else {
            if (musicRef.current) musicRef.current.pause();
            musicRef.current = new Audio(url);
            musicRef.current.loop = true;
            musicRef.current.volume = 0.6;
            musicRef.current.play().catch(err => {
                console.error(err);
                if (err.name === "NotAllowedError") toast.error("Vui lòng tương tác với trang để bật nhạc.");
            });
            setActiveMusic(id);
        }
    };

    return (
        <div className="max-w-[1240px] mx-auto space-y-12 animate-in fade-in duration-1000 pb-16 pt-4">
            {/* YouTube Player - Hidden, only for audio */}
            {ytVideoId && (
                <div className="sr-only">
                    <iframe
                        width="1"
                        height="1"
                        src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&loop=1&playlist=${ytVideoId}`}
                        allow="autoplay"
                    />
                </div>
            )}

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="space-y-1.5 px-2">
                    <h1 className="text-3xl font-bold text-foreground/90 tracking-tight">Không gian tập trung</h1>
                    <p className="text-[14px] text-muted-foreground/60 font-medium">Tìm lại trạng thái tập trung tuyệt đối của bạn.</p>
                </div>

                {/* Session Progress */}
                <div className="flex items-center gap-6 bg-background rounded-[40px] border border-border/40 px-8 py-4 shadow-none">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-muted-foreground/40 no-uppercase">Tiến độ phiên</span>
                        <span className="text-[15px] font-bold text-foreground/90 tabular-nums">{cycleCount}/{targetCycles} hiệp</span>
                    </div>
                    <div className="flex gap-2.5">
                        {Array.from({ length: targetCycles }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-3.5 h-3.5 rounded-full transition-all duration-700",
                                    i < cycleCount ? "bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]" : "bg-muted-foreground/10"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                {/* Sidebar Left: Control Panel */}
                <div className="md:col-span-3 flex flex-col gap-8 h-full">
                    <div className="p-8 rounded-[40px] border border-border/40 bg-card/40 space-y-10 shadow-none h-full flex flex-col">

                        {/* Nature Sounds */}
                        <div className="space-y-5">
                            <p className="text-[12px] font-bold text-muted-foreground/40 no-uppercase px-1">Âm thanh tự nhiên</p>
                            <div className="grid grid-cols-1 gap-2.5">
                                {SOUNDS.map((sound) => {
                                    const Icon = sound.icon;
                                    const isSelected = activeSound === sound.id;
                                    return (
                                        <button
                                            key={sound.id}
                                            onClick={() => toggleSound(sound.url, sound.id)}
                                            className={cn(
                                                "flex items-center gap-4 w-full p-4 rounded-2xl transition-all border text-left active:scale-[0.98]",
                                                isSelected
                                                    ? "bg-primary/5 border-primary/20 text-primary"
                                                    : "bg-muted/5 border-transparent hover:bg-muted/15 text-muted-foreground/70"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="text-[14px] font-bold flex-1">{sound.label}</span>
                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Music Hub */}
                        <div className="space-y-5">
                            <p className="text-[12px] font-bold text-muted-foreground/40 no-uppercase px-1">Giai điệu thư giãn</p>
                            <div className="grid grid-cols-1 gap-2.5">
                                {AMBIANCE_MUSICS.map((music) => {
                                    const Icon = music.icon;
                                    const isSelected = activeMusic === music.id;
                                    return (
                                        <button
                                            key={music.id}
                                            onClick={() => toggleMusic(music.url, music.id)}
                                            className={cn(
                                                "flex items-center gap-4 w-full p-4 rounded-2xl transition-all border text-left active:scale-[0.98]",
                                                isSelected
                                                    ? "bg-primary/5 border-primary/20 text-primary"
                                                    : "bg-muted/5 border-transparent hover:bg-muted/15 text-muted-foreground/70"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="text-[14px] font-bold flex-1">{music.label}</span>
                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* YouTube Custom Music */}
                        <div className="mt-auto pt-6 border-t border-border/10 space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <p className="text-[12px] font-bold text-muted-foreground/40 no-uppercase">YouTube Music</p>
                                {ytVideoId && <button onClick={() => setYtVideoId(null)} className="text-[10px] text-destructive font-bold hover:underline">Tắt nhạc</button>}
                            </div>
                            <div className="relative group">
                                <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-red-500 transition-colors" />
                                <Input
                                    placeholder="Dán link bài hát..."
                                    value={ytLink}
                                    onChange={(e) => setYtLink(e.target.value)}
                                    className="pl-10 h-10 rounded-xl bg-muted/5 border-border/20 focus:border-red-500/30 text-[13px] shadow-none"
                                />
                                {ytLink && (
                                    <button
                                        onClick={handleAddYt}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            {ytVideoId && <p className="text-[10px] text-green-500 font-bold text-center px-1">Đang phát từ YouTube...</p>}
                        </div>
                    </div>
                </div>

                {/* Center: Hero Style Timer */}
                <div className="md:col-span-5 relative rounded-[40px] border border-border/40 bg-card overflow-hidden flex flex-col items-center justify-center p-8 py-24 min-h-[500px] shadow-none group">

                    {/* Breathing Waves (From tulie.agency style) */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <AnimatePresence>
                            {isActive && [...Array(3)].map((_, i) => (
                                <motion.div
                                    key={`waves-${i}`}
                                    className="absolute rounded-full bg-primary/[0.03] border border-primary/10"
                                    style={{ width: 140, height: 140 }}
                                    initial={{ scale: 1, opacity: 0 }}
                                    animate={{ scale: 5.5, opacity: i === 0 ? 0.2 : i === 1 ? 0.12 : 0.05 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 8,
                                        repeat: Infinity,
                                        delay: i * 2.5,
                                        ease: "linear",
                                    }}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Main UI container */}
                    <div className="relative z-10 flex flex-col items-center w-full space-y-16">
                        {/* Mode Selectors */}
                        <div className="flex gap-2.5 p-1.5 bg-background/50 rounded-2xi border border-border/10">
                            {(['focus', 'short', 'long'] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => switchMode(m)}
                                    className={cn(
                                        "px-7 py-2.5 rounded-xl text-[14px] font-bold transition-all no-uppercase",
                                        mode === m
                                            ? "bg-background text-foreground shadow-sm ring-1 ring-border/20"
                                            : "text-muted-foreground/50 hover:text-foreground"
                                    )}
                                >
                                    {m === "focus" ? "Tập trung" : m === "short" ? "Nghỉ ngắn" : "Nghỉ dài"}
                                </button>
                            ))}
                        </div>

                        {/* Large Timer Core */}
                        <div className="relative flex items-center justify-center">
                            {/* Glass background for timer */}
                            <div className={cn(
                                "absolute inset-[-40px] md:inset-[-60px] rounded-full transition-all duration-1000",
                                isActive ? "bg-primary/5 blur-3xl opacity-100" : "opacity-0"
                            )} />

                            <motion.div
                                className={cn(
                                    "text-[130px] font-bold tracking-tight tabular-nums leading-none select-none transition-colors",
                                    isActive ? "text-foreground" : "text-muted-foreground/30"
                                )}
                                animate={isActive ? {
                                    scale: [1, 1.04, 1],
                                    opacity: [1, 0.8, 1],
                                } : {}}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                {formatTime(timeLeft)}
                            </motion.div>
                        </div>

                        {/* Action Hub */}
                        <div className="flex items-center justify-center gap-10">
                            <button
                                className="w-14 h-14 rounded-full flex items-center justify-center text-muted-foreground/30 hover:text-foreground hover:bg-muted/50 transition-all border border-transparent hover:border-border/30"
                                onClick={resetTimer}
                            >
                                <RotateCcw className="w-6 h-6" />
                            </button>

                            <button
                                onClick={toggleTimer}
                                className={cn(
                                    "w-28 h-28 rounded-full flex items-center justify-center transition-all bg-foreground text-background hover:scale-105 active:scale-95",
                                    isActive && "shadow-[0_0_40px_rgba(0,0,0,0.1)]"
                                )}
                            >
                                {isActive ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 ml-2 fill-current" />}
                            </button>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="w-14 h-14 rounded-full flex items-center justify-center text-muted-foreground/30 hover:text-foreground hover:bg-muted/50 transition-all border border-transparent hover:border-border/30">
                                        <Settings2 className="w-6 h-6" />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md rounded-[40px] border-border/40 p-8 shadow-none">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold no-uppercase">Thiết lập kịch bản</DialogTitle>
                                    </DialogHeader>
                                    <div className="p-2 space-y-10 pt-4">
                                        <div className="space-y-5">
                                            <p className="text-[12px] font-bold text-muted-foreground/40 no-uppercase tracking-normal">Thời lượng nhịp độ (phút)</p>
                                            <div className="grid grid-cols-3 gap-5">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold text-muted-foreground/60 ml-1">Tập trung</label>
                                                    <Input type="number" value={focusMinutes} onChange={(e) => setFocusMinutes(Number(e.target.value))} className="rounded-2xl border-border/40 h-12" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold text-muted-foreground/60 ml-1">Nghỉ ngắn</label>
                                                    <Input type="number" value={shortBreakMinutes} onChange={(e) => setShortBreakMinutes(Number(e.target.value))} className="rounded-2xl border-border/40 h-12" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold text-muted-foreground/60 ml-1">Nghỉ dài</label>
                                                    <Input type="number" value={longBreakMinutes} onChange={(e) => setLongBreakMinutes(Number(e.target.value))} className="rounded-2xl border-border/40 h-12" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <p className="text-[12px] font-bold text-muted-foreground/40 no-uppercase tracking-normal">Thông số phiên làm việc</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between bg-muted/10 p-5 rounded-2xl border border-border/40">
                                                    <span className="text-[14px] font-bold text-foreground/70">Tổng số hiệp (Goal)</span>
                                                    <div className="flex items-center gap-4">
                                                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-background" onClick={() => setTargetCycles(Math.max(1, targetCycles - 1))}><Minus className="w-4 h-4" /></Button>
                                                        <span className="font-bold text-[18px] w-6 text-center tabular-nums">{targetCycles}</span>
                                                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-background" onClick={() => setTargetCycles(targetCycles + 1)}><Plus className="w-4 h-4" /></Button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between bg-muted/10 p-5 rounded-2xl border border-border/40">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[14px] font-bold text-foreground/70 block">Nghỉ dài sau mỗi...</span>
                                                        <span className="text-[11px] text-muted-foreground/50 font-medium">VD: 4 hiệp tập trung sẽ có 1 hiệp nghỉ dài</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-background" onClick={() => setLongBreakInterval(Math.max(1, longBreakInterval - 1))}><Minus className="w-4 h-4" /></Button>
                                                        <span className="font-bold text-[18px] w-6 text-center tabular-nums">{longBreakInterval}</span>
                                                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-background" onClick={() => setLongBreakInterval(longBreakInterval + 1)}><Plus className="w-4 h-4" /></Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-[13px] font-bold text-muted-foreground/70">Tự động bắt đầu hiệp mới</span>
                                            <button
                                                onClick={() => setAutoStart(!autoStart)}
                                                className={cn(
                                                    "w-12 h-6 rounded-full p-1 transition-colors relative",
                                                    autoStart ? "bg-primary" : "bg-muted"
                                                )}
                                            >
                                                <div className={cn("w-4 h-4 rounded-full bg-white transition-all shadow-sm", autoStart ? "translate-x-6" : "translate-x-0")} />
                                            </button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Extended Notes */}
                <div className="md:col-span-4 h-full flex flex-col">
                    <div className="relative flex-1 p-10 rounded-[40px] border border-border/40 bg-card/40 flex flex-col space-y-6 shadow-none min-h-[500px] h-full">
                        <div className="flex items-center justify-between">
                            <p className="text-[12px] font-bold text-muted-foreground/40 no-uppercase tracking-normal">Nhật ký tập trung</p>
                            {notes.trim().length > 0 && <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full no-uppercase tracking-tight">Cloud Synced</span>
                            </div>}
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Điều gì lướt qua tâm trí bạn? Ghi chú tại đây để giải tải bộ não và duy trì dòng chảy công việc..."
                            className="flex-1 w-full bg-transparent border-none p-0 text-[15px] font-medium focus:ring-0 transition-all resize-none placeholder:text-muted-foreground/20 leading-relaxed custom-scrollbar outline-none"
                        />

                        {/* Note Footer Decorations */}
                        <div className="pt-6 border-t border-border/5 flex items-center justify-between opacity-30 select-none grayscale">
                            <span className="text-[10px] font-bold">Total characters: {notes.length}</span>
                            <Sparkles className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* No generic shadow/uppercase styles from global system bleed in unwantedly */}
            <style jsx global>{`
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
