"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "./activity";
import { audit } from "@/lib/audit";
import { attachFiles } from "@/lib/files";
import { canReviewMentee } from "@/lib/access";
import { isMenteeOfMentorship } from "@/lib/access";

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

const reflectionSchema = z.object({
    meetingId: z.string().min(1).max(64),
    content: z.string().max(200_000).default(""),
    linkUrl: z.string().trim().max(500).url().refine((u) => /^https?:\/\//i.test(u), "Chỉ chấp nhận liên kết http(s)").optional().or(z.literal("")),
    fileIds: z.array(z.string().max(64)).max(5).default([]),
    submit: z.boolean().default(false),
});

/**
 * Mentee lưu nháp hoặc nộp thu hoạch cho một buổi họp mà mình tham gia.
 * Không sửa được sau khi mentor đã xác nhận.
 */
export async function upsertReflection(meetingId: string, content: string, extras?: { linkUrl?: string; fileIds?: string[]; submit?: boolean }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;
    if ((session.user as any).role !== "mentee") throw new Error("Chỉ mentee mới viết thu hoạch");

    const parsed = reflectionSchema.safeParse({ meetingId, content, ...extras });
    if (!parsed.success) throw new Error("Dữ liệu thu hoạch không hợp lệ");
    const d = parsed.data;

    const meeting = await prisma.meeting.findUnique({ where: { id: d.meetingId }, select: { mentorshipId: true } });
    if (!meeting?.mentorshipId || !(await isMenteeOfMentorship(userId, meeting.mentorshipId))) {
        throw new Error("Bạn không thuộc buổi họp này");
    }

    const existing = await prisma.sessionReflection.findUnique({
        where: { meetingId_menteeId: { meetingId: d.meetingId, menteeId: userId } },
        select: { id: true, mentorConfirmed: true },
    });
    if (existing?.mentorConfirmed) throw new Error("Thu hoạch đã được mentor xác nhận, không thể chỉnh sửa");

    if (d.submit && !d.content.trim() && d.fileIds.length === 0 && !d.linkUrl) {
        throw new Error("Hãy viết nội dung hoặc đính kèm tệp/liên kết trước khi nộp");
    }

    const data = {
        content: d.content,
        linkUrl: d.linkUrl || null,
        ...(d.submit ? { status: "submitted", submittedAt: new Date() } : {}),
    };
    const reflection = await prisma.sessionReflection.upsert({
        where: { meetingId_menteeId: { meetingId: d.meetingId, menteeId: userId } },
        update: data,
        create: { meetingId: d.meetingId, menteeId: userId, ...data },
    });

    await attachFiles({ ownerId: userId, purpose: "reflection", fileIds: d.fileIds, target: { reflectionId: reflection.id } });

    revalidatePath("/reflections");
    await logActivity(d.submit ? "submit_reflection" : "save_reflection", reflection.id, "reflection", { meetingId: d.meetingId });

    return JSON.parse(JSON.stringify(reflection));
}

/** Mentor của cặp (hoặc admin/PM) nhận xét và/hoặc xác nhận thu hoạch. */
export async function reviewReflection(id: string, feedback: string, confirm = true) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const userId = session.user.id;
    const role = (session.user as any).role as string;

    const text = z.string().max(5000).parse(feedback ?? "");
    const reflection = await prisma.sessionReflection.findUnique({ where: { id }, select: { id: true, menteeId: true, status: true } });
    if (!reflection || !(await canReviewMentee(userId, role, reflection.menteeId))) {
        throw new Error("Không tìm thấy thu hoạch");
    }
    if (reflection.status === "draft") throw new Error("Mentee chưa nộp thu hoạch này");

    const updated = await prisma.sessionReflection.update({
        where: { id },
        data: {
            mentorFeedback: text || null,
            reviewedAt: new Date(),
            reviewedById: userId,
            ...(confirm ? { mentorConfirmed: true, status: "reviewed" } : {}),
        },
    });
    await audit({ action: "reflection.review", entityType: "reflection", entityId: id });
    revalidatePath("/reflections");
    return JSON.parse(JSON.stringify(updated));
}

export async function getReflections() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const reflections = await prisma.sessionReflection.findMany({
        where: {
            menteeId: session.user.id!
        },
        include: {
            files: { where: { status: "ready" }, select: { id: true, fileName: true, size: true } },
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
    return reviewReflection(id, "", true);
}

export async function deleteReflection(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const reflection = await prisma.sessionReflection.findUnique({
        where: { id },
    });

    if (!reflection) throw new Error("Reflection not found");

    const role = (session.user as any).role;
    const isOwner = reflection.menteeId === session.user.id;
    if (!isOwner && role !== "admin") throw new Error("Reflection not found");
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
                        select: {
                            id: true, content: true, mentorConfirmed: true, menteeId: true, createdAt: true,
                            status: true, submittedAt: true, linkUrl: true, mentorFeedback: true,
                            files: { where: { status: "ready" }, select: { id: true, fileName: true, size: true } },
                        }
                    }
                }
            }
        }
    });

    return JSON.parse(JSON.stringify(mentorships));
}
