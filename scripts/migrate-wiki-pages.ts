/**
 * Data migration script: Migrate old WikiPage data to new 3-level hierarchy.
 * 
 * Old structure: WikiPage has `category` (String?) 
 * New structure: WikiCategory → Wiki → WikiPage (via wikiId FK)
 * 
 * This script:
 * 1. Finds all WikiPages with wikiId=null (old pages)
 * 2. Groups them by their old `category` field
 * 3. Creates a WikiCategory "Chung" (General) if needed
 * 4. Creates a Wiki for each unique category
 * 5. Links old pages to the new Wiki
 * 
 * Run: npx tsx scripts/migrate-wiki-pages.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "untitled";
}

async function main() {
    console.log("🚀 Starting wiki data migration...\n");

    // Find all orphan pages (wikiId is null)
    const orphanPages = await prisma.wikiPage.findMany({
        where: { wikiId: null },
        orderBy: { createdAt: "asc" },
    });

    if (orphanPages.length === 0) {
        console.log("✅ No orphan pages found. Migration not needed.");
        return;
    }

    console.log(`📄 Found ${orphanPages.length} orphan pages to migrate.\n`);

    // Group by old category
    const grouped = new Map<string, typeof orphanPages>();
    for (const page of orphanPages) {
        const cat = (page as any).category || "Chưa phân loại";
        if (!grouped.has(cat)) grouped.set(cat, []);
        grouped.get(cat)!.push(page);
    }

    console.log(`📁 Categories found: ${[...grouped.keys()].join(", ")}\n`);

    // Create or find the default WikiCategory
    let defaultCategory = await prisma.wikiCategory.findFirst({
        where: { slug: "chung" },
    });

    if (!defaultCategory) {
        defaultCategory = await prisma.wikiCategory.create({
            data: {
                name: "Chung",
                slug: "chung",
                order: 0,
            },
        });
        console.log(`✅ Created category: "Chung" (id: ${defaultCategory.id})`);
    } else {
        console.log(`♻️ Using existing category: "Chung" (id: ${defaultCategory.id})`);
    }

    // For each old category, create a Wiki and link pages
    let wikiOrder = 0;
    for (const [categoryName, pages] of grouped) {
        const wikiSlug = slugify(categoryName);
        
        // Check if wiki already exists
        let wiki = await prisma.wiki.findFirst({
            where: { slug: wikiSlug },
        });

        if (!wiki) {
            // Find author from first page
            const firstPage = pages[0];
            
            wiki = await prisma.wiki.create({
                data: {
                    title: categoryName,
                    slug: wikiSlug,
                    description: `Các trang wiki từ chuyên mục "${categoryName}"`,
                    categoryId: defaultCategory.id,
                    authorId: firstPage.authorId,
                    visibility: "public",
                    order: wikiOrder++,
                },
            });
            console.log(`  ✅ Created wiki: "${categoryName}" (id: ${wiki.id})`);
        } else {
            console.log(`  ♻️ Wiki already exists: "${categoryName}" (id: ${wiki.id})`);
        }

        // Link pages to wiki
        let pageOrder = 0;
        for (const page of pages) {
            await prisma.wikiPage.update({
                where: { id: page.id },
                data: {
                    wikiId: wiki.id,
                    order: pageOrder++,
                },
            });
            console.log(`    📄 Linked page: "${page.title}" → wiki "${categoryName}"`);
        }
    }

    // Summary
    const totalCategories = await prisma.wikiCategory.count();
    const totalWikis = await prisma.wiki.count();
    const totalPages = await prisma.wikiPage.count();
    const remainingOrphans = await prisma.wikiPage.count({ where: { wikiId: null } });

    console.log(`\n📊 Summary:`);
    console.log(`   Categories: ${totalCategories}`);
    console.log(`   Wikis: ${totalWikis}`);
    console.log(`   Pages: ${totalPages}`);
    console.log(`   Remaining orphans: ${remainingOrphans}`);
    console.log(`\n✅ Migration complete!`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
