"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

export async function sendMessage(data: {
    roomId: string;
    content: string;
    type?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;

    // SECURITY: Verify user is a participant of this room
    const isParticipant = await prisma.chatParticipant.findFirst({
        where: { roomId: data.roomId, userId }
    });
    if (!isParticipant) throw new Error("Access denied: Not a participant of this chat room");

    const message = await prisma.chatMessage.create({
        data: {
            roomId: data.roomId,
            senderId: userId,
            content: data.content,
            type: data.type || "text",
        }
    });

    // Update roomId updatedAt for sorting rooms
    await prisma.chatRoom.update({
        where: { id: data.roomId },
        data: { updatedAt: new Date() }
    });

    await logActivity("send_chat_message", message.id, "chat");

    revalidatePath(`/chat/${data.roomId}`);
    return JSON.parse(JSON.stringify(message));
}

export async function getChatRooms() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;

    const rooms = await prisma.chatRoom.findMany({
        where: {
            participants: {
                some: { userId: userId }
            }
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            role: true,
                        }
                    }
                }
            },
            messages: {
                take: 1,
                orderBy: { createdAt: "desc" }
            },
            _count: {
                select: {
                    messages: true
                }
            }
        },
        orderBy: {
            updatedAt: "desc"
        }
    });

    return JSON.parse(JSON.stringify(rooms));
}

export async function getMessages(roomId: string, limit = 50, cursor?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;

    // SECURITY: Verify user is a participant of this room
    const isParticipant = await prisma.chatParticipant.findFirst({
        where: { roomId, userId }
    });
    if (!isParticipant) throw new Error("Access denied: Not a participant of this chat room");

    const messages = await prisma.chatMessage.findMany({
        where: { roomId },
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
            sender: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return JSON.parse(JSON.stringify(messages.reverse()));
}

export async function getOrCreateDirectChat(targetUserId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;

    // Find existing direct chat
    const existingRoom = await prisma.chatRoom.findFirst({
        where: {
            type: "direct",
            AND: [
                { participants: { some: { userId: userId } } },
                { participants: { some: { userId: targetUserId } } }
            ]
        }
    });

    if (existingRoom) {
        return JSON.parse(JSON.stringify(existingRoom));
    }

    // Create new direct chat
    const room = await prisma.chatRoom.create({
        data: {
            type: "direct",
            participants: {
                create: [
                    { userId: userId },
                    { userId: targetUserId }
                ]
            }
        }
    });

    return JSON.parse(JSON.stringify(room));
}

export async function getMentorshipGroupChat(mentorshipId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id!;

    const room = await prisma.chatRoom.findFirst({
        where: {
            mentorshipId,
            type: "mentorship_group"
        }
    });

    if (room) {
        return JSON.parse(JSON.stringify(room));
    }

    // If moderator/facilitator or mentor creates it, or it doesn't exist
    // For now, let's just create it on demand if the user is part of the mentorship
    const mentorship = await prisma.mentorship.findUnique({
        where: { id: mentorshipId },
        include: {
            mentees: true,
            mentor: true
        }
    });

    if (!mentorship) throw new Error("Mentorship not found");

    const participants = [
        { userId: mentorship.mentorId },
        ...mentorship.mentees.map(m => ({ userId: m.menteeId }))
    ];

    const isParticipant = participants.some(p => p.userId === userId);
    if (!isParticipant && (session.user as any).role !== "admin") {
        throw new Error("Unauthorized: Not a participant of this mentorship");
    }

    const newRoom = await prisma.chatRoom.create({
        data: {
            type: "mentorship_group",
            mentorshipId: mentorshipId,
            name: `Group: ${mentorship.mentor.firstName}`,
            participants: {
                create: participants
            }
        }
    });

    return JSON.parse(JSON.stringify(newRoom));
}
