"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth, requireMentorshipAccess, isAdminLevel } from "@/lib/permissions";
import { logActivity } from "./activity";

// ─── Types ───────────────────────────────────────────────
type NoteCategory = "general" | "strength" | "improvement" | "plan";

const VALID_CATEGORIES: NoteCategory[] = ["general", "strength", "improvement", "plan"];

// ─── Create ──────────────────────────────────────────────
export async function createMentorNote(data: {
    mentorshipId: string;
    aboutUserId: string;
    content: string;
    category?: NoteCategory;
}) {
    const { userId, role } = await requireAuth();

    // Only mentor of this match, assigned facilitator, or admin can create notes
    const { memberRole } = await requireMentorshipAccess(data.mentorshipId, userId, role);

    if (memberRole === "mentee") {
        throw new Error("Unauthorized: Mentees cannot create mentor notes");
    }

    // Validate the aboutUserId is actually a mentee in this mentorship
    const mentorship = await prisma.mentorship.findUnique({
        where: { id: data.mentorshipId },
        include: { mentees: { select: { menteeId: true } } },
    });

    if (!mentorship) throw new Error("Mentorship not found");

    const isMenteeInMatch = mentorship.mentees.some(m => m.menteeId === data.aboutUserId);
    if (!isMenteeInMatch) {
        throw new Error("The specified user is not a mentee in this mentorship");
    }

    // Validate category
    const category = data.category || "general";
    if (!VALID_CATEGORIES.includes(category)) {
        throw new Error(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`);
    }

    const note = await prisma.mentorNote.create({
        data: {
            mentorshipId: data.mentorshipId,
            authorId: userId,
            aboutUserId: data.aboutUserId,
            content: data.content,
            category,
        },
    });

    await logActivity("create_mentor_note", note.id, "mentor_note", {
        mentorshipId: data.mentorshipId,
        aboutUserId: data.aboutUserId,
        category,
    });

    revalidatePath(`/admin/mentorships/${data.mentorshipId}`);
    return JSON.parse(JSON.stringify(note));
}

// ─── Update ──────────────────────────────────────────────
export async function updateMentorNote(
    id: string,
    data: { content?: string; category?: NoteCategory }
) {
    const { userId, role } = await requireAuth();

    const note = await prisma.mentorNote.findUnique({
        where: { id },
    });

    if (!note) throw new Error("Note not found");

    // Only the author or admin can edit
    if (note.authorId !== userId && !isAdminLevel(role)) {
        throw new Error("Unauthorized: Only the author can edit this note");
    }

    // Validate category if provided
    if (data.category && !VALID_CATEGORIES.includes(data.category)) {
        throw new Error(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`);
    }

    const updated = await prisma.mentorNote.update({
        where: { id },
        data: {
            content: data.content,
            category: data.category,
        },
    });

    revalidatePath(`/admin/mentorships/${note.mentorshipId}`);
    return JSON.parse(JSON.stringify(updated));
}

// ─── Delete ──────────────────────────────────────────────
export async function deleteMentorNote(id: string) {
    const { userId, role } = await requireAuth();

    const note = await prisma.mentorNote.findUnique({
        where: { id },
    });

    if (!note) throw new Error("Note not found");

    // Only the author or admin can delete
    if (note.authorId !== userId && !isAdminLevel(role)) {
        throw new Error("Unauthorized: Only the author can delete this note");
    }

    await prisma.mentorNote.delete({ where: { id } });

    await logActivity("delete_mentor_note", id, "mentor_note", {
        mentorshipId: note.mentorshipId,
        aboutUserId: note.aboutUserId,
    });

    revalidatePath(`/admin/mentorships/${note.mentorshipId}`);
}

// ─── Get Notes for a Mentorship ──────────────────────────
export async function getMentorNotes(mentorshipId: string, aboutUserId?: string) {
    const { userId, role } = await requireAuth();

    // Verify access to this mentorship
    const { memberRole } = await requireMentorshipAccess(mentorshipId, userId, role);

    // Mentees CANNOT see mentor notes — this is the core privacy rule
    if (memberRole === "mentee") {
        throw new Error("Unauthorized: Mentor notes are private");
    }

    const where: any = { mentorshipId };
    if (aboutUserId) {
        where.aboutUserId = aboutUserId;
    }

    const notes = await prisma.mentorNote.findMany({
        where,
        include: {
            author: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
            },
            aboutUser: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return JSON.parse(JSON.stringify(notes));
}
