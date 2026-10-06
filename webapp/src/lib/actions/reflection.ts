"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

/**
 * Get reflections from mentees for mentor/admin view.
 * Mentor sees only reflections from their mentorships.
 * Admin sees all reflections.
 */
export async function getMentorReflections() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    if (role !== "mentor" && role !== "admin" && role !== "program_manager") {
        throw new Error("Permission denied");
    }

    const mentorFilter = role === "admin" || role === "program_manager"
        ? {}
        : { meeting: { mentorship: { mentorId: session.user.id! } } };

    const reflections = await prisma.sessionReflection.findMany({
        where: mentorFilter,
        include: {
            mentee: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                }
            },
            meeting: {
                select: {
                    id: true,
                    title: true,
                    scheduledAt: true,
                    mentorship: {
                        select: {
                            id: true,
                            mentor: { select: { firstName: true, lastName: true } },
                            mentees: {
                                select: {
                                    mentee: { select: { id: true, firstName: true, lastName: true } }
                                }
                            }
                        }
                    }
                }
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return JSON.parse(JSON.stringify(reflections));
}

/**
 * Get mentor reflection stats: total expected vs submitted vs confirmed
 */
export async function getMentorReflectionStats() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    if (role !== "mentor" && role !== "admin" && role !== "program_manager") {
        throw new Error("Permission denied");
    }

    const mentorFilter = role === "admin" || role === "program_manager"
        ? {}
        : { mentorId: session.user.id! };

    // Get all meetings in mentor's mentorships
    const meetings = await prisma.meeting.findMany({
        where: {
            mentorship: mentorFilter,
        },
        include: {
            sessionReflections: { select: { id: true, mentorConfirmed: true } },
            mentorship: {
                select: {
                    mentees: { select: { menteeId: true } }
                }
            }
        }
    });

    let totalExpected = 0;
    let totalSubmitted = 0;
    let totalConfirmed = 0;

    for (const m of meetings) {
        const menteeCount = m.mentorship?.mentees?.length || 0;
        totalExpected += menteeCount;
        totalSubmitted += m.sessionReflections.length;
        totalConfirmed += m.sessionReflections.filter(r => r.mentorConfirmed).length;
    }

    return {
        totalExpected,
        totalSubmitted,
        totalConfirmed,
        submissionRate: totalExpected > 0 ? Math.round((totalSubmitted / totalExpected) * 100) : 0,
        confirmationRate: totalSubmitted > 0 ? Math.round((totalConfirmed / totalSubmitted) * 100) : 0,
        pendingConfirmation: totalSubmitted - totalConfirmed,
    };
}

export async function getRecentMeetingsForReflection() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // Meetings the user attended (status present) but doesn't have a reflection for yet
    const meetings = await prisma.meeting.findMany({
        where: {
            attendances: {
                some: {
                    userId: session.user.id!,
                    status: "present"
                }
            },
            sessionReflections: {
                none: {
                    menteeId: session.user.id!
                }
            }
        },
        include: {
            mentorship: {
                include: {
                    mentor: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }
        },
        orderBy: {
            scheduledAt: "desc"
        }
    });

    return JSON.parse(JSON.stringify(meetings));
}

export async function upsertReflection(
    meetingId: string,
    dataOrContent: string | {
        keyLearnings?: string;
        actionCommitment?: string;
        blockers?: string;
        rating?: number;
        content?: string;
    }
) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const payload = typeof dataOrContent === "string" 
        ? { content: dataOrContent }
        : dataOrContent;

    const reflection = await prisma.sessionReflection.upsert({
        where: {
            meetingId_menteeId: {
                meetingId,
                menteeId: session.user.id!
            }
        },
        update: {
            content: payload.content || `${payload.keyLearnings || ""}\n\nCam kết: ${payload.actionCommitment || ""}`,
            keyLearnings: payload.keyLearnings,
            actionCommitment: payload.actionCommitment,
            blockers: payload.blockers,
            rating: payload.rating || 5,
            submittedAt: new Date(),
            updatedAt: new Date()
        },
        create: {
            meetingId,
            menteeId: session.user.id!,
            content: payload.content || `${payload.keyLearnings || ""}\n\nCam kết: ${payload.actionCommitment || ""}`,
            keyLearnings: payload.keyLearnings,
            actionCommitment: payload.actionCommitment,
            blockers: payload.blockers,
            rating: payload.rating || 5,
            submittedAt: new Date(),
        }
    });

    revalidatePath("/reflections");
    revalidatePath(`/meetings/${meetingId}`);

    // Log activity
    await logActivity("submit_reflection", reflection.id, "reflection", { meetingId });

    return JSON.parse(JSON.stringify(reflection));
}

/**
 * Lấy danh sách nộp bài thu hoạch của tất cả mentee trong 1 buổi họp nhóm
 */
export async function getMeetingReflectionsForGroup(meetingId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        include: {
            mentorship: {
                include: {
                    mentees: {
                        include: {
                            mentee: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                    email: true,
                                }
                            }
                        }
                    }
                }
            },
            sessionReflections: {
                include: {
                    mentee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        }
                    }
                }
            }
        }
    });

    if (!meeting) return null;

    const mentees = meeting.mentorship?.mentees.map(m => m.mentee) || [];
    const reflectionsMap = new Map(meeting.sessionReflections.map(r => [r.menteeId, r]));

    const groupStatus = mentees.map(mentee => {
        const ref = reflectionsMap.get(mentee.id);
        return {
            mentee,
            isSubmitted: !!ref,
            reflection: ref || null,
        };
    });

    return {
        meetingTitle: meeting.title,
        scheduledAt: meeting.scheduledAt,
        status: meeting.status,
        totalMentees: mentees.length,
        submittedCount: meeting.sessionReflections.length,
        items: groupStatus,
    };
}

/**
 * Mentor gửi phản hồi / nhận xét bài thu hoạch của mentee
 */
export async function mentorReviewReflection(reflectionId: string, mentorFeedback: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const reflection = await prisma.sessionReflection.update({
        where: { id: reflectionId },
        data: {
            mentorFeedback,
            mentorConfirmed: true,
        }
    });

    revalidatePath("/reflections");
    return JSON.parse(JSON.stringify(reflection));
}

export async function getReflections() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const reflections = await prisma.sessionReflection.findMany({
        where: {
            menteeId: session.user.id!
        },
        include: {
            meeting: {
                include: {
                    mentorship: {
                        include: {
                            mentor: {
                                select: {
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return JSON.parse(JSON.stringify(reflections));
}

export async function confirmReflection(id: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "mentor") {
        throw new Error("Only mentors can confirm reflections");
    }

    const reflection = await prisma.sessionReflection.update({
        where: { id },
        data: { mentorConfirmed: true },
    });

    revalidatePath("/reflections");
    return JSON.parse(JSON.stringify(reflection));
}

export async function deleteReflection(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const reflection = await prisma.sessionReflection.findUnique({
        where: { id },
    });

    if (!reflection) throw new Error("Reflection not found");

    const role = (session.user as any).role;
    if (role === "mentee" && reflection.mentorConfirmed) {
        throw new Error("Cannot delete a confirmed reflection");
    }

    await prisma.sessionReflection.delete({
        where: { id },
    });

    revalidatePath("/reflections");
    return { success: true };
}

export async function getMentorMenteeReflections() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const role = (session.user as any).role;
    const mentorFilter = role === "admin" || role === "program_manager"
        ? {}
        : { mentorId: session.user.id! };

    const mentorships = await prisma.mentorship.findMany({
        where: mentorFilter,
        include: {
            mentees: {
                include: {
                    mentee: {
                        select: { id: true, firstName: true, lastName: true, avatar: true }
                    }
                }
            },
            meetings: {
                orderBy: { scheduledAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    scheduledAt: true,
                    status: true,
                    sessionReflections: {
                        select: { id: true, content: true, mentorConfirmed: true, menteeId: true, createdAt: true }
                    }
                }
            }
        }
    });

    return JSON.parse(JSON.stringify(mentorships));
}
