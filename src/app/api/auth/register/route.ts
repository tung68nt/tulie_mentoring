import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = registerSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Email đã được sử dụng" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                passwordHash: hashedPassword,
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                role: validatedData.role,
            },
        });

        // Create profile based on role
        if (validatedData.role === "mentor") {
            await prisma.mentorProfile.create({
                data: { userId: user.id },
            });
        } else if (validatedData.role === "mentee") {
            await prisma.menteeProfile.create({
                data: { userId: user.id },
            });
        }

        return NextResponse.json(
            { message: "Đăng ký thành công", userId: user.id },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Đã xảy ra lỗi khi đăng ký" },
            { status: 500 }
        );
    }
}
