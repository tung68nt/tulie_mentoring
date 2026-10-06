= SỰ ƯU VIỆT SO VỚI CÁC CÔNG CỤ HIỆN CÓ <ch4>

== Bảng so sánh tổng quan

#figure(
  table(
    columns: (auto, 1fr, 1fr),
    align: (center, left, left),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Tiêu chí]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Notion / Trello / Excel]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[WebApp IMP]),
    [Thiết lập], [Tự xây template, tốn hàng tuần], [Sẵn sàng, chuẩn quy trình IMP],
    [Liên kết dữ liệu], [Rời rạc (data silo)], [Tự động: Daily → Task → Goal → Report],
    [Độ trễ thông tin], [Cao (chờ manual update)], [Thấp (cập nhật real-time)],
    [Habit tracking], [Không có], [Program Grid + Streak Counter],
    [Reporting], [Thủ công (export Excel)], [Tự động Dashboard 360 độ],
    [Chi phí], [Cao khi >10 người], [0 đồng (home-grown)],
    [Trải nghiệm], [Cần kỹ năng IT], [Click "Báo cáo" là xong],
    [Ngôn ngữ], [Tiếng Anh], [Tiếng Việt 100%],
    [Tùy biến], [Chung chung], [Thiết kế riêng cho IMP],
  ),
  caption: [So sánh tổng quan WebApp IMP với các công cụ phổ thông],
)
#text(9pt, fill: rgb("#616161"), style: "italic")[_Nguồn: Tulie Tech Research, 2026_]

== Phân tích sâu: Notion

=== Ưu điểm
Notion là công cụ all-in-one mạnh mẽ, cho phép tạo database, Kanban, wiki, và calendar. Tính linh hoạt là điểm mạnh lớn nhất.

=== Hạn chế khi áp dụng cho IMP
- *"Quá linh hoạt phản tác dụng"*: Mỗi Mentee tự setup giao diện khác nhau. Mentor phải "học lại" interface mỗi khi vào trang Mentee mới -- đặc biệt khó khăn cho Mentor cao tuổi.
- *Thiếu Habit Heatmap*: Notion không có khái niệm "22 ngày xanh liên tiếp" tích hợp sẵn. Dữ liệu daily checklist không tự chuyển thành heatmap trực quan.
- *Dữ liệu không tự chảy*: Hoàn thành 1 task trong Kanban không tự cộng vào thanh Goal progress. Mentee phải update tay ở 2 nơi.
- *Chi phí*: Notion Team/Business từ \$8/người/tháng khi số lượng lớn.

== Phân tích sâu: Trello

=== Ưu điểm
Trello đơn giản, trực quan với giao diện Kanban. Phù hợp cho quản lý task cá nhân.

=== Hạn chế khi áp dụng cho IMP
- *"Thiếu chiều sâu cảm xúc"*: Trello quản lý card (task) tốt, nhưng không có nơi để Mentee viết nhật ký suy ngẫm hay bài thu hoạch.
- *Không có Goal Hierarchy*: Card trong Trello không tự liên kết thành mục tiêu tổng thể. Hoàn thành 10 cards nhưng Goal vẫn hiển thị 0%.
- *Không có Reports*: Trello không tự tổng hợp dữ liệu thành biểu đồ tiến độ cho Mentor xem.
- *Thiếu Calendar tích hợp*: Phải dùng Power-Up (thêm phí) hoặc kết nối Google Calendar bên ngoài.

== Phân tích sâu: Google Sheets/Excel

=== Ưu điểm
Quen thuộc, dễ chia sẻ, linh hoạt trong việc tạo bảng tính tùy ý.

=== Hạn chế khi áp dụng cho IMP
- *"Tĩnh và thủ công"*: 100% dữ liệu phải nhập tay. Mentee hay quên, Mentor phải nhắc. Dễ nhập sai.
- *Không có giao diện thân thiện*: Một bảng tính chứa 50 dòng không tạo cảm hứng rèn luyện. Không có hiệu ứng trực quan (heatmap, animation, progress bar).
- *Không real-time*: Mentor mở Sheet vào buổi sáng thì thấy dữ liệu của tuần trước.
- *Không có hệ thống cảnh báo*: Không tự phát hiện "đèn đỏ" (Mentee không update >3 ngày).

== Điểm khác biệt cốt lõi: "Opinionated Design"

WebApp IMP không phải là một "blank canvas" (trang trắng cho bạn tự vẽ) như Notion. Nó là một hệ thống có "quan điểm" (_Opinionated Design_):

#figure(
  table(
    columns: (1fr, 1fr),
    align: (left, left),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Blank Canvas (Notion, Trello)]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Opinionated Design (WebApp IMP)]),
    ["Làm gì tùy bạn"], ["Đây là quy trình chuẩn, hãy làm theo"],
    [Mentee phải tự setup workflow], [Workflow đã chuẩn hóa sẵn],
    [Mentor phải học cách đọc mỗi giao diện], [Mọi Mentee có chung giao diện],
    [Dễ bỏ bê vì không ai kiểm soát], [Hệ thống tự cảnh báo khi Mentee "lơ là"],
  ),
  caption: [So sánh triết lý thiết kế Blank Canvas vs. Opinionated Design],
)
#text(9pt, fill: rgb("#616161"), style: "italic")[_Nguồn: Tulie Tech Research, 2026_]

Đây chính là giá trị mà các công cụ thị trường không cung cấp được: *một hệ thống do chính chương trình thiết kế, cho chính quy trình của chương trình*.

== Bốn giá trị gia tăng cốt lõi

#import "@preview/cetz:0.3.1"

#figure(
  cetz.canvas({
    import cetz.draw: *

    // Center
    circle((x: 0, y: 0), radius: 1, fill: rgb("#0d47a1"), stroke: black)
    content((x: 0, y: 0), text(white, 8pt, weight: "bold")[WebApp \ IMP])

    // Value Boxes
    rect((x: -5, y: 1.5), (x: -1, y: 3.5), fill: rgb("#f1f8e9"), stroke: rgb("#4caf50"), radius: 0.2)
    content((x: -3, y: 2.5), text(7pt)[*Cho Mentor* \ "Nhàn hơn" quản trị \ → tập trung coaching])

    rect((x: 1, y: 1.5), (x: 5, y: 3.5), fill: rgb("#f1f8e9"), stroke: rgb("#4caf50"), radius: 0.2)
    content((x: 3, y: 2.5), text(7pt)[*Cho Mentee* \ "Kỷ luật hơn" nhờ visual \ → thấy mình tiến bộ])

    rect((x: -5, y: -3.5), (x: -1, y: -1.5), fill: rgb("#f1f8e9"), stroke: rgb("#4caf50"), radius: 0.2)
    content((x: -3, y: -2.5), text(7pt)[*Cho Chương trình* \ "Chuyên nghiệp hơn" \ → đánh giá chuẩn xác])

    rect((x: 1, y: -3.5), (x: 5, y: -1.5), fill: rgb("#f1f8e9"), stroke: rgb("#4caf50"), radius: 0.2)
    content((x: 3, y: -2.5), text(7pt)[*Cho Tổ chức* \ "Tiết kiệm hơn" \ 0đ license → bền vững])

    // Lines
    line((x: -0.7, y: 0.7), (x: -1, y: 1.5), stroke: 0.5pt + rgb("#0d47a1"))
    line((x: 0.7, y: 0.7), (x: 1, y: 1.5), stroke: 0.5pt + rgb("#0d47a1"))
    line((x: -0.7, y: -0.7), (x: -1, y: -1.5), stroke: 0.5pt + rgb("#0d47a1"))
    line((x: 0.7, y: -0.7), (x: 1, y: -1.5), stroke: 0.5pt + rgb("#0d47a1"))
  }),
  caption: [Bốn giá trị gia tăng cốt lõi của WebApp IMP],
)
#text(9pt, fill: rgb("#616161"), style: "italic")[_Nguồn: Tulie Tech Research, 2026_]
