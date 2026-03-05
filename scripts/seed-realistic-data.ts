import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding realistic data...");

    // 1. Get existing users
    const admin = await prisma.user.findFirst({ where: { role: "admin" } });
    const mentor = await prisma.user.findFirst({ where: { role: "mentor" } });
    const mentee = await prisma.user.findFirst({ where: { role: "mentee" } });

    const authorId = admin?.id || mentor?.id || mentee?.id;
    if (!authorId) {
        console.error("No users found. Run main seed first: npm run db:seed");
        return;
    }

    // Update Admin avatar
    if (admin) {
        await prisma.user.update({
            where: { id: admin.id },
            data: {
                avatar: "/images/wiki/admin_avatar.png",
                firstName: "Quản trị",
                lastName: "Hệ thống"
            }
        });
        console.log("Updated Admin profile with premium avatar.");
    }

    console.log("Seeding comprehensive mentee data...");

    // 3. Mentee Profile & Portfolio Deep Seed
    if (mentee) {
        // Update Mentee Profile
        await prisma.menteeProfile.upsert({
            where: { userId: mentee.id },
            update: {
                studentId: "MT2024001",
                major: "Marketing & Truyền thông Đa phương tiện",
                careerGoals: "Trở thành Brand Manager tại tập đoàn đa quốc gia và xây dựng cộng đồng làm sáng tạo nội dung bền vững.",
                skills: "Content Writing, CapCut, Photoshop cơ bản, Google Analytics 4",
                strengths: "Tư duy sáng tạo, kỹ năng làm việc nhóm, nhạy bén với các xu hướng trên mạng xã hội.",
                weaknesses: "Quản lý thời gian chưa tối ưu, kỹ năng thuyết trình trước đám đông cần cải thiện.",
                background: "Sinh viên năm 3 chuyên ngành Marketing với niềm đam mê sâu sắc về Branding.",
                currentChallenges: "Đang gặp khó khăn trong việc cân bằng giữa việc học trên trường và các dự án thực tế. Cần định hướng rõ ràng về lộ trình thăng tiến trong ngành Agency.",
                isOnboardingComplete: true,
                onboardingCompletedAt: new Date()
            },
            create: {
                userId: mentee.id,
                studentId: "MT2024001",
                major: "Marketing & Truyền thông Đa phương tiện",
                isOnboardingComplete: true
            }
        });

        // Update/Create Portfolio
        await prisma.portfolio.upsert({
            where: { menteeId: mentee.id },
            update: {
                personalityMbti: "ENFJ-A",
                personalityDisc: "D/I",
                personalityHolland: "EAS",
                competencies: "Lãnh đạo đội nhóm, Phân tích dữ liệu Marketing, Sáng tạo thông điệp thương hiệu.",
                strengths: "Khả năng kết nối mọi người, truyền cảm hứng cho đồng đội và đưa ra các ý tưởng đột phá trong hoàn cảnh áp lực cao.",
                weaknesses: "Đôi khi quá chú trọng vào tiểu tiết dẫn đến chậm tiến độ tổng thể. Cần học cách ủy quyền hiệu quả hơn.",
                challenges: "Xây dựng mạng lưới quan hệ chất lượng trong ngành công nghiệp sáng tạo khi chưa có nhiều kinh nghiệm thực tế.",
                shortTermGoals: "Hoàn thành khóa học Digital Marketing nâng cao, đạt chứng chỉ IELTS 7.5, thực tập tại Top 10 Agency trong nước.",
                longTermGoals: "Sáng lập một Agency chuyên về định vị thương hiệu cho các Startup khởi nghiệp xanh trong vòng 5 năm tới.",
                personalNotes: "Luôn tâm niệm: 'Stay hungry, stay foolish'. Mỗi ngày đều nỗ lực hơn chính mình của ngày hôm qua.",
                startupIdeas: "Nền tảng kết nối các bạn trẻ làm Freelance Creative với các doanh nghiệp vừa và nhỏ đang cần xây dựng thương hiệu bài bản."
            },
            create: {
                menteeId: mentee.id,
                personalityMbti: "ENFJ-A",
                personalityDisc: "D/I"
            }
        });

        // Add 3-5 Goals
        const goals = [
            { title: "Nâng cao kỹ năng Strategic Content", description: "Xây dựng 3 kế hoạch truyền thông tích hợp cho dự án cá nhân.", category: "skill", priority: "high", targetValue: 3, currentValue: 1 },
            { title: "Mở rộng mạng lưới quan hệ chuyên môn", description: "Kết nối và thảo luận với ít nhất 5 chuyên gia trong ngành qua LinkedIn.", category: "networking", priority: "medium", targetValue: 5, currentValue: 2 },
            { title: "Cải thiện kỹ năng thuyết trình bằng tiếng Anh", description: "Thực hiện ít nhất 1 bài thuyết trình chuyên sâu mỗi tuần.", category: "skill", priority: "high", targetValue: 12, currentValue: 4 }
        ];

        // Add Goals for mentee (assuming a mentorship exists, skipping if not to avoid errors)
        const mentorship = await prisma.mentorship.findFirst({
            where: { mentees: { some: { menteeId: mentee.id } } }
        });

        if (mentorship) {
            for (const g of goals) {
                await prisma.goal.create({
                    data: {
                        ...g,
                        mentorshipId: mentorship.id,
                        creatorId: mentee.id,
                        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                    }
                });
            }
        }

        // Add Habits
        const habits = [
            { title: "Đọc 10 trang sách chuyên ngành", frequency: "daily" },
            { title: "Viết Journal tổng kết ngày", frequency: "daily" },
            { title: "Học từ vựng tiếng Anh chuyên ngành Marketing", frequency: "daily" }
        ];
        for (const h of habits) {
            await prisma.habit.create({ data: { ...h, userId: mentee.id } });
        }

        // Add Daily Diaries
        const diaries = [
            {
                date: new Date(),
                mood: "Inspired",
                content: "Hôm nay tôi đã có một buổi thảo luận tuyệt vời với Mentor về định hướng nghề nghiệp. Tôi nhận ra rằng mình cần tập trung nhiều hơn vào tư duy chiến lược thay vì chỉ dừng lại ở việc thực thi content đơn thuần. Cảm thấy rất hào hứng cho lộ trình 3 tháng tới!"
            },
            {
                date: new Date(Date.now() - 24 * 60 * 60 * 1000),
                mood: "Productive",
                content: "Đã hoàn thành xong bản kế hoạch Content đầu tiên cho Tulie Mentoring. Mặc dù còn nhiều điểm cần cải thiện nhưng đây là bước tiến lớn của bản thân. Việc áp dụng các framework được Mentor chia sẻ giúp công việc trôi chảy hơn hẳn."
            }
        ];
        for (const d of diaries) {
            await prisma.dailyDiary.upsert({
                where: { userId_date: { userId: mentee.id, date: d.date } },
                update: d,
                create: { ...d, userId: mentee.id }
            });
        }
    }

    console.log("Found user for seeding:", authorId);

    // 4. Realistic Wiki Pages (existing loop follows...)
    const wikiPages = [
        // ... (previous pages content here)
        {
            title: "Danh sách tài nguyên cho Mentee",
            category: "Resources",
            visibility: "public",
            content: JSON.stringify([
                { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Chào mừng bạn đến với Mentoring", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Dưới đây là các tài liệu quan trọng để bạn bắt đầu hành trình của mình.", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Sổ tay Mentee (PDF)", styles: { bold: true } }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Quy tắc ứng xử trong chương trình", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Hướng dẫn sử dụng hệ thống Tulie Mentoring", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Hãy đảm bảo bạn đã đọc kỹ các tài liệu này trước buổi gặp đầu tiên.", styles: {} }] }
            ]),
            coverImage: "/images/wiki/resources.png"
        },
        {
            title: "Tulie Brand Guidelines 2026",
            category: "Branding",
            visibility: "public",
            content: JSON.stringify([
                { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Brand Guideline & Visual Identity", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Bộ quy chuẩn thương hiệu Tulie Mentoring giúp duy trì sự thống nhất trong giao tiếp và hình ảnh.", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Core Colors", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Emerald Green: #10b981 - Tượng trưng cho sự tăng trưởng", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Soft Navy: #1e1b4b - Tượng trưng cho sự chuyên nghiệp", styles: {} }] }
            ]),
            coverImage: "/images/wiki/branding.png"
        },
        {
            title: "Marketing Knowledge Hub",
            category: "Marketing",
            visibility: "public",
            content: JSON.stringify([
                { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Lộ trình tự học Marketing cơ bản", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Tổng hợp các nguồn tài liệu uy tín về Marketing.", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "1. Brand Positioning", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Hiểu về định vị thương hiệu và cách tạo sự khác biệt trên thị trường.", styles: {} }] }
            ]),
            coverImage: "/images/wiki/marketing.png"
        },
        {
            title: "Quy trình Onboarding cho Intern",
            category: "Tài liệu công ty",
            visibility: "mentor_only",
            content: JSON.stringify([
                { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Quy trình Onboarding Intern", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Tài liệu hướng dẫn giúp các bạn Intern nhanh chóng làm quen với văn hóa công ty.", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Ngày 1: Giới thiệu team và công cụ", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Ngày 2-3: Training chuyên môn", styles: {} }] }
            ]),
            coverImage: "/images/wiki/operations.png"
        },
        {
            title: "Kỹ năng thuyết trình hiệu quả",
            category: "Soft Skills",
            visibility: "public",
            content: JSON.stringify([
                { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Kỹ năng thuyết trình chuyên dụng", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Áp dụng nguyên tắc 10-20-30: Tối đa 10 slides, thời lượng 20 phút, font chữ tối thiểu 30pt.", styles: {} }] }
            ]),
            coverImage: "/images/wiki/soft_skills.png"
        }
    ];

    for (const wp of wikiPages) {
        const slug = wp.title
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d").replace(/Đ/g, "D")
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '');

        try {
            await prisma.wikiPage.upsert({
                where: { slug },
                update: {
                    title: wp.title,
                    content: wp.content,
                    category: wp.category,
                    visibility: wp.visibility,
                    coverImage: wp.coverImage
                },
                create: { ...wp, slug, authorId }
            });
            console.log(`  ✓ Wiki: ${wp.title}`);
        } catch (e: any) {
            console.log(`  ⚠ Wiki "${wp.title}" skipped: ${e.message?.substring(0, 60)}`);
        }
    }

    console.log("\n✅ Realistic wiki data seeded successfully!");
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
