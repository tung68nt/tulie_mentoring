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

    console.log("Found user for seeding:", authorId);

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
                { type: "bulletListItem", content: [{ type: "text", text: "Hướng dẫn sử dụng hệ thống Tulie Mentoring", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Hãy đảm bảo bạn đã đọc kỹ các tài liệu này trước buổi gặp đầu tiên.", styles: {} }] }
            ]),
            coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=2000"
        },
        {
            title: "Marketing Knowledge Hub",
            category: "Marketing",
            visibility: "public",
            content: JSON.stringify([
                { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Lộ trình tự học Marketing cơ bản", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Tổng hợp các nguồn tài liệu uy tín về Marketing.", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "1. Brand Positioning", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Hiểu về định vị thương hiệu và cách tạo sự khác biệt trên thị trường. Bao gồm các mô hình STP (Segmentation, Targeting, Positioning), Brand Archetype, và Value Proposition Canvas.", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "2. Digital Performance", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Tối ưu hóa chuyển đổi và các chỉ số đo lường. Google Analytics 4, Facebook Ads Manager, và A/B Testing methodology.", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "3. Content Marketing", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Xây dựng chiến lược nội dung dài hạn: SEO Content, Social Media Calendar, Email Marketing funnel.", styles: {} }] }
            ]),
            coverImage: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&q=80&w=2000"
        },
        {
            title: "Quy trình đánh giá kết quả Mentoring",
            category: "Operations",
            visibility: "mentor_only",
            content: JSON.stringify([
                { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Quy trình đánh giá kết quả Mentoring", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Tài liệu dành riêng cho Mentor để theo dõi tiến độ của Mentee theo từng giai đoạn.", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Giai đoạn 1: Onboarding (Tuần 1-2)", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Mentee hoàn thành hồ sơ cá nhân đầy đủ", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Xác định mục tiêu SMART cho 3 tháng đầu", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Giai đoạn 2: Development (Tuần 3-8)", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Check-in hàng tuần với Mentor", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Hoàn thành ít nhất 80% task được giao", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Giai đoạn 3: Review (Tuần 9-12)", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Đánh giá theo quý (Quarterly Review)", styles: {} }] },
                { type: "bulletListItem", content: [{ type: "text", text: "Feedback 360 từ Mentor và Mentee", styles: {} }] }
            ]),
            coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000"
        },
        {
            title: "Hướng dẫn sử dụng Notion cho Mentee",
            category: "Resources",
            visibility: "public",
            content: JSON.stringify([
                { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Hướng dẫn sử dụng Notion", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Notion là công cụ quản lý dự án và ghi chú mạnh mẽ. Dưới đây là cách sử dụng hiệu quả cho quá trình mentoring.", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Tạo Workspace", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Tạo workspace riêng cho mentoring, phân chia theo: Goals, Meeting Notes, Resources, và Personal Journal.", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Template gợi ý", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Sử dụng template Weekly Review để tổng kết tuần: What went well, What needs improvement, Action items.", styles: {} }] }
            ]),
            coverImage: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=2000"
        },
        {
            title: "Kỹ năng thuyết trình hiệu quả",
            category: "Soft Skills",
            visibility: "public",
            content: JSON.stringify([
                { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Kỹ năng thuyết trình hiệu quả", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Thuyết trình là kỹ năng quan trọng trong mọi ngành nghề. Dưới đây là các nguyên tắc cốt lõi.", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Cấu trúc bài thuyết trình", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Áp dụng nguyên tắc 10-20-30: Tối đa 10 slides, thời lượng 20 phút, font chữ tối thiểu 30pt.", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Storytelling", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Sử dụng cấu trúc Hero's Journey: Giới thiệu vấn đề, Xung đột, Giải pháp, Kết quả.", styles: {} }] },
                { type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Xử lý câu hỏi", styles: {} }] },
                { type: "paragraph", content: [{ type: "text", text: "Luôn lắng nghe hết câu hỏi trước khi trả lời. Nếu không biết, hãy thành thật và hẹn trả lời sau.", styles: {} }] }
            ]),
            coverImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=2000"
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
