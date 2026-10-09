# Thiết lập Supabase Storage và keep-alive

## 1. Biến môi trường (VPS / `.env`)

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>      # CHỈ server, không bao giờ đưa vào NEXT_PUBLIC_*
SUPABASE_STORAGE_BUCKET=tulie-files
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>          # public; bucket private và không có policy nên anon không đọc/ghi được gì
CRON_SECRET=<chuỗi ngẫu nhiên dài>
```

GitHub Secrets cần thêm cho workflow deploy: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (nhúng lúc build), `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` (tuỳ chọn, mặc định `tulie-files`), `APP_URL`, `CRON_SECRET`.

## 2. Tạo bucket

Supabase Dashboard → Storage → New bucket: tên `tulie-files`, **Private** (không bật Public).
Không tạo policy nào cho `anon`/`authenticated`: mọi đọc/ghi đi qua signed URL do server cấp sau khi kiểm tra quyền.

## 3. Cập nhật schema

```
npx prisma db push
```

(thêm bảng `FileAsset`, `Submission`; cột mới ở `Attendance`, `SessionReflection`, `MenteeProfile`)

## 4. Keep-alive (chống Supabase tự pause sau 7 ngày)

GitHub → Settings → Secrets and variables → Actions: thêm `APP_URL` (vd `https://mentoring.tulie.vn`) và `CRON_SECRET`.
Workflow `.github/workflows/keepalive.yml` gọi `/api/cron/keepalive` mỗi 2 ngày, đồng thời dọn file upload dở dang.
GitHub sẽ tắt workflow theo lịch nếu repo không có commit nào trong 60 ngày; có thể gọi thêm từ crontab VPS:

```
0 3 */2 * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://mentoring.tulie.vn/api/cron/keepalive
```

## 5. Phân quyền dữ liệu

- Mentee: chỉ thấy dữ liệu của mình.
- Mentor: chỉ thấy mentee thuộc mentorship của mình; nhận xét thu hoạch và bài nộp.
- Facilitator: xem mentee trong mentorship / program được giao (`FacilitatorAssignment`); tạo và sửa buổi họp trong phạm vi đó.
- Admin, program_manager, manager: xem toàn bộ (manager chỉ đọc).

## 6. Đăng nhập Google

Mặc định bất kỳ tài khoản Google nào cũng được tự tạo thành mentee. Nếu chương trình đóng, đặt `GOOGLE_AUTO_CREATE=false`
(thêm vào docker-compose.prod.yml) để chỉ cho email đã được admin tạo trước.
