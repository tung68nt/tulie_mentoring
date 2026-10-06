export async function verifyCaptcha(token: string | undefined | null) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        // No secret key configured — skip captcha verification
        // This allows login to work even if RECAPTCHA is not set up
        console.warn("RECAPTCHA_SECRET_KEY is not defined. Skipping captcha verification.");
        return { success: true };
    }

    if (!token) {
        return { success: false, error: "Captcha token is missing" };
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
