"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getMenteeRankings(filters?: {
    programCycleId?: string;
    facilitatorId?: string;
    mentorId?: string;
}) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const role = (session.user as any).role;

    // Security check by role
    let effectiveFilters = { ...filters };
    if (role === "mentor") {
        effectiveFilters.mentorId = session.user.id;
    } else if (role === "facilitator") {
        // Assume facilitator manages specific mentorships
        // effectiveFilters.facilitatorId = session.user.id;
    }

    // Build where clause — only include filters that are defined
    const menteeFilter: any = {};
    if (effectiveFilters.mentorId || effectiveFilters.facilitatorId) {
        menteeFilter.menteeships = {
            some: {
                mentorship: {
                    ...(effectiveFilters.mentorId ? { mentorId: effectiveFilters.mentorId } : {}),
                    ...(effectiveFilters.facilitatorId ? {
                        facilitatorAssignments: {
                            some: { facilitatorId: effectiveFilters.facilitatorId }
                        }
                    } : {})
                }
            }
        };
    }

    let rankings = await prisma.menteeRanking.findMany({
        where: {
            programCycleId: effectiveFilters.programCycleId,
            ...(Object.keys(menteeFilter).length > 0 ? { mentee: menteeFilter } : {}),
        },
        orderBy: {
            totalScore: "desc",
        },
        include: {
            mentee: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    image: true,
                },
            },
        },
    });

    // Auto-compute rankings if none exist
    if (rankings.length === 0) {
        // Find the active program cycle
        const activeCycle = effectiveFilters.programCycleId
            ? { id: effectiveFilters.programCycleId }
            : await prisma.programCycle.findFirst({
                where: { status: "active" },
                orderBy: { startDate: "desc" },
            });

        if (activeCycle) {
            await computeRankings(activeCycle.id);

            // Re-fetch after computing
            rankings = await prisma.menteeRanking.findMany({
                where: {
                    programCycleId: activeCycle.id,
                    ...(Object.keys(menteeFilter).length > 0 ? { mentee: menteeFilter } : {}),
                },
                orderBy: {
                    totalScore: "desc",
                },
                include: {
                    mentee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            image: true,
                        },
                    },
                },
            });
        }
    }

    return rankings;
}

export async function computeRankings(programCycleId: string) {
    // 1. Get all mentees in the cycle
    const mentees = await prisma.user.findMany({
        where: {
            role: "mentee",
            menteeships: {
                some: {
                    mentorship: {
                        programCycleId: programCycleId
                    }
                }
            }
        },
        include: {
            attendances: {
                where: {
                    meeting: {
                        mentorship: {
                            programCycleId: programCycleId
                        }
                    }
                }
            },
            goalsCreated: {
                where: {
                    mentorship: {
                        programCycleId: programCycleId
                    }
                }
            },
            menteeEvaluations: {
                include: {
                    answers: true
                }
            }
        }
    });

    // 2. Simplified Scoring Logic
    for (const mentee of mentees) {
        let attendanceScore = 0;
        if (mentee.attendances.length > 0) {
            const presentCount = mentee.attendances.filter(a => a.status === "present" || a.status === "late").length;
            attendanceScore = (presentCount / mentee.attendances.length) * 100;
        }

        let goalScore = 0;
        if (mentee.goalsCreated.length > 0) {
            const completedGoals = mentee.goalsCreated.filter(g => g.status === "completed").length;
            goalScore = (completedGoals / mentee.goalsCreated.length) * 100;
        }

        let evalScore = 0;
        const recentEvals = mentee.menteeEvaluations.slice(-5);
        if (recentEvals.length > 0) {
            let totalWeights = 0;
            let totalWeightedScore = 0;
            for (const evalEntry of recentEvals) {
                for (const answer of evalEntry.answers) {
                    if (answer.score !== null) {
                        totalWeightedScore += answer.score;
                        totalWeights += 1;
                    }
                }
            }
            if (totalWeights > 0) evalScore = totalWeightedScore / totalWeights;
        }

        // Weighted Total (Example 30-30-40)
        const totalScore = (attendanceScore * 0.3) + (goalScore * 0.3) + (evalScore * 0.4);

        await prisma.menteeRanking.upsert({
            where: {
                menteeId_programCycleId: {
                    menteeId: mentee.id,
                    programCycleId: programCycleId
                }
            },
            update: {
                totalScore,
                rank: 0, // Will be sort-updated later
                metrics: {
                    attendance: Number(attendanceScore.toFixed(2)),
                    goals: Number(goalScore.toFixed(2)),
                    evals: Number(evalScore.toFixed(2))
                }
            },
            create: {
                menteeId: mentee.id,
                programCycleId: programCycleId,
                totalScore,
                rank: 0,
                metrics: {
                    attendance: Number(attendanceScore.toFixed(2)),
                    goals: Number(goalScore.toFixed(2)),
                    evals: Number(evalScore.toFixed(2))
                }
            }
        });
    }

    // 3. Update Rank positions
    const sortedRankings = await prisma.menteeRanking.findMany({
        where: { programCycleId },
        orderBy: { totalScore: "desc" }
    });

    for (let i = 0; i < sortedRankings.length; i++) {
        await prisma.menteeRanking.update({
            where: { id: sortedRankings[i].id },
            data: { rank: i + 1 }
        });
    }
}
