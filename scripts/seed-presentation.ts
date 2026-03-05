import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Ensure process.env.DATABASE_URL points to the correct DB
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding data for Tulie Mentoring Presentation...");

    const hash = await bcrypt.hash("password123", 12);

    // 1. Ensure Program Cycle exists
    const cycle = await prisma.programCycle.upsert({
        where: { id: "tulie-cycle-1" },
        update: {
            name: "Tulie Mentoring Program 2026",
            status: "active",
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-06-30"),
        },
        create: {
            id: "tulie-cycle-1",
            name: "Tulie Mentoring Program 2026",
            description: "Chương trình thực tập và mentoring dành cho intern tại Tulie Agency",
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-06-30"),
            status: "active",
        },
    });

    // 2. Create Mentor
    const mentor = await prisma.user.upsert({
        where: { email: "mentor@tulie.vn" },
        update: {},
        create: {
            email: "mentor@tulie.vn",
            passwordHash: hash,
            firstName: "Tú",
            lastName: "Nguyễn",
            role: "mentor",
            bio: "Creative Director tại Tulie Agency, 8 năm kinh nghiệm trong ngành truyền thông quảng cáo.",
            mentorProfile: {
                create: {
                    company: "Tulie Agency",
                    jobTitle: "Creative Director",
                    expertise: JSON.stringify(["Branding", "Creative Copywriting", "Digital Strategy"]),
                    experience: "8 năm xây dựng chiến lược truyền thông cho FMCG & Fashion",
                    maxMentees: 5,
                },
            },
        },
    });

    // 3. Create Mentee
    const mentee = await prisma.user.upsert({
        where: { email: "mentee@tulie.vn" },
        update: {},
        create: {
            email: "mentee@tulie.vn",
            passwordHash: hash,
            firstName: "Hải",
            lastName: "Anh",
            role: "mentee",
            bio: "Sinh viên năm cuối ngành Marketing đam mê sáng tạo nội dung",
            menteeProfile: {
                create: {
                    studentId: "TL-M001",
                    major: "Marketing",
                    year: 4,
                    careerGoals: "Trở thành Content Strategist tại một Agency quốc tế",
                    skills: "Viết lách cơ bản, Thiết kế Canva",
                    strengths: "Chăm chỉ, nhanh nhạy với trend",
                    weaknesses: "Chưa biết lập kế hoạch bài bản",
                },
            },
            portfolios: {
                create: {
                    personalityMbti: "ENFP",
                    personalityDisc: "I",
                    shortTermGoals: JSON.stringify(["Tự lên được 1 chiến dịch Content trong 3 tháng"]),
                    longTermGoals: JSON.stringify(["Digital Marketing Manager"]),
                    competencies: JSON.stringify({
                        communication: 8,
                        leadership: 6,
                        problem_solving: 7,
                        technical_skills: 6,
                        teamwork: 8,
                    })
                }
            }
        },
    });

    // 4. Create Mentorship Relation
    const mentorship = await prisma.mentorship.create({
        data: {
            mentorId: mentor.id,
            type: "one_on_one",
            status: "active",
            programCycleId: cycle.id,
            maxMentees: 1,
            mentees: {
                create: { menteeId: mentee.id },
            },
        },
    });

    // Helper text formatter for BlockNote
    const createBlockDoc = (lines: string[]) => {
        return JSON.stringify(lines.map(l => {
            if (l.startsWith("## ")) return { type: "heading", props: { level: 2 }, content: l.replace("## ", "") };
            if (l.startsWith("### ")) return { type: "heading", props: { level: 3 }, content: l.replace("### ", "") };
            if (l.startsWith("- ")) return { type: "bulletListItem", content: l.replace("- ", "") };
            if (l.startsWith("> ")) return { type: "paragraph", content: l.replace("> ", "") }; // basic paragraph
            return { type: "paragraph", content: l };
        }));
    };

    // 5. Wiki Pages
    await prisma.wikiPage.createMany({
        data: [
            {
                title: "Tulie Brand Guidelines 2026",
                slug: "tulie-brand-guidelines-2026",
                category: "Marketing",
                visibility: "public",
                authorId: mentor.id,
                content: createBlockDoc([
                    "## Giới thiệu về Brand Guideline",
                    "Tulie Agency tự hào mang đến phong cách tối giản, sáng tạo và khác biệt. Để giữ được tính nhất quán trong tất cả các ấn phẩm truyền thông, Mentee / Intern hãy tham khảo tài liệu này trước.",
                    "## 1. Logo & Typography",
                    "- Logo chính thức chỉ sử dụng 2 màu: Đen (Black Panther) và Trắng.",
                    "- Font chữ chủ đạo: Inter hoặc Roboto (không dùng Comic Sans).",
                    "## 2. Voice & Tone",
                    "- Giọng văn trên Social: Tự tin, chuyên nghiệp, sắc bén nhưng không trịch thượng.",
                    "- Khuyến khích xưng hô 'Tulie' và 'bạn'.",
                    "## 3. Tông màu (Color Palette)",
                    "- Primary: #000000",
                    "- Secondary: #FFFFFF, #F1F5F9",
                ]),
            },
            {
                title: "Quy trình Onboarding cho Intern mới",
                slug: "onboarding-tulie-interns",
                category: "Tài liệu Công ty",
                visibility: "mentee_only",
                authorId: mentor.id,
                content: createBlockDoc([
                    "## Chào mừng tới Tulie Agency",
                    "Các bước cơ bản trong tuần đầu tiên của bạn:",
                    "- Ngày 1: Setup Workspace (Slack, Notion, Github/Figma). Tham gia Mentoring Kick-off.",
                    "- Ngày 2: Đọc hiểu 5 case study thành công của Tulie trong 2025.",
                    "- Ngày 3: Viết nháp 3 bài post Facebook cho dự án hiện tại (Review cùng Mentor).",
                    "## Quy định làm việc",
                    "- Báo cáo cuối ngày (Daily Report) trên Notion trước 18h.",
                    "- Tham gia đầy đủ các buổi họp check-in hàng tuần.",
                ]),
            },
            {
                title: "Cẩm nang Content Marketing từ Zero",
                slug: "content-marketing-from-zero",
                category: "Kiến thức",
                visibility: "public",
                authorId: mentor.id,
                content: createBlockDoc([
                    "## 1. Content Marketing là gì?",
                    "Không chỉ là viết bài, Content Marketing là tạo ra nội dung mang lại GIÁ TRỊ THỰC SỰ cho khách hàng.",
                    "### Các bước triển khai:",
                    "- B1: Phân tích Audience Insight (Họ thích gì? Nỗi đau của họ là gì?)",
                    "- B2: Lên Content Pillar (Các trụ cột nội dung chính)",
                    "- B3: Triển khai Content Angle (Góc độ sáng tạo của bài viết)",
                    "## 2. Công thức viết bài (Copywriting)",
                    "- AIDA: Attention -> Interest -> Desire -> Action",
                    "- PAS: Problem -> Agitation -> Solution",
                    "Thực hành: Hãy áp dụng AIDA cho sản phẩm 'Trà sữa giảm cân' vào Task tuần tới của bạn nhé!"
                ]),
            }
        ]
    });

    // 6. Meetings
    const meeting1 = await prisma.meeting.create({
        data: {
            mentorshipId: mentorship.id,
            creatorId: mentor.id,
            title: "Kick-off Mentoring: Định hướng lộ trình 3 tháng",
            type: "offline",
            meetingType: "session",
            status: "completed",
            scheduledAt: new Date("2026-03-01T10:00:00"),
            duration: 60,
            location: "Tulie Văn phòng số 1",
            minutes: {
                create: {
                    authorId: mentor.id,
                    agenda: "Giới thiệu nhau, bàn về mục tiêu",
                    keyPoints: "Mentee khá rụt rè nhưng có kỹ năng viết tốt. Thống nhất sẽ focus vào Kỹ năng Lập kế hoạch Content.",
                    actionItems: "- Mentee: Nộp bản nháp mục tiêu cá nhân trên hệ thống trước thứ 6.",
                    status: "approved"
                }
            }
        }
    });

    const meeting2 = await prisma.meeting.create({
        data: {
            mentorshipId: mentorship.id,
            creatorId: mentor.id,
            title: "Check-in tuần 2: Review bài kiểm tra Content",
            type: "online",
            meetingType: "checkin",
            status: "scheduled",
            scheduledAt: new Date("2026-03-15T09:00:00"),
            duration: 45,
            meetingUrl: "https://meet.google.com/xyz-123",
        }
    });

    // 7. Goals & Progress Notes
    const goal1 = await prisma.goal.create({
        data: {
            mentorshipId: mentorship.id,
            creatorId: mentee.id,
            title: "Lên Planner Content Hoàn chỉnh cho 1 Brand",
            description: "Thực hành việc phân bổ bài viết, target audience và timeline cho Brand XYZ",
            category: "skill",
            currentValue: 30,
            targetValue: 100,
            status: "in_progress",
            priority: "high",
            dueDate: new Date("2026-04-30"),
            progressNotes: {
                create: [
                    { note: "Đã hoàn thành phân tích đối thủ", value: 30 },
                ]
            }
        }
    });

    // 8. To-do Tasks 
    await prisma.todoItem.createMany({
        data: [
            {
                menteeId: mentee.id,
                title: "Đọc 'Tulie Brand Guidelines'",
                description: "Nắm vững màu sắc, quy chuẩn logo, voice & tone",
                status: "done",
                column: "done",
                priority: "high",
                dueDate: new Date("2026-03-05"),
                completedPercentage: 100,
            },
            {
                menteeId: mentee.id,
                title: "Phân tích 5 Case Study Fanpage đối thủ",
                description: "Tổng hợp xem họ xài Angle gì, Tương tác thế nào. Lưu link vào Notion.",
                status: "in_progress",
                column: "in_progress",
                priority: "high",
                dueDate: new Date("2026-03-08"),
                completedPercentage: 40,
            },
            {
                menteeId: mentee.id,
                title: "Draft 3 bài Post đầu tiên cho dự án Alpha",
                description: "Áp dụng công thức AIDA hoặc PAS",
                status: "todo",
                column: "todo",
                priority: "medium",
                dueDate: new Date("2026-03-12"),
                completedPercentage: 0,
            }
        ]
    });

    // 9. Feedback (Mentor & Mentee)
    await prisma.feedback.createMany({
        data: [
            {
                mentorshipId: mentorship.id,
                fromUserId: mentee.id,
                toUserId: mentor.id,
                type: "session",
                rating: 5,
                communication: 5,
                engagement: 5,
                content: "Anh Tú rất nhiệt tình và chu đáo! Mặc dù là sếp lớn nhưng hướng dẫn cực kỳ dễ hiểu. Nhờ buổi kick-off mà em đã hình dung rõ 3 tháng tới mình cần làm gì rồiiiii.",
                strengths: "Logic sắc bén, Cởi mở",
            },
            {
                mentorshipId: mentorship.id,
                fromUserId: mentor.id,
                toUserId: mentee.id,
                type: "session",
                rating: 4,
                communication: 4,
                engagement: 5,
                content: "Hải Anh có sự chuẩn bị kỹ, tiếp thu nhanh các khái niệm mới. Tuy nhiên đôi khi còn bị cuống khi bị hỏi vặn lại.",
                strengths: "Thái độ học hỏi tuyệt vời",
                improvements: "Cần tự tin hơn để bảo vệ luận điểm của bản thân",
            }
        ]
    });

    // 10. Reflections
    await prisma.sessionReflection.create({
        data: {
            meetingId: meeting1.id,
            menteeId: mentee.id,
            content: "Buổi gặp đầu tiên mình được anh Tú chỉ ra những lỗ hổng trong tư duy viết bài. Mình nhận ra không phải viết hay là đủ, mà còn phải viết đúng mục đích của Brand. Cần đọc lại nhiều hơn về mảng Strategy.",
            mentorConfirmed: true,
        }
    });

    // 11. Custom Whiteboard (Demo)
    await prisma.whiteboard.create({
        data: {
            title: "Sơ đồ ý tưởng Campaign X",
            description: "Brainstorming cho chiến dịch Tháng 5",
            status: "shared",
            creatorId: mentor.id,
        }
    });

    console.log("-----------------------------------------");
    console.log("✅ Seed completed successfully! Realistic Presentation data inserted.");
    console.log("Credentials:");
    console.log("Mentor : mentor@tulie.vn | pass: password123");
    console.log("Mentee : mentee@tulie.vn | pass: password123");
    console.log("-----------------------------------------");
}

main()
    .catch((e) => {
        console.error("Failed seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
