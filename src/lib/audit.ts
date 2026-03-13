"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ─── Types ───────────────────────────────────────────────
export type AuditSeverity = "info" | "warning" | "critical";

export type AuditEntry = {
    action: string;
    severity?: AuditSeverity;
    entityType?: string;
    entityId?: string;
    details?: Record<string, any>;
};

// ─── Core Audit Functions ────────────────────────────────

/**
 * Log a structured audit event.
 * Automatically captures userId from session, IP, and user-agent.
 */
export async function audit(entry: AuditEntry) {
    try {
        const session = await auth();
        if (!session?.user?.id) return;

        let ipAddress: string | undefined;
        let userAgent: string | undefined;

        try {
            const headersList = await headers();
            ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined;
            userAgent = headersList.get("user-agent") || undefined;
        } catch {
            // headers() may not be available in all contexts
        }

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: entry.action,
                severity: entry.severity || "info",
                entityType: entry.entityType,
                entityId: entry.entityId,
                details: entry.details ? JSON.stringify(entry.details) : null,
                ipAddress,
                userAgent,
            },
        });
    } catch (error) {
        // Never throw on audit failures — this is a best-effort system
        console.error("[AUDIT] Failed to log:", error);
    }
}

// ─── Convenience Functions ───────────────────────────────

/**
 * Log a permission denied event (severity: warning)
 */
export async function auditPermissionDenied(
    action: string,
    entityType: string,
    entityId?: string,
    details?: Record<string, any>
) {
    await audit({
        action: `permission.denied:${action}`,
        severity: "warning",
        entityType,
        entityId,
        details,
    });
}

/**
 * Log a data access event
 */
export async function auditDataAccess(
    entityType: string,
    entityId: string,
    action: string = "read"
) {
    await audit({
        action: `data.${action}`,
        severity: "info",
        entityType,
        entityId,
    });
}

/**
 * Log a status change event
 */
export async function auditStatusChange(
    entityType: string,
    entityId: string,
    from: string,
    to: string,
    details?: Record<string, any>
) {
    await audit({
        action: "status.change",
        severity: "info",
        entityType,
        entityId,
        details: { from, to, ...details },
    });
}

/**
 * Log a critical security event (severity: critical)
 */
export async function auditCritical(
    action: string,
    details?: Record<string, any>
) {
    await audit({
        action,
        severity: "critical",
        details,
    });
}

// ─── Query Functions ─────────────────────────────────────

/**
 * Get audit logs with filtering. Admin only.
 */
export async function getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    severity?: AuditSeverity;
    entityType?: string;
    from?: Date;
    to?: Date;
    limit?: number;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    if (role !== "admin" && role !== "program_manager") {
        throw new Error("Unauthorized: Admin access required");
    }

    const where: any = {};

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = { contains: filters.action };
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.from || filters?.to) {
        where.createdAt = {};
        if (filters?.from) where.createdAt.gte = filters.from;
        if (filters?.to) where.createdAt.lte = filters.to;
    }

    const logs = await prisma.auditLog.findMany({
        where,
        include: {
            user: {
                select: { id: true, firstName: true, lastName: true, email: true, role: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: filters?.limit || 50,
    });

    return JSON.parse(JSON.stringify(logs));
}
