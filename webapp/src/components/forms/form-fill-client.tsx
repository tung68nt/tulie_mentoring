"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Star, AlignLeft, Type, List, CheckSquare, Hash, Calendar, ChevronsUpDown,
    ChevronLeft, Send, CheckCircle2, User
} from "lucide-react";
import { submitFormResponse } from "@/lib/actions/evaluation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Question {
    id: string;
    type: string;
    label: string;
    options: string | null;
    order: number;
    weight: number;
}

interface Mentee {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
}

interface FormFillProps {
    form: {
        id: string;
        title: string;
        description: string | null;
        questions: Question[];
    };
    mentees: Mentee[];
}

export function FormFillClient({ form, mentees }: FormFillProps) {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [targetMenteeId, setTargetMenteeId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const setAnswer = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const toggleCheckbox = (questionId: string, option: string) => {
        const current = answers[questionId] || "";
        const selected = current ? current.split(",").map(s => s.trim()) : [];
        const updated = selected.includes(option)
            ? selected.filter(s => s !== option)
            : [...selected, option];
        setAnswer(questionId, updated.join(", "));
    };

    const handleSubmit = async () => {
        // Validate all questions answered
        const unanswered = form.questions.filter(q => !answers[q.id]?.trim());
        if (unanswered.length > 0) {
            toast.error(`Vui lòng trả lời ${unanswered.length} câu hỏi còn thiếu`);
            return;
        }

        setSubmitting(true);
        try {
            const formattedAnswers = form.questions.map(q => {
                const value = answers[q.id] || "";
                let score: number | undefined;
                if (q.type === "RATING" || q.type === "SCALE") {
                    score = parseFloat(value) * q.weight;
                }
                return { questionId: q.id, value, score };
            });

            await submitFormResponse(form.id, formattedAnswers, targetMenteeId || undefined);
            setSubmitted(true);
            toast.success("Đã gửi phản hồi thành công!");
        } catch {
            toast.error("Lỗi khi gửi phản hồi");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-3xl">
                <Card className="shadow-none text-center py-16">
                    <CardContent className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-semibold">Đã gửi phản hồi!</h2>
                        <p className="text-sm text-muted-foreground">Cảm ơn bạn đã hoàn thành biểu mẫu &quot;{form.title}&quot;.</p>
                        <div className="flex justify-center gap-3 pt-4">
                            <Button variant="outline" onClick={() => { setSubmitted(false); setAnswers({}); setTargetMenteeId(""); }}>
                                Gửi phản hồi khác
                            </Button>
                            <Link href={`/facilitator/forms/${form.id}`}>
                                <Button variant="ghost">Quay lại form</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            {/* Back Button */}
            <div className="mb-6">
                <Link href={`/facilitator/forms/${form.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                        <ChevronLeft className="w-4 h-4" /> Trở lại thiết kế
                    </Button>
                </Link>
            </div>

            {/* Form Header */}
            <Card className="shadow-none overflow-hidden mb-6">
                <div className="h-2 bg-primary" />
                <CardHeader className="p-6">
                    <CardTitle className="text-2xl">{form.title}</CardTitle>
                    {form.description && <CardDescription className="text-sm mt-1">{form.description}</CardDescription>}
                    <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-[10px]">{form.questions.length} câu hỏi</Badge>
                        <span className="text-[10px] text-destructive">* Bắt buộc</span>
                    </div>
                </CardHeader>
            </Card>

            {/* Target Mentee Selection */}
            {mentees.length > 0 && (
                <Card className="shadow-none mb-4">
                    <CardContent className="p-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> Đánh giá cho mentee (tùy chọn)
                            </Label>
                            <Select value={targetMenteeId} onValueChange={setTargetMenteeId}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Chọn mentee..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Không chọn (đánh giá chung)</SelectItem>
                                    {mentees.map(m => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.firstName} {m.lastName} ({m.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Questions */}
            <div className="space-y-4">
                {form.questions.map((q, idx) => (
                    <Card key={q.id} className="shadow-none">
                        <CardContent className="p-5">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <Label className="text-[14px] font-medium text-foreground leading-relaxed">
                                        {idx + 1}. {q.label} <span className="text-destructive">*</span>
                                    </Label>
                                </div>
                                <QuestionInput question={q} value={answers[q.id] || ""} onChange={val => setAnswer(q.id, val)} onToggleCheckbox={opt => toggleCheckbox(q.id, opt)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Submit */}
            <div className="mt-8 flex justify-end">
                <Button size="lg" className="gap-2 px-8" onClick={handleSubmit} disabled={submitting} isLoading={submitting}>
                    <Send className="w-4 h-4" /> Gửi phản hồi
                </Button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   Question Input Renderer
   ═══════════════════════════════════════════════════════ */
function QuestionInput({ question: q, value, onChange, onToggleCheckbox }: {
    question: Question;
    value: string;
    onChange: (val: string) => void;
    onToggleCheckbox: (opt: string) => void;
}) {
    const options = q.options ? q.options.split(",").map(o => o.trim()).filter(Boolean) : [];
    const selected = value ? value.split(",").map(s => s.trim()) : [];

    switch (q.type) {
        case "RATING":
            return (
                <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => onChange(String(star))}
                            className="p-1 transition-all hover:scale-110"
                        >
                            <Star className={`w-7 h-7 transition-colors ${parseInt(value) >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20 hover:text-amber-300"}`} />
                        </button>
                    ))}
                    {value && <span className="ml-3 text-sm font-semibold text-foreground">{value}/5</span>}
                </div>
            );

        case "SCALE":
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => onChange(String(n))}
                                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border ${
                                    parseInt(value) === n
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background border-border text-muted-foreground hover:border-primary/30 hover:bg-primary/5"
                                }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                        <span>Rất kém</span>
                        <span>Xuất sắc</span>
                    </div>
                </div>
            );

        case "TEXT":
            return (
                <Input
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Nhập câu trả lời..."
                />
            );

        case "PARAGRAPH":
            return (
                <textarea
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Nhập câu trả lời chi tiết..."
                    rows={4}
                    className="w-full rounded-xl border border-border/40 bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/40 focus-visible:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary outline-none resize-y min-h-[100px]"
                />
            );

        case "MULTIPLE_CHOICE":
            return (
                <div className="space-y-2">
                    {options.map(opt => (
                        <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            value === opt ? "border-primary bg-primary/5" : "border-border hover:border-primary/20 hover:bg-muted/30"
                        }`}>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                value === opt ? "border-primary" : "border-muted-foreground/30"
                            }`}>
                                {value === opt && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <span className="text-sm">{opt}</span>
                        </label>
                    ))}
                    {options.length === 0 && <p className="text-xs text-muted-foreground">Chưa có tùy chọn nào.</p>}
                </div>
            );

        case "CHECKBOX":
            return (
                <div className="space-y-2">
                    {options.map(opt => (
                        <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            selected.includes(opt) ? "border-primary bg-primary/5" : "border-border hover:border-primary/20 hover:bg-muted/30"
                        }`}>
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                selected.includes(opt) ? "border-primary bg-primary" : "border-muted-foreground/30"
                            }`}>
                                {selected.includes(opt) && (
                                    <svg className="w-2.5 h-2.5 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm">{opt}</span>
                        </label>
                    ))}
                    {options.length === 0 && <p className="text-xs text-muted-foreground">Chưa có tùy chọn nào.</p>}
                </div>
            );

        case "DROPDOWN":
            return (
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="Chọn một tùy chọn..." />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );

        case "DATE":
            return (
                <Input
                    type="date"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                />
            );

        default:
            return (
                <Input
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Nhập câu trả lời..."
                />
            );
    }
}
