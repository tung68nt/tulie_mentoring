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

## 7. Sao lưu database

Workflow `.github/workflows/db-backup.yml` chạy mỗi ngày, dump schema `public`, nén và mã hoá AES-256 rồi lưu làm artifact 14 ngày.
Secrets cần thêm:
- `BACKUP_DATABASE_URL`: chuỗi kết nối **Session pooler** của Supabase (cổng 5432 trên host `pooler.supabase.com`). Không dùng host trực tiếp `db.<ref>.supabase.co` vì chỉ có IPv6 nên runner GitHub không kết nối được.
- `BACKUP_PASSPHRASE`: chuỗi ngẫu nhiên dài. **Hãy lưu riêng ở nơi an toàn**: mất chuỗi này thì không giải mã được bản sao lưu.

Giải mã và khôi phục:

```
gpg --decrypt backup-YYYYMMDD.sql.gz.gpg | gunzip | psql "$DATABASE_URL"
```

Lưu ý: file lưu trên Supabase Storage (selfie, tệp nộp) không nằm trong bản dump này. Cần sao lưu bucket riêng nếu muốn đầy đủ.

## 8. Triển khai trên Vercel

1. Vercel → Add New Project → import repo `tung68nt/tulie_mentoring`. Framework: Next.js (tự nhận). Production Branch: `main`; các nhánh khác tự có bản Preview.
2. Settings → Environment Variables (đặt cho Production và Preview):

| Biến | Ghi chú |
|---|---|
| `DATABASE_URL` | Supabase **Transaction pooler** (cổng 6543, thêm `?pgbouncer=true`) |
| `DIRECT_URL` | Session pooler (cổng 5432), dùng cho `prisma db push` |
| `AUTH_SECRET`, `NEXTAUTH_URL` | `NEXTAUTH_URL` là domain Vercel/domain chính thức |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable key (public) |
| `SUPABASE_URL` | cùng giá trị `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | secret key, **chỉ nhập trong Vercel, không đưa vào chat/code** |
| `SUPABASE_STORAGE_BUCKET` | `tulie-files` |
| `CRON_SECRET` | Vercel Cron tự gửi `Authorization: Bearer <CRON_SECRET>` |
| `SMTP_*`, `AUTH_GOOGLE_ID/SECRET` | như hiện có |

3. `vercel.json` đã khai báo cron: keepalive (chống Supabase pause) và nhắc việc, mỗi ngày một lần (giới hạn gói Hobby).
4. Áp schema một lần từ máy có `.env`: `npx prisma db push`.
5. Lưu ý: whiteboard dùng Socket.IO cần server riêng, không chạy được trên Vercel; phần còn lại của app hoạt động bình thường.
