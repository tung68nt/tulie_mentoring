import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding database...");

    // Clear existing data
    await prisma.notification.deleteMany();
    await prisma.progressNote.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.meetingMinutes.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.meeting.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.portfolio.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.mentorshipMentee.deleteMany();
    await prisma.mentorship.deleteMany();
    await prisma.mentorProfile.deleteMany();
    await prisma.menteeProfile.deleteMany();
    await prisma.programCycle.deleteMany();
    await prisma.user.deleteMany();

    const hash = await bcrypt.hash("password123", 12);

    // ─── Admin ─────────────────────────────────────────────────────
    const admin = await prisma.user.create({
        data: {
            email: "admin@imp.edu.vn",
            passwordHash: hash,
            firstName: "Quản trị",
            lastName: "Hệ thống",
            role: "admin",
            bio: "Quản trị viên hệ thống IMP Mentoring Platform",
        },
    });

    // ─── Mentors ───────────────────────────────────────────────────
    const mentor1 = await prisma.user.create({
        data: {
            email: "mentor1@imp.edu.vn",
            passwordHash: hash,
            firstName: "Nguyễn Văn",
            lastName: "An",
            role: "mentor",
            bio: "CEO Công ty ABC, 15 năm kinh nghiệm quản lý",
            mentorProfile: {
                create: {
                    company: "Công ty TNHH ABC",
                    jobTitle: "Giám đốc điều hành",
                    expertise: JSON.stringify(["Leadership", "Strategy", "Marketing"]),
                    experience: "15 năm kinh nghiệm điều hành doanh nghiệp, MBA Stanford",
                    maxMentees: 6,
                },
            },
        },
    });

    const mentor2 = await prisma.user.create({
        data: {
            email: "mentor2@imp.edu.vn",
            passwordHash: hash,
            firstName: "Trần Thị",
            lastName: "Bình",
            role: "mentor",
            bio: "Phó Giám đốc XYZ Corp, chuyên gia tài chính",
            mentorProfile: {
                create: {
                    company: "XYZ Corporation",
                    jobTitle: "Phó Giám đốc Tài chính",
                    expertise: JSON.stringify(["Finance", "Accounting", "Investment"]),
                    experience: "12 năm trong lĩnh vực tài chính, CFA charterholder",
                    maxMentees: 12,
                },
            },
        },
    });

    const mentor3 = await prisma.user.create({
        data: {
            email: "mentor3@imp.edu.vn",
            passwordHash: hash,
            firstName: "Lê Hoàng",
            lastName: "Cường",
            role: "mentor",
            bio: "CTO Tech Solutions, chuyên gia công nghệ",
            mentorProfile: {
                create: {
                    company: "Tech Solutions JSC",
                    jobTitle: "Giám đốc Công nghệ",
                    expertise: JSON.stringify(["Technology", "Programming", "AI/ML"]),
                    experience: "10 năm trong ngành công nghệ, ex-Google",
                    maxMentees: 6,
                },
            },
        },
    });

    // ─── Mentees ───────────────────────────────────────────────────
    const menteeData = [
        { email: "mentee1@imp.edu.vn", firstName: "Phạm Minh", lastName: "Dũng", studentId: "SV001", major: "Quản trị kinh doanh", year: 4 },
        { email: "mentee2@imp.edu.vn", firstName: "Hoàng Thu", lastName: "Hiền", studentId: "SV002", major: "Tài chính ngân hàng", year: 4 },
        { email: "mentee3@imp.edu.vn", firstName: "Vũ Đức", lastName: "Huy", studentId: "SV003", major: "Marketing", year: 4 },
        { email: "mentee4@imp.edu.vn", firstName: "Ngô Thị", lastName: "Lan", studentId: "SV004", major: "Kinh tế quốc tế", year: 3 },
        { email: "mentee5@imp.edu.vn", firstName: "Đặng Quốc", lastName: "Bảo", studentId: "SV005", major: "Quản trị kinh doanh", year: 1 },
        { email: "mentee6@imp.edu.vn", firstName: "Bùi Thanh", lastName: "Mai", studentId: "SV006", major: "Tài chính ngân hàng", year: 1 },
        { email: "mentee7@imp.edu.vn", firstName: "Lý Quang", lastName: "Minh", studentId: "SV007", major: "Marketing", year: 2 },
        { email: "mentee8@imp.edu.vn", firstName: "Trịnh Hải", lastName: "Yến", studentId: "SV008", major: "Kinh tế quốc tế", year: 2 },
        { email: "mentee9@imp.edu.vn", firstName: "Đinh Văn", lastName: "Tùng", studentId: "SV009", major: "Quản trị kinh doanh", year: 1 },
        { email: "mentee10@imp.edu.vn", firstName: "Mai Thị", lastName: "Ngọc", studentId: "SV010", major: "Marketing", year: 1 },
        { email: "mentee11@imp.edu.vn", firstName: "Cao Đình", lastName: "Khôi", studentId: "SV011", major: "Tài chính ngân hàng", year: 2 },
        { email: "mentee12@imp.edu.vn", firstName: "Phan Anh", lastName: "Thư", studentId: "SV012", major: "Kinh tế quốc tế", year: 2 },
    ];

    const mentees = [];
    for (const data of menteeData) {
        const mentee = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash: hash,
                firstName: data.firstName,
                lastName: data.lastName,
                role: "mentee",
                menteeProfile: {
                    create: {
                        studentId: data.studentId,
                        major: data.major,
                        year: data.year,
                        careerGoals: "Phát triển sự nghiệp trong lĩnh vực " + data.major,
                    },
                },
            },
        });
        mentees.push(mentee);
    }

    // ─── Program Cycle ─────────────────────────────────────────────
    const cycle = await prisma.programCycle.create({
        data: {
            name: "IMP Spring 2026",
            description: "Chương trình ISME Mentoring Program - Kỳ Xuân 2026",
            startDate: new Date("2026-02-01"),
            endDate: new Date("2026-05-01"),
            status: "active",
        },
    });

    // ─── Mentorships ───────────────────────────────────────────────
    // 1:1 mentorships (mentor1 with senior mentees)
    const mentorship1 = await prisma.mentorship.create({
        data: {
            mentorId: mentor1.id,
            type: "one_on_one",
            status: "active",
            programCycleId: cycle.id,
            startDate: new Date("2026-02-01"),
            endDate: new Date("2026-05-01"),
            maxMentees: 1,
            mentees: {
                create: { menteeId: mentees[0].id },
            },
        },
    });

    const mentorship2 = await prisma.mentorship.create({
        data: {
            mentorId: mentor3.id,
            type: "one_on_one",
            status: "active",
            programCycleId: cycle.id,
            startDate: new Date("2026-02-01"),
            endDate: new Date("2026-05-01"),
            maxMentees: 1,
            mentees: {
                create: { menteeId: mentees[1].id },
            },
        },
    });

    // Group mentorship (mentor2 with junior mentees)
    const mentorship3 = await prisma.mentorship.create({
        data: {
            mentorId: mentor2.id,
            type: "group",
            status: "active",
            programCycleId: cycle.id,
            startDate: new Date("2026-02-01"),
            endDate: new Date("2026-05-01"),
            maxMentees: 6,
            mentees: {
                create: [
                    { menteeId: mentees[4].id },
                    { menteeId: mentees[5].id },
                    { menteeId: mentees[6].id },
                    { menteeId: mentees[7].id },
                    { menteeId: mentees[8].id },
                    { menteeId: mentees[9].id },
                ],
            },
        },
    });

    // ─── Meetings ───────────────────────────────────────────────────
    const meetings = [
        {
            mentorshipId: mentorship1.id,
            creatorId: mentor1.id,
            title: "Buổi gặp mặt đầu tiên - Tìm hiểu mục tiêu",
            type: "offline",
            scheduledAt: new Date("2026-02-15T09:00:00"),
            duration: 60,
            location: "Phòng A302, ISME NEU",
            status: "completed",
        },
        {
            mentorshipId: mentorship1.id,
            creatorId: mentor1.id,
            title: "Review kế hoạch phát triển cá nhân",
            type: "online",
            scheduledAt: new Date("2026-02-22T14:00:00"),
            duration: 45,
            meetingUrl: "https://meet.google.com/abc-defg-hij",
            status: "completed",
        },
        {
            mentorshipId: mentorship1.id,
            creatorId: mentor1.id,
            title: "Chia sẻ kinh nghiệm quản lý dự án",
            type: "offline",
            scheduledAt: new Date("2026-03-01T10:00:00"),
            duration: 90,
            location: "Café Workspace, Cầu Giấy",
            status: "scheduled",
        },
        {
            mentorshipId: mentorship3.id,
            creatorId: mentor2.id,
            title: "Workshop: Kỹ năng tài chính cá nhân",
            meetingType: "workshop",
            type: "offline",
            scheduledAt: new Date("2026-02-20T08:30:00"),
            duration: 120,
            location: "Hội trường B, ISME NEU",
            status: "completed",
        },
        {
            mentorshipId: mentorship3.id,
            creatorId: mentor2.id,
            title: "Group check-in: Tiến độ tháng 2",
            meetingType: "checkin",
            type: "online",
            scheduledAt: new Date("2026-02-28T15:00:00"),
            duration: 60,
            meetingUrl: "https://zoom.us/j/123456789",
            status: "scheduled",
        },
    ];

    for (const m of meetings) {
        await prisma.meeting.create({ data: m });
    }

    // ─── Goals ──────────────────────────────────────────────────────
    await prisma.goal.createMany({
        data: [
            {
                mentorshipId: mentorship1.id,
                creatorId: mentees[0].id,
                title: "Cải thiện kỹ năng thuyết trình",
                description: "Hoàn thành 3 bài thuyết trình trước nhóm, nhận feedback và cải thiện",
                category: "skill",
                targetValue: 100,
                currentValue: 40,
                status: "in_progress",
                priority: "high",
                dueDate: new Date("2026-04-15"),
            },
            {
                mentorshipId: mentorship1.id,
                creatorId: mentees[0].id,
                title: "Xây dựng network chuyên nghiệp",
                description: "Kết nối với ít nhất 10 chuyên gia trong ngành",
                category: "network",
                targetValue: 10,
                currentValue: 3,
                unit: "người",
                status: "in_progress",
                priority: "medium",
                dueDate: new Date("2026-04-30"),
            },
            {
                mentorshipId: mentorship1.id,
                creatorId: mentees[0].id,
                title: "Hoàn thành dự án thực tế",
                description: "Thực hiện case study phân tích chiến lược kinh doanh",
                category: "project",
                targetValue: 100,
                currentValue: 20,
                status: "in_progress",
                priority: "high",
                dueDate: new Date("2026-04-20"),
            },
        ],
    });

    // ─── Feedback ──────────────────────────────────────────────────
    await prisma.feedback.createMany({
        data: [
            {
                mentorshipId: mentorship1.id,
                fromUserId: mentees[0].id,
                toUserId: mentor1.id,
                type: "session",
                rating: 5,
                communication: 5,
                engagement: 5,
                content: "Buổi mentoring rất bổ ích, mentor chia sẻ nhiều kinh nghiệm thực tế",
                strengths: "Kiến thức sâu rộng, dễ tiếp cận",
            },
            {
                mentorshipId: mentorship1.id,
                fromUserId: mentor1.id,
                toUserId: mentees[0].id,
                type: "session",
                rating: 4,
                communication: 4,
                engagement: 5,
                content: "Mentee rất chủ động và chuẩn bị kỹ trước buổi gặp",
                strengths: "Chủ động, ham học hỏi",
                improvements: "Cần tự tin hơn khi trình bày ý tưởng",
            },
        ],
    });

    // ─── Resources ─────────────────────────────────────────────────
    await prisma.resource.createMany({
        data: [
            {
                title: "Template CV chuyên nghiệp",
                description: "Mẫu CV chuẩn quốc tế, phù hợp cho sinh viên năm cuối",
                type: "document",
                category: "Templates",
                tags: JSON.stringify(["CV", "Career", "Template"]),
                visibility: "public",
                uploadedById: mentor1.id,
            },
            {
                title: "Kỹ năng phỏng vấn hiệu quả",
                description: "Tổng hợp các tips phỏng vấn từ các HR Manager",
                type: "link",
                linkUrl: "https://example.com/interview-tips",
                category: "Reading Materials",
                tags: JSON.stringify(["Interview", "Career", "Tips"]),
                visibility: "public",
                uploadedById: mentor1.id,
            },
            {
                title: "Tài liệu về phân tích tài chính",
                description: "Giáo trình phân tích tài chính doanh nghiệp",
                type: "document",
                category: "Reading Materials",
                tags: JSON.stringify(["Finance", "Analysis", "Academic"]),
                visibility: "public",
                uploadedById: mentor2.id,
            },
        ],
    });

    // ─── Availability ──────────────────────────────────────────────
    // Mentor1 available Mon-Fri 9AM-5PM
    for (let day = 1; day <= 5; day++) {
        await prisma.availability.create({
            data: {
                userId: mentor1.id,
                dayOfWeek: day,
                startTime: "09:00",
                endTime: "17:00",
                duration: 60,
            },
        });
    }

    // Mentor2 available Tue, Thu, Sat
    for (const day of [2, 4, 6]) {
        await prisma.availability.create({
            data: {
                userId: mentor2.id,
                dayOfWeek: day,
                startTime: "08:00",
                endTime: "12:00",
                duration: 90,
            },
        });
    }

    // ─── Portfolio ─────────────────────────────────────────────────
    await prisma.portfolio.create({
        data: {
            menteeId: mentees[0].id,
            personalityMbti: "ENFP",
            personalityDisc: "I/D",
            personalityHolland: "SEC",
            competencies: JSON.stringify({
                communication: 7.5,
                leadership: 6.0,
                problem_solving: 8.0,
                technical_skills: 7.0,
                teamwork: 8.5,
            }),
            shortTermGoals: JSON.stringify([
                "Cải thiện kỹ năng thuyết trình",
                "Xây dựng network chuyên nghiệp",
            ]),
            longTermGoals: JSON.stringify([
                "Trở thành Product Manager tại công ty công nghệ",
                "Khởi nghiệp trong lĩnh vực EdTech",
            ]),
            initialCompletedAt: new Date("2026-02-05"),
        },
    });

    // ─── Notifications ─────────────────────────────────────────────
    await prisma.notification.createMany({
        data: [
            {
                userId: mentees[0].id,
                title: "Buổi mentoring sắp diễn ra",
                message: "Bạn có buổi mentoring với mentor Nguyễn Văn An vào ngày 01/03/2026 lúc 10:00",
                type: "info",
                link: "/meetings",
            },
            {
                userId: mentees[0].id,
                title: "Feedback mới từ mentor",
                message: "Mentor Nguyễn Văn An đã gửi feedback cho buổi mentoring gần nhất",
                type: "success",
                link: "/feedback",
            },
            {
                userId: mentor1.id,
                title: "Mentee cập nhật tiến độ",
                message: "Phạm Minh Dũng đã cập nhật tiến độ mục tiêu 'Cải thiện kỹ năng thuyết trình'",
                type: "info",
                link: "/goals",
            },
        ],
    });

    console.log("Seeding complete!");
    console.log("─────────────────────────────────");
    console.log("Demo accounts (password: password123):");
    console.log("  Admin:  admin@imp.edu.vn");
    console.log("  Mentor: mentor1@imp.edu.vn");
    console.log("  Mentee: mentee1@imp.edu.vn");
    console.log("─────────────────────────────────");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
