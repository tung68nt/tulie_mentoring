
export async function verifyCaptcha(token: string | null) {
    if (!token) {
        return { success: false, error: "Captcha token is missing" };
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        console.warn("RECAPTCHA_SECRET_KEY is not defined in environment variables.");
        // In development, we might want to skip verification if no key is provided
        if (process.env.NODE_ENV === "development") {
            return { success: true };
        }
        return { success: false, error: "Captcha configuration error" };
    }

    try {
        const response = await fetch(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
            { method: "POST" }
        );

        const data = await response.json();
        return {
            success: data.success,
            error: data.success ? null : "Captcha verification failed",
            score: data.score, // for v3
            action: data.action // for v3
        };
    } catch (error) {
        console.error("Captcha verification error:", error);
        return { success: false, error: "Failed to verify captcha" };
    }
}
