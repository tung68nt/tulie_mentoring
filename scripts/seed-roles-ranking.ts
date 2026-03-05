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
    console.log("Starting roles and ranking seeding...");

    const passwordHash = await bcrypt.hash("password123", 12);
    const cycleId = "seed-cycle-id";
    const mentorshipId = "seed-mentorship-id";

    // 1. New Roles Users
    console.log("Creating Program Manager and Facilitator...");

    const manager = await prisma.user.upsert({
        where: { email: "manager@tulie.vn" },
        update: { role: "program_manager" },
        create: {
            email: "manager@tulie.vn",
            passwordHash,
            firstName: "Trưởng",
            lastName: "Khoa Đào tạo",
            role: "program_manager",
            image: "https://ui-avatars.com/api/?name=TK+DaoTao&background=ef4444&color=fff",
        }
    });

    const facilitator = await prisma.user.upsert({
        where: { email: "facilitator@tulie.vn" },
        update: { role: "facilitator" },
        create: {
            email: "facilitator@tulie.vn",
            passwordHash,
            firstName: "Trợ lý",
            lastName: "Văn Phòng",
            role: "facilitator",
            image: "https://ui-avatars.com/api/?name=TL+VanPhong&background=f59e0b&color=fff",
        }
    });

    // 2. Additional Mentees for Ranking
    console.log("Creating more mentees for ranking comparison...");
    const mentees = [
        { email: "mentee2@tulie.vn", first: "Lê", last: "Văn Giỏi", studentId: "SV2026-02" },
        { email: "mentee3@tulie.vn", first: "Phạm", last: "Thị Khá", studentId: "SV2026-03" }
    ];

    const menteeUsers = [];
    for (const m of mentees) {
        const user = await prisma.user.upsert({
            where: { email: m.email },
            update: { role: "mentee" },
            create: {
                email: m.email,
                passwordHash,
                firstName: m.first,
                lastName: m.last,
                role: "mentee",
                image: `https://ui-avatars.com/api/?name=${m.first}+${m.last}&background=random`,
                menteeProfile: {
                    create: {
                        studentId: m.studentId,
                        major: "Kỹ thuật phần mềm",
                        year: 3
                    }
                }
            }
        });
        menteeUsers.push(user);

        // Assign to mentorship
        await prisma.mentorshipMentee.upsert({
            where: { mentorshipId_menteeId: { mentorshipId, menteeId: user.id } },
            update: {},
            create: { mentorshipId, menteeId: user.id }
        });
    }

    // 3. Facilitator Assignment
    console.log("Assigning Facilitator to Mentorship...");
    await prisma.facilitatorAssignment.upsert({
        where: { facilitatorId_programCycleId_mentorshipId: { facilitatorId: facilitator.id, programCycleId: cycleId, mentorshipId } },
        update: {},
        create: {
            facilitatorId: facilitator.id,
            mentorshipId: mentorshipId,
            programCycleId: cycleId
        }
    });

    // 4. Evaluation Form & Questions
    console.log("Creating Evaluation Form...");
    const form = await prisma.evaluationForm.create({
        data: {
            title: "Đánh giá tiến độ giữa kỳ",
            description: "Dành cho Mentor đánh giá năng lực và thái độ của Mentee sau 2 tháng.",
            questions: {
                create: [
                    { label: "Kỹ năng chuyên môn", type: "RATING", order: 1, weight: 1.5 },
                    { label: "Thái độ học tập", type: "RATING", order: 2, weight: 1.0 },
                    { label: "Kế hoạch hoàn thành mục tiêu", type: "RATING", order: 3, weight: 1.2 },
                    { label: "Nhận xét tổng quát", type: "TEXT", order: 4, weight: 0.5 }
                ]
            }
        },
        include: { questions: true }
    });

    // 5. Some Sample Rankings
    console.log("Seeding Rankings...");
    const rankingData = [
        { email: "mentee@tulie.vn", score: 88.5, rank: 2, metrics: { attendance: 95, goals: 80, evals: 90 } },
        { email: "mentee2@tulie.vn", score: 92.0, rank: 1, metrics: { attendance: 100, goals: 85, evals: 92 } },
        { email: "mentee3@tulie.vn", score: 75.2, rank: 3, metrics: { attendance: 80, goals: 70, evals: 76 } }
    ];

    for (const r of rankingData) {
        const user = await prisma.user.findUnique({ where: { email: r.email } });
        if (user) {
            await prisma.menteeRanking.upsert({
                where: { menteeId_programCycleId: { menteeId: user.id, programCycleId: cycleId } },
                update: {
                    totalScore: r.score,
                    rank: r.rank,
                    metrics: r.metrics
                },
                create: {
                    menteeId: user.id,
                    programCycleId: cycleId,
                    totalScore: r.score,
                    rank: r.rank,
                    metrics: r.metrics
                }
            });

            // Create some responses to the form for them
            const response = await prisma.evaluationResponse.create({
                data: {
                    formId: form.id,
                    submitterId: facilitator.id, // Facilitator or Mentor
                    targetMenteeId: user.id,
                    answers: {
                        create: form.questions.map(q => ({
                            questionId: q.id,
                            value: q.type === "RATING" ? (Math.floor(Math.random() * 2) + 4).toString() : "Good progress",
                            score: q.type === "RATING" ? (Math.floor(Math.random() * 2) + 4) * 20 : 100 // Scale to 100
                        }))
                    }
                }
            });
        }
    }

    console.log("\n✅ ROLES AND RANKING SEEDING COMPLETED!");
    console.log("Accounts created:");
    console.log("- Manager: manager@tulie.vn / password123");
    console.log("- Facilitator: facilitator@tulie.vn / password123");
    console.log("- Mentee 2: mentee2@tulie.vn / password123");
    console.log("- Mentee 3: mentee3@tulie.vn / password123");
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
