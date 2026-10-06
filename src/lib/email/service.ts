import nodemailer from "nodemailer";

/**
 * Email Service for Tulie Mentoring
 * Sử dụng SMTP transporter qua nodemailer
 *
 * Ưu tiên config:
 * 1. DB SystemSetting (smtp_host, smtp_user, ...) — thay đổi nhanh qua Admin Settings
 * 2. Environment variables (SMTP_HOST, SMTP_USER, ...) — mặc định từ .env
 * 3. Gracefully degrade nếu chưa cấu hình (chỉ log warning)
 */

// ─── Config Helper ────────────────────────────────────────────────

let _cachedDbSettings: Record<string, string> | null = null;
let _cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 1 minute cache

async function getDbSmtpSettings(): Promise<Record<string, string>> {
    const now = Date.now();
    if (_cachedDbSettings && now - _cacheTimestamp < CACHE_TTL) {
        return _cachedDbSettings;
    }

    try {
        // Dynamic import to avoid circular deps
        const { prisma } = await import("@/lib/db");
        const settings = await prisma.systemSetting.findMany({
            where: { key: { startsWith: "smtp_" } },
        });
        _cachedDbSettings = settings.reduce((acc: Record<string, string>, s: { key: string; value: string }) => {
            acc[s.key] = s.value;
            return acc;
        }, {});
        _cacheTimestamp = now;
        return _cachedDbSettings;
    } catch {
        return {};
    }
}

/**
 * Invalidate DB SMTP settings cache (call after admin updates settings)
 */
export function invalidateSmtpCache() {
    _cachedDbSettings = null;
    _cacheTimestamp = 0;
    _transporter = null; // Force transporter recreation
}

async function getSmtpConfig() {
    const db = await getDbSmtpSettings();

    return {
        host: db.smtp_host || process.env.SMTP_HOST || "",
        port: parseInt(db.smtp_port || process.env.SMTP_PORT || "587"),
        user: db.smtp_user || process.env.SMTP_USER || "",
        pass: db.smtp_password || process.env.SMTP_PASSWORD || "",
        from: db.smtp_from || process.env.SMTP_FROM || "Tulie Mentoring <noreply@tulie.vn>",
    };
}

async function isSmtpConfigured(): Promise<boolean> {
    const config = await getSmtpConfig();
    return !!(config.host && config.user && config.pass);
}

let _transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter | null> {
    if (!(await isSmtpConfigured())) {
        return null;
    }

    const config = await getSmtpConfig();

    // Recreate transporter if config changed (cache invalidated)
    _transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: {
            user: config.user,
            pass: config.pass,
        },
    });

    return _transporter;
}

// ─── Send Email ───────────────────────────────────────────────────

export interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
}

/**
 * Gửi email qua SMTP.
 * Trả về true nếu gửi thành công, false nếu lỗi hoặc chưa cấu hình SMTP.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
    const transporter = await getTransporter();

    if (!transporter) {
        console.warn("[EMAIL] SMTP chưa được cấu hình. Bỏ qua gửi email.");
        return false;
    }

    const config = await getSmtpConfig();
    const recipients = Array.isArray(to) ? to.join(", ") : to;

    try {
        await transporter.sendMail({
            from: config.from,
            to: recipients,
            subject,
            html,
        });
        console.log(`[EMAIL] Đã gửi email: "${subject}" → ${recipients}`);
        return true;
    } catch (error) {
        console.error("[EMAIL] Lỗi gửi email:", error);
        return false;
    }
}

/**
 * Gửi email cho nhiều người (mỗi người nhận riêng)
 */
export async function sendEmailToMany(
    recipients: { email: string; name?: string }[],
    subject: string,
    html: string
): Promise<number> {
    if (!(await isSmtpConfigured())) {
        console.warn("[EMAIL] SMTP chưa được cấu hình. Bỏ qua gửi email.");
        return 0;
    }

    let sentCount = 0;
    for (const recipient of recipients) {
        const success = await sendEmail({
            to: recipient.email,
            subject,
            html,
        });
        if (success) sentCount++;
    }

    return sentCount;
}
