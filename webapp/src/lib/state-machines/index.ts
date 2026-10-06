/**
 * State machine definitions for core entities.
 * Defines valid transitions, who can perform them, and conditions.
 */

// ─── Types ───────────────────────────────────────────────

export type TransitionRule = {
    from: string;
    to: string;
    allowedRoles: string[];
    condition?: string; // human-readable condition description
};

// ─── Mentorship Status ───────────────────────────────────

export const MENTORSHIP_STATUSES = [
    "pending",
    "active",
    "paused",
    "completed",
    "cancelled",
] as const;

export type MentorshipStatus = (typeof MENTORSHIP_STATUSES)[number];

export const MENTORSHIP_TRANSITIONS: TransitionRule[] = [
    { from: "pending", to: "active", allowedRoles: ["admin", "program_manager"] },
    { from: "pending", to: "cancelled", allowedRoles: ["admin", "program_manager"] },
    { from: "active", to: "paused", allowedRoles: ["admin", "program_manager"] },
    { from: "active", to: "completed", allowedRoles: ["admin", "program_manager"], condition: "Program cycle has ended or early completion approved" },
    { from: "active", to: "cancelled", allowedRoles: ["admin", "program_manager"] },
    { from: "paused", to: "active", allowedRoles: ["admin", "program_manager"] },
    { from: "paused", to: "cancelled", allowedRoles: ["admin", "program_manager"] },
    // completed and cancelled are terminal states
];

// ─── Meeting Status ──────────────────────────────────────

export const MEETING_STATUSES = [
    "scheduled",
    "ongoing",
    "completed",
    "cancelled",
] as const;

export type MeetingStatusType = (typeof MEETING_STATUSES)[number];

export const MEETING_TRANSITIONS: TransitionRule[] = [
    { from: "scheduled", to: "ongoing", allowedRoles: ["admin", "program_manager", "mentor", "mentee"] },
    { from: "scheduled", to: "completed", allowedRoles: ["admin", "program_manager", "mentor", "mentee"] },
    { from: "scheduled", to: "cancelled", allowedRoles: ["admin", "program_manager", "mentor", "mentee"] },
    { from: "ongoing", to: "completed", allowedRoles: ["admin", "program_manager", "mentor", "mentee"] },
    { from: "ongoing", to: "cancelled", allowedRoles: ["admin", "program_manager", "mentor", "mentee"] },
    // completed and cancelled are terminal states
];

// ─── Task (TodoItem) Status ──────────────────────────────

export const TASK_STATUSES = [
    "todo",
    "doing",
    "done",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_TRANSITIONS: TransitionRule[] = [
    { from: "todo", to: "doing", allowedRoles: ["mentee", "admin"] },
    { from: "todo", to: "done", allowedRoles: ["mentee", "admin"] },
    { from: "doing", to: "todo", allowedRoles: ["mentee", "admin"] },
    { from: "doing", to: "done", allowedRoles: ["mentee", "admin"] },
    { from: "done", to: "todo", allowedRoles: ["mentee", "admin"] },
    { from: "done", to: "doing", allowedRoles: ["mentee", "admin"] },
];

// ─── Meeting Minutes Status ──────────────────────────────

export const MINUTES_STATUSES = [
    "draft",
    "submitted",
    "approved",
] as const;

export type MinutesStatusType = (typeof MINUTES_STATUSES)[number];

export const MINUTES_TRANSITIONS: TransitionRule[] = [
    { from: "draft", to: "submitted", allowedRoles: ["mentor", "mentee", "admin"] },
    { from: "submitted", to: "approved", allowedRoles: ["mentor", "admin", "program_manager"] },
    { from: "submitted", to: "draft", allowedRoles: ["mentor", "admin"], condition: "Returned for revision" },
    { from: "approved", to: "draft", allowedRoles: ["admin"], condition: "Admin override only" },
];

// ─── Validation Functions ────────────────────────────────

/**
 * Check if a status transition is valid.
 * Returns the matching rule or null if invalid.
 */
export function validateTransition(
    transitions: TransitionRule[],
    fromStatus: string,
    toStatus: string,
    userRole: string
): { valid: boolean; rule: TransitionRule | null; error?: string } {
    // Same status is always valid (no-op)
    if (fromStatus === toStatus) {
        return { valid: true, rule: null };
    }

    const matchingRule = transitions.find(
        t => t.from === fromStatus && t.to === toStatus
    );

    if (!matchingRule) {
        return {
            valid: false,
            rule: null,
            error: `Invalid transition: ${fromStatus} → ${toStatus}`,
        };
    }

    if (!matchingRule.allowedRoles.includes(userRole) && userRole !== "admin") {
        return {
            valid: false,
            rule: matchingRule,
            error: `Role "${userRole}" is not allowed to transition from ${fromStatus} to ${toStatus}`,
        };
    }

    return { valid: true, rule: matchingRule };
}

/**
 * Get all possible next statuses from a given status for a specific role.
 */
export function getNextStatuses(
    transitions: TransitionRule[],
    currentStatus: string,
    userRole: string
): string[] {
    return transitions
        .filter(t => t.from === currentStatus && (t.allowedRoles.includes(userRole) || userRole === "admin"))
        .map(t => t.to);
}
