= CÁC PHÂN HỆ CỦA HỆ THỐNG <ch3>

WebApp Mentoring IMP được cấu trúc thành 4 phân hệ (Pillars), mỗi phân hệ giải quyết một nhóm nhu cầu cốt lõi. Cụm phân hệ hoạt động như một hệ điều hành (OS) rèn luyện con người, nơi dữ liệu tự động chảy từ hành động hằng ngày đến báo cáo tổng hợp.

== Phân hệ 1: Kỷ luật tự thân (The Habit Engine)

=== Cơ sở lý thuyết
- *Atomic Habits* @atomichabits2018: Tích lũy 1% mỗi ngày.
- *Habit Loop* @duhigg2012: Tín hiệu (Cue) → Thói quen (Routine) → Phần thưởng (Reward).
- *Loss Aversion* @kahneman1979: Con người sợ mất đi thành quả hiện tại hơn là mong muốn đạt được thành quả mới.
- *Peak-End Rule*: Trải nghiệm được đánh giá dựa trên thời điểm đỉnh cao và thời điểm kết thúc.

=== Pain Point sâu sắc tại IMP
Trong các chương trình Mentoring truyền thống, việc duy trì động lực (momentum) là khó khăn lớn nhất. Mentee thường rơi vào trạng thái "nguội lạnh" sau giai đoạn trăng mật (honeymoon phase). Mentor không có cách nào biết Mentee đang dừng bước cho đến khi quá muộn.

_Hậu quả_: Buổi gặp mặt trở nên gượng gạo vì Mentee không có gì để báo cáo, và Mentor cảm thấy mình đang bị lãng phí thời gian.

=== Giải pháp: Công cụ trong phân hệ

#figure(
  table(
    columns: (auto, 1fr, 1fr),
    align: (center, left, left),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Công cụ]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Mô tả]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Nguyên lý thiết kế]),
    [*Program Grid*], [Ma trận ô vuông 7x4 hoặc 30x12, tick xanh/xám], [Trực quan hóa tiến độ (Visual cues)],
    [*Daily Diary*], [Nhật ký ngắn (micro-journaling) mỗi ngày], [Phản tư sâu (Deep reflection)],
    [*Streak Counter*], [Hiển thị số ngày liên tiếp], [Hiệu ứng "Đừng làm đứt xích" (Seinfeld Strategy)],
    [*Morning Brief*], [Thông báo nhắc nhở đầu ngày], [Cue (Tín hiệu) trong vòng lặp thói quen],
  ),
  caption: [Bộ công cụ Phân hệ 1 và nguyên lý thiết kế hành vi],
)
#text(9pt, fill: rgb("#616161"), style: "italic")[_Nguồn: Tulie Tech Research, 2026_]

=== Gợi ý sử dụng để đạt hiệu quả tối đa

+ *Dành cho Mentee*: Đừng cố gắng viết Diary quá dài. Hãy áp dụng quy tắc 2 phút: nếu hành động tốn dưới 2 phút, hãy làm ngay. Việc tick Grid chỉ tốn 5 giây, hãy làm nó ngay sau khi thức dậy hoặc trước khi đi ngủ để neo (anchor) thói quen.
+ *Dành cho Mentor*: Đừng chỉ dùng Grid để kiểm soát. Hãy dùng nó để *thấu cảm*. Nếu thấy Mentee có chuỗi ngày xám, hãy bắt đầu buổi họp bằng: "Anh thấy em có một tuần hơi khó khăn đúng không? Có chuyện gì đang xảy ra làm cản trở em vậy?". Điều này tạo ra sự kết nối (Relatedness) @ryan2000.

== Phân hệ 2: Thực thi mục tiêu (The Execution Pillar)

=== Cơ sở lý thuyết
- *OKRs* @okrs2018: Objectives and Key Results.
- *4DX* @4dx2012: The 4 Disciplines of Execution.
- *Eisenhower Matrix*: Phân loại ưu tiên Quan trọng/Khẩn cấp.

=== Pain Point sâu sắc tại IMP
Mentee thường bị sa lầy vào các việc vặt (urgent but not important) và bỏ quên các mục tiêu chiến lược (WIGs). Dữ liệu mục tiêu thường nằm trong file Excel/PDF tĩnh, không có sự liên kết sống với hành động hằng ngày.

=== Giải pháp: Công cụ trong phân hệ

#figure(
  table(
    columns: (auto, 1fr, 1fr),
    align: (center, left, left),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Công cụ]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Mô tả]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Giá trị]),
    [*Goal Board*], [Hiển thị các mục tiêu lớn với thanh tiến độ %], [Giữ sự tập trung (Focus)],
    [*Gantt Chart*], [Trực quan hóa lộ trình thực hiện theo thời gian], [Quản trị tiến độ chuyên nghiệp],
    [*Task Master*], [Danh sách nhiệm vụ tuần gắn liền với Goal], [Chuyển hóa chiến lược thành thực thi],
    [*Priority Tags*], [Gắn nhãn mức độ ưu tiên], [Áp dụng nguyên lý Pareto 80/20],
    [*Progress Auto-Sync*], [Tự động cập nhật Goal % khi hoàn thành Task], [Phần thưởng tức thì (Immediate Reward)],
  ),
  caption: [Bộ công cụ Phân hệ 2 và cơ chế thực thi (Cập nhật tính năng Gantt)],
)
#text(9pt, fill: rgb("#616161"), style: "italic")[_Nguồn: Tulie Tech Research, 2026_]

=== Gợi ý sử dụng để đạt hiệu quả tối đa
+ *Xác định WIG*: Chỉ nên có tối đa 2--3 mục tiêu cực kỳ quan trọng mỗi đợt.
+ *Break-down*: Mỗi Goal phải được chia nhỏ thành ít nhất 5--10 tasks cụ thể. Một task không nên kéo dài quá 3 ngày.
+ *Review kỹ thuật*: Mentor nên kiểm tra xem các task của Mentee có thực sự là "Lead Measures" (những việc tác động đến kết quả) hay chỉ là "Lag Measures" (kết quả mong muốn).

== Phân hệ 3: Kết nối và Đồng hành (The Connection Layer)

=== Cơ sở lý thuyết
- *Mô hình GROW* @grow2009.
- *Psychological Safety*: Niềm tin rằng mình sẽ không bị trừng phạt khi thừa nhận sai lầm.
- *Active Listening*: Lắng nghe chủ động.

=== Pain Point sâu sắc tại IMP
Sự kết nối giữa Mentor và Mentee thường bị đứt quãng giữa các buổi họp. Mentee cảm thấy cô đơn trên hành trình rèn luyện, còn Mentor cảm thấy mình chỉ là người "kiểm tra bài cũ". Tri thức từ các buổi đối thoại không được đúc kết (harvesting).

=== Giải pháp: Công cụ trong phân hệ

#figure(
  table(
    columns: (auto, 1.2fr, 1fr),
    align: (center, left, left),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Công cụ]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Mô tả]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Vai trò]),
    [*Social Hub*], [Bảng tin nội bộ chia sẻ tri thức và cảm hứng], [Gắn kết cộng đồng],
    [*Chat Center*], [Nhắn tin tức thời 1-1 và Group Mentorship], [Trao đổi real-time],
    [*Meeting Lab*], [Đặt lịch, ghi biên bản cuộc họp chuyên nghiệp], [Chuẩn hóa tương tác],
    [*Check-in 360*], [Mentee cập nhật trạng thái trước họp], [Tiết kiệm 30 phút "hỏi bài"],
    [*Reflection Studio*], [Nơi viết thu hoạch bài học sau họp], [Đóng gói tri thức],
  ),
  caption: [Bộ công cụ Phân hệ 3 - Kết nối & Tương tác (Cập nhật Social & Chat)],
)
#text(9pt, fill: rgb("#616161"), style: "italic")[_Nguồn: Tulie Tech Research, 2026_]

=== Gợi ý sử dụng để đạt hiệu quả tối đa
_Quy tắc Vàng_: Mentee phải điền Check-in ít nhất 12 giờ trước khi họp. Mentor dành 5 phút đọc Check-in để bước vào buổi họp với tư thế của một người dẫn dắt (Coach) chứ không phải người điều tra. Sau họp, Mentee có 24 giờ vàng để viết Reflection trước khi kiến thức bị mai một.

== Phân hệ 4: Trí tuệ hệ thống (The Insight Hub)

=== Cơ sở lý thuyết
- *Management by Exception* @mbe1961.
- *Big Data for Small Groups*: Dùng dữ liệu để cá nhân hóa lộ trình phát triển.

=== Pain Point sâu sắc tại IMP
Dữ liệu rải rác làm cho việc đánh giá cuối đợt trở nên cảm quan. Ban điều hành chương trình khó có cái nhìn tổng quan về sức mạnh của toàn bộ dàn Mentors/Mentees.

=== Giải pháp: Công cụ trong phân hệ

#figure(
  table(
    columns: (auto, 1fr, 1fr),
    align: (center, left, left),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Công cụ]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Mô tả]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Lợi ích]),
    [*Command Center*], [Dashboard tổng quan cho Mentor/BĐH], [Nhận diện "đèn đỏ" tức thì],
    [*Studio (B2C)*], [Hệ thống quản lý đơn hàng và QR Payment], [Mở rộng hệ sinh thái kinh doanh],
    [*Growth Analytics*], [Biểu đồ tăng trưởng năng lực của Mentee], [Minh chứng cho sự thay đổi],
    [*Knowledge Base*], [Thư viện tài liệu chia sẻ (Wiki)], [Tích lũy tài sản tri thức],
  ),
  caption: [Bộ công cụ Phân hệ 4 và cơ chế trí tuệ (Mở rộng phân hệ Studio)],
)
#text(9pt, fill: rgb("#616161"), style: "italic")[_Nguồn: Tulie Tech Research, 2026_]

== Kiến trúc tổng quan và Luồng dữ liệu

#import "@preview/cetz:0.3.1"

#figure(
  cetz.canvas({
    import cetz.draw: *

    // Actors
    circle((x: 0, y: 4), radius: 0.8, fill: rgb("#0d47a1"), stroke: black)
    content((x: 0, y: 4), text(white, 8pt, weight: "bold")[MENTEE])

    circle((x: 0, y: -4), radius: 0.8, fill: rgb("#0d47a1"), stroke: black)
    content((x: 0, y: -4), text(white, 8pt, weight: "bold")[MENTOR])

    // Pillars
    rect((x: -5, y: 1), (x: -1, y: 2.5), fill: rgb("#e1f5fe"), stroke: rgb("#01579b"), radius: 0.2)
    content((x: -3, y: 1.75), text(7pt)[*PH 1* \ Kỷ luật & Thói quen \ #text(5pt)[Program Grid, Daily Diary]])

    rect((x: 1, y: 1), (x: 5, y: 2.5), fill: rgb("#e1f5fe"), stroke: rgb("#01579b"), radius: 0.2)
    content((x: 3, y: 1.75), text(7pt)[*PH 2* \ Thực thi mục tiêu \ #text(5pt)[Goal Board, Task Master]])

    rect((x: -5, y: -2.5), (x: -1, y: -1), fill: rgb("#e1f5fe"), stroke: rgb("#01579b"), radius: 0.2)
    content((x: -3, y: -1.75), text(7pt)[*PH 3* \ Kết nối & Đồng hành \ #text(5pt)[Meeting Lab, Reflection]])

    rect((x: 1, y: -2.5), (x: 5, y: -1), fill: rgb("#e1f5fe"), stroke: rgb("#01579b"), radius: 0.2)
    content((x: 3, y: -1.75), text(7pt)[*PH 4* \ Trí tuệ hệ thống \ #text(5pt)[Command Center, Analytics]])

    // Flows
    line((x: 0, y: 3.2), (x: -3, y: 2.5), stroke: 0.8pt + gray)
    line((x: 0, y: 3.2), (x: 3, y: 2.5), stroke: 0.8pt + gray)
    line((x: -1, y: 1.75), (x: 1, y: 1.75), stroke: (paint: gray, thickness: 0.5pt, dash: "dashed"))
    line((x: -3, y: 1), (x: -3, y: -1), stroke: 0.5pt + gray)
    line((x: 3, y: 1), (x: 3, y: -1), stroke: 0.5pt + gray)
    line((x: -1, y: -1.75), (x: 1, y: -1.75), stroke: 0.5pt + gray)
    line((x: -3, y: -2.5), (x: 0, y: -3.2), stroke: 0.8pt + gray)
    line((x: 3, y: -2.5), (x: 0, y: -3.2), stroke: 0.8pt + gray)
  }),
  caption: [Kiến trúc tổng thể và luồng tương tác dữ liệu liên phân hệ],
)
#text(9pt, fill: rgb("#616161"), style: "italic")[_Nguồn: Tulie Tech Research, 2026_]

== Kịch bản ví dụ: Một tuần rèn luyện rực rỡ

+ *Thứ 2 -- Thứ 6*: Mentee thực hiện 3 thói quen buổi sáng, tick Grid (PH1). Hoàn thành 2 task chuyên môn, Goal % tăng từ 45% lên 52% (PH2).
+ *Thứ 7*: Mentee điền Check-in form giải thích lý do thanh tiến độ tăng nhanh (PH3).
+ *Chủ nhật (Sáng)*: Mentor mở Dashboard (PH4), thấy heatmap của Mentee xanh ngắt và Goal đang bứt phá.
+ *Chủ nhật (Chiều)*: Buổi họp 1:1 diễn ra. Mentor không hỏi về task nữa mà dành trọn 1 giờ để chỉ dạy về tư duy quản trị (PH3).
+ *Chủ nhật (Tối)*: Mentee viết bài Reflection dài 500 chữ đúc kết bài học đắt giá nhất (PH3). Hệ thống lưu vào Portfolio.
