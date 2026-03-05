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

    console.log("Found user for seeding:", authorId);

    // 2. Realistic Wiki Pages
    const wikiPages = [
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
