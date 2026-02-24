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

function GoogleIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
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
                redirect: false,
            });

            if (result?.error) {
                setError("Email hoặc mật khẩu không chính xác");
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err) {
            setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        setError(null);
        try {
            await signIn("google", { callbackUrl });
        } catch (err) {
            setError("Đã xảy ra lỗi khi đăng nhập bằng Google.");
            setIsGoogleLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md p-8">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-foreground">Chào mừng trở lại</h1>
                <p className="text-muted-foreground mt-2 text-sm">Đăng nhập vào hệ thống Tulie TSS Mentoring</p>
            </div>

            {/* Google Login */}
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 h-10 px-4 rounded-[6px] border border-border bg-card text-sm font-medium text-foreground hover:bg-muted hover:border-foreground/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGoogleLoading ? (
                    <div className="w-4 h-4 border-2 border-border border-t-black rounded-full animate-spin" />
                ) : (
                    <GoogleIcon />
                )}
                Đăng nhập bằng Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">hoặc</span>
                <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/5 rounded-[6px] border border-destructive/10">
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
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    error={errors.password?.message}
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
