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

export function RegisterForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
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

    return (
        <Card className="w-full max-w-md p-8">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Tham gia chương trình</h1>
                <p className="text-gray-500 mt-2">Dành cho cả Mentors và Mentees</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
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

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                    Đã có tài khoản?{" "}
                    <button
                        onClick={() => router.push("/login")}
                        className="font-semibold text-gray-900 hover:underline"
                    >
                        Đăng nhập
                    </button>
                </p>
            </div>
        </Card>
    );
}
