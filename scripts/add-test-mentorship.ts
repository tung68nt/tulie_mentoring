import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Adding test mentorship...");

    const hash = await bcrypt.hash("password123", 12);

    // 1. Get or create Program Cycle
    let cycle = await prisma.programCycle.findFirst({
        where: { status: "active" }
    });

    if (!cycle) {
        cycle = await prisma.programCycle.create({
            data: {
                name: "Test Cycle 2026",
                description: "Cycle created for testing",
                startDate: new Date(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
                status: "active",
            },
        });
    }

    // 2. Create Mentor
    const mentorEmail = "test_mentor@tulie.vn";
    let mentor = await prisma.user.findUnique({ where: { email: mentorEmail } });

    if (!mentor) {
        mentor = await prisma.user.create({
            data: {
                email: mentorEmail,
                passwordHash: hash,
                firstName: "Mentor",
                lastName: "Test",
                role: "mentor",
                bio: "Expert mentor for testing purposes",
                mentorProfile: {
                    create: {
                        company: "Tulie Test Co",
                        jobTitle: "Senior Tester",
                        expertise: JSON.stringify(["Testing", "Debugging"]),
                        experience: "10 years in software testing",
                    }
                }
            }
        });
        console.log(`Created mentor: ${mentorEmail}`);
    }

    // 3. Create Mentee
    const menteeEmail = "test_mentee@tulie.vn";
    let mentee = await prisma.user.findUnique({ where: { email: menteeEmail } });

    if (!mentee) {
        mentee = await prisma.user.create({
            data: {
                email: menteeEmail,
                passwordHash: hash,
                firstName: "Mentee",
                lastName: "Localhost",
                role: "mentee",
                menteeProfile: {
                    create: {
                        studentId: "TEST001",
                        major: "Computer Science",
                        year: 3,
                    }
                }
            }
        });
        console.log(`Created mentee: ${menteeEmail}`);
    }

    // 4. Create Mentorship
    const existingMentorship = await prisma.mentorship.findFirst({
        where: {
            mentorId: mentor.id,
            mentees: { some: { menteeId: mentee.id } }
        }
    });

    if (!existingMentorship) {
        const mentorship = await prisma.mentorship.create({
            data: {
                mentorId: mentor.id,
                type: "one_on_one",
                status: "active",
                programCycleId: cycle.id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                mentees: {
                    create: { menteeId: mentee.id }
                }
            }
        });
        console.log(`Created mentorship between ${mentorEmail} and ${menteeEmail}`);

        // 5. Add some initial goals for the mentee
        await prisma.goal.createMany({
            data: [
                {
                    mentorshipId: mentorship.id,
                    creatorId: mentee.id,
                    title: "Học React căn bản",
                    category: "skill",
                    targetValue: 100,
                    currentValue: 10,
                    status: "in_progress",
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
                {
                    mentorshipId: mentorship.id,
                    creatorId: mentee.id,
                    title: "Xây dựng Portfolio cá nhân",
                    category: "project",
                    targetValue: 100,
                    currentValue: 0,
                    status: "not_started",
                    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                }
            ]
        });
        console.log("Added sample goals.");
    } else {
        console.log("Mentorship already exists.");
    }

    console.log("Done!");
    console.log("---------------------------------");
    console.log("Login details (password: password123):");
    console.log(`  Mentor: ${mentorEmail}`);
    console.log(`  Mentee: ${menteeEmail}`);
    console.log("---------------------------------");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
