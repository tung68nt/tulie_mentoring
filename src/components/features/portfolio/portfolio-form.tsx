"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertPortfolio, completePortfolio } from "@/lib/actions/portfolio";

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

function InitialForm({ isPending, startTransition, portfolio }: any) {
    const [mbti, setMbti] = useState(portfolio?.personalityMbti || "");
    const [disc, setDisc] = useState(portfolio?.personalityDisc || "");
    const [holland, setHolland] = useState(portfolio?.personalityHolland || "");
    const [shortGoals, setShortGoals] = useState(portfolio?.shortTermGoals || "");
    const [longGoals, setLongGoals] = useState(portfolio?.longTermGoals || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            await upsertPortfolio({
                personalityMbti: mbti,
                personalityDisc: disc,
                personalityHolland: holland,
                shortTermGoals: shortGoals,
                longTermGoals: longGoals,
            });
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">MBTI</label>
                    <Input value={mbti} onChange={e => setMbti(e.target.value)} placeholder="VD: INTJ" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">DISC</label>
                    <Input value={disc} onChange={e => setDisc(e.target.value)} placeholder="VD: D/I" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Holland</label>
                    <Input value={holland} onChange={e => setHolland(e.target.value)} placeholder="VD: RIA" />
                </div>
            </div>

            <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Mục tiêu ngắn hạn (JSON array)</label>
                <textarea
                    value={shortGoals}
                    onChange={e => setShortGoals(e.target.value)}
                    placeholder='["Nâng cao kỹ năng giao tiếp", "Học thêm về Data Analysis"]'
                    rows={3}
                    className="w-full px-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all resize-none"
                />
            </div>

            <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Mục tiêu dài hạn (JSON array)</label>
                <textarea
                    value={longGoals}
                    onChange={e => setLongGoals(e.target.value)}
                    placeholder='["Trở thành PM", "Xây dựng mạng lưới chuyên gia"]'
                    rows={3}
                    className="w-full px-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all resize-none"
                />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Đang lưu..." : "Hoàn thành đánh giá ban đầu"}
            </Button>
        </form>
    );
}

function FinalForm({ isPending, startTransition, portfolio }: any) {
    const [goalsAchieved, setGoalsAchieved] = useState(portfolio?.finalGoalsAchieved?.toString() || "");
    const [skillsGained, setSkillsGained] = useState(portfolio?.finalSkillsGained || "");
    const [selfAssessment, setSelfAssessment] = useState(portfolio?.finalSelfAssessment || "");
    const [mentorFeedback, setMentorFeedback] = useState(portfolio?.finalMentorFeedback || "");
    const [recommendations, setRecommendations] = useState(portfolio?.finalRecommendations || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            await completePortfolio({
                finalGoalsAchieved: parseInt(goalsAchieved) || 0,
                finalSkillsGained: skillsGained,
                finalSelfAssessment: selfAssessment,
                finalMentorFeedback: mentorFeedback,
                finalRecommendations: recommendations,
            });
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tỉ lệ mục tiêu đạt được (%)</label>
                <Input type="number" min={0} max={100} value={goalsAchieved} onChange={e => setGoalsAchieved(e.target.value)} placeholder="0-100" />
            </div>

            <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Kỹ năng đã đạt được (JSON array)</label>
                <textarea
                    value={skillsGained}
                    onChange={e => setSkillsGained(e.target.value)}
                    placeholder='["Kỹ năng thuyết trình", "Tư duy phản biện"]'
                    rows={3}
                    className="w-full px-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all resize-none"
                />
            </div>

            <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tự đánh giá</label>
                <textarea
                    value={selfAssessment}
                    onChange={e => setSelfAssessment(e.target.value)}
                    placeholder="Chia sẻ đánh giá của bạn về quá trình phát triển..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all resize-none"
                />
            </div>

            <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nhận xét từ Mentor</label>
                <textarea
                    value={mentorFeedback}
                    onChange={e => setMentorFeedback(e.target.value)}
                    placeholder="Nhận xét của Mentor về quá trình mentoring..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all resize-none"
                />
            </div>

            <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Đề xuất phát triển</label>
                <textarea
                    value={recommendations}
                    onChange={e => setRecommendations(e.target.value)}
                    placeholder="Đề xuất các bước tiếp theo..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all resize-none"
                />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Đang lưu..." : "Hoàn thành Portfolio cuối kỳ"}
            </Button>
        </form>
    );
}
