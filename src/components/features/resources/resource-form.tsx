"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resourceSchema, type ResourceInput } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { createResource } from "@/lib/actions/resource";

export function ResourceForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResourceInput>({
        resolver: zodResolver(resourceSchema) as any,
        defaultValues: {
            type: "link",
            visibility: "public",
            category: "Tài liệu",
        },
    });

    const resourceType = watch("type");

    const onSubmit = async (data: ResourceInput) => {
        setIsLoading(true);
        setError(null);

        try {
            await createResource({
                title: data.title,
                description: data.description,
                type: data.type,
                linkUrl: data.linkUrl,
                category: data.category || "Khác",
                visibility: data.visibility,
            });
            router.push("/resources");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi khi tạo tài liệu");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-xl mx-auto p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/5 rounded-[8px] border border-destructive/10">
                        {error}
                    </div>
                )}

                <Input
                    label="Tiêu đề tài liệu"
                    placeholder="Tài liệu hướng dẫn Mentoring"
                    {...register("title")}
                    error={errors.title?.message}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Loại tài liệu"
                        options={[
                            { value: "link", label: "Liên kết (URL)" },
                            { value: "document", label: "Tài liệu" },
                            { value: "file", label: "Tệp đính kèm" },
                        ]}
                        {...register("type")}
                        error={errors.type?.message}
                    />
                    <Select
                        label="Danh mục"
                        options={[
                            { value: "Tài liệu", label: "Tài liệu" },
                            { value: "Biểu mẫu", label: "Biểu mẫu" },
                            { value: "Video", label: "Video" },
                            { value: "Sách điện tử", label: "Sách điện tử" },
                            { value: "Khác", label: "Khác" },
                        ]}
                        {...register("category")}
                        error={errors.category?.message}
                    />
                </div>

                {(resourceType === "link") && (
                    <Input
                        label="URL liên kết"
                        type="url"
                        placeholder="https://docs.google.com/..."
                        {...register("linkUrl")}
                        error={errors.linkUrl?.message}
                    />
                )}

                <Select
                    label="Phạm vi hiển thị"
                    options={[
                        { value: "public", label: "Công khai (Tất cả)" },
                        { value: "group", label: "Nhóm (Mentorship)" },
                        { value: "private", label: "Riêng tư" },
                    ]}
                    {...register("visibility")}
                    error={errors.visibility?.message}
                />

                <div className="space-y-1.5">
                    <label className="block text-[12px] font-medium text-muted-foreground">Mô tả</label>
                    <textarea
                        {...register("description")}
                        className="w-full min-h-[100px] p-3 rounded-[8px] border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:border-foreground focus:ring-4 focus:ring-foreground/5 hover:border-foreground/30"
                        placeholder="Mô tả ngắn gọn về tài liệu này..."
                    />
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.back()}
                    >
                        Hủy
                    </Button>
                    <Button type="submit" className="flex-1" isLoading={isLoading}>
                        Tạo tài liệu
                    </Button>
                </div>
            </form>
        </Card>
    );
}
