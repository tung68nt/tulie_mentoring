import "dotenv/config";
import { prisma } from "./src/lib/db";

async function main() {
    const users = await prisma.user.findMany({
        where: {
            email: {
                in: ["mentor@tulie.vn", "mentee@tulie.vn"]
            }
        },
        include: {
            mentorProfile: true,
            menteeProfile: true
        }
    });
    console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
