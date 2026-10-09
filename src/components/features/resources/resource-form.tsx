"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentPicker, type PickedFile } from "@/components/features/files/attachment-picker";
import { createResource } from "@/lib/actions/resource";

type Props = {
    canPublic: boolean;
    mentorships: { id: string; label: string }[];
};

export function ResourceForm({ canPublic, mentorships }: Props) {
    const router = useRouter();
    const [type, setType] = useState<"link" | "file" | "document">("link");
    const [visibility, setVisibility] = useState<"public" | "group" | "private">(mentorships.length ? "group" : "private");
    const [mentorshipId, setMentorshipId] = useState(mentorships[0]?.id ?? "");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [category, setCategory] = useState("Tài liệu");
    const [files, setFiles] = useState<PickedFile[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await createResource({
                title, description, type, linkUrl, category, visibility,
                mentorshipId: visibility === "group" ? mentorshipId : undefined,
                fileIds: type === "file" ? files.map((f) => f.fileId) : [],
            });
            router.push("/resources");
            router.refresh();
        } catch (err: any) {
            setError(err?.message || "Đã xảy ra lỗi khi tạo tài liệu");
        } finally {
            setBusy(false);
        }
    }

    const visibilityOptions = [
        ...(canPublic ? [{ value: "public", label: "Công khai (tất cả)" }] : []),
        ...(mentorships.length ? [{ value: "group", label: "Nhóm mentoring của tôi" }] : []),
        { value: "private", label: "Riêng tư" },
    ];

    return (
        <Card className="w-full max-w-xl mx-auto p-8">
            <form onSubmit={onSubmit} className="space-y-5">
                {error && <div className="p-3 text-sm text-destructive bg-destructive/5 rounded-lg border border-destructive/10">{error}</div>}

                <Input label="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />

                <div className="grid grid-cols-2 gap-4">
                    <Select label="Loại" value={type} onValueChange={(v) => setType(v as any)}
                        options={[{ value: "link", label: "Liên kết (URL)" }, { value: "file", label: "Tệp tải lên" }, { value: "document", label: "Ghi chú" }]} />
                    <Select label="Danh mục" value={category} onValueChange={(v) => setCategory(v)}
                        options={["Tài liệu", "Biểu mẫu", "Video", "Sách điện tử", "Khác"].map((v) => ({ value: v, label: v }))} />
                </div>

                {type === "link" && (
                    <Input label="URL liên kết" type="url" placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} maxLength={500} required />
                )}
                {type === "file" && <AttachmentPicker purpose="resource" value={files} onChange={setFiles} max={1} />}

                <Select label="Phạm vi hiển thị" value={visibility} onValueChange={(v) => setVisibility(v as any)} options={visibilityOptions} />
                {visibility === "group" && mentorships.length > 1 && (
                    <Select label="Nhóm" value={mentorshipId} onValueChange={(v) => setMentorshipId(v)}
                        options={mentorships.map((m) => ({ value: m.id, label: m.label }))} />
                )}

                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={3000}
                    placeholder={type === "document" ? "Nội dung ghi chú..." : "Mô tả ngắn về tài liệu..."} />

                <div className="flex items-center gap-4 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Hủy</Button>
                    <Button type="submit" className="flex-1" disabled={busy || !title.trim()}>{busy ? "Đang lưu..." : "Lưu tài liệu"}</Button>
                </div>
            </form>
        </Card>
    );
}
