/**
 * HTML Email Templates for Tulie Mentoring
 * Tất cả template responsive, clean design, tiếng Việt
 */

const baseLayout = (content: string) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e4e4e7; }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { font-size: 20px; color: #18181b; margin: 0 0 4px; font-weight: 600; }
    .header p { font-size: 13px; color: #71717a; margin: 0; }
    .content { color: #3f3f46; font-size: 14px; line-height: 1.6; }
    .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f4f4f5; }
    .detail-label { color: #71717a; font-size: 13px; min-width: 100px; }
    .detail-value { color: #18181b; font-size: 13px; font-weight: 500; }
    .btn { display: inline-block; padding: 10px 24px; background: #18181b; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 500; margin-top: 20px; }
    .btn:hover { background: #27272a; }
    .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #a1a1aa; }
    .emoji { font-size: 28px; margin-bottom: 12px; }
    table.details { width: 100%; border-collapse: collapse; margin: 16px 0; }
    table.details td { padding: 8px 0; font-size: 13px; border-bottom: 1px solid #f4f4f5; }
    table.details td:first-child { color: #71717a; width: 120px; }
    table.details td:last-child { color: #18181b; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      ${content}
    </div>
    <div class="footer">
      Tulie Mentoring · Bạn nhận được email này vì là thành viên của chương trình mentoring.
    </div>
  </div>
</body>
</html>
`;

// ─── Meeting Reminder ─────────────────────────────────────────────

export function meetingReminderTemplate(params: {
    meetingTitle: string;
    scheduledAt: string;
    duration: number;
    location?: string | null;
    meetingUrl?: string | null;
    type: string;
    link: string;
    timeUntil: string;
}) {
    const locationInfo = params.type === "online"
        ? params.meetingUrl || "Link sẽ được gửi sau"
        : params.location || "Chưa xác định";

    return baseLayout(`
        <div class="header">
            <div class="emoji">📅</div>
            <h1>Nhắc lịch họp</h1>
            <p>Cuộc họp sắp diễn ra trong ${params.timeUntil}</p>
        </div>
        <div class="content">
            <table class="details">
                <tr><td>Tiêu đề</td><td>${params.meetingTitle}</td></tr>
                <tr><td>Thời gian</td><td>${params.scheduledAt}</td></tr>
                <tr><td>Thời lượng</td><td>${params.duration} phút</td></tr>
                <tr><td>Hình thức</td><td>${params.type === "online" ? "🌐 Online" : "🏢 Offline"}</td></tr>
                <tr><td>Địa điểm</td><td>${locationInfo}</td></tr>
            </table>
            <div style="text-align: center;">
                <a href="${params.link}" class="btn">Xem chi tiết cuộc họp</a>
            </div>
        </div>
    `);
}

// ─── Meeting Created ──────────────────────────────────────────────

export function meetingCreatedTemplate(params: {
    meetingTitle: string;
    scheduledAt: string;
    creatorName: string;
    link: string;
}) {
    return baseLayout(`
        <div class="header">
            <div class="emoji">🆕</div>
            <h1>Cuộc họp mới</h1>
            <p>${params.creatorName} đã tạo cuộc họp mới</p>
        </div>
        <div class="content">
            <table class="details">
                <tr><td>Tiêu đề</td><td>${params.meetingTitle}</td></tr>
                <tr><td>Thời gian</td><td>${params.scheduledAt}</td></tr>
                <tr><td>Người tạo</td><td>${params.creatorName}</td></tr>
            </table>
            <div style="text-align: center;">
                <a href="${params.link}" class="btn">Xem cuộc họp</a>
            </div>
        </div>
    `);
}

// ─── Minutes Created ──────────────────────────────────────────────

export function minutesCreatedTemplate(params: {
    meetingTitle: string;
    authorName: string;
    link: string;
}) {
    return baseLayout(`
        <div class="header">
            <div class="emoji">📝</div>
            <h1>Biên bản cuộc họp</h1>
            <p>Biên bản đã được tạo cho cuộc họp</p>
        </div>
        <div class="content">
            <table class="details">
                <tr><td>Cuộc họp</td><td>${params.meetingTitle}</td></tr>
                <tr><td>Người viết</td><td>${params.authorName}</td></tr>
            </table>
            <div style="text-align: center;">
                <a href="${params.link}" class="btn">Xem biên bản</a>
            </div>
        </div>
    `);
}

// ─── Task Deadline Reminder ───────────────────────────────────────

export function taskDeadlineTemplate(params: {
    taskTitle: string;
    dueDate: string;
    priority: string;
    link: string;
    timeUntil: string;
}) {
    const priorityLabel: Record<string, string> = {
        low: "🟢 Thấp",
        medium: "🟡 Trung bình",
        high: "🔴 Cao",
    };

    return baseLayout(`
        <div class="header">
            <div class="emoji">⏰</div>
            <h1>Nhắc deadline công việc</h1>
            <p>Công việc sắp đến hạn trong ${params.timeUntil}</p>
        </div>
        <div class="content">
            <table class="details">
                <tr><td>Công việc</td><td>${params.taskTitle}</td></tr>
                <tr><td>Deadline</td><td>${params.dueDate}</td></tr>
                <tr><td>Ưu tiên</td><td>${priorityLabel[params.priority] || params.priority}</td></tr>
            </table>
            <div style="text-align: center;">
                <a href="${params.link}" class="btn">Xem công việc</a>
            </div>
        </div>
    `);
}

// ─── Meeting Status Update ────────────────────────────────────────

export function meetingStatusTemplate(params: {
    meetingTitle: string;
    newStatus: string;
    link: string;
}) {
    const statusLabel: Record<string, string> = {
        scheduled: "📋 Đã lên lịch",
        ongoing: "▶️ Đang diễn ra",
        completed: "✅ Hoàn thành",
        cancelled: "❌ Đã hủy",
    };

    return baseLayout(`
        <div class="header">
            <div class="emoji">🔄</div>
            <h1>Cập nhật cuộc họp</h1>
            <p>Trạng thái cuộc họp đã thay đổi</p>
        </div>
        <div class="content">
            <table class="details">
                <tr><td>Cuộc họp</td><td>${params.meetingTitle}</td></tr>
                <tr><td>Trạng thái</td><td>${statusLabel[params.newStatus] || params.newStatus}</td></tr>
            </table>
            <div style="text-align: center;">
                <a href="${params.link}" class="btn">Xem chi tiết</a>
            </div>
        </div>
    `);
}
