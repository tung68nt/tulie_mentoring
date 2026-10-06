import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function backfillSessionNumbers() {
    console.log("🔄 Backfilling session numbers for existing meetings...\n");

    const mentorships = await prisma.mentorship.findMany({
        select: { id: true },
    });

    let totalUpdated = 0;

    for (const mentorship of mentorships) {
        const meetings = await prisma.meeting.findMany({
            where: { mentorshipId: mentorship.id },
            orderBy: { scheduledAt: "asc" },
            select: { id: true, title: true, sessionNumber: true, scheduledAt: true },
        });

        if (meetings.length === 0) continue;

        console.log(`📋 Mentorship ${mentorship.id}: ${meetings.length} meetings`);

        for (let i = 0; i < meetings.length; i++) {
            const expectedSession = i + 1;
            const meeting = meetings[i];

            if (meeting.sessionNumber !== expectedSession) {
                await prisma.meeting.update({
                    where: { id: meeting.id },
                    data: { sessionNumber: expectedSession },
                });
                console.log(`  ✅ "${meeting.title}" → Buổi ${expectedSession} (was ${meeting.sessionNumber ?? "null"})`);
                totalUpdated++;
            } else {
                console.log(`  ⏭️  "${meeting.title}" → Buổi ${expectedSession} (already correct)`);
            }
        }
    }

    console.log(`\n✨ Done! Updated ${totalUpdated} meetings.`);
    await prisma.$disconnect();
    await pool.end();
}

backfillSessionNumbers().catch((e) => {
    console.error("❌ Error:", e);
    prisma.$disconnect();
    pool.end();
    process.exit(1);
});
