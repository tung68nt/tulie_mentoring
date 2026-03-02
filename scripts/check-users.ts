import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const users = await prisma.user.findMany({
        where: { email: { contains: "@tulie.vn" } },
        select: { id: true, email: true, role: true, passwordHash: true }
    });
    console.log("Current @tulie.vn users in DB:");
    console.log(JSON.stringify(users, null, 2));
}

main()
    .catch(console.error)
    .finally(() => pool.end());
