= LÝ DO XÂY DỰNG HỆ THỐNG <ch1>

== Bối cảnh chương trình IMP
Chương trình IMP (ISME Mentoring Program) là hệ sinh thái rèn luyện thế hệ trẻ thông qua mô hình đồng hành cá nhân hóa. Hiện tại, chương trình vận hành với hai hình thức cốt lõi:

- *Mentoring 1:1*: Mô hình 1 Mentor -- 1 Mentee tập trung sâu vào định hướng nghề nghiệp và giải quyết vấn đề cá nhân.
- *Mentoring 1:N (Group Mentoring)*: Mô hình 1 Mentor đồng hành cùng nhóm 4--6 _Junior Mentees_#footnote[Thường là sinh viên năm 1, 2 -- khối đối tượng cần rèn luyện tính kỷ luật tập thể và các kỹ năng nền tảng trước khi bước vào định hướng chuyên sâu 1:1.] (thường là sinh viên năm 1, 2). Mô hình này tập trung vào xây dựng thói quen gốc, kỷ luật tập thể và các kỹ năng nền tảng.

Dù ở hình thức nào, các hoạt động cốt lõi vẫn xoay quanh: thiết lập mục tiêu (Growth Mindset @dweck2006), rèn luyện kỷ luật (Atomic Habits @atomichabits2018) và phản tư sâu (Personal Mastery @senge2006).

Tuy nhiên, trong quá trình vận hành thực tế, chương trình đang gặp ba nhóm vấn đề mang tính hệ thống.

== Nhóm vấn đề 1: Phân mảnh công cụ (Tool Fragmentation)

=== Hiện trạng
Mentee hiện phải chuyển đổi liên tục giữa 4--6 nền tảng khác nhau để thực hiện các hoạt động Mentoring. Mỗi nền tảng phục vụ một "mảnh" nhỏ trong quy trình tổng thể, nhưng không nền tảng nào bao phủ được toàn bộ hành trình rèn luyện.

#figure(
  table(
    columns: (auto, auto, 1fr, 1fr),
    align: (center, left, left, left),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[STT]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Công cụ]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Vai trò trong IMP]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Hạn chế]),
    [1],
    [Notion],
    [Ghi chú, Kanban board],
    [Quá linh hoạt, mỗi Mentee setup khác nhau, Mentor phải "học lại" giao diện],
    [2], [Trello], [Quản lý task tuần], [Không có nhật ký habit / thu hoạch, thiếu chiều sâu cảm xúc],
    [3], [Google Sheets], [Bảng theo dõi tiến độ], [Cập nhật thủ công, dễ quên/sai, không real-time],
    [4], [Zalo / Messenger], [Trao đổi nhanh], [Thông tin trôi nhanh, không lưu trữ, khó tìm lại],
    [5], [Google Calendar], [Lịch họp], [Không liên kết với mục tiêu, task, hay report],
    [6], [Google Drive], [Lưu trữ tài liệu], [Cô lập, không gắn với context Mentoring],
  ),
  caption: [Tổng hợp các công cụ đang sử dụng và hạn chế trong chương trình IMP],
)
#text(9pt, fill: rgb("#616161"), style: "italic")[_Nguồn: Tulie Tech Research, 2026_]

=== Hệ quả của sự phân mảnh
Nghiên cứu về chi phí chuyển đổi ngữ cảnh (_context switching cost_) cho thấy mỗi lần chuyển giữa 2 công cụ, não bộ mất trung bình 23 phút để lấy lại sự tập trung. Với 5--6 nền tảng, Mentee tiêu tốn một lượng đáng kể năng lượng nhận thức chỉ cho việc "điều hướng" thay vì "rèn luyện".

Ngoài ra, dữ liệu bị cô lập (data silo) giữa các nền tảng dẫn tới:
- Mentor không thấy được "bức tranh toàn cảnh" của Mentee.
- Mentee mất động lực vì không thấy sự tiến bộ tích lũy.
- Chương trình không có dữ liệu tổng hợp để đánh giá hiệu quả.

== Nhóm vấn đề 2: Mentor thiếu dữ liệu để ra quyết định

=== Pain Point cụ thể
Khảo sát nhanh trong dàn Mentor cho thấy các điểm đau (pain points) phổ biến nhất:

#figure(
  table(
    columns: (auto, 1fr, auto),
    align: (center, left, center),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[STT]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Pain Point của Mentor]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Tần suất]),
    [1], [Mất 30--50% thời gian buổi họp chỉ để "hỏi bài"], [Rất cao],
    [2], [Không biết Mentee có đang rèn luyện hằng ngày hay không], [Cao],
    [3], [Khó so sánh tiến độ giữa các Mentee], [Trung bình],
    [4], [Sau buổi họp, kiến thức "bay màu" vì Mentee không ghi chép], [Cao],
    [5], [Mentor cao tuổi gặp khó khăn với các công cụ công nghệ phức tạp], [Cao],
  ),
  caption: [Bảng tổng hợp Pain Points của Mentor trong chương trình IMP],
)
#text(9pt, fill: rgb("#616161"), style: "italic")[_Nguồn: Tulie Tech Research, 2026_]

=== Phân tích gốc rễ
Theo nguyên tắc _Management by Exception_ @mbe1961, Mentor chỉ nên tập trung vào những "ngoại lệ" -- nơi Mentee cần sự can thiệp. Tuy nhiên, hiện tại Mentor không có hệ thống nào tự động phát hiện "đèn đỏ" (Mentee bỏ bê kỷ luật, mục tiêu đứng hình). Điều này buộc Mentor phải dành thời gian quý báu cho việc "thu thập thông tin" thay vì "coaching thực sự".

Peter Drucker đã nhấn mạnh: _"What gets measured gets managed"_ @drucker2006. Nếu không có công cụ đo lường tự động, Mentor đang "quản lý mù" -- ra quyết định dựa trên cảm tính thay vì dữ liệu.

== Nhóm vấn đề 3: Chi phí và sự không phù hợp của SaaS

=== Chi phí license
Các nền tảng quản trị Mentoring chuyên nghiệp hiện có trên thị trường:

#figure(
  table(
    columns: (auto, 1fr, auto),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Nền tảng]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Mô tả]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Chi phí]),
    [MentorcliQ], [Quản lý matching, scheduling, tracking], [\$8--15/người/tháng],
    [Together Platform], [Mentoring marketplace + analytics], [\$5--12/người/tháng],
    [Chronus], [Enterprise mentoring, compliance], [\$10--20/người/tháng],
    [Qooper], [Mentoring + Learning], [\$5--10/người/tháng],
  ),
  caption: [Chi phí license các nền tảng Mentoring SaaS phổ biến],
)
#text(9pt, fill: rgb("#616161"), style: "italic")[_Nguồn: Tulie Tech Research, 2026_]

Với chương trình IMP có 30+ thành viên, chi phí hằng năm ước tính từ 36--108 triệu đồng -- không phù hợp với ngân sách chương trình.

=== Sự không phù hợp về quy trình
Quan trọng hơn, các nền tảng SaaS quốc tế không có:
- *Program Grid (Heatmap kỷ luật)*: Tính năng đặc thù của IMP.
- *Daily Diary + Harvesting*: Quy trình thu hoạch riêng biệt.
- *Giao diện tiếng Việt*: Thân thiện với Mentor cao tuổi.
- *Tùy biến văn hóa*: Phản ánh giá trị rèn luyện của ISME.

== Giải pháp: WebApp tự xây dựng (Home-grown Solution)

Giải pháp được đề xuất là xây dựng một WebApp tập trung do chính đội ngũ kỹ thuật trong dàn Mentor phát triển.

#figure(
  table(
    columns: (auto, 1fr),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Ưu điểm]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Chi tiết]),
    [*Miễn phí vĩnh viễn*], [Không phụ thuộc nhà cung cấp SaaS, không tốn license hàng tháng],
    [*Tùy biến 100%*], [Thiết kế riêng cho quy trình rèn luyện IMP (Habit Grid, Harvesting, GROW)],
    [*Chủ quyền dữ liệu*], [Toàn bộ dữ liệu Mentee nằm trên hạ tầng nội bộ, bảo mật],
    [*Phát triển liên tục*], [Đội kỹ thuật nội bộ có thể cập nhật tính năng theo phản hồi thực tế],
    [*Giao diện Việt hóa*], [Tối ưu cho Mentor cao tuổi, không cần kỹ năng IT],
  ),
  caption: [Ưu điểm của giải pháp WebApp tự xây dựng],
)
#text(9pt, fill: rgb("#616161"), style: "italic")[_Nguồn: Tulie Tech Research, 2026_]

Như @kotter2012 nhấn mạnh trong lý thuyết quản lý sự thay đổi: để chuyển đổi thành công, tổ chức cần "tạo ra cảm giác cấp bách" (sense of urgency) và "tầm nhìn rõ ràng". WebApp IMP không chỉ là một công cụ mà là bước đi đầu tiên trong chiến lược chuyển đổi số toàn diện của chương trình.
