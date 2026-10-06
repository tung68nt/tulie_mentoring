import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL?.replace(":5432/", ":6543/");
const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding realistic data for active mentee experience...");

    const mentorEmail = "mentor@tulie.vn";
    const menteeEmail = "mentee@tulie.vn";

    const mentor = await prisma.user.findUnique({ where: { email: mentorEmail } });
    const mentee = await prisma.user.findUnique({ where: { email: menteeEmail } });

    if (!mentor || !mentee) {
        console.error("Mentor or Mentee not found.");
        return;
    }

    // 1. Mentee Profile - Base info
    await prisma.menteeProfile.upsert({
        where: { userId: mentee.id },
        update: {
            studentId: "TL-2026-001",
            major: "Marketing & Communications",
            year: 4,
            careerGoals: "Trở thành một Account Manager xuất sắc hoặc Marketing Lead trong 3 năm tới.",
            background: "Từng tham gia nhiều hoạt động ngoại khóa về truyền thông. Có kinh nghiệm làm freelancer content production.",
            experience: "Thực tập sinh Marketing tại VinGroup (3 tháng), Co-founder dự án cộng đồng 'Eco-Hanoi'.",
            skills: JSON.stringify(["Content Writing", "Meta Ads", "CapCut", "Figma", "English Ielts 7.5"]),
            strengths: "Sáng tạo, kiên trì, có khả năng làm việc dưới áp lực cao.",
            weaknesses: "Đôi khi quá tập trung vào chi tiết dẫn đến chậm deadline, đang học cách quản lý thời gian tốt hơn."
        },
        create: {
            userId: mentee.id,
            studentId: "TL-2026-001",
            major: "Marketing & Communications",
            year: 4,
            careerGoals: "Account Manager / Marketing Lead.",
            background: "Năng động, thích sáng tạo.",
            experience: "Thực tập sinh Marketing.",
            skills: JSON.stringify(["Marketing", "Communication"]),
            strengths: "Chăm chỉ",
            weaknesses: "Cầu toàn"
        }
    });

    // 2. Portfolio - Deeper insights
    await prisma.portfolio.upsert({
        where: { menteeId: mentee.id },
        update: {
            personalityMbti: "ENFJ-A",
            personalityDisc: "Di",
            personalityHolland: "AES",
            competencies: JSON.stringify({
                "Communication": 85,
                "Creative Thinking": 90,
                "Analytical Skills": 70,
                "Project Management": 75,
                "Self-Learning": 95
            }),
            shortTermGoals: JSON.stringify([
                "Hoàn thành khóa học Google Data Analytics",
                "Xây dựng portfolio cá nhân trên Behance",
                "Thực tập tại một Agency lớn"
            ]),
            longTermGoals: JSON.stringify([
                "Trở thành Head of Marketing",
                "Xây dựng cộng đồng chia sẻ kiến thức cho sinh viên"
            ]),
            challenges: "Khó khăn trong việc cân bằng giữa việc học trên trường và dự án thực tế tại Agency.",
            personalNotes: "Luôn nỗ lực 200% sức lực cho mỗi dự án. Quan điểm: Done is better than perfect, but better is best.",
            startupIdeas: "Ứng dụng AI để tối ưu hóa việc lên moodboard tự động cho dân Creative.",
            strengths: "Khả năng kết nối mọi người trong team cực tốt.",
            weaknesses: "Dễ bị sao nhãng bởi các ý tưởng mới."
        },
        create: {
            menteeId: mentee.id,
            personalityMbti: "ENFJ-A",
            personalityDisc: "Di",
            personalityHolland: "AES",
            competencies: JSON.stringify({
                "Communication": 80,
                "Creative Thinking": 90
            }),
            shortTermGoals: JSON.stringify(["Học thiết kế"]),
            longTermGoals: JSON.stringify(["Mở Agency"]),
            challenges: "Thời gian",
            personalNotes: "Nhiệt huyết"
        }
    });

    // 3. Activity Logs - The "Active" feel
    const actions = [
        { action: "login", metadata: JSON.stringify({ device: "MacBook Pro", location: "Hanoi" }), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
        { action: "submit_reflection", metadata: JSON.stringify({ meetingTitle: "Review Kế hoạch Marketing" }), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
        { action: "update_goal", metadata: JSON.stringify({ goalTitle: "Thành thạo Figma", progress: 65 }), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48) },
        { action: "view_wiki", metadata: JSON.stringify({ wikiTitle: "Brand Guideline" }), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
        { action: "complete_task", metadata: JSON.stringify({ taskTitle: "Research Insight" }), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12) },
    ];

    for (const log of actions) {
        await prisma.activityLog.create({
            data: {
                userId: mentee.id,
                ...log
            }
        });
    }

    console.log("Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
