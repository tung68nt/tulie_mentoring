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

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const [isLoading, setIsLoading] = useState(false);
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

    return (
        <Card className="w-full max-w-md p-8">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-black">Chào mừng trở lại</h1>
                <p className="text-[#666] mt-2 text-sm">Đăng nhập vào hệ thống IMP Mentoring</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="p-3 text-sm text-[#ee0000] bg-[#ee0000]/5 rounded-[6px] border border-[#ee0000]/10">
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

            <div className="mt-8 pt-6 border-t border-[#eaeaea] text-center">
                <p className="text-sm text-[#666]">
                    Chưa có tài khoản?{" "}
                    <button
                        onClick={() => router.push("/register")}
                        className="font-semibold text-black hover:underline"
                    >
                        Đăng ký tham gia
                    </button>
                </p>
            </div>

            <div className="mt-6 p-4 bg-[#fafafa] rounded-[8px] border border-[#eaeaea]">
                <p className="text-xs font-medium text-[#999] mb-2">
                    Tài khoản Demo
                </p>
                <div className="space-y-1 text-xs text-[#666]">
                    <p>Admin: admin@imp.edu.vn / password123</p>
                    <p>Mentor: mentor1@imp.edu.vn / password123</p>
                    <p>Mentee: mentee1@imp.edu.vn / password123</p>
                </div>
            </div>
        </Card>
    );
}
