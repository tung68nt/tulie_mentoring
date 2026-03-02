import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const password = "password123";
    const hash = await bcrypt.hash(password, 12);

    console.log(`Setting password to "${password}" for all @tulie.vn accounts...`);
    console.log(`Hash: ${hash}`);

    const users = await prisma.user.findMany({
        where: { email: { contains: "@tulie.vn" } }
    });

    for (const user of users) {
        console.log(`Updating user: ${user.email} (current role: ${user.role})`);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: hash }
        });
    }

    // Ensure they have profiles
    for (const user of users) {
        if (user.role === "mentor") {
            await prisma.mentorProfile.upsert({
                where: { userId: user.id },
                update: {},
                create: { userId: user.id, company: "Tulie Academy" }
            });
        } else if (user.role === "mentee") {
            await prisma.menteeProfile.upsert({
                where: { userId: user.id },
                update: {},
                create: { userId: user.id, major: "Education" }
            });
        }
    }

    console.log("Update complete!");
}

main()
    .catch(console.error)
    .finally(() => pool.end());
