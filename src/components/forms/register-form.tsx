"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { signIn } from "next-auth/react";

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

export function RegisterForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema) as any,
        defaultValues: {
            role: "mentee",
        },
    });

    const onSubmit = async (data: RegisterInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                router.push("/login?registered=true");
            } else {
                const result = await response.json();
                setError(result.message || "Đã xảy ra lỗi khi đăng ký");
            }
        } catch (err) {
            setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setIsGoogleLoading(true);
        setError(null);
        try {
            await signIn("google", { callbackUrl: "/" });
        } catch (err) {
            setError("Đã xảy ra lỗi khi đăng ký bằng Google.");
            setIsGoogleLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md p-8">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-foreground">Tham gia chương trình</h1>
                <p className="text-muted-foreground mt-2 text-sm">Dành cho cả Mentors và Mentees</p>
            </div>

            {/* Google Register */}
            <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 h-10 px-4 rounded-[6px] border border-border bg-card text-sm font-medium text-foreground hover:bg-muted hover:border-foreground/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGoogleLoading ? (
                    <div className="w-4 h-4 border-2 border-border border-t-black rounded-full animate-spin" />
                ) : (
                    <GoogleIcon />
                )}
                Đăng ký bằng Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">hoặc</span>
                <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/5 rounded-[6px] border border-destructive/10">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Họ"
                        placeholder="Nguyễn"
                        {...register("firstName")}
                        error={errors.firstName?.message}
                    />
                    <Input
                        label="Tên"
                        placeholder="An"
                        {...register("lastName")}
                        error={errors.lastName?.message}
                    />
                </div>

                <Input
                    label="Email"
                    type="email"
                    placeholder="user@example.com"
                    {...register("email")}
                    error={errors.email?.message}
                />

                <Select
                    label="Bạn tham gia với vai trò"
                    options={[
                        { value: "mentee", label: "Mentee (Sinh viên)" },
                        { value: "mentor", label: "Mentor (Chuyên gia)" },
                    ]}
                    {...register("role")}
                    error={errors.role?.message}
                />

                <Input
                    label="Mật khẩu"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    error={errors.password?.message}
                />

                <Input
                    label="Xác nhận mật khẩu"
                    type="password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Đăng ký ngay
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                    Đã có tài khoản?{" "}
                    <button
                        onClick={() => router.push("/login")}
                        className="font-semibold text-foreground hover:underline"
                    >
                        Đăng nhập
                    </button>
                </p>
            </div>
        </Card>
    );
}
