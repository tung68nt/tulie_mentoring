"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updatePortfolio, addPortfolioEntry, createPortfolioSnapshot } from "@/lib/actions/portfolio";
import { Plus, Trash2, Layout, Target, Brain, Save, History, BookMarked } from "lucide-react";
import { toast } from "sonner";

interface PortfolioFormProps {
    type: "entry" | "snapshot" | "full";
    portfolio: any;
}

export function PortfolioForm({ type, portfolio }: PortfolioFormProps) {
    const [isPending, startTransition] = useTransition();

    if (type === "entry") {
        return <EntryForm isPending={isPending} startTransition={startTransition} />;
    }
    if (type === "snapshot") {
        return <SnapshotForm isPending={isPending} startTransition={startTransition} />;
    }
    return <FullPortfolioForm isPending={isPending} startTransition={startTransition} portfolio={portfolio} />;
}

function EntryForm({ isPending, startTransition }: any) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        startTransition(async () => {
            try {
                await addPortfolioEntry({ title, content });
                toast.success("Đã lưu ghi chú mới!");
                setTitle("");
                setContent("");
            } catch (error) {
                toast.error("Lỗi khi lưu ghi chú.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Input
                    placeholder="Tiêu đề (VD: Thay đổi trong cách nhìn nhận vấn đề...)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="text-sm border-border/60 focus:border-primary rounded-lg"
                />
            </div>
            <div className="space-y-2">
                <Textarea
                    placeholder="Nội dung nhật ký tiến bộ..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={4}
                    className="text-sm border-border/60 focus:border-primary rounded-lg resize-none"
                />
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={isPending || !title.trim()} size="sm" className="rounded-lg px-6">
                    {isPending ? "Đang lưu..." : "Lưu vào nhật ký"}
                </Button>
            </div>
        </form>
    );
}

function SnapshotForm({ isPending, startTransition }: any) {
    const [title, setTitle] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                await createPortfolioSnapshot(title);
                toast.success("Đã tạo bản lưu!");
                setTitle("");
            } catch (error) {
                toast.error("Lỗi khi tạo bản lưu.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
                placeholder="Tên bản lưu (VD: Tháng 3/2024)"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="text-xs h-9 border-border/60 rounded-lg"
            />
            <Button type="submit" disabled={isPending} variant="secondary" size="sm" className="rounded-lg h-9">
                <History className="w-3.5 h-3.5 mr-1.5" />
                Lưu phiên bản
            </Button>
        </form>
    );
}

function FullPortfolioForm({ isPending, startTransition, portfolio }: any) {
    const profile = portfolio?.mentee?.menteeProfile;

    const [mbti, setMbti] = useState(portfolio?.personalityMbti || "");
    const [disc, setDisc] = useState(portfolio?.personalityDisc || "");
    const [holland, setHolland] = useState(portfolio?.personalityHolland || "");

    const [strengths, setStrengths] = useState(portfolio?.strengths || profile?.strengths || "");
    const [weaknesses, setWeaknesses] = useState(portfolio?.weaknesses || profile?.weaknesses || "");
    const [challenges, setChallenges] = useState(portfolio?.challenges || profile?.currentChallenges || "");
    const [startupIdeas, setStartupIdeas] = useState(portfolio?.startupIdeas || profile?.startupIdeas || "");
    const [personalNotes, setPersonalNotes] = useState(portfolio?.personalNotes || profile?.personalNotes || "");

    const [shortGoals, setShortGoals] = useState<string[]>([]);
    const [longGoals, setLongGoals] = useState<string[]>([]);

    useEffect(() => {
        try {
            if (portfolio?.shortTermGoals) {
                const parsed = JSON.parse(portfolio.shortTermGoals);
                setShortGoals(Array.isArray(parsed) ? parsed : [portfolio.shortTermGoals]);
            } else {
                setShortGoals([""]);
            }

            if (portfolio?.longTermGoals) {
                const parsed = JSON.parse(portfolio.longTermGoals);
                setLongGoals(Array.isArray(parsed) ? parsed : [portfolio.longTermGoals]);
            } else {
                setLongGoals([""]);
            }
        } catch (e) {
            setShortGoals(portfolio?.shortTermGoals ? [portfolio.shortTermGoals] : [""]);
            setLongGoals(portfolio?.longTermGoals ? [portfolio.longTermGoals] : [""]);
        }
    }, [portfolio]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const cleanShortGoals = shortGoals.filter(g => g.trim() !== "");
        const cleanLongGoals = longGoals.filter(g => g.trim() !== "");

        startTransition(async () => {
            try {
                await updatePortfolio({
                    personalityMbti: mbti,
                    personalityDisc: disc,
                    personalityHolland: holland,
                    shortTermGoals: JSON.stringify(cleanShortGoals),
                    longTermGoals: JSON.stringify(cleanLongGoals),
                    strengths,
                    weaknesses,
                    challenges,
                    startupIdeas,
                    personalNotes,
                });
                toast.success("Đã cập nhật chỉ số năng lực!");
            } catch (error) {
                toast.error("Lỗi khi cập nhật.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                    <Brain className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Chỉ số tính cách & Phân tích</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground">MBTI Type</label>
                        <Input value={mbti} onChange={e => setMbti(e.target.value)} placeholder="VD: INTJ" className="h-10 rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground">DISC Profile</label>
                        <Input value={disc} onChange={e => setDisc(e.target.value)} placeholder="VD: D/I" className="h-10 rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground">Holland Code</label>
                        <Input value={holland} onChange={e => setHolland(e.target.value)} placeholder="VD: RIA" className="h-10 rounded-lg" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground">Điểm mạnh hiện tại</label>
                        <Textarea
                            value={strengths}
                            onChange={e => setStrengths(e.target.value)}
                            placeholder="Kỹ năng tự tin nhất..."
                            rows={3}
                            className="text-sm border-border/60 rounded-lg resize-none"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground">Điểm còn hạn chế</label>
                        <Textarea
                            value={weaknesses}
                            onChange={e => setWeaknesses(e.target.value)}
                            placeholder="Cần cải thiện thêm..."
                            rows={3}
                            className="text-sm border-border/60 rounded-lg resize-none"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Khó khăn đang đối mặt</label>
                    <Textarea
                        value={challenges}
                        onChange={e => setChallenges(e.target.value)}
                        placeholder="Vấn đề học tập hoặc công việc..."
                        rows={3}
                        className="text-sm border-border/60 rounded-lg resize-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Ý tưởng / Dự án ấp ủ</label>
                    <Input
                        value={startupIdeas}
                        onChange={e => setStartupIdeas(e.target.value)}
                        placeholder="Startup hoặc ý tưởng riêng..."
                        className="h-10 rounded-lg"
                    />
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Mục tiêu phát triển</h3>
                </div>

                <GoalListInput
                    label="Mục tiêu ngắn hạn"
                    goals={shortGoals}
                    setGoals={setShortGoals}
                    placeholder="VD: Học xong khóa SQL căn bản..."
                />

                <GoalListInput
                    label="Mục tiêu dài hạn"
                    goals={longGoals}
                    setGoals={setLongGoals}
                    placeholder="VD: Có sản phẩm MVP đầu tay..."
                />
            </div>

            <Button type="submit" disabled={isPending} className="w-full h-11 rounded-lg text-sm font-medium shadow-none">
                {isPending ? "Đang lưu..." : "Cập nhật"}
            </Button>
        </form>
    );
}

function GoalListInput({ label, goals, setGoals, placeholder }: { label: string, goals: string[], setGoals: (goals: string[]) => void, placeholder: string }) {
    const addGoal = () => setGoals([...goals, ""]);
    const updateGoal = (index: number, value: string) => {
        const newGoals = [...goals];
        newGoals[index] = value;
        setGoals(newGoals);
    };
    const removeGoal = (index: number) => {
        setGoals(goals.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
                <Button type="button" variant="ghost" size="sm" onClick={addGoal} className="h-7 px-2 text-[10px] gap-1 hover:bg-muted font-normal">
                    <Plus className="w-3 h-3" />
                    Thêm dòng
                </Button>
            </div>
            <div className="space-y-2">
                {goals.map((goal, index) => (
                    <div key={index} className="flex gap-2">
                        <Input
                            value={goal}
                            onChange={e => updateGoal(index, e.target.value)}
                            placeholder={placeholder}
                            className="text-sm h-9 border-border/60 rounded-lg"
                        />
                        {goals.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeGoal(index)}
                                className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

