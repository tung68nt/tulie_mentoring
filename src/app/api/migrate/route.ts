import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const log: string[] = [];
    try {
        // 1. Add missing TodoItem columns
        const todoColumns = [
            `ALTER TABLE "TodoItem" ADD COLUMN "attachments" TEXT;`,
            `ALTER TABLE "TodoItem" ADD COLUMN "comments" TEXT;`,
            `ALTER TABLE "TodoItem" ADD COLUMN "description" TEXT;`,
            `ALTER TABLE "TodoItem" ADD COLUMN "checklist" TEXT;`,
            `ALTER TABLE "TodoItem" ADD COLUMN "completedPercentage" INTEGER NOT NULL DEFAULT 0;`,
            `ALTER TABLE "TodoItem" ADD COLUMN "actualCompletedAt" TIMESTAMP(3);`,
            `ALTER TABLE "TodoItem" ADD COLUMN "actualStartDate" TIMESTAMP(3);`,
        ];
        for (const statement of todoColumns) {
            try {
                await prisma.$executeRawUnsafe(statement);
                log.push(`Success: ${statement}`);
            } catch (e: any) {
                log.push(`Skipped (likely exists): ${statement} -> ${e.message}`);
            }
        }

        // 2. Create Habit table
        try {
            await prisma.$executeRawUnsafe(`
        CREATE TABLE "Habit" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "description" TEXT,
            "frequency" TEXT NOT NULL DEFAULT 'daily',
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
        );
      `);
            log.push('Created Habit table');
        } catch (e: any) { log.push(`Habit table exists or failed: ${e.message}`); }

        // 3. Create HabitLog table
        try {
            await prisma.$executeRawUnsafe(`
        CREATE TABLE "HabitLog" (
            "id" TEXT NOT NULL,
            "habitId" TEXT NOT NULL,
            "date" DATE NOT NULL,
            "completed" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "HabitLog_pkey" PRIMARY KEY ("id")
        );
      `);
            log.push('Created HabitLog table');
        } catch (e: any) { log.push(`HabitLog table exists or failed: ${e.message}`); }

        // 4. Create DailyDiary table
        try {
            await prisma.$executeRawUnsafe(`
        CREATE TABLE "DailyDiary" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "date" DATE NOT NULL,
            "content" TEXT NOT NULL,
            "mood" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "DailyDiary_pkey" PRIMARY KEY ("id")
        );
      `);
            log.push('Created DailyDiary table');
        } catch (e: any) { log.push(`DailyDiary table exists or failed: ${e.message}`); }

        // 5. Constraints and Indexes
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
        } catch (e: any) { }
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "HabitLog" ADD CONSTRAINT "HabitLog_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
        } catch (e: any) { }
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "DailyDiary" ADD CONSTRAINT "DailyDiary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
        } catch (e: any) { }

        try { await prisma.$executeRawUnsafe(`CREATE INDEX "Habit_userId_idx" ON "Habit"("userId");`); } catch (e) { }
        try { await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "HabitLog_habitId_date_key" ON "HabitLog"("habitId", "date");`); } catch (e) { }
        try { await prisma.$executeRawUnsafe(`CREATE INDEX "HabitLog_habitId_idx" ON "HabitLog"("habitId");`); } catch (e) { }
        try { await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "DailyDiary_userId_date_key" ON "DailyDiary"("userId", "date");`); } catch (e) { }
        try { await prisma.$executeRawUnsafe(`CREATE INDEX "DailyDiary_userId_idx" ON "DailyDiary"("userId");`); } catch (e) { }

        return NextResponse.json({ success: true, log });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message, log });
    }
}
