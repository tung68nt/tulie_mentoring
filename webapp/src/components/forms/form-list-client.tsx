"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, FileText, Settings2, BarChart, Trash, ToggleRight } from "lucide-react";
import { createEvaluationForm, deleteEvaluationForm, toggleFormActive } from "@/lib/actions/evaluation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormItem {
    id: string;
    title: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count: { questions: number; responses: number };
}

export function FormListClient({ forms: initialForms }: { forms: FormItem[] }) {
    const router = useRouter();
    const [forms, setForms] = useState(initialForms);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [creating, setCreating] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!newTitle.trim()) { toast.error("Vui lòng nhập tiêu đề"); return; }
        setCreating(true);
        try {
            const form = await createEvaluationForm({ title: newTitle, description: newDescription || undefined });
            toast.success("Đã tạo form mới");
            setShowCreate(false);
            setNewTitle("");
            setNewDescription("");
            router.push(`/facilitator/forms/${form.id}`);
        } catch {
            toast.error("Lỗi khi tạo form");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteEvaluationForm(id);
            setForms(forms.filter(f => f.id !== id));
            setDeleteId(null);
            toast.success("Đã xóa form");
        } catch {
            toast.error("Lỗi khi xóa form");
        }
    };

    const handleToggle = async (id: string) => {
        try {
            const updated = await toggleFormActive(id);
            setForms(forms.map(f => f.id === id ? { ...f, isActive: updated.isActive } : f));
            toast.success(updated.isActive ? "Đã kích hoạt form" : "Đã tắt form");
        } catch {
            toast.error("Lỗi khi thay đổi trạng thái");
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-semibold text-foreground">Biểu mẫu đánh giá</h2>
                    <p className="text-sm text-muted-foreground mt-1">Thiết kế và tùy chỉnh các biểu mẫu đánh giá tiến độ mentorship.</p>
                </div>
                <Button className="gap-2" onClick={() => setShowCreate(true)}>
                    <Plus className="w-4 h-4" /> Tạo Form mới
                </Button>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {forms.map((form) => (
                    <Card key={form.id} className="group shadow-none hover:ring-1 hover:ring-primary/20 transition-all">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Badge variant={form.isActive ? "secondary" : "outline"}
                                        className={form.isActive ? "bg-emerald-500/10 text-emerald-600 border-none text-[10px]" : "text-[10px]"}>
                                        {form.isActive ? "Hoạt động" : "Nháp"}
                                    </Badge>
                                </div>
                            </div>
                            <CardTitle className="text-base font-semibold">{form.title}</CardTitle>
                            <CardDescription className="line-clamp-2 text-xs">
                                {form.description || "Chưa có mô tả."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-3">
                            <div className="flex items-center gap-6 text-xs">
                                <div>
                                    <span className="text-muted-foreground">Câu hỏi</span>
                                    <span className="ml-1.5 font-bold">{form._count.questions}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Phản hồi</span>
                                    <span className="ml-1.5 font-bold">{form._count.responses}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="gap-2 flex-wrap">
                            <Link href={`/facilitator/forms/${form.id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                                    <Settings2 className="w-3.5 h-3.5" /> Câu hỏi
                                </Button>
                            </Link>
                            <Link href={`/facilitator/forms/${form.id}/responses`}>
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                    <BarChart className="w-3.5 h-3.5" /> {form._count.responses}
                                </Button>
                            </Link>
                            <Button variant="ghost" size="icon-xs" onClick={() => handleToggle(form.id)} title={form.isActive ? "Tắt" : "Bật"}>
                                <ToggleRight className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon-xs" className="text-destructive/50 hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(form.id)} title="Xóa">
                                <Trash className="w-3.5 h-3.5" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {forms.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-xl">
                        <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground font-medium mb-4">Bạn chưa tạo biểu mẫu nào.</p>
                        <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
                            <Plus className="w-3.5 h-3.5" /> Tạo ngay
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Tạo biểu mẫu mới</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <Input label="Tiêu đề" placeholder="Ví dụ: Đánh giá giữa kỳ Mentorship" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                        <Input label="Mô tả (tùy chọn)" placeholder="Mô tả ngắn về biểu mẫu này..." value={newDescription} onChange={e => setNewDescription(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowCreate(false)}>Hủy</Button>
                        <Button onClick={handleCreate} isLoading={creating} className="gap-1.5">
                            <Plus className="w-3.5 h-3.5" /> Tạo form
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Xóa biểu mẫu</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">Tất cả câu hỏi và phản hồi sẽ bị xóa vĩnh viễn. Bạn có chắc?</p>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDeleteId(null)}>Hủy</Button>
                        <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Xóa vĩnh viễn</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
