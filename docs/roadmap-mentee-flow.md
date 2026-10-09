# Roadmap: luồng mentee, facilitator, mentor và hệ thống

Đối chiếu yêu cầu với hiện trạng code (đã khảo sát 2026-10-09).

## Hiện trạng và lỗ hổng cần xử lý trước

| Vấn đề | Vị trí | Mức độ |
|---|---|---|
| Check-in bằng mã 6 ký tự không kiểm tra user có thuộc mentorship của buổi họp không, và không kiểm tra khung giờ | `checkIn()` trong `src/lib/actions/meeting.ts` | Cao (bypass) |
| Check-in không có selfie, GPS và device hash không được ghi (cột có trong `Attendance` nhưng không dùng) | `Attendance` | Cao |
| `/api/migrate` chạy raw SQL qua HTTP GET | `src/app/api/migrate/route.ts` | Cao, nên xoá |
| `/api/cron/*` bị middleware redirect về /login nên crontab không gọi được | `src/middleware.ts` | Đã sửa |
| Không có lớp lưu file (chỉ lưu URL dạng text) | toàn hệ thống | Chặn các tính năng upload |
| `ActivityLog` chỉ ghi vài hành động, không ghi lượt truy cập trang | `activity.ts` | Chặn phân tích tần suất |
| Không có rate limit (login, check-in, upload) | — | Trung bình |
| Phân quyền kiểm tra rải rác từng action, có helper `requireMentorshipAccess` nhưng chưa dùng nhất quán | `permissions.ts` | Cao (rò dữ liệu chéo cặp) |

## Đã có sẵn, tái sử dụng

Onboarding mentee (`MenteeProfile`: strengths, weaknesses, challenges, expectations), `Meeting` (location, meetingUrl, QR), `SessionReflection`, `Procedure` + `ProcedureSubmission` (nộp file/form/link, duyệt), `SupportTicket`, `Wiki`, `MentorNote`, `AuditLog`, `FacilitatorAssignment`, thông báo + email.

## Phase 0 – Nền tảng (làm trước)
1. Lớp lưu file: Supabase Storage, bucket private, signed URL, giới hạn loại và dung lượng, kiểm tra quyền trước khi ký URL.
2. `requireMeetingAccess`, `requireMenteeAccess` dùng chung; rà toàn bộ action đọc dữ liệu theo mentee.
3. Rate limit và security headers (CSP, HSTS), xoá `/api/migrate`.
4. Keep-alive Supabase: `/api/cron/keepalive` + `.github/workflows/keepalive.yml` (đã làm).

## Phase 1 – Mentee
1. Check-in tự động theo cửa sổ giờ (mở từ `scheduledAt - 15'` đến `scheduledAt + duration`), không cần mentor bật mã. Server kiểm tra: thuộc mentorship, trong khung giờ, chưa check-in; bắt buộc selfie (chụp trực tiếp bằng camera, lưu private, có timestamp server); ghi IP, user agent, device hash; GPS tuỳ chọn cho họp offline.
2. Thu hoạch sau họp: dùng `SessionReflection`, thêm file đính kèm và hạn nộp (ví dụ 48 giờ), trạng thái `draft/submitted/reviewed`.
3. Mục "Bài tập / thực hành": nộp file hoặc link, dựa trên `ProcedureSubmission` hoặc model `Assignment` mới có `dueAt`, trạng thái, nhận xét.
4. Bỏ bài test đầu vào, giữ form profile, liên hệ, điểm mạnh/yếu, kỹ năng mềm, khó khăn, mong muốn (mở rộng `MenteeProfile`).

## Phase 2 – Facilitator và Mentor
- Facilitator: trang hồ sơ 360 độ của từng mentee (profile, chuyên cần, thu hoạch, bài nộp, ticket, mức độ hoạt động), tạo/sửa buổi họp với link online hoặc phòng offline, thông báo tự động cho mentee.
- Mentor: danh sách mentee của mình, hộp "chờ nhận xét" (thu hoạch và bài nộp chưa phản hồi), nhận xét theo từng bài, ghi chú riêng.

## Phase 3 – Hệ thống
- Ticket hỏi đáp: thêm trạng thái `open → answered → resolved`, gắn vào buổi họp hoặc bài nộp, SLA nhắc mentor trả lời, chuyển thành mục wiki khi đã giải đáp.
- Wiki: ghim, tag, tìm kiếm, lưu file và link tham chiếu theo nhóm.
- Xuất dữ liệu: CSV log truy cập và hoạt động (có lọc theo thời gian, nhóm, mentee).
- Chỉ số nhiệt tình (engagement score 0–100): chuyên cần, đúng giờ check-in, tỉ lệ nộp thu hoạch đúng hạn, tỉ lệ nộp bài, số lần đăng nhập, ticket/tương tác.

## Gợi ý để hoàn thiện LMS mini
Nên thêm: nhắc việc tự động (sắp tới hạn, quá hạn, vắng mặt liên tiếp), cảnh báo sớm mentee có nguy cơ bỏ cuộc, rubric đánh giá cho nhận xét, đánh giá cuối kỳ hai chiều, mục tiêu SMART theo kỳ, xuất báo cáo PDF cho lãnh đạo viện, nhật ký thay đổi (audit) hiển thị cho admin, sao lưu DB định kỳ.
Có thể bỏ hoặc gộp bớt (tùy mức dùng thực tế): whiteboard/slides/chat/posts nếu nhóm chat đã đảm nhận, habits/daily diary trùng với thu hoạch và todo, ranking nếu không công khai.
