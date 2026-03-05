"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash, HelpCircle, Save, X, GripVertical } from "lucide-react";
import { addQuestion, deleteQuestion } from "@/lib/actions/evaluation";
import { toast } from "sonner";

interface FormBuilderProps {
    form: any;
}

export function FormBuilder({ form }: FormBuilderProps) {
    const [questions, setQuestions] = useState<any[]>(form.questions || []);
    const [loading, setLoading] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        label: "",
        type: "RATING",
        options: "",
        weight: 1.0,
    });

    const handleAddQuestion = async () => {
        if (!newQuestion.label) {
            toast.error("Vui lòng nhập câu hỏi");
            return;
        }

        setLoading(true);
        try {
            const data = await addQuestion(form.id, {
                ...newQuestion,
                order: questions.length + 1,
            });
            setQuestions([...questions, data]);
            setNewQuestion({ label: "", type: "RATING", options: "", weight: 1.0 });
            toast.success("Đã thêm câu hỏi");
        } catch (err) {
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
        } catch (err) {
            toast.error("Lỗi khi xóa câu hỏi");
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto py-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{form.title}</h2>
                    <p className="text-muted-foreground">{form.description || "Tạo và bớt các câu hỏi cho bảng đánh giá này."}</p>
                </div>
            </div>

            <div className="grid gap-6">
                {questions.map((q, idx) => (
                    <Card key={q.id || idx} className="border-none shadow-sm ring-1 ring-border rounded-xl">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <GripVertical className="text-muted-foreground/30 w-5 h-5 shrink-0 cursor-grab active:cursor-grabbing" />
                            <div className="flex-1">
                                <span className="text-[12px] font-bold text-primary mb-1 uppercase tracking-wider block">Câu {idx + 1}</span>
                                <p className="font-semibold text-[15px]">{q.label}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-bold py-0">{q.type}</Badge>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                onClick={() => handleDeleteQuestion(q.id)}
                            >
                                <Trash className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        {q.options && (
                            <CardContent className="pl-14">
                                <div className="text-[12px] text-muted-foreground bg-muted/30 p-2 rounded-lg break-all">
                                    Option choices: {q.options}
                                </div>
                            </CardContent>
                        )}
                        <CardFooter className="pl-14 pb-4">
                            <span className="text-[12px] text-muted-foreground">Trọng số: {q.weight}</span>
                        </CardFooter>
                    </Card>
                ))}

                <Card className="border-2 border-dashed border-primary/20 bg-primary/5 shadow-none rounded-xl overflow-hidden mt-4">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[13px] font-bold uppercase tracking-wider text-primary">Thêm câu hỏi mới</CardTitle>
                        <CardDescription>Chọn loại câu hỏi và soạn nội dung.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold">Nội dung câu hỏi</Label>
                                <Input
                                    placeholder="Nhập câu hỏi của bạn..."
                                    className="bg-background rounded-lg outline-none"
                                    value={newQuestion.label}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, label: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold">Loại trả lời</Label>
                                <Select
                                    value={newQuestion.type}
                                    onValueChange={(val) => setNewQuestion({ ...newQuestion, type: val })}
                                >
                                    <SelectTrigger className="bg-background rounded-lg outline-none h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="RATING">Đánh giá sao (1-5)</SelectItem>
                                        <SelectItem value="TEXT">Câu trả lời ngắn</SelectItem>
                                        <SelectItem value="MULTIPLE_CHOICE">Trắc nghiệm</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {newQuestion.type === "MULTIPLE_CHOICE" && (
                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold">Các tùy chọn (phân cách bởi dấu phẩy)</Label>
                                <Input
                                    placeholder="Ví dụ: Tốt, Khá, Đạt, Không đạt"
                                    className="bg-background rounded-lg outline-none"
                                    value={newQuestion.options}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[12px] font-bold">Trọng số điểm (mặc định 1.0)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    className="bg-background rounded-lg outline-none"
                                    value={newQuestion.weight}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, weight: parseFloat(e.target.value) || 1.0 })}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-accent/5 pb-6 pt-2">
                        <Button
                            className="w-full h-11 rounded-lg gap-2 font-bold no-uppercase"
                            onClick={handleAddQuestion}
                            disabled={loading}
                        >
                            <Plus className="w-4 h-4" />
                            {loading ? "Đang lưu..." : "Thêm câu hỏi ngay"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

function Badge({ children, variant, className }: any) {
    return <span className={`px-2 py-0.5 rounded-full ring-1 ring-inset ${variant === 'outline' ? 'bg-primary/5 text-primary ring-primary/20' : ''} ${className}`}>{children}</span>;
}
