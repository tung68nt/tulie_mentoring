import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🚀 Starting SUPER-CHARGED seeding process...");

    // 1. Find Users
    const admin = await prisma.user.findFirst({ where: { role: "admin" } });
    const mentor = await prisma.user.findFirst({ where: { role: "mentor" } });
    const mentee = await prisma.user.findFirst({ where: { role: "mentee" } });

    if (!mentee || !mentor) {
        console.error("❌ No mentee or mentor found. Please run baseline seed first.");
        return;
    }

    // 2. Mentorship Link
    const mentorship = await prisma.mentorship.findFirst({
        where: { mentees: { some: { menteeId: mentee.id } } }
    });

    if (!mentorship) {
        console.log("⚠️ No active mentorship found. Creating one for seeding purposes...");
        if (mentor) {
            await prisma.mentorship.create({
                data: {
                    notes: "Chương trình định hướng và phát triển kỹ năng Marketing thực chiến dành cho sinh viên tiềm năng.",
                    status: "active",
                    mentorId: mentor.id,
                    programCycleId: (await prisma.programCycle.findFirst({ where: { status: "active" } }))?.id || "",
                    mentees: {
                        create: { menteeId: mentee.id }
                    }
                }
            });
        }
    }

    const activeMentorship = await prisma.mentorship.findFirst({
        where: { mentees: { some: { menteeId: mentee.id } } }
    });

    // 3. ENRICH PORTFOLIO & PROFILE
    console.log("📝 Enriching Mentee Portfolio & Profile...");
    await prisma.portfolio.upsert({
        where: { menteeId: mentee.id },
        update: {
            personalityMbti: "INFJ-A (The Advocate)",
            personalityDisc: "D/I (The Influencer/Dominant)",
            personalityHolland: "EAS (Enterprising, Artistic, Social)",
            competencies: "Kỹ năng lập kế hoạch chiến lược, Sản xuất nội dung thị giác (Visual Storytelling), Phân tích hành vi người dùng trên nền tảng số, Quản trị dự án Agile.",
            strengths: "Khả năng nhìn nhận vấn đề một cách hệ thống và đa chiều. Tư duy sáng tạo không giới hạn kết hợp với sự tỉ mỉ trong khâu thực thi. Luôn giữ được sự bình tĩnh và tập trung cao độ trong các tình huống áp lực cao hoặc khi đối mặt với những thay đổi bất ngờ của thị trường marketing.",
            weaknesses: "Đôi khi quá cầu toàn dẫn đến việc tiêu tốn nhiều thời gian cho những chi tiết nhỏ không thực sự ảnh hưởng đến kết quả cuối cùng. Cần cải thiện kỹ năng thuyết trình bằng tiếng Anh chuyên ngành để có thể pitching các dự án lớn hiệu quả hơn với đối tác quốc tế.",
            challenges: "Cân bằng giữa việc tiếp thu các kiến thức học thuật tại trường và việc thực chiến tại các doanh nghiệp. Xây dựng một lộ trình phát triển sự nghiệp bền vững trong bối cảnh ngành Marketing thay đổi liên tục bởi AI và công nghệ mới.",
            shortTermGoals: "Trong 6 tháng tới: Hoàn thành chứng chỉ Google Digital Marketing & E-commerce chuyên sâu. Đạt mức IELTS 7.5 với trọng tâm vào kỹ năng Speaking. Xây dựng được 5 Case Study Marketing hoàn chỉnh để nạp vào portfolio cá nhân. Thực tập tại một trong những Big 4 Agency tại Việt Nam.",
            longTermGoals: "Trong 5 năm tới: Trở thành Senior Brand Strategy Manager tại một tập đoàn đa quốc gia dẫn đầu về tiêu dùng nhanh (FMCG). Sáng lập một dự án cộng đồng hỗ trợ các bạn sinh viên vùng sâu vùng xa tiếp cận với giáo dục sáng tạo và kỹ năng số bản lĩnh.",
            personalNotes: "Tôi tin rằng: 'Kỹ năng có thể học, nhưng thái độ là thứ định hình vận mệnh'. Mỗi dự án là một cơ hội để học hỏi và mỗi thất bại là một bài học đắt giá trên hành trình trưởng thành. Sự kiên trì và lòng trắc ẩn là hai kim chỉ nam giúp tôi không bao giờ bỏ cuộc.",
            startupIdeas: "Phát triển một nền tảng SaaS ứng dụng AI để cá nhân hóa lộ trình học tập cho sinh viên Việt Nam dựa trên hồ sơ năng lực và sở thích thực tế. Mục tiêu là giúp các bạn trẻ tìm thấy đúng 'vibe' sự nghiệp của mình ngay từ khi còn ngồi trên ghế nhà trường."
        },
        create: {
            menteeId: mentee.id,
            personalityMbti: "INFJ-A",
            personalityDisc: "D/I",
            personalityHolland: "EAS"
        }
    });

    // 4. ADD 12+ GOALS
    if (activeMentorship) {
        console.log("🎯 Seeding massive list of Goals...");
        // Clear existing to avoid duplicates if re-running
        await prisma.goal.deleteMany({ where: { mentorshipId: activeMentorship.id } });

        const goalsData = [
            { title: "Hoàn thành Portfolio Website cá nhân", description: "Xây dựng website trên nền tảng Framer hoặc Webflow để trình diễn các dự án đã thực hiện.", category: "skill", priority: "high", targetValue: 100, currentValue: 65 },
            { title: "Chứng chỉ Google Analytics 4", description: "Vượt qua bài kiểm tra cuối khóa và nhận chứng chỉ phục vụ cho việc phân tích dữ liệu marketing.", category: "skill", priority: "medium", targetValue: 100, currentValue: 20 },
            { title: "Xây dựng kênh TikTok 10k Followers", description: "Thử nghiệm xây dựng nội dung về 'Marketing Vibes' để hiểu thuật toán và cách tạo viral content.", category: "skill", priority: "medium", targetValue: 10000, currentValue: 1200 },
            { title: "Đọc 12 cuốn sách về Kinh tế & Tâm lý", description: "Mỗi tháng 1 cuốn để mở rộng góc nhìn về hành vi khách hàng và các mô hình kinh doanh.", category: "personal", priority: "low", targetValue: 12, currentValue: 4 },
            { title: "Kết nối 10 Mentor qua LinkedIn", description: "Mời cafe hoặc nhắn tin xin lời khuyên từ những anh chị có kinh nghiệm để mở rộng networking.", category: "networking", priority: "high", targetValue: 10, currentValue: 3 },
            { title: "Internship tại Global Agency", description: "Nộp đơn và vượt qua các vòng phỏng vấn để trở thành thực tập sinh chiến lược tại Ogilvy hoặc Dentsu.", category: "career", priority: "high", targetValue: 1, currentValue: 0 },
            { title: "Cải thiện Writing Skill (English)", description: "Viết ít nhất 2 bài blog chuyên ngành bằng tiếng Anh mỗi tuần trên Medium.", category: "skill", priority: "medium", targetValue: 24, currentValue: 8 },
            { title: "Học SQL cơ bản", description: "Hiểu cách truy vấn dữ liệu từ database để tự thực hiện các báo cáo marketing khi cần.", category: "skill", priority: "low", targetValue: 100, currentValue: 45 },
            { title: "Luyện tập Thuyết trình Group", description: "Chủ động nhận vai trò leader và thuyết trình trong tất cả các bài thảo luận nhóm tại trường.", category: "soft_skill", priority: "medium", targetValue: 10, currentValue: 6 },
            { title: "Hoàn thành Portfolio Design cơ bản", description: "Học cách sử dụng Figma để thiết kế các mock-up cơ bản cho chiến dịch truyền thông.", category: "skill", priority: "medium", targetValue: 100, currentValue: 30 },
            { title: "Phân tích 5 Case Study quốc tế", description: "Viết báo cáo phân tích sâu về các chiến dịch marketing đạt giải Cannes Lions.", category: "skill", priority: "high", targetValue: 5, currentValue: 1 },
            { title: "Cải thiện chỉ số EQ & Lắng nghe", description: "Thực hành lắng nghe tích cực trong các buổi gặp gỡ và ghi chép lại những phản hồi của người xung quanh.", category: "soft_skill", priority: "low", targetValue: 100, currentValue: 50 },
            { title: "Tổ chức 1 Workshop nhỏ", description: "Cùng nhóm bạn tổ chức buổi chia sẻ kỹ năng Canva cho các bạn sinh viên năm nhất.", category: "leadership", priority: "high", targetValue: 1, currentValue: 0 },
            { title: "Ứng dụng AI vào quy trình Content Marketing", description: "Nghiên cứu và áp dụng ChatGPT/Claude để tối ưu hóa việc lên outline và viết nháp cho 10 bài blog.", category: "ai_marketing", priority: "high", targetValue: 10, currentValue: 2 },
            { title: "Thành thạo công cụ Design AI (Midjourney/DALL-E)", description: "Tạo ra bộ nhận diện hình ảnh cho 3 chiến dịch truyền thông hoàn toàn bằng Prompt Engineering.", category: "ai_marketing", priority: "medium", targetValue: 3, currentValue: 1 },
            { title: "Nghiên cứu AI Automation trong Email Marketing", description: "Tìm hiểu các công cụ như Jasper hoặc Copy.ai để tự động hóa viết tiêu đề và email nuôi dưỡng khách hàng.", category: "ai_marketing", priority: "medium", targetValue: 100, currentValue: 15 },
            { title: "Phân tích Big Data bằng AI Tool", description: "Sử dụng các tính năng Advanced Data Analysis của ChatGPT để phân tích tệp khách hàng 1000 người.", category: "ai_marketing", priority: "high", targetValue: 1, currentValue: 0 }
        ];

        for (const g of goalsData) {
            await prisma.goal.create({
                data: {
                    ...g,
                    mentorshipId: activeMentorship.id,
                    creatorId: mentee.id,
                    dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
                }
            });
        }
    }

    // 5. ADD RICH DIARY ENTRIES
    console.log("📔 Seeding detailed Diary entries...");
    const diaryEntries = [
        {
            date: new Date(),
            mood: "Inspired",
            content: "Một ngày thực sự ý nghĩa. Tôi đã dành cả buổi chiều để thảo luận với Mentor về 'Brand Purpose'. Tôi hiểu ra rằng một thương hiệu mạnh không chỉ nằm ở sản phẩm tốt, mà còn phải có một tâm hồn và sứ mệnh rõ ràng để kết nối với khách hàng. Cảm thấy tràn đầy năng lượng để viết lại nội dung cho dự án Portfolio sắp tới."
        },
        {
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
            mood: "Productive",
            content: "Hôm nay tôi đã vượt qua được sự trì hoãn và hoàn thành 3 chương của khóa học GA4. Việc hiểu cách tracking hành trình người dùng trên web giúp tôi có cái nhìn khoa học hơn về marketing. Tuy nhiên, phần phân tích đa kênh vẫn còn hơi rối, cần hỏi thêm Mentor vào buổi check-in tuần tới. Đã hoàn thành 500 tập Squat - cảm giác thể chất và tinh thần đều rất sảng khoái!"
        },
        {
            date: new Date(Date.now() - 48 * 60 * 60 * 1000),
            mood: "Challenged",
            content: "Gặp một chút áp lực khi bài tập nhóm ở trường bị trễ deadline do các thành viên chưa phối hợp tốt. Đây là cơ hội để tôi thực hành kỹ năng quản trị xung đột. Tôi đã chủ động mời mọi người ngồi lại để phân chia lại khối lượng công việc rõ ràng hơn. Tuy mệt nhưng tôi thấy mừng vì mình đã không né tránh vấn đề."
        },
        {
            date: new Date(Date.now() - 72 * 60 * 60 * 1000),
            mood: "Calm",
            content: "Dành trọn vẹn buổi sáng để thiền và đọc sách 'Hạt giống tâm hồn'. Trong cái nhiễu nhương của ngành marketing vốn luôn ồn ào, những giây phút tĩnh lặng này giúp tôi tái định vị lại những giá trị cốt lõi mà bản thân muốn hướng tới. Tôi muốn trở thành một Marketer tử tế trước khi trở thành một Marketer giỏi."
        }
    ];

    for (const d of diaryEntries) {
        await prisma.dailyDiary.upsert({
            where: { userId_date: { userId: mentee.id, date: d.date } },
            update: d,
            create: { ...d, userId: mentee.id }
        });
    }

    // 6. ADD WIKI, WHITEBOARD, SLIDES
    if (activeMentorship) {
        console.log("📄 Seeding Wiki pages, Whiteboards and Slides for Mentorship...");

        // Wiki Pages
        await prisma.wikiPage.createMany({
            data: [
                {
                    title: "Bộ quy tắc ứng xử trong Mentoring",
                    slug: `quy-tac-ung-xu-${Math.random().toString(36).substring(7)}`,
                    content: "Hợp đồng cam kết giữa Mentor và Mentee. Bao gồm: Đúng giờ, Tuyệt đối bảo mật thông tin, Phản hồi tích cực, và Tinh thần chủ động.",
                    visibility: "private",
                    authorId: mentor.id!,
                    mentorshipId: activeMentorship.id
                },
                {
                    title: "Tài liệu Phân tích Thị trường 2024",
                    slug: `market-analysis-${Math.random().toString(36).substring(7)}`,
                    content: "Tổng hợp các báo cáo về xu hướng tiêu dùng của thế hệ Z tại Việt Nam. Tập trung vào mảng thương mại điện tử và KOL Marketing.",
                    visibility: "private",
                    authorId: mentee.id!,
                    mentorshipId: activeMentorship.id
                },
                {
                    title: "Draft Chiến dịch Marketing 'Vibe Khác Biệt'",
                    slug: `draft-campaign-${Math.random().toString(36).substring(7)}`,
                    content: "Bản nháp ý tưởng cho chiến dịch truyền thông của nhãn hàng ABC. Target khách hàng là sinh viên và người trẻ yêu công nghệ.",
                    visibility: "private",
                    authorId: mentee.id!,
                    mentorshipId: activeMentorship.id
                }
            ]
        });

        // Whiteboards
        const whiteboard = await prisma.whiteboard.create({
            data: {
                title: "Brainstorming: Campaign Concept",
                description: "Sơ đồ tư duy cho việc định vị thương hiệu mới.",
                creatorId: mentor.id!,
                mentorshipId: activeMentorship.id,
                artboards: {
                    create: { name: "Moodboard", order: 0 }
                }
            }
        });

        // Slides
        await prisma.slide.create({
            data: {
                title: "Báo cáo Tiến độ Tháng 1",
                description: "Slide trình bày các công việc đã làm và kế hoạch cho tháng tiếp theo.",
                content: "# Month 1 Review\n---\n## Key Wins\n- Finished GA4 Certification\n- Drafted Market Analysis\n---\n## Challenges\n- Time management between school & intern",
                creatorId: mentee.id,
                mentorshipId: activeMentorship.id,
                status: "private",
                theme: "modern"
            }
        });
    }

    console.log("✅ FINISHED! All sections are now full of premium, detailed content.");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
