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
        return { error: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc." };
    }

    const d = validated.data;

    try {
        // Cập nhật thông tin User cơ bản nếu có
        await prisma.user.update({
            where: { id: userId },
            data: {
                phone: d.phone || user.phone,
                avatar: d.portraitPhoto || user.avatar || user.image,
            },
        });

        await prisma.menteeProfile.upsert({
            where: { userId },
            create: {
                userId,
                studentId: d.studentId,
                major: d.major,
                year: d.year,
                age: d.age,
                telegram: d.telegram,
                zalo: d.zalo,
                facebookUrl: d.facebookUrl,
                linkedinUrl: d.linkedinUrl,
                githubUrl: d.githubUrl,
                portraitPhoto: d.portraitPhoto,
                personalityType: d.personalityType,
                personalityScores: d.personalityScores,
                personalityTestUrl: d.personalityTestUrl,
                personalNeeds: d.personalNeeds,
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
                age: d.age,
                telegram: d.telegram,
                zalo: d.zalo,
                facebookUrl: d.facebookUrl,
                linkedinUrl: d.linkedinUrl,
                githubUrl: d.githubUrl,
                portraitPhoto: d.portraitPhoto,
                personalityType: d.personalityType,
                personalityScores: d.personalityScores,
                personalityTestUrl: d.personalityTestUrl,
                personalNeeds: d.personalNeeds,
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
        revalidatePath("/mentor");
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
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    avatar: true,
                }
            }
        }
    });
}

/**
 * Lấy danh sách ma trận mentee dành cho Mentor để phân nhóm và định hướng
 */
export async function getJuniorMenteesMatrix() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const mentees = await prisma.user.findMany({
        where: {
            role: "mentee",
            isActive: true,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            menteeProfile: true,
            menteeships: {
                select: {
                    mentorshipId: true,
                    status: true,
                    mentorship: {
                        select: {
                            id: true,
                            type: true,
                            notes: true,
                            mentor: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        }
    });

    return JSON.parse(JSON.stringify(mentees));
}
