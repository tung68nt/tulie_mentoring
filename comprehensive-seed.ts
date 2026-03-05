import { Pool } from "pg";
import "dotenv/config";

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function main() {
    console.log("Connecting to Supabase Pooler...");
    const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 30000
    });

    try {
        const client = await pool.connect();
        console.log("SUCCESS: Connected to database.");

        // 1. Ensure Admin Role
        console.log("Setting roles...");
        await client.query(`UPDATE "User" SET role = 'admin' WHERE email IN ('mentor@tulie.vn', 'admin@tulie.vn')`);

        // 2. Get important IDs
        const userRes = await client.query(`SELECT id, email FROM "User" WHERE email IN ('mentor@tulie.vn', 'mentee@tulie.vn')`);
        const users = userRes.rows.reduce((acc, curr) => ({ ...acc, [curr.email]: curr.id }), {});

        const mentorId = users['mentor@tulie.vn'];
        const menteeId = users['mentee@tulie.vn'];

        if (!mentorId || !menteeId) {
            console.error("Required users not found. Run basic seed first.");
            return;
        }

        // 3. Ensure Mentorship exists
        const mentorshipRes = await client.query(`
            INSERT INTO "Mentorship" (id, mentorId, title, status, "updatedAt")
            VALUES ('seed-mentorship-id', $1, 'TSS Mentoring Program', 'active', NOW())
            ON CONFLICT (id) DO UPDATE SET status = 'active'
            RETURNING id
        `, [mentorId]);
        const mentorshipId = mentorshipRes.rows[0].id;

        await client.query(`
            INSERT INTO "MentorshipMentee" (id, mentorshipId, menteeId, status)
            VALUES ('seed-relation-id', $1, $2, 'active')
            ON CONFLICT (mentorshipId, menteeId) DO NOTHING
        `, [mentorshipId, menteeId]);

        // 4. Seed Goals
        console.log("Seeding comprehensive goals...");
        const goals = [
            ['Master Advanced React Patterns', 'Focus on Compound Components and Render Props', 'skill', 100, 75, 'Urgent'],
            ['Complete Typst Presentation', 'For the final project assessment', 'project', 100, 90, 'High'],
            ['Build System Branding Feature', 'Favicon and Logo customization', 'feature', 100, 100, 'Medium'],
            ['UI/UX Refinement', 'Polish the dashboard aesthetics', 'design', 100, 40, 'Low'],
            ['Performance Optimization', 'Improve lighthouse score to 95+', 'tech', 100, 0, 'Medium']
        ];

        for (const [title, desc, cat, target, current, priority] of goals) {
            await client.query(`
                INSERT INTO "Goal" (id, mentorshipId, creatorId, title, description, category, "targetValue", "currentValue", priority, status, "updatedAt", "dueDate")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW() + interval '30 days')
                ON CONFLICT DO NOTHING
            `, [Math.random().toString(36).substr(2, 9), mentorshipId, menteeId, title, desc, cat, target, current, priority, current === 100 ? 'completed' : 'in_progress']);
        }

        // 5. Seed Daily Diaries (Past 30 days)
        console.log("Seeding daily diaries...");
        const moods = ['excellent', 'good', 'neutral', 'tired', 'coding'];
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            await client.query(`
                INSERT INTO "DailyDiary" (id, userId, date, content, mood, "updatedAt")
                VALUES ($1, $2, $3, $4, $5, NOW())
                ON CONFLICT (userId, date) DO NOTHING
            `, [Math.random().toString(36).substr(2, 9), menteeId, date, `Hôm nay tôi đã xử lý được task ${i}. Mọi thứ đang tiến triển tốt.`, moods[i % moods.length]]);
        }

        // 6. Seed Activity Logs for Heatmap (Concentrated in last 60 days)
        console.log("Seeding activity logs for heatmap...");
        const actions = ['login', 'update_goal', 'create_task', 'view_report', 'message_mentor', 'post_reflection'];
        for (let i = 0; i < 200; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 60));
            await client.query(`
                INSERT INTO "ActivityLog" (id, userId, action, createdAt)
                VALUES ($1, $2, $3, $4)
            `, [Math.random().toString(36).substr(2, 9), menteeId, actions[i % actions.length], date]);
        }

        // 7. Seed Meetings
        console.log("Seeding meetings and minutes...");
        for (let i = 0; i < 10; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (i * 7)); // Once a week
            const meetingId = Math.random().toString(36).substr(2, 9);
            await client.query(`
                INSERT INTO "Meeting" (id, mentorshipId, creatorId, title, description, scheduledAt, status, "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            `, [meetingId, mentorshipId, mentorId, `Weekly Sync - Week ${12 - i}`, 'Reviewing progress and blockers.', date, 'completed']);

            await client.query(`
                INSERT INTO "MeetingMinutes" (id, meetingId, authorId, agenda, "keyPoints", "actionItems", status, "updatedAt")
                VALUES ($1, $2, $3, 'Check progress', 'Work is stable', 'Complete next module', 'approved', NOW())
            `, [Math.random().toString(36).substr(2, 9), meetingId, mentorId]);
        }

        // 8. Seed Portfolio (Journey)
        console.log("Seeding portfolio entries...");
        const entries = [
            'Dự án mentoring được khởi tạo thành công',
            'Hoàn thành thiết kế UI/UX cho Dashboard',
            'Tích hợp thành công Docker và CI/CD',
            'Demo lần 1 với Mentor đạt kết quả tốt',
            'Bắt đầu triển khai tính năng Admin'
        ];
        for (let i = 0; i < entries.length; i++) {
            await client.query(`
                INSERT INTO "Portfolio" (id, userId, mentorshipId, title, description, category, "updatedAt")
                VALUES ($1, $2, $3, $4, $5, 'milestone', NOW())
            `, [Math.random().toString(36).substr(2, 9), menteeId, mentorshipId, entries[i], 'Chi tiết quá trình phát triển dự án.']);
        }

        console.log("COMPREHENSIVE SEED FINISHED SUCCESSFULLY!");
        client.release();
    } catch (err) {
        console.error("Error during seeding:", err);
    } finally {
        await pool.end();
    }
}

main();
