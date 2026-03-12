import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendNotification } from "@/lib/notifications/service";
import { sendEmail } from "@/lib/email/service";
import { meetingReminderTemplate, taskDeadlineTemplate } from "@/lib/email/templates";
import { format, addHours } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * GET /api/cron/reminders
 *
 * Cron endpoint gửi reminder cho:
 * 1. Meetings sắp diễn ra trong 24h
 * 2. Tasks có deadline trong 24h
 *
 * Bảo vệ bằng CRON_SECRET header.
 * Setup: crontab trên VPS gọi mỗi 15-30 phút
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://mentoring.tulie.vn/api/cron/reminders
 */
export async function GET(request: Request) {
    // Auth check
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const in24h = addHours(now, 24);
    const in1h = addHours(now, 1);
    const baseUrl = process.env.NEXTAUTH_URL || "https://mentoring.tulie.vn";

    let meetingReminders = 0;
    let taskReminders = 0;
    let emailsSent = 0;

    try {
        // ─── 1. Meeting Reminders (24h trước) ─────────────────────────

        const upcomingMeetings = await prisma.meeting.findMany({
            where: {
                scheduledAt: {
                    gte: now,
                    lte: in24h,
                },
                status: {
                    in: ["scheduled"],
                },
            },
            include: {
                mentorship: {
                    select: {
                        mentorId: true,
                        mentor: { select: { id: true, email: true, firstName: true, lastName: true } },
                        mentees: {
                            include: {
                                mentee: { select: { id: true, email: true, firstName: true, lastName: true } },
                            },
                        },
                    },
                },
            },
        });

        for (const meeting of upcomingMeetings) {
            const participants = [
                meeting.mentorship.mentor,
                ...meeting.mentorship.mentees.map(m => m.mentee),
            ];

            const scheduledAtStr = format(new Date(meeting.scheduledAt), "HH:mm - EEEE, dd/MM/yyyy", { locale: vi });
            const hoursUntil = Math.round((new Date(meeting.scheduledAt).getTime() - now.getTime()) / (1000 * 60 * 60));
            const timeUntil = hoursUntil <= 1 ? "1 giờ" : `${hoursUntil} giờ`;
            const meetingLink = `/meetings/${meeting.id}`;

            for (const participant of participants) {
                // Check if we already sent a reminder for this meeting to this user
                const existingReminder = await prisma.notification.findFirst({
                    where: {
                        userId: participant.id,
                        title: { startsWith: "Nhắc lịch:" },
                        link: meetingLink,
                        createdAt: { gte: addHours(now, -23) }, // don't send duplicates within 23h
                    },
                });

                if (existingReminder) continue;

                // Send in-app notification
                const notification = await sendNotification({
                    userId: participant.id,
                    title: `Nhắc lịch: ${meeting.title}`,
                    message: `Cuộc họp "${meeting.title}" diễn ra lúc ${scheduledAtStr} (còn ${timeUntil})`,
                    type: "meeting",
                    link: meetingLink,
                });

                if (notification) meetingReminders++;

                // Send email
                if (participant.email) {
                    const emailHtml = meetingReminderTemplate({
                        meetingTitle: meeting.title,
                        scheduledAt: scheduledAtStr,
                        duration: meeting.duration,
                        location: meeting.location,
                        meetingUrl: meeting.meetingUrl,
                        type: meeting.type,
                        link: `${baseUrl}${meetingLink}`,
                        timeUntil,
                    });

                    const sent = await sendEmail({
                        to: participant.email,
                        subject: `[Tulie] Nhắc lịch: ${meeting.title} (${timeUntil} nữa)`,
                        html: emailHtml,
                    });

                    if (sent) {
                        emailsSent++;
                        if (notification) {
                            await prisma.notification.update({
                                where: { id: notification.id },
                                data: { emailSentAt: new Date() },
                            });
                        }
                    }
                }
            }
        }

        // ─── 2. Task Deadline Reminders (24h trước) ───────────────────

        const upcomingTasks = await prisma.todoItem.findMany({
            where: {
                dueDate: {
                    gte: now,
                    lte: in24h,
                },
                status: {
                    notIn: ["done"],
                },
            },
            include: {
                mentee: { select: { id: true, email: true, firstName: true, lastName: true } },
            },
        });

        for (const task of upcomingTasks) {
            const taskLink = "/tasks";
            const dueDateStr = format(new Date(task.dueDate!), "HH:mm - dd/MM/yyyy", { locale: vi });
            const hoursUntil = Math.round((new Date(task.dueDate!).getTime() - now.getTime()) / (1000 * 60 * 60));
            const timeUntil = hoursUntil <= 1 ? "1 giờ" : `${hoursUntil} giờ`;

            // Check for existing reminder
            const existingReminder = await prisma.notification.findFirst({
                where: {
                    userId: task.menteeId,
                    title: { startsWith: "Nhắc deadline:" },
                    message: { contains: task.title },
                    createdAt: { gte: addHours(now, -23) },
                },
            });

            if (existingReminder) continue;

            // Send in-app notification
            const notification = await sendNotification({
                userId: task.menteeId,
                title: `Nhắc deadline: ${task.title}`,
                message: `Công việc "${task.title}" sắp đến hạn lúc ${dueDateStr} (còn ${timeUntil})`,
                type: "system",
                link: taskLink,
            });

            if (notification) taskReminders++;

            // Send email
            if (task.mentee.email) {
                const emailHtml = taskDeadlineTemplate({
                    taskTitle: task.title,
                    dueDate: dueDateStr,
                    priority: task.priority,
                    link: `${baseUrl}${taskLink}`,
                    timeUntil,
                });

                const sent = await sendEmail({
                    to: task.mentee.email,
                    subject: `[Tulie] Nhắc deadline: ${task.title} (${timeUntil} nữa)`,
                    html: emailHtml,
                });

                if (sent) {
                    emailsSent++;
                    if (notification) {
                        await prisma.notification.update({
                            where: { id: notification.id },
                            data: { emailSentAt: new Date() },
                        });
                    }
                }
            }
        }

        return NextResponse.json({
            ok: true,
            timestamp: now.toISOString(),
            summary: {
                meetingReminders,
                taskReminders,
                emailsSent,
                upcomingMeetings: upcomingMeetings.length,
                upcomingTasks: upcomingTasks.length,
            },
        });
    } catch (error) {
        console.error("[CRON] Reminder error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: String(error) },
            { status: 500 }
        );
    }
}
