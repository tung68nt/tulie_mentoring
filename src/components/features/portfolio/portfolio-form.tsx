"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertPortfolio, completePortfolio } from "@/lib/actions/portfolio";
import { Plus, Trash2, Layout, Target, Brain, Award } from "lucide-react";
import { toast } from "sonner";

interface PortfolioFormProps {
    type: "initial" | "final";
    portfolio: any;
}

export function PortfolioForm({ type, portfolio }: PortfolioFormProps) {
    const [isPending, startTransition] = useTransition();

    if (type === "initial") {
        return <InitialForm isPending={isPending} startTransition={startTransition} portfolio={portfolio} />;
    }
    return <FinalForm isPending={isPending} startTransition={startTransition} portfolio={portfolio} />;
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
                <label className="text-xs font-semibold text-muted-foreground">{label}</label>
                <Button type="button" variant="ghost" size="sm" onClick={addGoal} className="h-7 px-2 text-[11px] gap-1.5 hover:bg-primary/5 hover:text-primary transition-colors">
                    <Plus className="w-3 h-3" />
                    Thêm mục tiêu
                </Button>
            </div>
            <div className="space-y-2">
                {goals.map((goal, index) => (
                    <div key={index} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                        <Input
                            value={goal}
                            onChange={e => updateGoal(index, e.target.value)}
                            placeholder={placeholder}
                            className="text-sm h-10 border-muted-foreground/20 focus:border-primary transition-all"
                        />
                        {goals.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeGoal(index)}
                                className="shrink-0 h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))}
                {goals.length === 0 && (
                    <div className="text-center py-4 border border-dashed rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Chưa có mục tiêu nào. Nhấp vào "Thêm mục tiêu" để bắt đầu.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function InitialForm({ isPending, startTransition, portfolio }: any) {
    const profile = portfolio?.mentee?.menteeProfile;

    const [mbti, setMbti] = useState(portfolio?.personalityMbti || "");
    const [disc, setDisc] = useState(portfolio?.personalityDisc || "");
    const [holland, setHolland] = useState(portfolio?.personalityHolland || "");

    const [strengths, setStrengths] = useState(portfolio?.initialStrengths || profile?.strengths || "");
    const [weaknesses, setWeaknesses] = useState(portfolio?.initialWeaknesses || profile?.weaknesses || "");
    const [challenges, setChallenges] = useState(portfolio?.initialChallenges || profile?.currentChallenges || "");
    const [startupIdeas, setStartupIdeas] = useState(portfolio?.initialStartupIdeas || profile?.startupIdeas || "");
    const [personalNotes, setPersonalNotes] = useState(portfolio?.initialPersonalNotes || profile?.personalNotes || "");

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
                await upsertPortfolio({
                    personalityMbti: mbti,
                    personalityDisc: disc,
                    personalityHolland: holland,
                    shortTermGoals: JSON.stringify(cleanShortGoals),
                    longTermGoals: JSON.stringify(cleanLongGoals),
                    initialStrengths: strengths,
                    initialWeaknesses: weaknesses,
                    initialChallenges: challenges,
                    initialStartupIdeas: startupIdeas,
                    initialPersonalNotes: personalNotes,
                });
                toast.success("Đã cập nhật hồ sơ năng lực!");
            } catch (error) {
                console.error(error);
                toast.error("Có lỗi xảy ra khi lưu hồ sơ!");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-muted/30 p-5 rounded-xl border border-border/50 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Layout className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Trắc nghiệm & Thông tin cá nhân</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground">MBTI</label>
                        <Input value={mbti} onChange={e => setMbti(e.target.value)} placeholder="VD: INTJ" className="h-10" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground">DISC</label>
                        <Input value={disc} onChange={e => setDisc(e.target.value)} placeholder="VD: D/I" className="h-10" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground">Holland</label>
                        <Input value={holland} onChange={e => setHolland(e.target.value)} placeholder="VD: RIA" className="h-10" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground">Điểm mạnh</label>
                        <textarea
                            value={strengths}
                            onChange={e => setStrengths(e.target.value)}
                            placeholder="Những kỹ năng, thái độ bạn tự tin nhất..."
                            rows={3}
                            className="w-full px-4 py-3 bg-card border border-muted-foreground/20 rounded-lg text-sm focus:outline-none focus:border-primary transition-all resize-none"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground">Hạn chế</label>
                        <textarea
                            value={weaknesses}
                            onChange={e => setWeaknesses(e.target.value)}
                            placeholder="Những điểm bạn muốn cải thiện..."
                            rows={3}
                            className="w-full px-4 py-3 bg-card border border-muted-foreground/20 rounded-lg text-sm focus:outline-none focus:border-primary transition-all resize-none"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground">Khó khăn hiện tại</label>
                    <textarea
                        value={challenges}
                        onChange={e => setChallenges(e.target.value)}
                        placeholder="Những vấn đề bạn đang gặp phải trong học tập/sự nghiệp..."
                        rows={3}
                        className="w-full px-4 py-3 bg-card border border-muted-foreground/20 rounded-lg text-sm focus:outline-none focus:border-primary transition-all resize-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground">Ý tưởng / Startup</label>
                    <textarea
                        value={startupIdeas}
                        onChange={e => setStartupIdeas(e.target.value)}
                        placeholder="Ý tưởng hoặc dự án bạn đang ấp ủ..."
                        rows={2}
                        className="w-full px-4 py-3 bg-card border border-muted-foreground/20 rounded-lg text-sm focus:outline-none focus:border-primary transition-all resize-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground">Tâm sự / Ghi chú riêng</label>
                    <textarea
                        value={personalNotes}
                        onChange={e => setPersonalNotes(e.target.value)}
                        placeholder="Những điều thầm kín bạn muốn chia sẻ với Mentor..."
                        rows={2}
                        className="w-full px-4 py-3 bg-card border border-muted-foreground/20 rounded-lg text-sm focus:outline-none focus:border-primary transition-all resize-none"
                    />
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Định hướng mục tiêu</h3>
                </div>

                <GoalListInput
                    label="Mục tiêu ngắn hạn"
                    goals={shortGoals}
                    setGoals={setShortGoals}
                    placeholder="VD: Cải thiện kỹ năng giao tiếp tiếng Anh..."
                />

                <GoalListInput
                    label="Mục tiêu dài hạn"
                    goals={longGoals}
                    setGoals={setLongGoals}
                    placeholder="VD: Trở thành Team Lead trong 3 năm tới..."
                />
            </div>

            <div className="pt-4">
                <Button type="submit" disabled={isPending} className="w-full h-11 rounded-lg text-sm font-medium transition-all group shadow-sm bg-primary hover:bg-primary/95">
                    {isPending ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Đang lưu dữ liệu...
                        </div>
                    ) : (
                        "Lưu thông tin"
                    )}
                </Button>
            </div>
        </form>
    );
}

function FinalForm({ isPending, startTransition, portfolio }: any) {
    const profile = portfolio?.mentee?.menteeProfile;

    const [goalsAchieved, setGoalsAchieved] = useState(portfolio?.finalGoalsAchieved?.toString() || "");
    const [skillsGained, setSkillsGained] = useState<string[]>([]);
    const [selfAssessment, setSelfAssessment] = useState(portfolio?.finalSelfAssessment || "");
    const [mentorFeedback, setMentorFeedback] = useState(portfolio?.finalMentorFeedback || "");
    const [recommendations, setRecommendations] = useState(portfolio?.finalRecommendations || "");

    const [strengths, setStrengths] = useState(portfolio?.finalStrengths || profile?.strengths || "");
    const [weaknesses, setWeaknesses] = useState(portfolio?.finalWeaknesses || profile?.weaknesses || "");
    const [challenges, setChallenges] = useState(portfolio?.finalChallenges || profile?.currentChallenges || "");
    const [startupIdeas, setStartupIdeas] = useState(portfolio?.finalStartupIdeas || profile?.startupIdeas || "");
    const [personalNotes, setPersonalNotes] = useState(portfolio?.finalPersonalNotes || profile?.personalNotes || "");

    useEffect(() => {
        try {
            if (portfolio?.finalSkillsGained) {
                const parsed = JSON.parse(portfolio.finalSkillsGained);
                setSkillsGained(Array.isArray(parsed) ? parsed : [portfolio.finalSkillsGained]);
            } else {
                setSkillsGained([""]);
            }
        } catch (e) {
            setSkillsGained(portfolio?.finalSkillsGained ? [portfolio.finalSkillsGained] : [""]);
        }
    }, [portfolio]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanSkills = skillsGained.filter(s => s.trim() !== "");

        startTransition(async () => {
            try {
                await completePortfolio({
                    finalGoalsAchieved: parseInt(goalsAchieved) || 0,
                    finalSkillsGained: JSON.stringify(cleanSkills),
                    finalSelfAssessment: selfAssessment,
                    finalMentorFeedback: mentorFeedback,
                    finalRecommendations: recommendations,
                    finalStrengths: strengths,
                    finalWeaknesses: weaknesses,
                    finalChallenges: challenges,
                    finalStartupIdeas: startupIdeas,
                    finalPersonalNotes: personalNotes,
                });
                toast.success("Đã hoàn thành Portfolio cuối kỳ!");
            } catch (error) {
                console.error(error);
                toast.error("Có lỗi xảy ra khi lưu Portfolio!");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">Kết quả học tập</h3>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-muted-foreground">Tỉ lệ mục tiêu đạt được (%)</label>
                            <Input type="number" min={0} max={100} value={goalsAchieved} onChange={e => setGoalsAchieved(e.target.value)} placeholder="0-100" className="h-10" />
                        </div>

                        <GoalListInput
                            label="Kỹ năng đã đạt được"
                            goals={skillsGained}
                            setGoals={setSkillsGained}
                            placeholder="VD: Quản lý thời gian, Giải quyết vấn đề..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground">Tự đánh giá cá nhân</label>
                        <textarea
                            value={selfAssessment}
                            onChange={e => setSelfAssessment(e.target.value)}
                            placeholder="Chia sẻ cảm nhận của bạn sau một học kỳ..."
                            rows={4}
                            className="w-full px-4 py-3 bg-card border border-muted-foreground/20 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all resize-none"
                        />
                    </div>

                    <div className="p-5 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
                        <h4 className="text-[11px] font-bold text-primary text-center">Cập nhật hồ sơ cuối kỳ</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground">Điểm mạnh hiện tại</label>
                                <textarea value={strengths} onChange={e => setStrengths(e.target.value)} rows={2} className="w-full mt-1 bg-white dark:bg-zinc-900 border border-border/50 rounded-md text-sm p-2" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground">Khó khăn còn lại</label>
                                <textarea value={challenges} onChange={e => setChallenges(e.target.value)} rows={2} className="w-full mt-1 bg-white dark:bg-zinc-900 border border-border/50 rounded-md text-sm p-2" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-semibold text-foreground">Phản hồi & Định hướng</h3>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-muted-foreground">Nhận xét từ Mentor</label>
                            <textarea
                                value={mentorFeedback}
                                onChange={e => setMentorFeedback(e.target.value)}
                                placeholder="Mentor sẽ viết nhận xét tại đây..."
                                rows={5}
                                className="w-full px-4 py-3 bg-muted/30 border border-muted-foreground/10 rounded-lg text-sm focus:outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-muted-foreground">Đề xuất phát triển tiếp theo</label>
                            <textarea
                                value={recommendations}
                                onChange={e => setRecommendations(e.target.value)}
                                placeholder="Ghi chú những lĩnh vực cần tập trung thêm..."
                                rows={4}
                                className="w-full px-4 py-3 bg-card border border-muted-foreground/20 rounded-lg text-sm focus:outline-none focus:border-primary transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Button type="submit" disabled={isPending} className="w-full h-11 rounded-lg text-sm font-medium transition-all shadow-sm bg-primary hover:bg-primary/95">
                {isPending ? "Đang xử lý..." : "Hoàn thành Portfolio cuối kỳ & Tổng kết"}
            </Button>
        </form>
    );
}

