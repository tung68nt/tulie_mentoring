import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting comprehensive seeding...");

    const passwordHash = await bcrypt.hash("password123", 12);

    // 1. Program Cycle (Needed for Mentorship)
    const cycle = await prisma.programCycle.upsert({
        where: { id: "seed-cycle-id" },
        update: { status: "active" },
        create: {
            id: "seed-cycle-id",
            name: "Tulie Mentoring 2026",
            description: "Chương trình mentoring chính thức",
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-12-31"),
            status: "active"
        }
    });

    // 2. USERS
    console.log("Creating/Updating Users...");

    // Mentor/Admin
    const mentor = await prisma.user.upsert({
        where: { email: "mentor@tulie.vn" },
        update: { role: "admin" },
        create: {
            email: "mentor@tulie.vn",
            passwordHash,
            firstName: "Nguyễn",
            lastName: "Văn Mentor",
            role: "admin",
            image: "https://ui-avatars.com/api/?name=NV+Mentor&background=6366f1&color=fff",
            mentorProfile: {
                create: {
                    company: "Tulie Agency",
                    jobTitle: "Senior Product Manager",
                    maxMentees: 5
                }
            }
        }
    });

    // Mentee
    const mentee = await prisma.user.upsert({
        where: { email: "mentee@tulie.vn" },
        update: { role: "mentee" },
        create: {
            email: "mentee@tulie.vn",
            passwordHash,
            firstName: "Trần",
            lastName: "Thị Mentee",
            role: "mentee",
            image: "https://ui-avatars.com/api/?name=TT+Mentee&background=ec4899&color=fff",
            menteeProfile: {
                create: {
                    studentId: "SV2026",
                    major: "Công nghệ thông tin",
                    year: 4
                }
            }
        }
    });

    // 3. MENTORSHIP
    console.log("Setting up Mentorship...");
    const mentorship = await prisma.mentorship.upsert({
        where: { id: "seed-mentorship-id" },
        update: { status: "active" },
        create: {
            id: "seed-mentorship-id",
            mentorId: mentor.id,
            programCycleId: cycle.id,
            status: "active",
            type: "one_on_one",
            mentees: {
                create: { menteeId: mentee.id }
            }
        }
    });

    // 4. GOALS
    console.log("Seeding Goals...");
    const goalsData = [
        { title: "Master Next.js App Router", category: "skill", priority: "high", current: 85, dueDate: 15 },
        { title: "Personal Branding Portfolio", category: "project", priority: "urgent", current: 40, dueDate: 30 },
        { title: "IELTS 7.5 Target", category: "skill", priority: "medium", current: 60, dueDate: 90 },
        { title: "UI/UX Case Study", category: "design", priority: "high", current: 20, dueDate: 45 },
        { title: "Networking (10 Mentors)", category: "network", priority: "low", current: 3, target: 10, dueDate: 60 }
    ];

    for (const goal of goalsData) {
        await prisma.goal.create({
            data: {
                mentorshipId: mentorship.id,
                creatorId: mentee.id,
                title: goal.title,
                category: goal.category,
                priority: goal.priority,
                currentValue: goal.current,
                targetValue: goal.target || 100,
                status: goal.current === 100 ? "completed" : "in_progress",
                dueDate: new Date(Date.now() + goal.dueDate * 24 * 60 * 60 * 1000)
            }
        });
    }

    // 5. DAILY DIARY
    console.log("Seeding Daily Diaries...");
    const dailyContents = [
        "Debugged the auth flow today. Finally got SSL working.",
        "Met with mentor. Received great feedback on UI design.",
        "Working on the Presentation slide. Typst is interesting.",
        "Fixed several responsive issues on the sidebar.",
        "Learning about Prisma connection pooling."
    ];
    for (let i = 0; i < 45; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        await prisma.dailyDiary.upsert({
            where: { userId_date: { userId: mentee.id, date } },
            update: {},
            create: {
                userId: mentee.id,
                date,
                content: dailyContents[i % dailyContents.length],
                mood: i % 7 === 0 ? "excellent" : "good"
            }
        });
    }

    // 6. ACTIVITY LOGS
    console.log("Seeding 200+ Activity Logs...");
    const actions = ["login", "update_goal", "create_task", "view_wiki", "start_timer", "post_reflection", "message_mentor"];
    const logs = [];
    for (let i = 0; i < 250; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 120));
        logs.push({
            userId: mentee.id,
            action: actions[Math.floor(Math.random() * actions.length)],
            createdAt: date
        });
    }
    await prisma.activityLog.createMany({ data: logs });

    // 7. MEETINGS
    console.log("Seeding Meetings...");
    for (let i = 0; i < 15; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7 + 2));
        await prisma.meeting.create({
            data: {
                mentorshipId: mentorship.id,
                creatorId: mentor.id,
                title: `Weekly Sync Session ${20 - i}`,
                description: "Review progress and set action items for next week.",
                scheduledAt: date,
                status: "completed",
                type: "online",
                minutes: {
                    create: {
                        authorId: mentor.id,
                        agenda: "Check previous action items\nReview goal progress",
                        keyPoints: "Consistency is key\nFocus on quality over quantity",
                        actionItems: "1. Polish the UI\n2. Prepare for demo",
                        status: "approved"
                    }
                }
            }
        });
    }

    // 8. PORTFOLIO
    console.log("Seeding Portfolio...");
    await prisma.portfolio.upsert({
        where: { menteeId: mentee.id },
        update: {},
        create: {
            menteeId: mentee.id,
            personalityMbti: "ENFJ",
            shortTermGoals: "Become a senior dev",
            longTermGoals: "CTO of a startup",
            competencies: "React, Node.js, Design Systems"
        }
    });

    // 9. SYSTEM SETTINGS
    console.log("Seeding System Settings...");
    const settings = [
        { key: "site_name", value: "Tulie Mentoring" },
        { key: "favicon", value: "" },
        { key: "sidebar_logo", value: "" },
        { key: "auth_logo", value: "" }
    ];
    for (const s of settings) {
        await prisma.systemSetting.upsert({
            where: { key: s.key },
            update: {},
            create: s
        });
    }

    console.log("\n✅ COMPREHENSIVE SEEDING COMPLETED!");
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
