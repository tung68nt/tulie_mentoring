"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdminOrPM, isAdminLevel, type UserRole } from "@/lib/role-helpers";

// ─── Types ───────────────────────────────────────────────
export type MembershipRole = "mentor" | "mentee";

// ─── Session Helpers ─────────────────────────────────────

/**
 * Get authenticated session or throw. Returns typed user with role.
 */
export async function requireAuth() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized: Not authenticated");
    }
    return {
        userId: session.user.id,
        role: (session.user as any).role as UserRole,
        user: session.user,
    };
}

// ─── Role Checks ─────────────────────────────────────────
// isAdminOrPM & isAdminLevel are re-exported from @/lib/role-helpers above

/**
 * Require admin or program_manager role. Throws if not.
 */
export async function requireAdminOrPM() {
    const { userId, role, user } = await requireAuth();
    if (!isAdminOrPM(role)) {
        throw new Error("Unauthorized: Admin or Program Manager role required");
    }
    return { userId, role, user };
}

// ─── Mentorship Access ───────────────────────────────────

/**
 * Verify that a user is a member of a mentorship (mentor or mentee).
 * Admin/PM/Manager bypass this check.
 * Returns the user's role within the mentorship.
 */
export async function requireMentorshipAccess(
    mentorshipId: string,
    userId: string,
    role: string
): Promise<{ memberRole: MembershipRole | "admin" }> {
    // Admin-level roles bypass scope check
    if (isAdminLevel(role)) {
        return { memberRole: "admin" };
    }

    // Check if user is the mentor
    const mentorship = await prisma.mentorship.findUnique({
        where: { id: mentorshipId },
        select: {
            mentorId: true,
            mentees: {
                where: { menteeId: userId },
                select: { menteeId: true },
            },
        },
    });

    if (!mentorship) {
        throw new Error("Mentorship not found");
    }

    if (mentorship.mentorId === userId) {
        return { memberRole: "mentor" };
    }

    if (mentorship.mentees.length > 0) {
        return { memberRole: "mentee" };
    }

    // Check if facilitator is assigned to this mentorship or its program
    if (role === "facilitator") {
        const assignment = await prisma.facilitatorAssignment.findFirst({
            where: {
                facilitatorId: userId,
                OR: [
                    { mentorshipId },
                    {
                        mentorship: null,
                        programCycle: {
                            mentorships: {
                                some: { id: mentorshipId },
                            },
                        },
                    },
                ],
            },
        });


        if (assignment) {
            return { memberRole: "admin" }; // facilitator has admin-like view access
        }
    }

    throw new Error("Unauthorized: You are not a member of this mentorship");
}

/**
 * Verify user is the mentor of a specific mentorship.
 * Admin/PM bypass.
 */
export async function requireMentorOfMatch(
    mentorshipId: string,
    userId: string,
    role: string
): Promise<void> {
    if (isAdminLevel(role)) return;

    const mentorship = await prisma.mentorship.findUnique({
        where: { id: mentorshipId },
        select: { mentorId: true },
    });

    if (!mentorship) {
        throw new Error("Mentorship not found");
    }

    if (mentorship.mentorId !== userId) {
        throw new Error("Unauthorized: Only the assigned mentor can perform this action");
    }
}

// ─── Goal Access ─────────────────────────────────────────

/**
 * Verify user has access to a goal by checking its mentorship.
 * Returns the goal and user's membership role.
 */
export async function requireGoalAccess(
    goalId: string,
    userId: string,
    role: string
) {
    const goal = await prisma.goal.findUnique({
        where: { id: goalId },
        select: {
            id: true,
            mentorshipId: true,
            creatorId: true,
            mentorConfirmed: true,
        },
    });

    if (!goal) {
        throw new Error("Goal not found");
    }

    const { memberRole } = await requireMentorshipAccess(goal.mentorshipId, userId, role);

    return { goal, memberRole };
}

// ─── Facilitator Scope ───────────────────────────────────

/**
 * Require that a facilitator is assigned to a specific program cycle.
 * Admin/PM bypass.
 */
export async function requireFacilitatorScope(
    userId: string,
    role: string,
    programCycleId?: string
): Promise<void> {
    if (isAdminLevel(role)) return;

    if (role !== "facilitator") {
        throw new Error("Unauthorized: Facilitator role required");
    }

    if (!programCycleId) {
        // If no specific program, verify user is a facilitator at all
        const assignment = await prisma.facilitatorAssignment.findFirst({
            where: { facilitatorId: userId },
        });
        if (!assignment) {
            throw new Error("Unauthorized: No facilitator assignments found");
        }
        return;
    }

    const assignment = await prisma.facilitatorAssignment.findFirst({
        where: {
            facilitatorId: userId,
            programCycleId,
        },
    });

    if (!assignment) {
        throw new Error("Unauthorized: Not assigned to this program cycle");
    }
}

// ─── Evaluation Access ───────────────────────────────────

/**
 * Require that user can submit evaluation forms.
 * Only admin, facilitator, program_manager, and mentor can submit.
 */
export async function requireEvaluationSubmitAccess(
    userId: string,
    role: string
): Promise<void> {
    const allowedRoles: UserRole[] = ["admin", "facilitator", "program_manager", "mentor"];
    if (!allowedRoles.includes(role as UserRole)) {
        throw new Error("Unauthorized: Cannot submit evaluation forms");
    }
}
