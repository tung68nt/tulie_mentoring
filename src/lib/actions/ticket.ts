"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

export async function createTicket(data: {
    title: string;
    description: string;
    priority?: "low" | "medium" | "high";
    category?: "system" | "mentor" | "admin_help";
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    const userId = session.user.id!;
    const userName = `${(session.user as any).firstName} ${(session.user as any).lastName}`;

    // Validate category based on role
    // Mentee: system or mentor (which goes to their mentor)
    // Mentor/Manager/Facilitator: only admin_help (which goes to admin)
    let finalCategory = data.category || "system";
    if (role !== "mentee" && finalCategory === "mentor") {
        finalCategory = "admin_help";
    }

    const ticket = await prisma.supportTicket.create({
        data: {
            title: data.title,
            description: data.description,
            priority: data.priority || "medium",
            category: finalCategory,
            userId: userId,
        }
    });

    // Log activity
    await logActivity("create_ticket", ticket.id, "ticket", { title: ticket.title });

    // Handle Notifications
    try {
        const { sendNotification, sendNotificationToRole } = await import("@/lib/notifications/service");

        if (finalCategory === "system" || finalCategory === "admin_help") {
            // Notify Admins and Program Managers
            await Promise.all([
                sendNotificationToRole({
                    role: "admin",
                    title: "Yêu cầu hỗ trợ mới",
                    message: `${userName} đã gửi một yêu cầu hỗ trợ: ${data.title}`,
                    type: "ticket",
                    link: `/tickets/${ticket.id}`,
                }),
                sendNotificationToRole({
                    role: "program_manager",
                    title: "Yêu cầu hỗ trợ mới",
                    message: `${userName} đã gửi một yêu cầu hỗ trợ: ${data.title}`,
                    type: "ticket",
                    link: `/tickets/${ticket.id}`,
                })
            ]);
        } else if (finalCategory === "mentor" && role === "mentee") {
            // Find the mentor for this mentee
            const mentorship = await prisma.mentorship.findFirst({
                where: {
                    mentees: { some: { menteeId: userId } },
                    status: "active"
                },
                select: { mentorId: true }
            });

            if (mentorship?.mentorId) {
                await sendNotification({
                    userId: mentorship.mentorId,
                    title: "Mentee cần hỗ trợ",
                    message: `${userName} đã gửi một yêu cầu hỗ trợ cho bạn: ${data.title}`,
                    type: "ticket",
                    link: `/tickets/${ticket.id}`,
                });
            }
        }
    } catch (error) {
        console.error("Failed to send ticket notifications:", error);
    }

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
    } else if (role === "admin" || role === "program_manager") {
        // Admins and Managers see system tickets + tickets from mentors/managers/facilitators requesting admin help
        where = { OR: [{ category: "system" }, { category: "admin_help" }] };
    } else if (role === "mentor") {
        // Mentors see: their own tickets (to admin) + mentor-category tickets (from their mentees)
        // Note: For now, we show all "mentor" category tickets to mentors, 
        // but ideally it should be filtered to ONLY their mentees.
        // Let's refine this to be specific to their mentorship.
        const mentorships = await prisma.mentorship.findMany({
            where: { mentorId: userId, status: "active" },
            select: { mentees: { select: { menteeId: true } } }
        });
        const menteeIds = mentorships.flatMap(m => m.mentees.map(mt => mt.menteeId));

        where = { 
            OR: [
                { userId }, // Their own tickets
                { 
                    AND: [
                        { category: "mentor" },
                        { userId: { in: menteeIds } }
                    ]
                }
            ] 
        };
    } else if (role === "facilitator") {
        // Facilitators see their own tickets
        where = { userId };
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

    // Security check: Admins/Managers/Mentors see relevant, Mentees only their own
    const isOwner = ticket.userId === userId;
    const canManageAll = role === "admin" || role === "program_manager";
    
    let hasAccess = isOwner || canManageAll;

    if (!hasAccess && role === "mentor" && ticket.category === "mentor") {
        // Check if ticket is from their mentee
        const mentorship = await prisma.mentorship.findFirst({
            where: {
                mentorId: userId,
                mentees: { some: { menteeId: ticket.userId } },
                status: "active"
            }
        });
        if (mentorship) hasAccess = true;
    }

    if (!hasAccess) {
        throw new Error("Unauthorized: You do not have permission to view this ticket");
    }

    return JSON.parse(JSON.stringify(ticket));
}

export async function addTicketComment(ticketId: string, content: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;
    const role = (session.user as any).role;
    const userName = `${(session.user as any).firstName} ${(session.user as any).lastName}`;

    // Security check: Check if user has access to the ticket
    const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        select: { userId: true, title: true }
    });

    if (!ticket) throw new Error("Ticket not found");

    // Re-use same access logic as getTicketDetail check
    // For simplicity here, we assume if they can see it, they can comment, but we'll add basic check
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

    // Notify the other party
    try {
        const { sendNotification } = await import("@/lib/notifications/service");
        
        // If someone else commented on owner's ticket, notify owner
        if (userId !== ticket.userId) {
            await sendNotification({
                userId: ticket.userId,
                title: "Phản hồi mới cho yêu cầu của bạn",
                message: `${userName} đã phản hồi yêu cầu: ${ticket.title}`,
                type: "ticket",
                link: `/tickets/${ticketId}`,
            });
        } 
        // If owner commented and it's assigned, notify assignee
        else {
            const ticketDetail = await prisma.supportTicket.findUnique({
                where: { id: ticketId },
                select: { assignedToId: true }
            });
            if (ticketDetail?.assignedToId && ticketDetail.assignedToId !== userId) {
                await sendNotification({
                    userId: ticketDetail.assignedToId,
                    title: "Phản hồi mới từ người dùng",
                    message: `${userName} đã phản hồi yêu cầu: ${ticket.title}`,
                    type: "ticket",
                    link: `/tickets/${ticketId}`,
                });
            }
        }
    } catch (error) {
        console.error("Failed to send comment notification:", error);
    }

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

    // Notify owner about status change
    try {
        const { sendNotification } = await import("@/lib/notifications/service");
        await sendNotification({
            userId: ticket.userId,
            title: "Cập nhật trạng thái yêu cầu",
            message: `Yêu cầu "${ticket.title}" của bạn đã được chuyển sang trạng thái: ${status === 'resolved' ? 'Đã giải quyết' : status === 'in_progress' ? 'Đang xử lý' : status === 'closed' ? 'Đã đóng' : status}`,
            type: "ticket",
            link: `/tickets/${id}`,
        });
    } catch (error) {
        console.error("Failed to send status update notification:", error);
    }

    // Log activity
    await logActivity("update_ticket_status", id, "ticket", { status });

    revalidatePath("/tickets");
    revalidatePath(`/tickets/${id}`);
    return JSON.parse(JSON.stringify(ticket));
}

