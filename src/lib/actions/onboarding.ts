"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { menteeOnboardingSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function saveMenteeOnboarding(data: unknown) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.role !== "mentee") {
        return { error: "Chỉ mentee mới có thể khai hồ sơ ban đầu." };
    }

    const validated = menteeOnboardingSchema.safeParse(data);
    if (!validated.success) {
        return { error: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại." };
    }

    const d = validated.data;

    try {
        await prisma.menteeProfile.upsert({
            where: { userId },
            create: {
                userId,
                studentId: d.studentId,
                major: d.major,
                year: d.year,
                background: d.background,
                experience: d.experience,
                skills: d.skills,
                strengths: d.strengths,
                weaknesses: d.weaknesses,
                currentChallenges: d.currentChallenges,
                careerGoals: d.careerGoals,
                endGoals: d.endGoals,
                expectations: d.expectations,
                startupIdeas: d.startupIdeas,
                personalNotes: d.personalNotes,
                isOnboardingComplete: true,
                onboardingCompletedAt: new Date(),
            },
            update: {
                studentId: d.studentId,
                major: d.major,
                year: d.year,
                background: d.background,
                experience: d.experience,
                skills: d.skills,
                strengths: d.strengths,
                weaknesses: d.weaknesses,
                currentChallenges: d.currentChallenges,
                careerGoals: d.careerGoals,
                endGoals: d.endGoals,
                expectations: d.expectations,
                startupIdeas: d.startupIdeas,
                personalNotes: d.personalNotes,
                isOnboardingComplete: true,
                onboardingCompletedAt: new Date(),
            },
        });

        revalidatePath("/mentee");
        return { success: true };
    } catch (error) {
        console.error("Error saving onboarding:", error);
        return { error: "Đã xảy ra lỗi khi lưu hồ sơ. Vui lòng thử lại." };
    }
}

export async function getMenteeProfile() {
    const session = await auth();
    if (!session?.user?.id) return null;

    return prisma.menteeProfile.findUnique({
        where: { userId: session.user.id },
    });
}
