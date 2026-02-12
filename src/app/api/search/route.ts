import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const q = request.nextUrl.searchParams.get("q")?.trim();
    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    const role = (session.user as any).role;

    // Parallel searches
    const [users, meetings, resources] = await Promise.all([
        // Search users (admin only)
        role === "admin"
            ? prisma.user.findMany({
                where: {
                    OR: [
                        { firstName: { contains: q, mode: "insensitive" } },
                        { lastName: { contains: q, mode: "insensitive" } },
                        { email: { contains: q, mode: "insensitive" } },
                    ],
                },
                select: { id: true, firstName: true, lastName: true, role: true, email: true },
                take: 5,
            })
            : [],

        // Search meetings
        prisma.meeting.findMany({
            where: {
                title: { contains: q, mode: "insensitive" },
            },
            select: { id: true, title: true, scheduledAt: true },
            take: 5,
        }),

        // Search resources
        prisma.resource.findMany({
            where: {
                OR: [
                    { title: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                ],
            },
            select: { id: true, title: true, type: true },
            take: 5,
        }),
    ]);

    const results = [
        ...users.map((u) => ({
            id: u.id,
            title: `${u.firstName} ${u.lastName}`,
            subtitle: u.email,
            href: `/admin/users/${u.id}`,
            type: "user" as const,
        })),
        ...meetings.map((m) => ({
            id: m.id,
            title: m.title,
            subtitle: m.scheduledAt?.toLocaleDateString("vi-VN"),
            href: `/meetings/${m.id}`,
            type: "meeting" as const,
        })),
        ...resources.map((r) => ({
            id: r.id,
            title: r.title,
            subtitle: r.type,
            href: `/resources`,
            type: "resource" as const,
        })),
    ];

    return NextResponse.json({ results });
}
