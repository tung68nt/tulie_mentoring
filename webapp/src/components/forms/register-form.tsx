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
import { Captcha } from "./captcha";
import { useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export function RegisterForm({ logoUrl, siteName = "IMP" }: { logoUrl?: string; siteName?: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const captchaRef = useRef<ReCAPTCHA>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema) as any,
        defaultValues: {
            role: "mentee",
            captchaToken: "",
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
                captchaRef.current?.reset();
                setValue("captchaToken", "");
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
                <h1 className="text-2xl font-bold text-foreground no-uppercase">Tham gia chương trình</h1>
                <p className="text-muted-foreground mt-2 text-sm">Trở thành một phần của {siteName}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/5 rounded-md border border-destructive/10">
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

                <Captcha
                    ref={captchaRef}
                    onChange={(token) => setValue("captchaToken", token || "")}
                    error={errors.captchaToken?.message}
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
