"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { canReviewMentee } from "@/lib/access";

export async function createTicket(data: {
    title: string;
    description: string;
    priority?: "low" | "medium" | "high";
    category?: "system" | "mentor" | "admin_help";
    meetingId?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const parsed = z.object({
        title: z.string().trim().min(3).max(200),
        description: z.string().trim().min(1).max(10000),
        priority: z.enum(["low", "medium", "high"]).optional(),
        category: z.enum(["system", "mentor", "admin_help"]).optional(),
        meetingId: z.string().max(64).optional(),
    }).safeParse(data);
    if (!parsed.success) throw new Error("Nội dung câu hỏi không hợp lệ");
    data = parsed.data;
    if (!rateLimit(`ticket:${session.user.id}`, 10, 3600_000).ok) throw new Error("Bạn gửi quá nhiều yêu cầu, vui lòng thử lại sau");

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

    // Câu hỏi cho mentor: giao thẳng cho mentor của mentee, gắn buổi họp (nếu có và hợp lệ)
    let assignedToId: string | undefined;
    let meetingId: string | undefined;
    if (finalCategory === "mentor" && role === "mentee") {
        const ms = await prisma.mentorship.findFirst({
            where: { mentees: { some: { menteeId: userId } }, status: "active" },
            select: { mentorId: true, id: true },
        });
        if (!ms) throw new Error("Bạn chưa có mentor để đặt câu hỏi");
        assignedToId = ms.mentorId;
        if (data.meetingId) {
            const m = await prisma.meeting.findFirst({ where: { id: data.meetingId, mentorshipId: ms.id }, select: { id: true } });
            if (m) meetingId = m.id;
        }
    }

    const ticket = await prisma.supportTicket.create({
        data: {
            assignedToId,
            meetingId,
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

/** Cùng quy tắc với getTicketDetail: chủ ticket, admin/PM, hoặc mentor của chính mentee gửi ticket loại "mentor". */
async function canAccessTicket(t: { userId: string; category: string }, userId: string, role: string) {
    if (t.userId === userId || role === "admin" || role === "program_manager") return true;
    if (role === "mentor" && t.category === "mentor") {
        const m = await prisma.mentorship.findFirst({
            where: { mentorId: userId, mentees: { some: { menteeId: t.userId } }, status: "active" },
            select: { id: true },
        });
        return !!m;
    }
    return false;
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
        select: { userId: true, title: true, category: true }
    });

    if (!ticket) throw new Error("Ticket not found");

    if (!(await canAccessTicket(ticket, userId, role))) {
        throw new Error("Unauthorized: You do not have permission to comment on this ticket");
    }
    if (typeof content !== "string" || !content.trim() || content.length > 5000) throw new Error("Nội dung không hợp lệ");

    const comment = await prisma.ticketComment.create({
        data: {
            ticketId,
            userId,
            content,
        }
    });

    // Cập nhật trạng thái theo luồng hỏi đáp
    const current = await prisma.supportTicket.findUnique({ where: { id: ticketId }, select: { status: true, firstResponseAt: true, category: true } });
    if (current) {
        if (userId !== ticket.userId) {
            await prisma.supportTicket.update({
                where: { id: ticketId },
                data: {
                    firstResponseAt: current.firstResponseAt ?? new Date(),
                    ...(current.category === "mentor" && ["open", "in_progress"].includes(current.status) ? { status: "answered" } : {}),
                },
            });
        } else if (["answered", "resolved"].includes(current.status)) {
            await prisma.supportTicket.update({ where: { id: ticketId }, data: { status: "in_progress" } });
        }
    }

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
    if (!["open", "in_progress", "answered", "resolved", "closed"].includes(status)) throw new Error("Trạng thái không hợp lệ");

    const existing = await prisma.supportTicket.findUnique({ where: { id }, select: { userId: true, category: true } });
    if (!existing || !(await canAccessTicket(existing, session.user.id!, role))) throw new Error("Permission denied");

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



/** Mentee xác nhận đã được giải đáp (resolved) hoặc hỏi tiếp (reopen). */
export async function setMyTicketState(id: string, state: "resolved" | "reopen") {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const t = await prisma.supportTicket.findUnique({ where: { id }, select: { userId: true, status: true, assignedToId: true, title: true } });
    if (!t || t.userId !== session.user.id) throw new Error("Không tìm thấy yêu cầu");
    if (t.status === "closed") throw new Error("Yêu cầu đã đóng");

    await prisma.supportTicket.update({ where: { id }, data: { status: state === "resolved" ? "resolved" : "in_progress" } });
    if (state === "reopen" && t.assignedToId) {
        const { sendNotification } = await import("@/lib/notifications/service");
        await sendNotification({ userId: t.assignedToId, title: "Mentee hỏi thêm", message: `Câu hỏi "${t.title}" được mở lại`, type: "ticket", link: `/tickets/${id}` }).catch(() => {});
    }
    revalidatePath(`/tickets/${id}`);
    revalidatePath("/tickets");
}

function toBlocks(text: string) {
    return text.split(/\n+/).filter((l) => l.trim()).map((l) => ({ type: "paragraph", content: l.slice(0, 2000) }));
}

/** Mentor (hoặc admin) đăng câu hỏi + câu trả lời lên wiki của cặp để mentee tra cứu về sau. */
export async function publishTicketToWiki(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const role = (session.user as any).role as string;

    const t = await prisma.supportTicket.findUnique({
        where: { id },
        include: { comments: { include: { user: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "asc" } } },
    });
    if (!t || t.category !== "mentor" || !(await canReviewMentee(session.user.id, role, t.userId))) throw new Error("Không có quyền");
    if (t.wikiPageId) return { pageId: t.wikiPageId };

    const ms = await prisma.mentorshipMentee.findFirst({ where: { menteeId: t.userId, mentorship: { status: "active" } }, select: { mentorshipId: true } });
    if (!ms) throw new Error("Không tìm thấy mentorship");

    const answers = t.comments.filter((c) => c.userId !== t.userId);
    if (answers.length === 0) throw new Error("Chưa có câu trả lời để đăng");

    const blocks = [
        { type: "heading", props: { level: 2 }, content: "Câu hỏi" },
        ...toBlocks(t.description),
        { type: "heading", props: { level: 2 }, content: "Trả lời" },
        ...answers.flatMap((c) => toBlocks(c.content)),
    ];
    const slug = `hoi-dap-${id.slice(-6)}-${Math.random().toString(36).slice(2, 7)}`;
    const page = await prisma.wikiPage.create({
        data: {
            title: `Hỏi đáp: ${t.title}`.slice(0, 200),
            slug,
            content: JSON.stringify(blocks),
            visibility: "mentorship",
            mentorshipId: ms.mentorshipId,
            authorId: session.user.id,
        },
    });
    await prisma.supportTicket.update({ where: { id }, data: { wikiPageId: page.id, status: "resolved" } });
    revalidatePath("/wiki");
    revalidatePath(`/tickets/${id}`);
    return { pageId: page.id, slug };
}
