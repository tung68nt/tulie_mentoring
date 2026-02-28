import { prisma } from "../src/lib/db";

async function main() {
    try {
        const goals = await prisma.goal.findMany({
            include: {
                subGoals: true,
                progressNotes: true,
            }
        });
        console.log("Success! Goals found:", goals.length);
    } catch (error) {
        console.error("Oops! Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
