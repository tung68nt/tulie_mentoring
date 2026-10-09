// Giới hạn tần suất trong bộ nhớ (phù hợp 1 instance Docker/VPS). Nếu scale nhiều instance, chuyển sang Redis.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || b.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        if (buckets.size > 10_000) for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
        return { ok: true, retryAfterSec: 0 };
    }
    b.count++;
    return { ok: b.count <= max, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
}
