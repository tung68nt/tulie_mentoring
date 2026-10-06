/**
 * BỘ TRẮC NGHIỆM ĐÁNH GIÁ PHONG CÁCH HÀNH VI DISC CHUẨN KHOA HỌC
 * Dựa trên lý thuyết của William Moulton Marston (Harvard) và phương pháp đánh giá
 * hành vi tổ chức quốc tế (Wiley Everything DiSC / Thomas International).
 *
 * Đo lường trên 2 trục hành vi cốt lõi:
 * 1. Trục Tốc độ / Xu hướng hành động (Pace): Active / Fast-paced (D, I) vs. Thoughtful / Moderate-paced (S, C)
 * 2. Trục Trọng tâm / Định hướng (Focus): Task-oriented / Skeptical (D, C) vs. People-oriented / Accepting (I, S)
 */

export interface DiscQuestion {
    id: number;
    category: "natural" | "work";
    question: string;
    options: {
        text: string;
        trait: "D" | "I" | "S" | "C";
        desc: string;
    }[];
}

export interface DiscTraitDetail {
    code: "D" | "I" | "S" | "C";
    name: string;
    title: string;
    archetype: string;
    description: string;
    coreDrive: string;
    greatestFear: string;
    strengths: string;
    blindSpots: string;
    teamRole: string;
    growthTips: string;
    mentorCommunicationTips: string;
    badgeColor: string;
    radarColor: string;
}

export const DISC_TRAITS: Record<"D" | "I" | "S" | "C", DiscTraitDetail> = {
    D: {
        code: "D",
        name: "Dominance (Thống trị & Quyết đoán)",
        title: "Phong cách Quyết đoán / Tiên phong",
        archetype: "Người Chèo Lái (Driver / Commander)",
        description: "Tập trung vào kết quả, tự tin, chủ động đối mặt với thử thách, thích tốc độ và phong cách làm việc dứt khoát.",
        coreDrive: "Chinh phục thử thách, đạt kết quả vượt trội, quyền tự chủ cao.",
        greatestFear: "Bị mất kiểm soát, bị người khác lợi dụng hoặc công việc bị chậm trễ.",
        strengths: "Ra quyết định nhanh, tư duy hướng mục tiêu, dám chấp nhận rủi ro, thúc đẩy cả nhóm tiến lên.",
        blindSpots: "Có thể thiếu kiên nhẫn với người làm việc chậm, dễ áp đặt ý kiến cá nhân.",
        teamRole: "Đầu tàu định hướng, người khai phá và giải quyết các bài toán hóc búa.",
        growthTips: "Học cách lắng nghe trọn vẹn ý kiến của người khác và ghi nhận đóng góp của đồng đội trước khi ra quyết định.",
        mentorCommunicationTips: "Giao tiếp ngắn gọn, đi thẳng vào kết quả, cho họ quyền tự chủ và thách thức năng lực của họ.",
        badgeColor: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50",
        radarColor: "#ef4444",
    },
    I: {
        code: "I",
        name: "Influence (Ảnh hưởng & Kết nối)",
        title: "Phong cách Truyền cảm hứng / Xã hội",
        archetype: "Người Thuyết Phục (Influencer / Catalyst)",
        description: "Nhiệt huyết, lạc quan, hướng ngoại, yêu thích kết nối con người và tạo bầu không khí tích cực đầy năng lượng.",
        coreDrive: "Sự công nhận xã hội, cơ hội thể hiện ý tưởng sáng tạo, truyền cảm hứng cho người khác.",
        greatestFear: "Bị cô lập, bị từ chối hoặc phải làm việc trong môi trường khô khan, gò bó.",
        strengths: "Kỹ năng thuyết trình lôi cuốn, tạo động lực nhóm, tư duy sáng tạo ngoài khuôn mẫu, thích ứng nhanh.",
        blindSpots: "Dễ phân tán sự chú ý, có thể hứa nhiều hơn khả năng thực thi chi tiết, quản lý thời gian chưa tối ưu.",
        teamRole: "Người truyền lửa, đại sứ kết nối cộng đồng, cầu nối giải tỏa căng thẳng trong nhóm.",
        growthTips: "Rèn luyện tính kỷ luật, theo dõi tiến độ công việc bằng bảng biểu và cam kết thực hiện đến cùng.",
        mentorCommunicationTips: "Tạo không gian cho họ chia sẻ ý tưởng, khen ngợi công khai khi họ làm tốt và giúp họ bám sát checklist cam kết.",
        badgeColor: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50",
        radarColor: "#f59e0b",
    },
    S: {
        code: "S",
        name: "Steadiness (Kiên định & Hỗ trợ)",
        title: "Phong cách Hợp tác / Kiên trì",
        archetype: "Hậu Phương Đáng Tin Cậy (Supporter / Anchor)",
        description: "Điềm đạm, chu đáo, đáng tin cậy, lắng nghe sâu sắc và coi trọng sự hòa hợp, gắn kết bền vững trong đội ngũ.",
        coreDrive: "Sự an toàn, tính ổn định, xây dựng lòng tin và được giúp đỡ người khác.",
        greatestFear: "Sự bất hòa, xung đột đối đầu hoặc những thay đổi quá đột ngột thiếu chuẩn bị.",
        strengths: "Lắng nghe tuyệt vời, làm việc kiên trì bền bỉ, tính đồng đội cao, trung thành và bảo mật tốt.",
        blindSpots: "Ngại va chạm, do dự khi phải từ chối (bệnh cả nể), có thể giấu đi sự bất mãn thay vì nói ra.",
        teamRole: "Chất keo gắn kết đội ngũ, người thực thi trung thành và hỗ trợ các thành viên khác hoàn thành nhiệm vụ.",
        growthTips: "Học cách nói 'không' khi cần thiết, chủ động bày tỏ quan điểm thẳng thắn và đón nhận thay đổi như cơ hội học hỏi.",
        mentorCommunicationTips: "Thể hiện sự chân thành, quan tâm đến cảm xúc của họ, cho họ thời gian thích nghi và không thúc ép đột ngột.",
        badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50",
        radarColor: "#10b981",
    },
    C: {
        code: "C",
        name: "Conscientiousness (Tận tâm & Chuẩn xác)",
        title: "Phong cách Phân tích / Chuẩn mực",
        archetype: "Nhà Phân Tích Khách Quan (Analyst / Specialist)",
        description: "Tư duy logic, tôn trọng dữ liệu và chất lượng, làm việc bài bản, ngăn nắp và luôn hướng tới sự chuẩn mực cao nhất.",
        coreDrive: "Sự hoàn hảo, chuyên môn sâu sắc, tính chính xác và làm đúng quy trình ngay từ đầu.",
        greatestFear: "Bị phê bình về chuyên môn, bị mắc sai sót hoặc làm việc với thông tin mơ hồ, cảm tính.",
        strengths: "Phân tích có hệ thống, chú ý tiểu tiết, phát hiện rủi ro từ sớm, tư duy phản biện sắc sảo.",
        blindSpots: "Có thể quá cầu toàn dẫn đến chậm tiến độ, khó chấp nhận sai số, đôi khi có vẻ lạnh lùng.",
        teamRole: "Kiểm soát chất lượng (QA), thiết kế kiến trúc hệ thống và xây dựng quy chuẩn vận hành.",
        growthTips: "Thực hành nguyên tắc 'Hoàn thành tốt hơn Hoàn hảo', chấp nhận thử nghiệm và sai số trong mức cho phép.",
        mentorCommunicationTips: "Cung cấp số liệu, tài liệu bài bản, giải thích lý do logic đằng sau mỗi yêu cầu và tôn trọng không gian tập trung của họ.",
        badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50",
        radarColor: "#3b82f6",
    }
};

/**
 * 16 CÂU HỎI TRẮC NGHIỆM CHUẨN HÓA KHOA HỌC
 * - 8 câu Natural: Đo lường phong cách bản năng tự nhiên
 * - 8 câu Applied: Đo lường phản ứng trong nhóm Mentoring và dưới áp lực công việc
 */
export const DISC_QUESTIONS: DiscQuestion[] = [
    // --- PHẦN 1: BẢN NĂNG TÍNH CÁCH & TƯƠNG TÁC TỰ NHIÊN (1 - 8) ---
    {
        id: 1,
        category: "natural",
        question: "Khi bắt đầu một dự án hoặc mục tiêu mới, điều đầu tiên bạn thường tập trung vào là gì?",
        options: [
            { text: "Xác định mục tiêu lớn và vạch chiến lược hành động dứt khoát.", trait: "D", desc: "Mục tiêu & Tốc độ" },
            { text: "Khuấy động tinh thần nhóm, tạo ý tưởng mới mẻ và truyền cảm hứng.", trait: "I", desc: "Cảm hứng & Kết nối" },
            { text: "Lắng nghe mọi người để đảm bảo mọi thành viên đều đồng thuận và sẵn sàng.", trait: "S", desc: "Hòa thuận & Ổn định" },
            { text: "Nghiên cứu kỹ yêu cầu, lập bảng tiêu chuẩn kỹ thuật và quy trình chi tiết.", trait: "C", desc: "Quy chuẩn & Chi tiết" }
        ]
    },
    {
        id: 2,
        category: "natural",
        question: "Phong cách giao tiếp thường thấy nhất của bạn khi làm việc với người khác là:",
        options: [
            { text: "Ngắn gọn, đi thẳng vào vấn đề, tập trung vào kết quả cụ thể.", trait: "D", desc: "Trực diện" },
            { text: "Cởi mở, giàu năng lượng, diễn đạt sinh động và thích kể chuyện.", trait: "I", desc: "Nhiệt huyết" },
            { text: "Nhẹ nhàng, kiên nhẫn lắng nghe, tạo cảm giác an tâm và tin cậy.", trait: "S", desc: "Thấu cảm" },
            { text: "Rõ ràng, dùng từ ngữ chuẩn xác, có dẫn chứng số liệu hoặc căn cứ thực tế.", trait: "C", desc: "Khách quan" }
        ]
    },
    {
        id: 3,
        category: "natural",
        question: "Khi xảy ra bất đồng ý kiến hoặc xung đột trong nhóm, phản xạ tự nhiên của bạn là:",
        options: [
            { text: "Thẳng thắn đối thoại dựa trên lý lẽ để đi đến kết luận dứt điểm.", trait: "D", desc: "Đối thoại trực diện" },
            { text: "Tìm cách làm dịu không khí bằng sự hài hước, kéo mọi người về tiếng nói chung.", trait: "I", desc: "Hòa giải thân thiện" },
            { text: "Nhẫn nại lắng nghe các bên, nhường nhịn để giữ gìn mối quan hệ bền vững.", trait: "S", desc: "Giữ hòa khí" },
            { text: "Xem lại quy định ban đầu, phân tích dữ liệu thực tế để xác định đúng - sai.", trait: "C", desc: "Căn cứ dữ liệu" }
        ]
    },
    {
        id: 4,
        category: "natural",
        question: "Điều gì mang lại cho bạn nguồn động lực và sự hào hứng lớn nhất trong học tập và công việc?",
        options: [
            { text: "Chinh phục bài toán khó, chiến thắng thử thách và tự chủ ra quyết định.", trait: "D", desc: "Chinh phục" },
            { text: "Được mọi người ghi nhận, có tầm ảnh hưởng tích cực và mở rộng quan hệ.", trait: "I", desc: "Sự công nhận" },
            { text: "Môi trường gắn kết, đồng nghiệp tin cậy và sự tiến bộ ổn định lâu dài.", trait: "S", desc: "Sự an tâm" },
            { text: "Tạo ra sản phẩm chuẩn mực, hoàn thiện về mặt chuyên môn và không có sai sót.", trait: "C", desc: "Sự hoàn hảo" }
        ]
    },
    {
        id: 5,
        category: "natural",
        question: "Khi phải đối mặt với một sự thay đổi đột ngột ngoài kế hoạch, bạn có xu hướng:",
        options: [
            { text: "Nhanh chóng chấp nhận và chuyển hướng hành động ngay để nắm bắt thời cơ.", trait: "D", desc: "Hành động tức thì" },
            { text: "Hào hứng đón nhận như một trải nghiệm mới và lan tỏa tinh thần lạc quan.", trait: "I", desc: "Lạc quan thích nghi" },
            { text: "Cần thời gian quan sát, thích nghi từ từ để đảm bảo không xáo trộn nhịp độ.", trait: "S", desc: "Thận trọng ổn định" },
            { text: "Đánh giá lại rủi ro, phân tích tác động và điều chỉnh kế hoạch có cơ sở.", trait: "C", desc: "Phân tích rủi ro" }
        ]
    },
    {
        id: 6,
        category: "natural",
        question: "Khi tiếp nhận một nhiệm vụ mới mẻ chưa từng làm bao giờ, cách bạn tiếp cận là:",
        options: [
            { text: "Bắt tay vào làm thử ngay, vừa làm vừa rút kinh nghiệm trên đường đi.", trait: "D", desc: "Thực chiến ngay" },
            { text: "Rủ thêm bạn bè cùng trao đổi, tìm kiếm ý tưởng sáng tạo và tạo cảm hứng làm việc.", trait: "I", desc: "Brainstorming nhóm" },
            { text: "Hỏi mentor hoặc người có kinh nghiệm để được chỉ dẫn từng bước cụ thể.", trait: "S", desc: "Học từ chuyên gia" },
            { text: "Đọc tài liệu, nghiên cứu kỹ nguyên lý và cấu trúc trước khi viết dòng mã đầu tiên.", trait: "C", desc: "Nghiên cứu sâu" }
        ]
    },
    {
        id: 7,
        category: "natural",
        question: "Điều gì dễ khiến bạn cảm thấy khó chịu hoặc mất kiên nhẫn nhất?",
        options: [
            { text: "Sự do dự, chần chừ, bàn lùi và tiến độ bị chậm trễ không rõ lý do.", trait: "D", desc: "Trì trệ" },
            { text: "Sự gò bó, cứng nhắc, làm việc cô lập thiếu sự tương tác và niềm vui.", trait: "I", desc: "Tẻ nhạt & Gò bó" },
            { text: "Sự bất hòa, môi trường cạnh tranh độc hại và thiếu sự tôn trọng lẫn nhau.", trait: "S", desc: "Bất hòa" },
            { text: "Sự cẩu thả, làm việc thiếu logic, báo cáo hời hợt không có số liệu.", trait: "C", desc: "Thiếu chính xác" }
        ]
    },
    {
        id: 8,
        category: "natural",
        question: "Cách bạn sắp xếp thời gian và quản lý công việc hàng ngày thường là:",
        options: [
            { text: "Ưu tiên việc quan trọng nhất đem lại kết quả lớn, xử lý với tốc độ nhanh.", trait: "D", desc: "Tập trung kết quả" },
            { text: "Linh hoạt, giải quyết công việc theo cảm hứng và dòng chảy cơ hội trong ngày.", trait: "I", desc: "Linh hoạt sáng tạo" },
            { text: "Tuân theo nhịp điệu quen thuộc, bền bỉ hoàn thành danh sách việc từng bước một.", trait: "S", desc: "Bền bỉ tuần tự" },
            { text: "Lập lịch trình chi tiết, ghi chú rõ ràng các mốc thời gian và tiêu chí hoàn thành.", trait: "C", desc: "Kỷ luật bài bản" }
        ]
    },

    // --- PHẦN 2: HÀNH VI TRONG NHÓM MENTORING & DƯỚI ÁP LỰC (9 - 16) ---
    {
        id: 9,
        category: "work",
        question: "Trong một nhóm học tập hoặc làm việc, bạn cảm thấy mình phát huy tốt nhất ở vai trò nào?",
        options: [
            { text: "Người chèo lái: Quyết định phương hướng, phân công nhiệm vụ và thúc đẩy cả nhóm.", trait: "D", desc: "Thống lĩnh" },
            { text: "Người truyền lửa: Gợi mở ý tưởng, kết nối thành viên và đại diện nhóm trình bày.", trait: "I", desc: "Đại diện & Kết nối" },
            { text: "Hậu phương vững vàng: Hỗ trợ các bạn gặp khó khăn, giữ cho nội bộ luôn gắn kết.", trait: "S", desc: "Chăm sóc đồng đội" },
            { text: "Chuyên gia phân tích: Đảm bảo chất lượng kỹ thuật, kiến trúc chuẩn và rà soát lỗi.", trait: "C", desc: "Đảm bảo chất lượng" }
        ]
    },
    {
        id: 10,
        category: "work",
        question: "Khi đối mặt với áp lực thời hạn (deadline) rất gấp, biểu hiện rõ nhất của bạn là:",
        options: [
            { text: "Càng trở nên quyết liệt, sẵn sàng cắt giảm việc phụ để về đích đúng hạn.", trait: "D", desc: "Tập trung cao độ" },
            { text: "Động viên tinh thần anh em, tạo sự lạc quan để cùng nhau thức đêm hoàn thành.", trait: "I", desc: "Cổ vũ tinh thần" },
            { text: "Bình tĩnh, không hoảng loạn, kiên trì xử lý từng phần việc theo khả năng tốt nhất.", trait: "S", desc: "Điềm tĩnh kiên trì" },
            { text: "Tập trung kiểm soát lỗi nghiêm trọng, đảm bảo dù vội cũng không giao sản phẩm hỏng.", trait: "C", desc: "Giữ vững chuẩn mực" }
        ]
    },
    {
        id: 11,
        category: "work",
        question: "Khi nhận được những lời phê bình hoặc góp ý thẳng thắn từ Mentor, bạn sẽ:",
        options: [
            { text: "Lắng nghe điểm mấu chốt và bắt tay vào sửa đổi ngay để chứng minh năng lực.", trait: "D", desc: "Hành động chứng minh" },
            { text: "Tiếp thu cởi mở, trao đổi lại góc nhìn của mình và mong nhận được lời động viên.", trait: "I", desc: "Trao đổi cởi mở" },
            { text: "Cảm ơn chân thành, suy ngẫm sâu sắc và muốn Mentor đồng hành chỉ bảo thêm.", trait: "S", desc: "Tiếp thu chân thành" },
            { text: "Yêu cầu dẫn chứng cụ thể, phân tích nguyên nhân gốc rễ để điều chỉnh chuẩn xác.", trait: "C", desc: "Phân tích nguyên nhân" }
        ]
    },
    {
        id: 12,
        category: "work",
        question: "Khi phải phối hợp với một thành viên có tính cách hoặc thói quen hoàn toàn trái ngược mình:",
        options: [
            { text: "Thẳng thắn đặt ra mục tiêu chung và quy định ranh giới công việc rõ ràng.", trait: "D", desc: "Rõ ràng mục tiêu" },
            { text: "Chủ động tìm kiếm sở thích chung, tạo mối quan hệ thân thiện ngoài giờ làm.", trait: "I", desc: "Tìm điểm chung" },
            { text: "Kiên nhẫn thích nghi, tôn trọng phong cách của bạn ấy để tránh gây mâu thuẫn.", trait: "S", desc: "Thấu cảm tôn trọng" },
            { text: "Thiết lập quy trình làm việc và tiêu chí bàn giao cụ thể để đôi bên cùng tuân theo.", trait: "C", desc: "Quy chuẩn bàn giao" }
        ]
    },
    {
        id: 13,
        category: "work",
        question: "Khi mentor giao một bài toán mở không có hướng dẫn chi tiết, bạn thường:",
        options: [
            { text: "Tự vạch ra hướng giải quyết theo cách của mình và chủ động đề xuất lộ trình.", trait: "D", desc: "Tự chủ đề xuất" },
            { text: "Tìm kiếm các ví dụ sáng tạo thú vị, rủ bạn bè cùng thử nghiệm các ý tưởng mới.", trait: "I", desc: "Thử nghiệm sáng tạo" },
            { text: "Hỏi rõ hơn về phạm vi mong đợi hoặc chờ xem các bạn khác tiếp cận như thế nào.", trait: "S", desc: "Thăm dò an toàn" },
            { text: "Tìm đọc tài liệu chính thống, xây dựng các kịch bản thử nghiệm bài bản.", trait: "C", desc: "Khảo sát tài liệu" }
        ]
    },
    {
        id: 14,
        category: "work",
        question: "Khi thấy một đồng đội trong nhóm làm việc chậm chạp hoặc gặp khó khăn, bạn sẽ:",
        options: [
            { text: "Góp ý thẳng thắn hoặc nhận luôn phần khó để đảm bảo cả nhóm không bị trễ.", trait: "D", desc: "Quyết liệt tiến độ" },
            { text: "Đến trò chuyện, động viên và khích lệ để bạn ấy không bị mất tinh thần.", trait: "I", desc: "Khích lệ tinh thần" },
            { text: "Chủ động ngồi cùng bạn ấy, kiên nhẫn hướng dẫn từng bước cho đến khi hiểu.", trait: "S", desc: "Cầm tay chỉ việc" },
            { text: "Chỉ ra chính xác chỗ bạn ấy bị sai và gửi tài liệu hoặc công cụ chuẩn để sửa.", trait: "C", desc: "Cung cấp giải pháp chuẩn" }
        ]
    },
    {
        id: 15,
        category: "work",
        question: "Thước đo thành công lớn nhất sau mỗi buổi họp hoặc buổi học mentoring đối với bạn là:",
        options: [
            { text: "Nắm được việc cần làm tiếp theo và có giải pháp rõ ràng để bứt phá kết quả.", trait: "D", desc: "Hành động & Kết quả" },
            { text: "Nhận được nhiều năng lượng tích cực, ý tưởng mới và kết nối gắn bó với mọi người.", trait: "I", desc: "Năng lượng & Kết nối" },
            { text: "Cảm giác được lắng nghe, hiểu rõ vị trí của mình và nhóm tiến bộ vững chắc.", trait: "S", desc: "Gắn kết & Vững tâm" },
            { text: "Học được kiến thức sâu sắc, hiểu cặn kẽ bản chất vấn đề và không còn mơ hồ.", trait: "C", desc: "Hiểu sâu bản chất" }
        ]
    },
    {
        id: 16,
        category: "work",
        question: "Kỳ vọng lớn nhất của bạn ở người Mentor đồng hành là:",
        options: [
            { text: "Thách thức bạn bằng các bài toán lớn, trao quyền chủ động và góp ý trực diện.", trait: "D", desc: "Thách thức bứt phá" },
            { text: "Truyền cảm hứng nghề nghiệp, mở rộng góc nhìn và tạo môi trường học tập vui vẻ.", trait: "I", desc: "Cảm hứng & Mở rộng" },
            { text: "Luôn kiên nhẫn, gần gũi, thấu hiểu hoàn cảnh và không tạo áp lực quá tải.", trait: "S", desc: "Đồng hành thấu hiểu" },
            { text: "Đưa ra lộ trình đào tạo bài bản, chuẩn chỉ về kỹ thuật và định hướng logic.", trait: "C", desc: "Chuyên môn bài bản" }
        ]
    }
];

export interface DiscCalculationResult {
    primary: "D" | "I" | "S" | "C";
    secondary: "D" | "I" | "S" | "C" | null;
    blendName: string;
    blendDescription: string;
    scores: {
        D: number;
        I: number;
        S: number;
        C: number;
    };
    rawCounts: {
        D: number;
        I: number;
        S: number;
        C: number;
    };
    dimensions: {
        pace: "fast" | "moderate" | "balanced";
        paceLabel: string;
        focus: "task" | "people" | "balanced";
        focusLabel: string;
    };
    traitInfo: DiscTraitDetail;
}

/**
 * Danh xưng các phong cách kết hợp (DiSC Blend Styles) chuẩn quốc tế
 */
const BLEND_STYLES: Record<string, { name: string; desc: string }> = {
    "D": { name: "Người Chỉ Huy Quyết Liệt", desc: "Tập trung cao độ vào kết quả, hành động tốc độ và luôn hướng tới việc dẫn đầu." },
    "DI": { name: "Người Tiên Phong Truyền Lửa", desc: "Kết hợp giữa sự quyết đoán và sức hút lôi cuốn; vừa dám nghĩ dám làm vừa biết cách lôi kéo đồng đội." },
    "ID": { name: "Người Khởi Xướng Đầy Nhiệt Huyết", desc: "Nhiều ý tưởng đột phá, truyền cảm hứng mạnh mẽ và dám hành động để biến tầm nhìn thành hiện thực." },
    "DC": { name: "Nhà Kiến Tạo Chiến Lược", desc: "Sắc bén và thực tế; kết hợp giữa mục tiêu lớn và tư duy phân tích rủi ro chặt chẽ." },
    "CD": { name: "Nhà Phân Tích Thách Thức", desc: "Coi trọng dữ liệu logic nhưng không ngại tranh luận thẳng thắn để đạt tiêu chuẩn cao nhất." },
    "I": { name: "Người Truyền Cảm Hứng Thuần Khiết", desc: "Lạc quan, nhiệt huyết, giỏi giao tiếp và luôn là tâm điểm kết nối mọi người." },
    "IS": { name: "Người Cố Vấn Đồng Cảm", desc: "Ấm áp, cởi mở và chân thành; luôn xây dựng mối quan hệ dựa trên sự lắng nghe và tin tưởng." },
    "SI": { name: "Người Đồng Đội Hòa Giải", desc: "Điềm đạm, thân thiện, kiên nhẫn; đóng vai trò cầu nối gắn kết và giữ gìn bình yên cho nhóm." },
    "S": { name: "Hậu Phương Kiên Định", desc: "Đáng tin cậy nhất trong đội ngũ; trung thành, bền bỉ và luôn sẵn sàng hỗ trợ người khác." },
    "SC": { name: "Chuyên Gia Điều Phối Ổn Định", desc: "Làm việc bài bản, đáng tin cậy, chú ý quy trình và luôn đảm bảo sự ổn định của hệ thống." },
    "CS": { name: "Người Thực Thi Tỉ Mỉ", desc: "Cẩn thận, kiên nhẫn, ngăn nắp; luôn hoàn thành công việc đúng hạn với chất lượng chính xác." },
    "C": { name: "Nhà Phân Tích Chuẩn Mực", desc: "Logic, khách quan, tiêu chuẩn cao; coi trọng sự thật và luôn tìm kiếm giải pháp tối ưu nhất." }
};

/**
 * Thuật toán tính điểm DISC khoa học
 */
export function calculateDiscResult(answers: Record<number, "D" | "I" | "S" | "C">): DiscCalculationResult {
    const rawCounts = { D: 0, I: 0, S: 0, C: 0 };
    const answeredKeys = Object.keys(answers);
    const total = answeredKeys.length;

    if (total === 0) {
        return {
            primary: "S",
            secondary: null,
            blendName: BLEND_STYLES["S"].name,
            blendDescription: BLEND_STYLES["S"].desc,
            scores: { D: 25, I: 25, S: 25, C: 25 },
            rawCounts,
            dimensions: {
                pace: "balanced",
                paceLabel: "Cân bằng giữa tốc độ và thận trọng",
                focus: "balanced",
                focusLabel: "Cân bằng giữa công việc và con người",
            },
            traitInfo: DISC_TRAITS.S,
        };
    }

    Object.values(answers).forEach((trait) => {
        if (rawCounts[trait] !== undefined) {
            rawCounts[trait] += 1;
        }
    });

    const scores = {
        D: Math.round((rawCounts.D / total) * 100),
        I: Math.round((rawCounts.I / total) * 100),
        S: Math.round((rawCounts.S / total) * 100),
        C: Math.round((rawCounts.C / total) * 100),
    };

    // Sắp xếp các nhóm theo điểm số giảm dần
    const sortedTraits = (["D", "I", "S", "C"] as ("D" | "I" | "S" | "C")[]).sort(
        (a, b) => rawCounts[b] - rawCounts[a]
    );

    const primary = sortedTraits[0];
    const secondCandidate = sortedTraits[1];

    // Nếu điểm của nhóm thứ 2 đạt ít nhất 20% và chênh lệch không quá xa so với nhóm 1 thì tính là Secondary Trait
    const isSecondarySignificant =
        scores[secondCandidate] >= 20 &&
        rawCounts[primary] - rawCounts[secondCandidate] <= Math.max(2, Math.round(total * 0.2));

    const secondary = isSecondarySignificant ? secondCandidate : null;

    // Xác định tên phong cách kết hợp
    const blendKey = secondary ? `${primary}${secondary}` : primary;
    const blendMeta = BLEND_STYLES[blendKey] || BLEND_STYLES[primary] || {
        name: `Phong cách ${primary}`,
        desc: DISC_TRAITS[primary].description,
    };

    // Phân tích 2 trục tọa độ (Pace & Focus)
    const fastPacedScore = rawCounts.D + rawCounts.I;
    const moderatePacedScore = rawCounts.S + rawCounts.C;
    const taskScore = rawCounts.D + rawCounts.C;
    const peopleScore = rawCounts.I + rawCounts.S;

    const pace: "fast" | "moderate" | "balanced" =
        fastPacedScore > moderatePacedScore + 1 ? "fast" :
        moderatePacedScore > fastPacedScore + 1 ? "moderate" : "balanced";

    const focus: "task" | "people" | "balanced" =
        taskScore > peopleScore + 1 ? "task" :
        peopleScore > taskScore + 1 ? "people" : "balanced";

    const paceLabel =
        pace === "fast" ? "Xu hướng hành động nhanh, chủ động bứt phá" :
        pace === "moderate" ? "Xu hướng thận trọng, suy ngẫm kỹ trước khi làm" :
        "Cân bằng linh hoạt giữa tốc độ và sự cẩn trọng";

    const focusLabel =
        focus === "task" ? "Trọng tâm chú ý vào công việc, logic và mục tiêu" :
        focus === "people" ? "Trọng tâm chú ý vào con người, cảm xúc và quan hệ" :
        "Cân bằng hài hòa giữa công việc và con người";

    return {
        primary,
        secondary,
        blendName: blendMeta.name,
        blendDescription: blendMeta.desc,
        scores,
        rawCounts,
        dimensions: {
            pace,
            paceLabel,
            focus,
            focusLabel,
        },
        traitInfo: DISC_TRAITS[primary],
    };
}
