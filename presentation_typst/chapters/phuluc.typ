= PHỤ LỤC

== Phụ lục 1: Danh mục các tính năng đã chuẩn hóa

_Hệ thống hiện đã hoàn thiện việc chuẩn hóa giao diện theo shadcn/ui, bao gồm Bảng điều khiển (Dashboard), Cộng đồng (Social Hub), Trung tâm tin nhắn (Chat) và các công cụ rèn luyện kỷ luật (Grid, Journal)._

== Phụ lục 2: Hướng dẫn nhanh dành cho Mentor (Quick Start Guide)

+ *Đăng nhập*: Truy cập địa chỉ nội bộ, sử dụng Email cá nhân. Nếu quên mật khẩu, hãy dùng tính năng "Forgot Password".
+ *Giao diện chính*:
  - *Cột trái*: Menu điều hướng (Dashboard, Mentees, Goals, Meetings, Wiki).
  - *Trung tâm*: Các thẻ chỉ số (Stats) và Lịch họp sắp tới.
+ *Xem chi tiết Mentee*: Click vào danh sách Mentee.
  - Quan sát *Heatmap*: Tìm kiếm những ô màu xám (ngày không rèn luyện).
  - Quan sát *Goal Progress*: Kiểm tra xem thanh % có di chuyển trong 7 ngày qua không.
+ *Ghi chép Minutes*: Trong buổi họp, click vào "New Meeting" để ghi lại các ý chính. Điều này giúp hệ thống tự động nhắc nhở Mentee làm Reflection sau đó.

== Phụ lục 3: Checklist Phản tư (Reflection) dành cho Mentee

Để đạt hiệu quả cao nhất từ WebApp, Mentee nên trả lời 5 câu hỏi sau trong bài Reflection hằng tuần:

- *Q1 -- Chiến thắng*: Điều gì em đã làm tốt nhất tuần vừa qua?
- *Q2 -- Thử thách*: Khó khăn lớn nhất em gặp phải là gì? Tại sao?
- *Q3 -- Bài học*: Mentor đã chỉ dạy điều gì khiến em thay đổi tư duy?
- *Q4 -- Hành động*: Tuần tới em sẽ thay đổi cụ thể điều gì trong bộ Task của mình?
- *Q5 -- Yêu cầu*: Em cần Mentor hỗ trợ thêm nguồn lực/tri thức gì?

== Phụ lục 4: Giải quyết vấn đề dành cho Mentor cao tuổi (FAQ)

#figure(
  table(
    columns: (auto, 1fr),
    align: (center, left),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Câu hỏi]),
    table.cell(fill: rgb("#0d47a1"), text(fill: white, weight: "bold")[Giải pháp]),
    [Tôi thấy chữ hơi nhỏ], [Nhấn tổ mã phím `Ctrl +` (Windows) hoặc `Cmd +` (Mac) để phóng to trình duyệt.],
    [Tôi không biết Mentee đã viết bài chưa],
    [Vào menu "Reflections", hệ thống sẽ liệt kê các bài mới nhất của tất cả Mentee lên đầu.],
    [Tôi muốn nhập dữ liệu thay Mentee],
    [Hệ thống khuyến khích Mentee tự nhập để rèn tính kỷ luật, nhưng Mentor vẫn có quyền Edit các Task nếu cần hướng dẫn cụ thể.],
    [WebApp có dùng được trên điện thoại không?],
    [Có, WebApp được thiết kế Responsive để hiển thị tốt trên iPhone/Android thông qua trình duyệt web.],
  ),
  caption: [Các câu hỏi thường gặp của Mentor khi mới tiếp cận WebApp],
)
#text(9pt, fill: rgb("#616161"), style: "italic")[_Nguồn: Tulie Tech Research, 2026_]

== Phụ lục 5: Chân dung người dùng (User Personas)

- *Mentor A (Bận rộn)*: Chủ doanh nghiệp, chỉ có 45 phút/tuần cho Mentee. WebApp giúp anh lướt Report trong 2 phút trước họp → Đi thẳng vào coaching.
- *Mentee B (Cần kỷ luật)*: Sinh viên năm cuối, năng lượng thất thường. WebApp và Streak Counter giúp bạn tự tạo áp lực tích cực để không bỏ cuộc.
- *Ban Điều Hành*: Cần báo cáo cuối kỳ cho Viện ISME. WebApp hỗ trợ xuất báo cáo dữ liệu sạch (clean data) trong 1 click.
