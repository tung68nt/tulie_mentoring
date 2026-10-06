import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email/service";

/**
 * POST /api/email/test
 * Gửi email test để kiểm tra cấu hình SMTP
 * Chỉ admin mới được dùng
 */
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to } = await request.json();
    const recipient = to || session.user.email;

    if (!recipient) {
        return NextResponse.json({ error: "Không có email nhận" }, { status: 400 });
    }

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 500px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e4e4e7; text-align: center; }
    h1 { font-size: 20px; color: #18181b; margin: 0 0 8px; }
    p { font-size: 14px; color: #71717a; line-height: 1.6; margin: 0; }
    .badge { display: inline-block; padding: 6px 16px; background: #dcfce7; color: #16a34a; border-radius: 999px; font-size: 12px; font-weight: 600; margin-top: 16px; }
    .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #a1a1aa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div style="font-size: 40px; margin-bottom: 16px;">✅</div>
      <h1>Email test thành công!</h1>
      <p>Cấu hình SMTP của bạn đang hoạt động bình thường.</p>
      <div class="badge">SMTP OK</div>
    </div>
    <div class="footer">
      Tulie Mentoring · Đây là email test từ hệ thống.
    </div>
  </div>
</body>
</html>`;

    try {
        const success = await sendEmail({
            to: recipient,
            subject: "[Tulie] Email test — Cấu hình SMTP thành công ✅",
            html,
        });

        if (success) {
            return NextResponse.json({ ok: true, message: `Đã gửi email test đến ${recipient}` });
        } else {
            return NextResponse.json(
                { ok: false, message: "Không thể gửi email. Kiểm tra cấu hình SMTP (host, port, user, password)." },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { ok: false, message: `Lỗi: ${String(error)}` },
            { status: 500 }
        );
    }
}
