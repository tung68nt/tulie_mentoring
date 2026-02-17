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

    const resource = await prisma.resource.create({
        data: {
            ...data,
            uploadedById: session.user.id!,
        },
    });

    revalidatePath("/resources");
    return JSON.parse(JSON.stringify(resource));
}

export async function getResources(category?: string) {
    const session = await auth();
    if (!session?.user) return [];

    const resources = await prisma.resource.findMany({
        where: category ? { category } : {},
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
