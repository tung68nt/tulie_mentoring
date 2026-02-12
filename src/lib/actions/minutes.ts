"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createMinutes(data: {
    meetingId: string;
    agenda?: string;
    keyPoints: string;
    actionItems?: string;
    outcome: "productive" | "average" | "needs_improvement";
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const minutes = await prisma.meetingMinutes.create({
        data: {
            meetingId: data.meetingId,
            authorId: session.user.id!,
            agenda: data.agenda,
            keyPoints: data.keyPoints,
            actionItems: data.actionItems,
            outcome: data.outcome,
        },
    });

    revalidatePath(`/meetings/${data.meetingId}`);
    return minutes;
}

export async function getMinutes(meetingId: string) {
    return await prisma.meetingMinutes.findFirst({
        where: { meetingId },
        include: {
            author: { select: { firstName: true, lastName: true } },
        },
    });
}
