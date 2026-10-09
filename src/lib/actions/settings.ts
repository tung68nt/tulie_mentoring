"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

// Các khoá hiển thị công khai (trang đăng nhập, favicon...). Mọi khoá khác (SMTP...) chỉ admin đọc được.
const PUBLIC_SETTING_KEYS = ["site_name", "auth_logo", "sidebar_logo", "favicon"];

export async function getSystemSettings() {
    try {
        // auth() dùng headers() nên sẽ ném lỗi khi prerender tĩnh: khi đó coi như không phải admin
        let isAdmin = false;
        try {
            isAdmin = ((await auth())?.user as any)?.role === "admin";
        } catch {
            isAdmin = false;
        }
        const settings = await prisma.systemSetting.findMany(
            isAdmin ? undefined : { where: { key: { in: PUBLIC_SETTING_KEYS } } }
        );
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
