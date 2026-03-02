import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function login(email, password) {
    console.log(`Simulating login for ${email}...`);
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.log("User not found in DB.");
        return null;
    }

    if (!user.passwordHash) {
        console.log("User has no password hash.");
        return null;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    console.log(`Password match with "password123": ${match}`);
    return match;
}

async function main() {
    await login("mentor@tulie.vn", "password123");
    await login("mentee@tulie.vn", "password123");
    await login("view@tulie.vn", "password123");
}

main()
    .catch(console.error)
    .finally(() => pool.end());
