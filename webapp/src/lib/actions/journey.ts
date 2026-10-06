"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export interface JourneyStats {
    menteeId: string;
    menteeName: string;
    avatar?: string | null;
    engagementScore: number;
    engagementLevel: "gương_mẫu" | "tích_cực" | "tiềm_năng" | "cần_cố_gắng";
    levelLabel: string;
    levelColor: string;
    attendance: {
        totalMeetings: number;
        presentCount: number;
        faceVerifiedCount: number;
        absentWithReasonCount: number;
        attendanceRate: number;
    };
    reflections: {
        submittedCount: number;
        dailyDiariesCount: number;
        totalReports: number;
    };
    questions: {
        askedToMentorCount: number;
    };
    assignments: {
        totalAssigned: number;
        submittedCount: number;
        averageScore: number | null;
        submissionRate: number;
    };
    onboarding: {
        isComplete: boolean;
        personalityType: string | null;
        hasPortraitPhoto: boolean;
    };
}

/**
 * Tính toán toàn bộ thông số hành trình & chỉ số chăm chỉ, tập trung của Mentee
 */
export async function getMenteeJourneyStats(targetMenteeId?: string): Promise<JourneyStats | null> {
    const session = await auth();
    if (!session?.user?.id) return null;

    const menteeId = targetMenteeId || session.user.id;

    const user = await prisma.user.findUnique({
        where: { id: menteeId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            menteeProfile: {
                select: {
                    isOnboardingComplete: true,
                    personalityType: true,
                    portraitPhoto: true,
                }
            }
        }
    });

    if (!user) return null;

    // 1. Thống kê Chuyên cần (Attendance & RSVP)
    const attendances = await prisma.attendance.findMany({
        where: { userId: menteeId },
        select: {
            status: true,
            verifiedByFace: true,
            rsvpStatus: true,
            declineReason: true,
            preMeetingQuestions: true,
        }
    });

    const totalMeetings = attendances.length;
    const presentCount = attendances.filter((a) => a.status === "present").length;
    const faceVerifiedCount = attendances.filter((a) => a.verifiedByFace).length;
    const absentWithReasonCount = attendances.filter((a) => a.rsvpStatus === "declined" && a.declineReason).length;
    const attendanceRate = totalMeetings > 0 ? Math.round((presentCount / totalMeetings) * 100) : 100;

    // 2. Thống kê Câu hỏi gửi Mentor
    const askedToMentorCount = attendances.filter((a) => a.preMeetingQuestions && a.preMeetingQuestions.trim()).length;

    // 3. Thống kê Thu hoạch Mentoring sau các buổi học
    const sessionReflectionsCount = await prisma.sessionReflection.count({
        where: { menteeId, submittedAt: { not: null } }
    });

    // 4. Thống kê Bài tập / Thực hành
    const submissions = await prisma.assignmentSubmission.findMany({
        where: { menteeId },
        select: {
            score: true,
            status: true,
        }
    });

    const submittedCount = submissions.length;
    const scoredSubmissions = submissions.filter((s) => s.score !== null);
    const averageScore = scoredSubmissions.length > 0
        ? Math.round(scoredSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / scoredSubmissions.length)
        : null;

    // Tổng số bài tập được giao cho các buổi họp mà mentee có mặt/thuộc về
    const meetingIds = (await prisma.attendance.findMany({
        where: { userId: menteeId },
        select: { meetingId: true }
    })).map(a => a.meetingId);

    const totalAssigned = await prisma.meetingAssignment.count({
        where: { meetingId: { in: meetingIds } }
    });

    const submissionRate = totalAssigned > 0 ? Math.round((submittedCount / totalAssigned) * 100) : 0;

    // 5. Trạng thái khảo sát & DISC
    const isComplete = !!user.menteeProfile?.isOnboardingComplete;
    const personalityType = user.menteeProfile?.personalityType || null;
    const hasPortraitPhoto = !!user.menteeProfile?.portraitPhoto;

    // 6. TÍNH CHỈ SỐ NHIỆT TÌNH / CHĂM CHỈ (ENGAGEMENT SCORE / 100)
    // - Chuyên cần họp: Max 30 điểm
    const attendancePoints = totalMeetings > 0 ? (presentCount / totalMeetings) * 30 : 25;
    // - Thu hoạch Mentoring sau buổi học: Max 25 điểm (mỗi bài thu hoạch 5 điểm)
    const reportPoints = Math.min(25, sessionReflectionsCount * 5);
    // - Bài tập thực hành: Max 25 điểm (theo tỷ lệ nộp và điểm)
    const assignmentPoints = totalAssigned > 0
        ? (submittedCount / totalAssigned) * 15 + ((averageScore || 80) / 100) * 10
        : (submittedCount > 0 ? 20 : 15);
    // - Khảo sát đầu vào & DISC: Max 10 điểm
    const onboardingPoints = isComplete ? 10 : 2;
    // - Hỏi đáp chủ động: Max 10 điểm
    const questionPoints = Math.min(10, askedToMentorCount * 3 + (askedToMentorCount > 0 ? 4 : 0));

    const engagementScore = Math.min(100, Math.round(
        attendancePoints + reportPoints + assignmentPoints + onboardingPoints + questionPoints
    ));

    // Cấp độ nỗ lực
    let engagementLevel: "gương_mẫu" | "tích_cực" | "tiềm_năng" | "cần_cố_gắng" = "tích_cực";
    let levelLabel = "Tích Cực & Nhiệt Tình";
    let levelColor = "text-blue-600 bg-blue-500/10 border-blue-500/30";

    if (engagementScore >= 90) {
        engagementLevel = "gương_mẫu";
        levelLabel = "Gương Mẫu & Xuất Sắc";
        levelColor = "text-emerald-600 bg-emerald-500/10 border-emerald-500/30";
    } else if (engagementScore >= 75) {
        engagementLevel = "tích_cực";
        levelLabel = "Tích Cực & Chăm Chỉ";
        levelColor = "text-sky-600 bg-sky-500/10 border-sky-500/30";
    } else if (engagementScore >= 60) {
        engagementLevel = "tiềm_năng";
        levelLabel = "Tiềm Năng (Cần Đều Đặn Hơn)";
        levelColor = "text-amber-600 bg-amber-500/10 border-amber-500/30";
    } else {
        engagementLevel = "cần_cố_gắng";
        levelLabel = "Cần Mentor Đôn Đốc";
        levelColor = "text-rose-600 bg-rose-500/10 border-rose-500/30";
    }

    return {
        menteeId,
        menteeName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Mentee",
        avatar: user.avatar,
        engagementScore,
        engagementLevel,
        levelLabel,
        levelColor,
        attendance: {
            totalMeetings,
            presentCount,
            faceVerifiedCount,
            absentWithReasonCount,
            attendanceRate,
        },
        reflections: {
            submittedCount: sessionReflectionsCount,
            dailyDiariesCount: 0,
            totalReports: sessionReflectionsCount,
        },
        questions: {
            askedToMentorCount,
        },
        assignments: {
            totalAssigned,
            submittedCount,
            averageScore,
            submissionRate,
        },
        onboarding: {
            isComplete,
            personalityType,
            hasPortraitPhoto,
        }
    };
}
