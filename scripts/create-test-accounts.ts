import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Creating test accounts...");

    const password = "password123";
    const hash = await bcrypt.hash(password, 12);

    const accounts = [
        {
            email: "mentor@tulie.vn",
            firstName: "Demo",
            lastName: "Mentor",
            role: "mentor",
            profileType: "mentor"
        },
        {
            email: "mentee@tulie.vn",
            firstName: "Demo",
            lastName: "Mentee",
            role: "mentee",
            profileType: "mentee"
        },
        {
            email: "viewer@tulie.vn",
            firstName: "Demo",
            lastName: "Viewer",
            role: "viewer",
            profileType: "none"
        },
        {
            email: "view@tulie.vn",
            firstName: "Demo",
            lastName: "View",
            role: "viewer",
            profileType: "none"
        }
    ];

    for (const acc of accounts) {
        console.log(`Creating ${acc.role} account: ${acc.email}...`);

        // Delete if exists
        const existing = await prisma.user.findUnique({ where: { email: acc.email } });
        if (existing) {
            await prisma.user.delete({ where: { id: existing.id } });
        }

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

        console.log(`Successfully created ${acc.email}`);
    }

    console.log("─────────────────────────────────");
    console.log("Test accounts created successfully!");
    console.log("Password: " + password);
    console.log("─────────────────────────────────");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
