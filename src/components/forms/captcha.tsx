
"use client";

import ReCAPTCHA from "react-google-recaptcha";
import { forwardRef } from "react";

interface CaptchaProps {
    onChange: (token: string | null) => void;
    error?: string;
}

export const Captcha = forwardRef<ReCAPTCHA, CaptchaProps>(({ onChange, error }, ref) => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
        if (process.env.NODE_ENV === "development") {
            return (
                <div className="p-3 text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md">
                    CAPTCHA is disabled in development (missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
                </div>
            );
        }
        return null;
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-center">
                <ReCAPTCHA
                    ref={ref}
                    sitekey={siteKey}
                    onChange={onChange}
                />
            </div>
            {error && <p className="text-xs text-destructive text-center">{error}</p>}
        </div>
    );
});

Captcha.displayName = "Captcha";
