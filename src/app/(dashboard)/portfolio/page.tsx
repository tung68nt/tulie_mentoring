import { auth } from "@/lib/auth";
import { getPortfolio } from "@/lib/actions/portfolio";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { PortfolioForm } from "@/components/features/portfolio/portfolio-form";
import { CheckCircle2, BookOpen, Target, Brain, Award, ArrowRight } from "lucide-react";

export default async function PortfolioPage() {
    const session = await auth();
    const role = (session?.user as any).role;
    const portfolio = await getPortfolio();

    const hasInitialAssessment = !!portfolio?.initialCompletedAt;
    const hasFinalPortfolio = !!portfolio?.finalCompletedAt;

    return (
        <div className="space-y-8 pb-10">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Hồ sơ năng lực</h1>
                <p className="text-sm text-muted-foreground mt-1">Đánh giá ban đầu và tổng kết quá trình phát triển</p>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${hasInitialAssessment ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {hasInitialAssessment ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 rounded-full border border-foreground/20" />}
                    Đánh giá ban đầu
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${hasFinalPortfolio ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {hasFinalPortfolio ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 rounded-full border border-foreground/20" />}
                    Portfolio cuối kỳ
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {!hasInitialAssessment ? (
                        <Card className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-md bg-muted border border-border flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">Đánh giá ban đầu</h3>
                                    <p className="text-xs text-muted-foreground">Hoàn thành đánh giá để bắt đầu chương trình</p>
                                </div>
                            </div>
                            <PortfolioForm type="initial" portfolio={portfolio ? JSON.parse(JSON.stringify(portfolio)) : null} />
                        </Card>
                    ) : (
                        <>
                            {/* Initial assessment result */}
                            <Card>
                                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <Brain className="w-4 h-4 text-muted-foreground" />
                                    Kết quả đánh giá ban đầu
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    {portfolio?.personalityMbti && (
                                        <div className="p-4 bg-muted rounded-md text-center">
                                            <p className="text-[10px] text-muted-foreground mb-1">MBTI</p>
                                            <p className="text-lg font-bold text-foreground">{portfolio.personalityMbti}</p>
                                        </div>
                                    )}
                                    {portfolio?.personalityDisc && (
                                        <div className="p-4 bg-muted rounded-md text-center">
                                            <p className="text-[10px] text-muted-foreground mb-1">DISC</p>
                                            <p className="text-lg font-bold text-foreground">{portfolio.personalityDisc}</p>
                                        </div>
                                    )}
                                    {portfolio?.personalityHolland && (
                                        <div className="p-4 bg-muted rounded-md text-center">
                                            <p className="text-[10px] text-muted-foreground mb-1">Holland</p>
                                            <p className="text-lg font-bold text-foreground">{portfolio.personalityHolland}</p>
                                        </div>
                                    )}
                                </div>

                                {portfolio?.competencies && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-medium text-muted-foreground">Năng lực đánh giá</p>
                                        {Object.entries(JSON.parse(portfolio.competencies)).map(([key, val]) => (
                                            <div key={key} className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground w-28 capitalize">{key}</span>
                                                <Progress value={(val as number) * 10} size="xs" color="default" />
                                                <span className="text-xs font-medium text-foreground w-8 text-right">{val as number}/10</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>

                            {/* Final portfolio form or result */}
                            {!hasFinalPortfolio && role === "mentee" && (
                                <Card className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-md bg-muted border border-border flex items-center justify-center">
                                            <Award className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-foreground">Portfolio cuối kỳ</h3>
                                            <p className="text-xs text-muted-foreground">Tổng kết quá trình phát triển</p>
                                        </div>
                                    </div>
                                    <PortfolioForm type="final" portfolio={portfolio ? JSON.parse(JSON.stringify(portfolio)) : null} />
                                </Card>
                            )}

                            {hasFinalPortfolio && (
                                <Card>
                                    <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <Award className="w-4 h-4 text-muted-foreground" />
                                        Tổng kết cuối kỳ
                                    </h3>
                                    <div className="space-y-4">
                                        {portfolio?.finalGoalsAchieved != null && (
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-2">Mục tiêu đạt được</p>
                                                <div className="flex items-center gap-3">
                                                    <Progress value={portfolio.finalGoalsAchieved} size="sm" color={portfolio.finalGoalsAchieved >= 80 ? "success" : "default"} />
                                                    <span className="text-sm font-semibold text-foreground">{portfolio.finalGoalsAchieved}%</span>
                                                </div>
                                            </div>
                                        )}
                                        {portfolio?.finalSelfAssessment && (
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Tự đánh giá</p>
                                                <p className="text-sm text-foreground leading-relaxed bg-muted p-3 rounded-md">{portfolio.finalSelfAssessment}</p>
                                            </div>
                                        )}
                                        {portfolio?.finalMentorFeedback && (
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Nhận xét từ Mentor</p>
                                                <p className="text-sm text-foreground leading-relaxed bg-muted p-3 rounded-md">{portfolio.finalMentorFeedback}</p>
                                            </div>
                                        )}
                                        {portfolio?.finalRecommendations && (
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Đề xuất phát triển</p>
                                                <p className="text-sm text-foreground leading-relaxed bg-muted p-3 rounded-md">{portfolio.finalRecommendations}</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}
                        </>
                    )}
                </div>

                {/* Sidebar: Goals */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            Mục tiêu cá nhân
                        </h3>

                        {portfolio?.shortTermGoals ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Ngắn hạn</p>
                                    <ul className="space-y-1.5">
                                        {JSON.parse(portfolio.shortTermGoals).map((goal: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                {goal}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {portfolio.longTermGoals && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2">Dài hạn</p>
                                        <ul className="space-y-1.5">
                                            {JSON.parse(portfolio.longTermGoals).map((goal: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                                                    {goal}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<Target className="w-5 h-5" />}
                                title="Chưa thiết lập mục tiêu"
                                description="Hoàn thành đánh giá ban đầu để bắt đầu"
                                className="py-8"
                            />
                        )}
                    </Card>

                    {portfolio?.finalSkillsGained && (
                        <Card>
                            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-muted-foreground" />
                                Kỹ năng đã đạt
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {JSON.parse(portfolio.finalSkillsGained).map((skill: string) => (
                                    <span key={skill} className="px-2 py-1 bg-muted border border-border rounded-md text-xs text-muted-foreground">{skill}</span>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
