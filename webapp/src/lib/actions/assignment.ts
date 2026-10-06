"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Mentor tạo bài tập / thực hành cho buổi họp
 */
export async function createMeetingAssignment(data: {
    meetingId: string;
    title: string;
    description?: string;
    dueDate?: string | Date;
    maxScore?: number;
    attachmentUrls?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Chưa đăng nhập");

    const meeting = await prisma.meeting.findUnique({
        where: { id: data.meetingId },
        include: {
            mentorship: {
                include: { mentees: true }
            }
        }
    });

    if (!meeting) throw new Error("Buổi họp không tồn tại");

    const assignment = await prisma.meetingAssignment.create({
        data: {
            meetingId: data.meetingId,
            title: data.title,
            description: data.description || null,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            maxScore: data.maxScore || 100,
            attachmentUrls: data.attachmentUrls || null,
        }
    });

    // Thông báo cho các mentee trong buổi họp
    if (meeting.mentorship?.mentees?.length) {
        try {
            await prisma.notification.createMany({
                data: meeting.mentorship.mentees.map((m) => ({
                    userId: m.menteeId,
                    title: `Bài tập mới: ${data.title}`,
                    message: `Mentor đã giao bài tập/thực hành sau buổi "${meeting.title}". Vui lòng kiểm tra và nộp đúng hạn.`,
                    type: "reminder",
                    link: `/meetings/${data.meetingId}`,
                }))
            });
        } catch (e) {
            console.error("Failed to notify mentees about assignment:", e);
        }
    }

    revalidatePath(`/meetings/${data.meetingId}`);
    return { success: true, assignment: JSON.parse(JSON.stringify(assignment)) };
}

/**
 * Mentee nộp bài tập thực hành
 */
export async function submitAssignment(data: {
    assignmentId: string;
    content?: string;
    attachmentUrls?: string;
    githubUrl?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Chưa đăng nhập");

    const menteeId = session.user.id;

    const assignment = await prisma.meetingAssignment.findUnique({
        where: { id: data.assignmentId },
        include: { meeting: true }
    });

    if (!assignment) throw new Error("Bài tập không tồn tại");

    const submission = await prisma.assignmentSubmission.upsert({
        where: {
            assignmentId_menteeId: {
                assignmentId: data.assignmentId,
                menteeId,
            }
        },
        update: {
            content: data.content || null,
            attachmentUrls: data.attachmentUrls || null,
            githubUrl: data.githubUrl || null,
            submittedAt: new Date(),
            status: "submitted",
        },
        create: {
            assignmentId: data.assignmentId,
            menteeId,
            content: data.content || null,
            attachmentUrls: data.attachmentUrls || null,
            githubUrl: data.githubUrl || null,
            submittedAt: new Date(),
            status: "submitted",
        }
    });

    // Thông báo cho Mentor
    try {
        const menteeName = `${(session.user as any).firstName || ""} ${(session.user as any).lastName || ""}`.trim() || "Mentee";
        await prisma.notification.create({
            data: {
                userId: assignment.meeting.creatorId,
                title: `Bài nộp mới từ ${menteeName}`,
                message: `${menteeName} đã nộp bài tập "${assignment.title}". Hãy vào xem và chấm điểm nhé.`,
                type: "feedback",
                link: `/meetings/${assignment.meetingId}`,
            }
        });
    } catch (e) {
        console.error("Failed to notify mentor about submission:", e);
    }

    revalidatePath(`/meetings/${assignment.meetingId}`);
    return { success: true, submission: JSON.parse(JSON.stringify(submission)) };
}

/**
 * Mentor chấm điểm và nhận xét bài nộp
 */
export async function gradeAssignment(data: {
    submissionId: string;
    score: number;
    mentorFeedback: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Chưa đăng nhập");

    const submission = await prisma.assignmentSubmission.update({
        where: { id: data.submissionId },
        data: {
            score: data.score,
            mentorFeedback: data.mentorFeedback,
            status: "reviewed",
        },
        include: {
            assignment: { select: { title: true, meetingId: true } },
            mentee: { select: { id: true, firstName: true } }
        }
    });

    // Thông báo cho Mentee kết quả chấm bài
    try {
        await prisma.notification.create({
            data: {
                userId: submission.menteeId,
                title: `Điểm bài tập: ${submission.assignment.title}`,
                message: `Mentor đã chấm bài: ${data.score} điểm kèm nhận xét. Nhấn để xem chi tiết.`,
                type: "feedback",
                link: `/meetings/${submission.assignment.meetingId}`,
            }
        });
    } catch (e) {
        console.error("Failed to notify mentee about grade:", e);
    }

    revalidatePath(`/meetings/${submission.assignment.meetingId}`);
    return { success: true, submission: JSON.parse(JSON.stringify(submission)) };
}

/**
 * Lấy danh sách bài tập và bài nộp của một buổi meeting
 */
export async function getMeetingAssignments(meetingId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const assignments = await prisma.meetingAssignment.findMany({
        where: { meetingId },
        include: {
            submissions: {
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
                },
                orderBy: { submittedAt: "desc" }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return JSON.parse(JSON.stringify(assignments));
}
