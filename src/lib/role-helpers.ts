// ─── Sync Role Helpers ─────────────────────────────────────
// These are pure sync functions (no side effects), kept outside
// "use server" modules to avoid the Server Actions async constraint.

export type UserRole = "admin" | "program_manager" | "facilitator" | "mentor" | "mentee" | "manager";

/**
 * Check if role is admin or program_manager
 */
export function isAdminOrPM(role: string): boolean {
    return role === "admin" || role === "program_manager";
}

/**
 * Check if role has admin-level access (admin, manager, program_manager)
 */
export function isAdminLevel(role: string): boolean {
    return role === "admin" || role === "manager" || role === "program_manager";
}
