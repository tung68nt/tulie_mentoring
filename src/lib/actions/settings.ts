"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function getSystemSettings() {
    try {
        const settings = await prisma.systemSetting.findMany();
        return settings.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return {};
    }
}

export async function updateSystemSetting(key: string, value: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
        throw new Error("Unauthorized");
    }

    await prisma.systemSetting.upsert({
        where: { key },
        update: { value, updatedAt: new Date() },
        create: { key, value }
    });

    revalidatePath("/", "layout");
}

export async function updateSystemSettings(data: Record<string, string>) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
        throw new Error("Unauthorized");
    }

    const promises = Object.entries(data).map(([key, value]) =>
        prisma.systemSetting.upsert({
            where: { key },
            update: { value, updatedAt: new Date() },
            create: { key, value }
        })
    );

    await Promise.all(promises);
    revalidatePath("/", "layout");
}
