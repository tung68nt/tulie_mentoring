import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Use Supabase Pooler URL for connection
const connectionString = "postgresql://postgres.uiecxdbsorhrbputbmyg:oqWtkY3vU8IxGe3R@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const emailToTest = "admin@tulie.vn";
    const passwordToTest = "TulieMasterAdmin2026!";

    console.log(`Checking DB for user: ${emailToTest}`);

    // 1. Find user
    const user = await prisma.user.findUnique({
        where: { email: emailToTest }
    });

    if (!user) {
        console.error("❌ User not found in database!");
        return;
    }

    console.log("✅ User found in database:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Has PasswordHash: ${!!user.passwordHash}`);

    if (!user.passwordHash) {
        console.error("❌ User has no password hash!");
        return;
    }

    // 2. Compare password
    console.log("\nTesting password match...");
    const isMatch = await bcrypt.compare(passwordToTest, user.passwordHash);

    if (isMatch) {
        console.log("✅ Password match SUCCESSFUL!");
    } else {
        console.error("❌ Password match FAILED!");
        console.log(`   Hash in DB: ${user.passwordHash}`);
    }
}

main()
    .catch((e) => {
        console.error("Script error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
