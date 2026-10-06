"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus, Trash, Save, GripVertical, Copy, ChevronUp, ChevronDown,
    Star, AlignLeft, List, CheckSquare, Hash, Calendar, ChevronsUpDown,
    Type, Edit3, Check, X, ToggleRight, Eye
} from "lucide-react";
import { addQuestion, deleteQuestion, updateQuestion, reorderQuestions, updateEvaluationForm, toggleFormActive, deleteEvaluationForm } from "@/lib/actions/evaluation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

const QUESTION_TYPES = [
    { value: "RATING", label: "Đánh giá sao (1-5)", icon: Star },
    { value: "TEXT", label: "Câu trả lời ngắn", icon: Type },
    { value: "PARAGRAPH", label: "Đoạn văn dài", icon: AlignLeft },
    { value: "MULTIPLE_CHOICE", label: "Trắc nghiệm (chọn 1)", icon: List },
    { value: "CHECKBOX", label: "Hộp kiểm (chọn nhiều)", icon: CheckSquare },
    { value: "SCALE", label: "Thang điểm (1-10)", icon: Hash },
    { value: "DROPDOWN", label: "Danh sách thả xuống", icon: ChevronsUpDown },
    { value: "DATE", label: "Ngày tháng", icon: Calendar },
];

interface Question {
    id: string;
    formId: string;
    type: string;
    label: string;
    options: string | null;
    order: number;
    weight: number;
}

interface FormBuilderProps {
    form: {
        id: string;
        title: string;
        description: string | null;
        isActive: boolean;
        questions: Question[];
        _count: { responses: number };
    };
}

export function FormBuilder({ form }: FormBuilderProps) {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>(form.questions || []);
    const [loading, setLoading] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [formTitle, setFormTitle] = useState(form.title);
    const [formDescription, setFormDescription] = useState(form.description || "");
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // ─── New Question State ────────────────────────────
    const [newQuestion, setNewQuestion] = useState({
        label: "",
        type: "RATING",
        options: "",
        weight: 1.0,
    });

    // ─── Form Title/Description Update ─────────────────
    const handleUpdateForm = async () => {
        try {
            await updateEvaluationForm(form.id, { title: formTitle, description: formDescription || undefined });
            setEditingTitle(false);
            toast.success("Đã cập nhật thông tin form");
        } catch {
            toast.error("Lỗi khi cập nhật form");
        }
    };

    const handleToggleActive = async () => {
        try {
            const updated = await toggleFormActive(form.id);
            toast.success(updated.isActive ? "Form đã được kích hoạt" : "Form đã được tắt");
            router.refresh();
        } catch {
            toast.error("Lỗi khi thay đổi trạng thái");
        }
    };

    const handleDeleteForm = async () => {
        try {
            await deleteEvaluationForm(form.id);
            toast.success("Đã xóa form");
            router.push("/facilitator/forms");
        } catch {
            toast.error("Lỗi khi xóa form");
        }
    };

    // ─── Question CRUD ─────────────────────────────────
    const handleAddQuestion = async () => {
        if (!newQuestion.label) {
            toast.error("Vui lòng nhập câu hỏi");
            return;
        }

        setLoading(true);
        try {
            const data = await addQuestion(form.id, {
                ...newQuestion,
                options: needsOptions(newQuestion.type) ? newQuestion.options : undefined,
                order: questions.length + 1,
            });
            setQuestions([...questions, data]);
            setNewQuestion({ label: "", type: "RATING", options: "", weight: 1.0 });
            toast.success("Đã thêm câu hỏi");
        } catch {
            toast.error("Lỗi khi thêm câu hỏi");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        try {
            await deleteQuestion(id, form.id);
            setQuestions(questions.filter((q) => q.id !== id));
            toast.success("Đã xóa câu hỏi");
        } catch {
            toast.error("Lỗi khi xóa câu hỏi");
        }
    };

    const handleUpdateQuestion = async (id: string, data: Partial<Question>) => {
        try {
            const updated = await updateQuestion(id, form.id, { ...data, options: data.options ?? undefined });
            setQuestions(questions.map(q => q.id === id ? { ...q, ...updated } : q));
            setEditingQuestionId(null);
            toast.success("Đã cập nhật câu hỏi");
        } catch {
            toast.error("Lỗi khi cập nhật câu hỏi");
        }
    };

    const handleDuplicateQuestion = async (q: Question) => {
        setLoading(true);
        try {
            const data = await addQuestion(form.id, {
                label: q.label + " (bản sao)",
                type: q.type,
                options: q.options || undefined,
                order: questions.length + 1,
                weight: q.weight,
            });
            setQuestions([...questions, data]);
            toast.success("Đã nhân bản câu hỏi");
        } catch {
            toast.error("Lỗi khi nhân bản");
        } finally {
            setLoading(false);
        }
    };

    const handleMoveQuestion = async (index: number, direction: "up" | "down") => {
        const newQuestions = [...questions];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

        [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
        setQuestions(newQuestions);

        try {
            await reorderQuestions(form.id, newQuestions.map(q => q.id));
        } catch {
            toast.error("Lỗi khi sắp xếp");
            setQuestions(questions); // revert
        }
    };

    const needsOptions = (type: string) => ["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(type);

    const getTypeIcon = (type: string) => {
        const found = QUESTION_TYPES.find(t => t.value === type);
        return found ? found.icon : Type;
    };

    const getTypeLabel = (type: string) => {
        const found = QUESTION_TYPES.find(t => t.value === type);
        return found?.label || type;
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* ─── Form Header ─────────────────────────────── */}
            <Card className="overflow-hidden shadow-none">
                <div className="h-2 bg-primary" />
                <CardContent className="p-6">
                    {editingTitle ? (
                        <div className="space-y-4">
                            <Input
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className="text-2xl font-bold border-none bg-transparent px-0 h-auto focus-visible:ring-0 focus-visible:border-primary/30"
                                placeholder="Tiêu đề form"
                            />
                            <Input
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                className="text-sm text-muted-foreground border-none bg-transparent px-0 h-auto focus-visible:ring-0"
                                placeholder="Mô tả form (tùy chọn)"
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleUpdateForm} className="gap-1.5">
                                    <Check className="w-3.5 h-3.5" /> Lưu
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setEditingTitle(false); setFormTitle(form.title); setFormDescription(form.description || ""); }}>
                                    <X className="w-3.5 h-3.5" /> Hủy
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1 cursor-pointer" onClick={() => setEditingTitle(true)}>
                                <h1 className="text-2xl font-bold text-foreground group flex items-center gap-2">
                                    {formTitle}
                                    <Edit3 className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                                </h1>
                                <p className="text-sm text-muted-foreground">{formDescription || "Nhấn để thêm mô tả..."}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge variant={form.isActive ? "secondary" : "outline"}
                                    className={form.isActive ? "bg-emerald-500/10 text-emerald-600 border-none" : ""}
                                >
                                    {form.isActive ? "Đang hoạt động" : "Nháp"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{form._count.responses} phản hồi</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ─── Toolbar ──────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4">
                <Tabs defaultValue="questions">
                    <TabsList>
                        <TabsTrigger value="questions" className="gap-1.5 text-xs">
                            <Edit3 className="w-3.5 h-3.5" /> Câu hỏi ({questions.length})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push(`/facilitator/forms/${form.id}/fill`)}>
                        <Eye className="w-3.5 h-3.5" /> Xem trước / Điền
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleToggleActive}>
                        <ToggleRight className="w-3.5 h-3.5" /> {form.isActive ? "Tắt" : "Bật"}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setShowDeleteDialog(true)}>
                        <Trash className="w-3.5 h-3.5" /> Xóa
                    </Button>
                </div>
            </div>

            {/* ─── Questions List ───────────────────────────── */}
            <div className="space-y-3">
                {questions.map((q, idx) => {
                    const TypeIcon = getTypeIcon(q.type);
                    const isEditing = editingQuestionId === q.id;

                    return (
                        <QuestionCard
                            key={q.id}
                            question={q}
                            index={idx}
                            total={questions.length}
                            TypeIcon={TypeIcon}
                            typeLabel={getTypeLabel(q.type)}
                            isEditing={isEditing}
                            onEdit={() => setEditingQuestionId(q.id)}
                            onCancelEdit={() => setEditingQuestionId(null)}
                            onSave={(data) => handleUpdateQuestion(q.id, data)}
                            onDelete={() => handleDeleteQuestion(q.id)}
                            onDuplicate={() => handleDuplicateQuestion(q)}
                            onMove={(dir) => handleMoveQuestion(idx, dir)}
                            needsOptions={needsOptions}
                        />
                    );
                })}
            </div>

            {/* ─── Add New Question ────────────────────────── */}
            <Card className="border-2 border-dashed border-primary/20 bg-primary/[0.02] shadow-none overflow-hidden">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary" /> Thêm câu hỏi mới
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Nội dung câu hỏi</Label>
                        <Input
                            placeholder="Nhập câu hỏi của bạn..."
                            value={newQuestion.label}
                            onChange={(e) => setNewQuestion({ ...newQuestion, label: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && handleAddQuestion()}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Loại câu hỏi</Label>
                            <Select value={newQuestion.type} onValueChange={(val) => setNewQuestion({ ...newQuestion, type: val })}>
                                <SelectTrigger className="h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {QUESTION_TYPES.map(t => (
                                        <SelectItem key={t.value} value={t.value}>
                                            <div className="flex items-center gap-2">
                                                <t.icon className="w-3.5 h-3.5 text-muted-foreground" />
                                                {t.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Trọng số điểm</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                value={newQuestion.weight}
                                onChange={(e) => setNewQuestion({ ...newQuestion, weight: parseFloat(e.target.value) || 1.0 })}
                            />
                        </div>
                    </div>

                    {needsOptions(newQuestion.type) && (
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Các tùy chọn (phân cách bởi dấu phẩy)</Label>
                            <Input
                                placeholder="Ví dụ: Tốt, Khá, Đạt, Không đạt"
                                value={newQuestion.options}
                                onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
                            />
                        </div>
                    )}
                </CardContent>
                <CardFooter className="pb-6">
                    <Button className="w-full h-10 gap-2" onClick={handleAddQuestion} disabled={loading} isLoading={loading}>
                        <Plus className="w-4 h-4" /> Thêm câu hỏi
                    </Button>
                </CardFooter>
            </Card>

            {/* ─── Delete Form Dialog ──────────────────────── */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Xóa biểu mẫu</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn xóa &quot;{form.title}&quot;? Tất cả câu hỏi và phản hồi sẽ bị xóa vĩnh viễn.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDeleteForm}>Xóa vĩnh viễn</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   Question Card Component
   ═══════════════════════════════════════════════════════ */
function QuestionCard({
    question, index, total, TypeIcon, typeLabel, isEditing,
    onEdit, onCancelEdit, onSave, onDelete, onDuplicate, onMove, needsOptions
}: {
    question: Question;
    index: number;
    total: number;
    TypeIcon: React.ComponentType<{ className?: string }>;
    typeLabel: string;
    isEditing: boolean;
    onEdit: () => void;
    onCancelEdit: () => void;
    onSave: (data: Partial<Question>) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onMove: (dir: "up" | "down") => void;
    needsOptions: (type: string) => boolean;
}) {
    const [editData, setEditData] = useState({
        label: question.label,
        type: question.type,
        options: question.options || "",
        weight: question.weight,
    });

    if (isEditing) {
        return (
            <Card className="shadow-none ring-2 ring-primary/20">
                <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary">Câu {index + 1} — Đang chỉnh sửa</span>
                        <div className="flex gap-1">
                            <Button size="icon-xs" variant="ghost" onClick={onCancelEdit}><X className="w-3.5 h-3.5" /></Button>
                        </div>
                    </div>
                    <Input value={editData.label} onChange={e => setEditData({ ...editData, label: e.target.value })} placeholder="Nội dung câu hỏi" />
                    <div className="grid grid-cols-2 gap-3">
                        <Select value={editData.type} onValueChange={val => setEditData({ ...editData, type: val })}>
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {QUESTION_TYPES.map(t => (
                                    <SelectItem key={t.value} value={t.value}>
                                        <div className="flex items-center gap-2"><t.icon className="w-3.5 h-3.5" /> {t.label}</div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input type="number" step="0.1" value={editData.weight} onChange={e => setEditData({ ...editData, weight: parseFloat(e.target.value) || 1 })} />
                    </div>
                    {needsOptions(editData.type) && (
                        <Input value={editData.options} onChange={e => setEditData({ ...editData, options: e.target.value })} placeholder="Tùy chọn (phân cách bởi dấu phẩy)" />
                    )}
                    <Button size="sm" className="gap-1.5" onClick={() => onSave({
                        label: editData.label,
                        type: editData.type,
                        options: needsOptions(editData.type) ? editData.options : undefined,
                        weight: editData.weight,
                    })}>
                        <Save className="w-3.5 h-3.5" /> Lưu thay đổi
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-none group hover:ring-1 hover:ring-border/80 transition-all">
            <CardContent className="p-5">
                <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 pt-0.5">
                        <GripVertical className="w-4 h-4 text-muted-foreground/20 group-hover:text-muted-foreground/50 cursor-grab" />
                        <span className="text-[10px] font-bold text-muted-foreground/40">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <TypeIcon className="w-4 h-4 text-primary/60 shrink-0" />
                            <p className="font-medium text-foreground text-[14px]">{question.label}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="text-[10px] py-0 font-medium">{typeLabel}</Badge>
                            {question.weight !== 1 && (
                                <span className="text-[10px] text-muted-foreground">Trọng số: {question.weight}</span>
                            )}
                            {question.options && (
                                <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                    {question.options.split(",").length} tùy chọn
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {index > 0 && (
                            <Button size="icon-xs" variant="ghost" onClick={() => onMove("up")} title="Di chuyển lên">
                                <ChevronUp className="w-3.5 h-3.5" />
                            </Button>
                        )}
                        {index < total - 1 && (
                            <Button size="icon-xs" variant="ghost" onClick={() => onMove("down")} title="Di chuyển xuống">
                                <ChevronDown className="w-3.5 h-3.5" />
                            </Button>
                        )}
                        <Button size="icon-xs" variant="ghost" onClick={onEdit} title="Chỉnh sửa">
                            <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon-xs" variant="ghost" onClick={onDuplicate} title="Nhân bản">
                            <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon-xs" variant="ghost" className="text-destructive/60 hover:text-destructive hover:bg-destructive/10" onClick={onDelete} title="Xóa">
                            <Trash className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
