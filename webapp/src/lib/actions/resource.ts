"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createResource(data: {
    title: string;
    description?: string;
    type: "file" | "link" | "document";
    fileUrl?: string;
    linkUrl?: string;
    category: string;
    visibility: "public" | "private" | "group";
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // Whitelist allowed fields to prevent mass assignment
    const { title, description, type, fileUrl, linkUrl, category, visibility } = data;

    const resource = await prisma.resource.create({
        data: {
            title,
            description,
            type,
            fileUrl,
            linkUrl,
            category,
            visibility,
            uploadedById: session.user.id!,
        },
    });

    revalidatePath("/resources");
    return JSON.parse(JSON.stringify(resource));
}

export async function getResources(category?: string) {
    const session = await auth();
    if (!session?.user) return [];

    const role = (session.user as any).role;
    const userId = session.user.id!;

    // Security check: visibility filtering
    // Admin can see everything
    // Members see public + resources they uploaded
    // (Note: "group" visibility might need more complex logic with mentorships)
    const where: any = {};
    if (category) where.category = category;

    if (role !== "admin") {
        where.OR = [
            { visibility: "public" },
            { uploadedById: userId }
        ];
    }

    const resources = await prisma.resource.findMany({
        where,
        include: {
            uploadedBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    return JSON.parse(JSON.stringify(resources));
}

export async function deleteResource(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new Error("Resource not found");

    if (resource.uploadedById !== session.user.id && (session.user as any).role !== "admin") {
        throw new Error("Unauthorized to delete this resource");
    }

    await prisma.resource.delete({ where: { id } });
    revalidatePath("/resources");
}
