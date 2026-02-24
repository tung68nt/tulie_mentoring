"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

export async function createTicket(data: {
    title: string;
    description: string;
    priority?: "low" | "medium" | "high";
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const ticket = await prisma.supportTicket.create({
        data: {
            title: data.title,
            description: data.description,
            priority: data.priority || "medium",
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

    // Admins and Mentors can see all tickets, Mentees only their own
    const tickets = await prisma.supportTicket.findMany({
        where: role === "mentee" ? { userId } : {},
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

    const ticket = await prisma.supportTicket.findUnique({
        where: { id },
        include: {
            user: {
                select: {
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

    return JSON.parse(JSON.stringify(ticket));
}

export async function addTicketComment(ticketId: string, content: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const comment = await prisma.ticketComment.create({
        data: {
            ticketId,
            userId: session.user.id!,
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
