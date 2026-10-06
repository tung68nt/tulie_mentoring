= CƠ SỞ LÝ LUẬN QUẢN TRỊ <ch2>

Chương này trình bày các nền tảng lý thuyết quản trị khoa học được sử dụng làm cơ sở thiết kế hệ thống WebApp Mentoring IMP. Mỗi lý thuyết tương ứng với một hoặc nhiều phân hệ cốt lõi (sẽ trình bày chi tiết tại Chương 3).

== Atomic Habits và Khoa học thay đổi hành vi

=== Nguyên lý tích lũy 1%
James Clear trong _Atomic Habits_ @atomichabits2018 chứng minh rằng thay đổi nhỏ 1% mỗi ngày, khi tích lũy qua 365 ngày, sẽ tạo ra kết quả gấp gần 38 lần so với xuất phát điểm:

$ 1.01^365 approx 37.78 $

Ngược lại, sự suy giảm 1% mỗi ngày sẽ khiến kết quả tiến gần về 0:

$ 0.99^365 approx 0.03 $

Đây là nền tảng toán học cho triết lý "rèn luyện mỗi ngày" của IMP. Vấn đề là: làm sao để *nhìn thấy* sự tích lũy này? Nếu không trực quan hóa, Mentee rất dễ bỏ cuộc vì cảm giác "làm mãi mà chẳng thấy kết quả".

=== Bốn quy luật thay đổi hành vi
Clear đề xuất 4 quy luật để xây dựng thói quen tốt:

#figure(
  table(
    columns: (auto, auto, 1fr, 1fr),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[STT]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Quy luật]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Giải thích]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Ứng dụng trong WebApp]),
    [1], [Make it Obvious], [Tín hiệu kích hoạt phải rõ ràng], [Program Grid luôn hiển thị trên Dashboard],
    [2], [Make it Attractive], [Liên kết thói quen với phần thưởng], [Chuỗi ngày xanh tạo cảm giác thành tựu],
    [3], [Make it Easy], [Giảm ma sát đến mức tối thiểu], [Chỉ cần 30 giây tick "Hoàn thành"],
    [4], [Make it Satisfying], [Phần thưởng tức thì], [Dopamine khi thấy ô vuông chuyển xanh],
  ),
  caption: [Bốn quy luật Atomic Habits và ứng dụng trong WebApp IMP],
)
#align(center, text(9pt, fill: rgb("#616161"), style: "italic")[Nguồn: Tổng hợp từ @atomichabits2018])

Charles Duhigg bổ sung thêm góc nhìn về "Vòng lặp thói quen" (_Habit Loop_): Tín hiệu (Cue) → Thói quen (Routine) → Phần thưởng (Reward) @duhigg2012. WebApp được thiết kế để mỗi ngày Mentee nhận được "Tín hiệu" (Dashboard nhắc nhở), thực hiện "Thói quen" (tick Grid, viết Diary), và nhận "Phần thưởng" (ô xanh, streak counter).

== Khung 4DX -- 4 Disciplines of Execution

=== Lead Measures vs. Lag Measures
@4dx2012 phân biệt hai loại chỉ số quan trọng:

- *Lag Measures* (Chỉ số kết quả): Điểm số cuối kỳ, hoàn thành mục tiêu tổng thể -- chỉ biết *kết quả* khi đã quá muộn để can thiệp.
- *Lead Measures* (Chỉ số dẫn dắt): Hành động cụ thể hằng ngày/tuần -- có thể *tác động* ngay để thay đổi kết quả.

Trong bối cảnh IMP:

#figure(
  table(
    columns: (1fr, 1fr),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Lag Measures (Biết muộn)]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Lead Measures (Biết sớm)]),
    [Mentee hoàn thành mục tiêu cuối đợt], [Mentee có tick Daily Grid hôm nay không?],
    [Điểm đánh giá tổng kết], [Mentee đã hoàn thành task tuần này chưa?],
    [Mức độ hài lòng cuối chương trình], [Mentee có viết Diary/Reflection sau họp không?],
  ),
  caption: [Phân biệt Lead vs. Lag Measures trong IMP],
)
#align(center, text(9pt, fill: rgb("#616161"), style: "italic")[Nguồn: Tổng hợp từ @4dx2012])

WebApp tập trung đo *Lead Measures* -- cho phép Mentor can thiệp *kịp thời* trước khi vấn đề trở nên nghiêm trọng.

== Mô hình GROW và Coaching chuyên sâu

Mô hình GROW của @grow2009 cấu trúc hóa cuộc đối thoại Mentoring thành 4 giai đoạn:

#figure(
  table(
    columns: (auto, auto, 1fr, 1fr),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Bước]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Tên]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Câu hỏi cốt lõi]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Công cụ WebApp]),
    [G], [Goal], ["Mục tiêu của em là gì?"], [Goal Management],
    [R], [Reality], ["Hiện tại em đang ở đâu?"], [Automated Report, Program Grid],
    [O], [Options], ["Có những cách nào để đạt được?"], [Meeting Lab + Wiki Resources],
    [W], [Will], ["Em cam kết sẽ làm gì?"], [Reflection Studio],
  ),
  caption: [Ánh xạ mô hình GROW với công cụ trên WebApp IMP],
)
#align(center, text(9pt, fill: rgb("#616161"), style: "italic")[Nguồn: Tổng hợp từ @grow2009])

== Tự chủ, Thành thạo và Mục đích (Pink, 2009)

Daniel Pink trong _Drive_ @pink2009 chỉ ra rằng động lực nội tại được thúc đẩy bởi 3 yếu tố:

- *Autonomy* (Tự chủ): Mặc dù có quy trình, Mentee vẫn được tự chủ trong việc đặt Goal và chọn Task.
- *Mastery* (Thành thạo): Thanh tiến độ Goal và Heatmap là bằng chứng rõ nhất cho sự thành thạo dần dần.
- *Purpose* (Mục đích): Việc liên kết Task hằng ngày với Goal lớn giúp Mentee thấy được ý nghĩa (Why) của từng hành động nhỏ.

== Học tập trải nghiệm (Kolb) và Phản tư (Reflection)

David Kolb @kolb1984 đề xuất chu kỳ 4 bước:

+ *Concrete Experience* (Trải nghiệm thực tế): Mentee thực hiện Task.
+ *Reflective Observation* (Quan sát phản tư): Mentee viết Diary/Reflection.
+ *Abstract Conceptualization* (Đúc kết khái quát): Mentor hướng dẫn rút ra bài học.
+ *Active Experimentation* (Thử nghiệm tích cực): Áp dụng bài học cho Task tiếp theo.

Thiếu bước 2 (Reflection), tri thức sẽ không được "đóng gói" và dễ dàng trôi đi. WebApp IMP đóng vai trò là một *Reflection Studio* buộc Mentee phải dừng lại và suy ngẫm sau mỗi cột mốc.

== Management by Exception (Quản trị theo ngoại lệ)

Theo @mbe1961, nhà quản lý hay Mentor hiệu quả chỉ nên can thiệp khi có sự sai lệch so với kế hoạch (đèn đỏ). WebApp hiện thực hóa điều này thông qua:

- *Automatic Alerts*: Hệ thống tự gắn cờ các Mentees đang trì trệ.
- *Visual Heatmap*: Mentor chỉ cần lướt mắt qua là biết ai đang ổn, ai đang cần hỗ trợ.

== Tổng hợp khung lý luận -- Ánh xạ Lý thuyết vào Phân hệ

#import "@preview/cetz:0.3.1"

#figure(
  cetz.canvas({
    import cetz.draw: *

    // Theories (Left)
    rect((x: -2, y: 4), (x: 2, y: 5.5), stroke: rgb("#00bcd4"), fill: rgb("#e0f7fa"), radius: 0.3)
    content((x: 0, y: 4.75), text(8pt)[*Atomic Habits / Habit Loop* \ James Clear, Duhigg \ Tập trung 1%])

    rect((x: -2, y: 1.5), (x: 2, y: 3), stroke: rgb("#00bcd4"), fill: rgb("#e0f7fa"), radius: 0.3)
    content((x: 0, y: 2.25), text(8pt)[*OKRs / 4DX / Drive* \ Doerr, Pink \ Quản trị mục tiêu])

    rect((x: -2, y: -1), (x: 2, y: 0.5), stroke: rgb("#00bcd4"), fill: rgb("#e0f7fa"), radius: 0.3)
    content((x: 0, y: -0.25), text(8pt)[*GROW / Kolb / SDT* \ Whitmore, Kolb \ Coaching & Phản tư])

    rect((x: -2, y: -3.5), (x: 2, y: -2), stroke: rgb("#00bcd4"), fill: rgb("#e0f7fa"), radius: 0.3)
    content((x: 0, y: -2.75), text(8pt)[*MBE / Senge* \ Bittel, Senge \ Ngoại lệ & Học tập])

    // Pillars (Right)
    rect((x: 6, y: 4), (x: 10, y: 5.5), fill: rgb("#0d47a1"), stroke: black, radius: 0.3)
    content((x: 8, y: 4.75), text(8pt, fill: white)[*Phân hệ 1* \ Kỷ luật tự thân])

    rect((x: 6, y: 1.5), (x: 10, y: 3), fill: rgb("#0d47a1"), stroke: black, radius: 0.3)
    content((x: 8, y: 2.25), text(8pt, fill: white)[*Phân hệ 2* \ Thực thi mục tiêu])

    rect((x: 6, y: -1), (x: 10, y: 0.5), fill: rgb("#0d47a1"), stroke: black, radius: 0.3)
    content((x: 8, y: -0.25), text(8pt, fill: white)[*Phân hệ 3* \ Kết nối & Đồng hành])

    rect((x: 6, y: -3.5), (x: 10, y: -2), fill: rgb("#0d47a1"), stroke: black, radius: 0.3)
    content((x: 8, y: -2.75), text(8pt, fill: white)[*Phân hệ 4* \ Trí tuệ hệ thống])

    // Arrows
    line((x: 2, y: 4.75), (x: 6, y: 4.75), stroke: 1.5pt + rgb("#0d47a1"))
    line((x: 2, y: 2.25), (x: 6, y: 2.25), stroke: 1.5pt + rgb("#0d47a1"))
    line((x: 2, y: -0.25), (x: 6, y: -0.25), stroke: 1.5pt + rgb("#0d47a1"))
    line((x: 2, y: -2.75), (x: 6, y: -2.75), stroke: 1.5pt + rgb("#0d47a1"))

    // Labels
    content((x: 0, y: 6.5), text(8pt, weight: "bold", fill: rgb("#616161"))[LÝ THUYẾT QUẢN TRỊ KINH ĐIỂN])
    content((x: 8, y: 6.5), text(8pt, weight: "bold", fill: rgb("#616161"))[PHÂN HỆ KỸ THUẬT SỐ])
  }),
  caption: [Mô hình ánh xạ Cơ sở lý luận Quản trị vào Kiến trúc WebApp IMP],
)
#text(9pt, fill: rgb("#616161"), style: "italic")[_Nguồn: Tulie Tech Research, 2026_]
