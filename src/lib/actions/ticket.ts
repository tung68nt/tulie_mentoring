"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

export async function createTicket(data: {
    title: string;
    description: string;
    priority?: "low" | "medium" | "high";
    category?: "system" | "mentor";
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const ticket = await prisma.supportTicket.create({
        data: {
            title: data.title,
            description: data.description,
            priority: data.priority || "medium",
            category: data.category || "system",
            userId: session.user.id!,
        }
    });

    // Log activity
    await logActivity("create_ticket", ticket.id, "ticket", { title: ticket.title });

    revalidatePath("/tickets");
    return JSON.parse(JSON.stringify(ticket));
}

export async function getTickets() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    const userId = session.user.id!;

    // Base where clause
    let where: any = {};

    if (role === "mentee") {
        // Mentees only their own
        where = { userId };
    } else if (role === "admin") {
        // Admins only see system tickets (Technical/Functional) as requested
        where = { category: "system" };
    } else if (role === "mentor") {
        // Mentors might see mentor tickets or all? 
        // User said "admin chỉ cần hiện yêu cầu hỗ trợ hệ thống thôi, không cần hiện yêu cầu mentor hỗ trợ"
        // This implies mentors handle "mentor" tickets.
        where = { category: "mentor" };
    }

    const tickets = await prisma.supportTicket.findMany({
        where,
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                }
            },
            assignedTo: {
                select: {
                    firstName: true,
                    lastName: true,
                }
            },
            _count: {
                select: { comments: true }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return JSON.parse(JSON.stringify(tickets));
}

export async function getTicketDetail(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    const userId = session.user.id!;

    const ticket = await prisma.supportTicket.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    role: true,
                }
            },
            assignedTo: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                }
            },
            comments: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            role: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: "asc"
                }
            }
        }
    });

    if (!ticket) throw new Error("Ticket not found");

    // Security check: Admins/Mentors see all, Mentees only their own
    if (role === "mentee" && ticket.userId !== userId) {
        throw new Error("Unauthorized: You do not have permission to view this ticket");
    }

    return JSON.parse(JSON.stringify(ticket));
}

export async function addTicketComment(ticketId: string, content: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;
    const role = (session.user as any).role;

    // Security check: Check if user has access to the ticket
    const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        select: { userId: true }
    });

    if (!ticket) throw new Error("Ticket not found");

    if (role === "mentee" && ticket.userId !== userId) {
        throw new Error("Unauthorized: You do not have permission to comment on this ticket");
    }

    const comment = await prisma.ticketComment.create({
        data: {
            ticketId,
            userId,
            content,
        }
    });

    // Log activity
    await logActivity("comment_ticket", ticketId, "ticket");

    revalidatePath(`/tickets/${ticketId}`);
    return JSON.parse(JSON.stringify(comment));
}

export async function updateTicketStatus(id: string, status: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    if (role === "mentee") throw new Error("Permission denied");

    const ticket = await prisma.supportTicket.update({
        where: { id },
        data: {
            status,
            assignedToId: status === "in_progress" ? session.user.id! : undefined
        }
    });

    // Log activity
    await logActivity("update_ticket_status", id, "ticket", { status });

    revalidatePath("/tickets");
    revalidatePath(`/tickets/${id}`);
    return JSON.parse(JSON.stringify(ticket));
}
