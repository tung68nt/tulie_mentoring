import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    // Simple security
    if (secret !== "tulie2026") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const log: string[] = [];

    try {
        const password = "password123";
        const hash = await bcrypt.hash(password, 12);

        const accounts = [
            { email: "mentor@tulie.vn", firstName: "Demo", lastName: "Mentor", role: "mentor", profileType: "mentor" },
            { email: "mentee@tulie.vn", firstName: "Demo", lastName: "Mentee", role: "mentee", profileType: "mentee" },
            { email: "view@tulie.vn", firstName: "Demo", lastName: "View", role: "viewer", profileType: "none" }
        ];

        for (const acc of accounts) {
            log.push(`Processing: ${acc.email}...`);
            const existing = await prisma.user.findUnique({ where: { email: acc.email } });

            if (existing) {
                // Just update password and role
                await prisma.user.update({
                    where: { id: existing.id },
                    data: { passwordHash: hash, role: acc.role, isActive: true }
                });
                log.push(`Updated existing user: ${acc.email}`);
            } else {
                // Create new
                const user = await prisma.user.create({
                    data: {
                        email: acc.email,
                        passwordHash: hash,
                        firstName: acc.firstName,
                        lastName: acc.lastName,
                        role: acc.role,
                        isActive: true,
                    }
                });

                if (acc.profileType === "mentor") {
                    await prisma.mentorProfile.create({
                        data: {
                            userId: user.id,
                            company: "Tulie Academy",
                            jobTitle: "Senior Mentor",
                            expertise: JSON.stringify(["Mentoring", "Soft Skills"]),
                            experience: "Demo Mentor Experience",
                        }
                    });
                } else if (acc.profileType === "mentee") {
                    await prisma.menteeProfile.create({
                        data: {
                            userId: user.id,
                            studentId: "DEMO001",
                            major: "General Management",
                            year: 1,
                            careerGoals: "Demo Career Goals",
                        }
                    });
                }
                log.push(`Created new user: ${acc.email}`);
            }
        }

        return NextResponse.json({ success: true, log });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message, log });
    }
}
