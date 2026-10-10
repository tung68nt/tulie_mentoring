"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Captcha } from "./captcha";
import { useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export function LoginForm({ logoUrl, siteName = "IMP 2026" }: { logoUrl?: string; siteName?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const captchaRef = useRef<ReCAPTCHA>(null);

    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema) as any,
    });

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                captchaToken: data.captchaToken,
                redirect: false,
            });

            if (result?.error) {
                if (result.error === "Captcha verification failed") {
                    setError("Xác minh Captcha không thành công");
                } else {
                    setError("Email hoặc mật khẩu không chính xác");
                }
                captchaRef.current?.reset();
                setValue("captchaToken", "");
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err) {
            setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
            captchaRef.current?.reset();
            setValue("captchaToken", "");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md p-8">
            <div className="text-center mb-8">
                {logoUrl ? (
                    <div className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-border/50 shadow-xs mx-auto mb-6">
                        <img src={logoUrl} alt={siteName} className="h-12 w-auto object-contain" />
                    </div>
                ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                        <span className="text-primary font-bold text-xl">{siteName.charAt(0)}</span>
                    </div>
                )}
                <h1 className="text-2xl font-bold text-foreground no-uppercase">Chào mừng trở lại</h1>
                <p className="text-muted-foreground mt-2 text-sm">Đăng nhập vào hệ thống {siteName}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/5 rounded-md border border-destructive/10">
                        {error}
                    </div>
                )}

                <Input
                    label="Email"
                    type="email"
                    placeholder="user@imp.edu.vn"
                    {...register("email")}
                    error={errors.email?.message}
                />

                <Input
                    label="Mật khẩu"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    error={errors.password?.message}
                    endIcon={
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground hover:text-foreground focus:outline-none"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                            )}
                        </button>
                    }
                />

                <Captcha
                    ref={captchaRef}
                    onChange={(token) => setValue("captchaToken", token || "")}
                    error={errors.captchaToken?.message}
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Đăng nhập
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                    Chưa có tài khoản?{" "}
                    <button
                        onClick={() => router.push("/register")}
                        className="font-semibold text-foreground hover:underline"
                    >
                        Đăng ký tham gia
                    </button>
                </p>
            </div>

        </Card>
    );
}
