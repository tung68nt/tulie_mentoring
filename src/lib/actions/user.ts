"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// SECURITY: Whitelist of valid roles to prevent privilege escalation
const VALID_ROLES = ["admin", "program_manager", "facilitator", "mentor", "mentee", "manager"] as const;
type ValidRole = typeof VALID_ROLES[number];

function isValidRole(role: string): role is ValidRole {
    return VALID_ROLES.includes(role as ValidRole);
}

export async function updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    avatar?: string;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // Whitelist only allowed fields to prevent mass assignment
    const { firstName, lastName, phone, bio, avatar } = data;

    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
            firstName,
            lastName,
            phone,
            bio,
            avatar,
        },
    });

    revalidatePath("/profile");
    return JSON.parse(JSON.stringify(user));
}

export async function getUserProfile(userId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                mentorProfile: true,
                menteeProfile: true,
            },
        });
        return user ? JSON.parse(JSON.stringify(user)) : null;
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        throw error;
    }
}

export async function getAllUsers() {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "program_manager" && role !== "manager")) return [];

    return await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function getUserDetail(userId: string) {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "program_manager" && role !== "manager")) throw new Error("Unauthorized");

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                mentorProfile: true,
                menteeProfile: true,
                mentorships: {
                    include: {
                        mentees: { include: { mentee: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
                        programCycle: { select: { name: true } },
                        _count: { select: { meetings: true, goals: true } },
                    },
                    orderBy: { createdAt: "desc" },
                },
                menteeships: {
                    include: {
                        mentorship: {
                            include: {
                                mentor: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                                programCycle: { select: { name: true } },
                                _count: { select: { meetings: true, goals: true } },
                            },
                        },
                    },
                },
                attendances: {
                    select: { status: true },
                },
                feedbackReceived: {
                    select: { rating: true, content: true, createdAt: true, fromUser: { select: { firstName: true, lastName: true } } },
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
            },
        });
        return user ? JSON.parse(JSON.stringify(user)) : null;
    } catch (error) {
        console.error("Error in getUserDetail:", error);
        return null;
    }
}

export async function deleteUser(userId: string) {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "program_manager")) {
        throw new Error("Unauthorized");
    }

    await prisma.user.delete({
        where: { id: userId },
    });

    revalidatePath("/admin/users");
}

export async function updateUserRole(userId: string, newRole: string) {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "program_manager" && role !== "manager")) {
        throw new Error("Unauthorized");
    }

    // SECURITY: Validate role against whitelist
    if (!isValidRole(newRole)) {
        throw new Error("Invalid role");
    }

    // Prevent changing own role
    if (userId === session.user.id) {
        throw new Error("Cannot change your own role");
    }

    // SECURITY: Privilege escalation protection
    if (role === "manager" && (newRole === "admin" || newRole === "program_manager")) {
        throw new Error("Managers cannot assign admin or program_manager roles");
    }
    if (role === "program_manager" && newRole === "admin") {
        throw new Error("Program managers cannot assign admin role");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return JSON.parse(JSON.stringify(updatedUser));
}


export async function bulkCreateUsers(usersData: any[]) {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "program_manager" && role !== "manager")) {
        return { success: false, error: "Unauthorized", count: 0, duplicateEmails: [] };
    }

    try {
        let createdCount = 0;
        const duplicateEmails: string[] = [];

        for (const data of usersData) {
            const email = data.email?.toLowerCase().trim();
            if (!email) continue;

            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) {
                duplicateEmails.push(email);
                continue;
            }

            const password = data.password;
            if (!password || password.length < 8) {
                continue; // Skip users without valid passwords
            }
            // SECURITY: Validate role
            const userRole = data.role || "mentee";
            if (!isValidRole(userRole)) continue;

            const passwordHash = await bcrypt.hash(password, 10);

            const newUser = await prisma.user.create({
                data: {
                    email,
                    firstName: data.firstName || email.split("@")[0],
                    lastName: data.lastName || "",
                    role: userRole,
                    passwordHash,
                }
            });

            if (newUser.role === "mentor") {
                await prisma.mentorProfile.create({ data: { userId: newUser.id } });
            } else if (newUser.role === "mentee") {
                await prisma.menteeProfile.create({ data: { userId: newUser.id } });
            }

            createdCount++;
        }
        revalidatePath("/admin/users");
        return { success: true, count: createdCount, duplicateEmails };
    } catch (error: any) {
        console.error("bulkCreateUsers error", error);
        return { success: false, error: error.message, count: 0, duplicateEmails: [] };
    }
}

export async function createSingleUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    password: string;
}) {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "program_manager" && role !== "manager")) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const email = data.email.toLowerCase().trim();
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return { success: false, error: "Email này đã tồn tại trong hệ thống" };
        }

        // SECURITY: Require password and validate role
        if (!data.password || data.password.length < 8) {
            return { success: false, error: "Mật khẩu phải có ít nhất 8 ký tự" };
        }
        const userRole = data.role || "mentee";
        if (!isValidRole(userRole)) {
            return { success: false, error: "Role không hợp lệ" };
        }

        const passwordHash = await bcrypt.hash(data.password, 10);
        const newUser = await prisma.user.create({
            data: {
                email,
                firstName: data.firstName,
                lastName: data.lastName,
                role: userRole,
                passwordHash,
            }
        });

        if (newUser.role === "mentor") {
            await prisma.mentorProfile.create({ data: { userId: newUser.id } });
        } else if (newUser.role === "mentee") {
            await prisma.menteeProfile.create({ data: { userId: newUser.id } });
        }

        revalidatePath("/admin/users");
        return { success: true, user: JSON.parse(JSON.stringify(newUser)) };
    } catch (error: any) {
        console.error("createSingleUser error:", error);
        return { success: false, error: error.message };
    }
}

export async function adminResetPassword(userId: string, newPassword: string) {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "program_manager" && role !== "manager")) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("adminResetPassword error:", error.message);
        return { success: false, error: "Không thể đổi mật khẩu" };
    }
}

export async function toggleUserActive(userId: string) {
    const session = await auth();
    const role = session?.user && (session.user as any).role;
    if (!role || (role !== "admin" && role !== "program_manager" && role !== "manager")) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { isActive: true } });
        if (!user) return { success: false, error: "User not found" };

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { isActive: !user.isActive }
        });
        revalidatePath("/admin/users");
        return { success: true, isActive: updated.isActive };
    } catch (error: any) {
        console.error("toggleUserActive error:", error.message);
        return { success: false, error: "Không thể thay đổi trạng thái" };
    }
}

export async function changePassword(currentPassword: string, newPassword: string) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        // SECURITY: Verify current password before allowing change
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { passwordHash: true }
        });

        if (!user?.passwordHash) {
            return { success: false, error: "Tài khoản không sử dụng mật khẩu" };
        }

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            return { success: false, error: "Mật khẩu hiện tại không đúng" };
        }

        if (newPassword.length < 8) {
            return { success: false, error: "Mật khẩu mới phải có ít nhất 8 ký tự" };
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: session.user.id },
            data: { passwordHash }
        });
        return { success: true };
    } catch (error: any) {
        console.error("changePassword error:", error.message);
        return { success: false, error: "Không thể đổi mật khẩu" };
    }
}


