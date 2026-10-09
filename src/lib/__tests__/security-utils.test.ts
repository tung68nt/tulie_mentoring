import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/rate-limit";
import { buildObjectPath, sanitizeFileName, FILE_RULES } from "@/lib/storage";
import { httpUrlSchema } from "@/lib/validators";

describe("rateLimit", () => {
    it("blocks after max attempts inside the window", () => {
        const key = `t:${Math.random()}`;
        for (let i = 0; i < 3; i++) expect(rateLimit(key, 3, 60_000).ok).toBe(true);
        expect(rateLimit(key, 3, 60_000).ok).toBe(false);
    });
});

describe("storage helpers", () => {
    it("builds server-controlled object paths without user input", () => {
        const p = buildObjectPath("selfie", "user1", "image/jpeg");
        expect(p).toMatch(/^selfie\/user1\/[0-9a-f-]{36}\.jpg$/);
    });
    it("sanitizes file names", () => {
        expect(sanitizeFileName("../../etc/pa:ss*wd.pdf")).not.toMatch(/[\\/:*]/);
        expect(sanitizeFileName("")).toBe("file");
    });
    it("selfie accepts only jpeg", () => {
        expect(Object.keys(FILE_RULES.selfie.types)).toEqual(["image/jpeg"]);
    });
});

describe("httpUrlSchema", () => {
    it("rejects javascript: and data: urls", () => {
        expect(httpUrlSchema.safeParse("javascript:alert(1)").success).toBe(false);
        expect(httpUrlSchema.safeParse("data:text/html;base64,AAA").success).toBe(false);
        expect(httpUrlSchema.safeParse("https://example.com/x").success).toBe(true);
    });
});
