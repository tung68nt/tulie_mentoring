"use server";

import { prisma } from "@/lib/db";
import { feedbackSchema, type FeedbackInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function submitFeedback(data: FeedbackInput) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const validatedData = feedbackSchema.parse(data);

    const feedback = await prisma.feedback.create({
        data: {
            ...validatedData,
            fromUserId: session.user.id!,
        },
    });

    revalidatePath("/feedback");
    revalidatePath(`/admin/mentorships/${validatedData.mentorshipId}`);
    return feedback;
}

export async function getReceivedFeedback(userId: string) {
    return await prisma.feedback.findMany({
        where: { toUserId: userId },
        include: {
            fromUser: { select: { firstName: true, lastName: true, avatar: true, role: true } },
            mentorship: { include: { programCycle: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getGivenFeedback(userId: string) {
    return await prisma.feedback.findMany({
        where: { fromUserId: userId },
        include: {
            toUser: { select: { firstName: true, lastName: true, avatar: true, role: true } },
            mentorship: { include: { programCycle: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}
