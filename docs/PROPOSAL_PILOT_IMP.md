# BÁO CÁO NÂNG CẤP & ĐỀ XUẤT TRIỂN KHAI THỬ NGHIỆM
## HỆ SINH THÁI MENTORING IMP (ISME MENTORING PROGRAM)

**Kính gửi:** Ban Lãnh đạo Viện Đào tạo Quốc tế (ISME) - Đại học Kinh tế Quốc dân.
**Đơn vị thực hiện:** Đội ngũ phát ngũ phát triển Hệ thống Mentoring IMP.
**Ngày báo cáo:** 11/03/2026

---

### I. TỔNG QUAN HIỆN TRẠNG
Sau giai đoạn phát triển cốt lõi, hệ thống đã hoàn thiện các tính năng quản trị cơ bản (Lịch họp, Mục tiêu, Nhật ký thu hoạch). Nhằm mục tiêu nâng cao **tính gắn kết** và **tính chuyên nghiệp**, chúng tôi đã thực hiện đợt nâng cấp lớn nhất từ trước đến nay, tập trung vào trải nghiệm người dùng và khả năng tương tác tức thời.

---

### II. CÁC HẠNG MỤC PHÁT TRIỂN MỚI

#### 1. Chuẩn hóa Giao diện Hệ thống (UI/UX Transformation)
Toàn bộ hệ thống đã được tái cấu trúc giao diện theo tiêu chuẩn **Premium Minimalist** (Tối giản cao cấp).
- **Mô tả:** Sử dụng thư viện thành phần `shadcn/ui` – tiêu chuẩn thiết kế hiện đại nhất hiện nay được các tập đoàn công nghệ lớn tin dùng.
- **Đặc điểm nổi bật:**
    - **Tính đồng nhất:** Mọi nút bấm, ô nhập liệu, thẻ thông tin đều có tỉ lệ vàng và khoảng cách chuẩn xác.
    - **Responsive Design:** Giao diện tự động tối ưu cho Máy tính, Máy tính bảng và Điện thoại di động.
    - **Dark/Light Mode:** Hỗ trợ chế độ nền tối (Dark Mode) giúp Mentor/Mentee làm việc lâu không mỏi mắt.
- **Giá trị mang lại:** Xây dựng hình ảnh chuyên nghiệp cho Viện ISME trong mắt các đối tác Mentor danh tiếng và sinh viên.

#### 2. Phân hệ Cộng đồng (Social Hub)
Không gian mạng xã hội nội bộ dành riêng cho chương trình Mentoring.
- **Mô tả:** Nơi Mentor và các quản lý chương trình đăng tải thông tin, cảm hứng và tri thức.
- **Chi tiết chức năng:**
    - **Post (Bài viết):** Chia sẻ các bài học kinh nghiệm, tài liệu quý hoặc thông báo khẩn từ Ban tổ chức.
    - **Reaction (Tương tác):** Chức năng "Thả tim", "Thích", "Khám phá" giúp tăng sự khích lệ cho các bài đăng tích cực.
    - **Comment (Bình luận):** Cho phép thảo luận dưới mỗi chủ đề, tạo nền tảng học thuật sôi nổi.
- **Giá trị mang lại:** Xây dựng văn hóa "Cùng học hỏi - Cùng phát triển", lưu trữ tri thức dưới dạng số hóa thay vì trôi mất trên các hội nhóm mạng xã hội bên ngoài.

#### 3. Phân hệ Liên lạc (Communication Hub - Chat)
Hệ thống nhắn tin tức thời bảo mật và tập trung.
- **Mô tả:** Công cụ chat trực tiếp tích hợp sâu vào hệ thống quản lý.
- **Chi tiết chức năng:**
    - **Direct Chat:** Nhắn tin 1-1 riêng tư giữa Mentor và Mentee.
    - **Mentorship Group Chat:** Hệ thống tự động tạo nhóm chat cho mỗi cặp Mentor và (các) Mentee tương ứng khi được Admin ghép cặp.
    - **Message Tracking:** Theo dõi trạng thái tin nhắn đã đọc/chưa đọc để đảm bảo thông tin quan trọng được tiếp nhận.
- **Giá trị mang lại:** Loại bỏ sự phân mảnh thông tin khi phải dùng quá nhiều ứng dụng ngoài (Zalo, Messenger), giúp quản lý tập trung và bảo mật dữ liệu của chương trình.

---

### III. GIẢI THÍCH THUẬT NGỮ (GLOSSARY)

| Thuật ngữ | Giải thích |
|---|---|
| **Program Cycle** | **Chu kỳ Chương trình**: Một giai đoạn mentoring cụ thể (VD: Khóa Spring 2026). Mỗi chu kỳ có cấu hình riêng về Social và Chat. |
| **Facilitator** | **Điều phối viên**: Người trực tiếp hỗ trợ, giải đáp thắc mắc và đảm bảo tiến độ cho các cặp Mentor-Mentee. |
| **Program Manager** | **Quản lý Chương trình**: Người có quyền cao nhất để theo dõi chỉ số hiệu quả (KPIs), xem báo cáo tổng hợp. |
| **Whiteboard** | **Bảng trắng số**: Không gian vẽ và tư duy trực quan tích hợp trong hệ thống để Mentor giảng dạy online. |
| **Wiki** | **Thư viện số**: Nơi lưu trữ các quy định, tài liệu học thuật tĩnh của chương trình. |

---

### IV. KẾ HOẠCH TRIỂN KHAI THỬ NGHIỆM (PILOT PROGRAM)

Chúng tôi đề xuất triển khai thử nghiệm (Pilot Run) cho nhóm đối tượng tiêu biểu:
1.  **Quy mô:** 5 Mentor và 20 Mentee xuất sắc nhất.
2.  **Thời gian:** 14 ngày (Từ ngày 15/03/2026).
3.  **Nội dung thử nghiệm:**
    - Thực hiện quy trình ghép cặp và tạo Group Chat tự động.
    - Đăng 3 bài viết chuyên môn trên Social Hub để thu thập tương tác.
    - Đánh giá tính ổn định của giao diện mới trên các cấu hình máy tính khác nhau.

---
**Trân trọng,**
*Đội ngũ phát triển Hệ thống Mentoring IMP*
