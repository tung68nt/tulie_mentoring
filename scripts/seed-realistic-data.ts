import "dotenv/config";
import { prisma } from "../src/lib/db";

async function main() {
    console.log("Seeding realistic data...");

    // 1. Get existing users
    const admin = await prisma.user.findFirst({ where: { role: "admin" } });
    const mentor = await prisma.user.findFirst({ where: { role: "mentor" } });
    const mentee = await prisma.user.findFirst({ where: { role: "mentee" } });

    if (!admin || !mentor || !mentee) {
        console.error("Required users (admin, mentor, mentee) not found. Run seed-test-accounts first.");
        return;
    }

    // 2. Realistic Wiki Pages
    const wikiPages = [
        {
            title: "Danh sách tài nguyên cho Mentee",
            category: "Resources",
            visibility: "public",
            content: JSON.stringify([
                { type: "heading", props: { textColor: "default", backgroundColor: "default", textAlignment: "left", level: 1 }, content: [{ type: "text", text: "Chào mừng bạn đến với Mentoring", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Dưới đây là các tài liệu quan trọng để bạn bắt đầu hành trình của mình.", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Sổ tay Mentee (PDF)", styles: { bold: true } }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Quy tắc ứng xử trong chương trình", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Hướng dẫn sử dụng hệ thống Tulie Mentoring", styles: { italic: false } }] },
                { type: "paragraph", content: [{ type: "text", text: "Hãy đảm bảo bạn đã đọc kỹ các tài liệu này trước buổi gặp đầu tiên.", styles: {} }] }
            ]),
            coverImage: "https://images.unsplash.com/photo-14340393118ee-d820b3f7ad6e?auto=format&fit=crop&q=80&w=2000"
        },
        {
            title: "Marketing Knowledge Hub",
            category: "Marketing",
            visibility: "public",
            content: JSON.stringify([
                { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Lộ trình tự học Marketing cơ bản", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Tổng hợp các nguồn tài liệu uy tín về Marketing.", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "1. Brand Positioning", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Hiểu về định vị thương hiệu và cách tạo sự khác biệt.", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "2. Digital Performance", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Tối ưu hóa chuyển đổi và các chỉ số đo lường.", styles: {} }] }
            ]),
            coverImage: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&q=80&w=2000"
        },
        {
            title: "Performance Review Process",
            category: "Operations",
            visibility: "mentor_only",
            content: JSON.stringify([
                { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Quy trình đánh giá kết quả Mentoring", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Tài liệu dành riêng cho Mentor để theo dõi tiến độ của Mentee.", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Đánh giá theo quý (Quarterly Review)", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Hệ thống chỉ số KPI cho Mentee", styles: {} }] }
            ]),
            coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000"
        }
    ];

    for (const wp of wikiPages) {
        const slug = wp.title.toLowerCase().replace(/\s+/g, '-');
        await prisma.wikiPage.upsert({
            where: { slug },
            update: { ...wp },
            create: { ...wp, slug, authorId: admin.id }
        });
    }

    // 3. Realistic Portfolio for Mentee
    const portfolio = await prisma.portfolio.upsert({
        where: { menteeId: mentee.id },
        update: {
            personalityMbti: "INFJ",
            personalityDisc: "DI",
            personalityHolland: "AES",
            shortTermGoals: "Hoàn thành khóa học SQL cơ bản và triển khai được 1 project data visualization.",
            longTermGoals: "Trở thành Senior Product Manager trong vòng 3 năm tới.",
            challenges: "Quản lý thời gian giữa việc học và làm thêm.",
            strengths: "Tư duy hệ thống, Khả năng tự học, Giao tiếp tốt.",
            weaknesses: "Trì hoãn khi gặp việc khó, Kỹ năng thuyết trình trước đám đông."
        },
        create: {
            menteeId: mentee.id,
            personalityMbti: "INFJ",
            personalityDisc: "DI",
            personalityHolland: "AES",
            shortTermGoals: "Hoàn thành khóa học SQL cơ bản và triển khai được 1 project data visualization.",
            longTermGoals: "Trở thành Senior Product Manager trong vòng 3 năm tới.",
            challenges: "Quản lý thời gian giữa việc học và làm thêm.",
            strengths: "Tư duy hệ thống, Khả năng tự học, Giao tiếp tốt.",
            weaknesses: "Trì hoãn khi gặp việc khó, Kỹ năng thuyết trình trước đám đông."
        }
    });

    // 4. Portfolio Entries (Journal/Diary items)
    const entries = [
        {
            title: "Buổi gặp gỡ đầu tiên với Mentor",
            content: "Hôm nay tôi đã có buổi gặp đầu tiên với Mentor. Chúng tôi đã thống nhất về lộ trình phát triển trong 6 tháng tới. Tôi cảm thấy rất hào hứng.",
            type: "reflection"
        },
        {
            title: "Thay đổi trong cách nhìn nhận vấn đề",
            content: "Sau khi thảo luận về case study Marketing, tôi nhận ra mình thường tập trung quá nhiều vào tool mà quên mất câu chuyện thương hiệu cốt lõi.",
            type: "reflection"
        }
    ];

    for (const entry of entries) {
        await prisma.portfolioEntry.create({
            data: {
                ...entry,
                portfolioId: portfolio.id
            }
        });
    }

    // 5. Training Progress (Goals)
    const mentorship = await prisma.mentorship.findFirst({
        where: { mentees: { some: { menteeId: mentee.id } } }
    });

    if (mentorship) {
        await prisma.goal.create({
            data: {
                mentorshipId: mentorship.id,
                creatorId: mentee.id,
                title: "Lên Planner Content Hoàn chỉnh",
                description: "Xây dựng kế hoạch nội dung chi tiết cho 1 tháng.",
                category: "skill",
                targetValue: 100,
                currentValue: 30,
                unit: "%",
                priority: "high",
                dueDate: new Date("2026-04-30")
            }
        });
    }

    console.log("Seeding completed successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
