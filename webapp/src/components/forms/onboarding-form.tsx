"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { menteeOnboardingSchema, type MenteeOnboardingInput } from "@/lib/validators";
import { saveMenteeOnboarding } from "@/lib/actions/onboarding";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WebcamCapture } from "@/components/ui/webcam-capture";
import { DISC_QUESTIONS, DISC_TRAITS, calculateDiscResult } from "@/lib/disc-questions";
import { cn } from "@/lib/utils";
import {
    User,
    Share2,
    Compass,
    Target,
    HeartHandshake,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Sparkles,
    ExternalLink,
    Camera
} from "lucide-react";

export function OnboardingForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    // DISC state
    const [discAnswers, setDiscAnswers] = useState<Record<number, "D" | "I" | "S" | "C">>({});
    const [portraitPhoto, setPortraitPhoto] = useState<string>("");

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        formState: { errors },
    } = useForm<MenteeOnboardingInput>({
        resolver: zodResolver(menteeOnboardingSchema) as any,
        defaultValues: {
            year: 3,
            age: 20,
        }
    });

    const stepFields: Record<number, (keyof MenteeOnboardingInput)[]> = {
        1: ["studentId", "major", "year", "age", "phone", "zalo", "telegram"],
        2: ["facebookUrl", "linkedinUrl", "githubUrl"],
        3: ["personalityType", "personalityScores", "personalityTestUrl"],
        4: ["skills", "strengths", "weaknesses", "currentChallenges"],
        5: ["careerGoals", "endGoals", "expectations", "personalNeeds", "startupIdeas", "personalNotes"],
    };

    const handleDiscSelect = (questionId: number, trait: "D" | "I" | "S" | "C") => {
        const next = { ...discAnswers, [questionId]: trait };
        setDiscAnswers(next);

        const result = calculateDiscResult(next);
        setValue("personalityType", result.primary);
        setValue("personalityScores", JSON.stringify(result.scores));
    };

    const discResult = calculateDiscResult(discAnswers);

    const handleNext = async () => {
        if (step === 2 && !portraitPhoto) {
            setError("Vui lòng chụp hoặc tải ảnh chân dung khuôn mặt trước khi tiếp tục.");
            return;
        }
        setError(null);

        const fieldsToValidate = stepFields[step] || [];
        const valid = await trigger(fieldsToValidate as any);
        if (valid) {
            setStep((prev) => Math.min(prev + 1, totalSteps));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleBack = () => {
        setError(null);
        setStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onSubmit = async (data: MenteeOnboardingInput) => {
        setIsLoading(true);
        setError(null);

        const payload = {
            ...data,
            portraitPhoto: portraitPhoto || data.portraitPhoto,
            personalityType: discResult.primary,
            personalityScores: JSON.stringify(discResult.scores),
        };

        const result = await saveMenteeOnboarding(payload);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            router.push("/mentee");
            router.refresh();
        }
    };

    const stepLabels = [
        { label: "Cá nhân & Liên hệ", icon: <User className="w-4 h-4" /> },
        { label: "Ảnh chân dung & Social", icon: <Camera className="w-4 h-4" /> },
        { label: "Trắc nghiệm DISC", icon: <Compass className="w-4 h-4" /> },
        { label: "Năng lực & Thách thức", icon: <Target className="w-4 h-4" /> },
        { label: "Kỳ vọng & Định hướng", icon: <HeartHandshake className="w-4 h-4" /> },
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    Khảo sát đầu vào Mentee Junior
                </div>
                <h1 className="text-2xl font-semibold text-foreground">Hồ sơ cá nhân & Định hướng phát triển</h1>
                <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                    Thông tin chi tiết giúp Mentor thấu hiểu phong cách làm việc, thế mạnh cá nhân để phân nhóm học tập và đồng hành hiệu quả nhất.
                </p>
            </div>

            {/* Stepper Progress */}
            <div className="grid grid-cols-5 gap-2 pt-2">
                {stepLabels.map((s, idx) => {
                    const stepNum = idx + 1;
                    const isActive = step === stepNum;
                    const isPassed = step > stepNum;
                    return (
                        <div
                            key={stepNum}
                            className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                                isActive
                                    ? "bg-primary/5 border-primary text-primary font-medium shadow-sm"
                                    : isPassed
                                    ? "bg-muted/50 border-border text-foreground hover:bg-muted cursor-pointer"
                                    : "bg-background border-border/60 text-muted-foreground opacity-60"
                            }`}
                            onClick={() => {
                                if (isPassed) setStep(stepNum);
                            }}
                        >
                            <div className="flex items-center gap-1 text-xs">
                                {isPassed ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : s.icon}
                                <span className="hidden sm:inline">Bước {stepNum}</span>
                            </div>
                            <span className="text-[11px] truncate w-full">{s.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Main Form Card */}
            <Card className="p-6 md:p-8 border-border shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* BƯỚC 1: CÁ NHÂN & KÊNH LIÊN HỆ */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in-50 duration-200">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Thông tin học tập & Liên hệ</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Giúp Mentor kết nối với bạn nhanh chóng qua các kênh liên lạc chính
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">Khoa / Ngành học *</label>
                                    <Input
                                        placeholder="Ví dụ: Công nghệ thông tin, Khoa học dữ liệu..."
                                        {...register("major")}
                                    />
                                    {errors.major && <p className="text-xs text-destructive">{errors.major.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">Mã sinh viên (nếu có)</label>
                                    <Input
                                        placeholder="Ví dụ: 21020000"
                                        {...register("studentId")}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-medium text-foreground">Sinh viên năm thứ</label>
                                        <span className="text-[11px] text-muted-foreground font-medium">
                                            {(watch("year") ?? 3) === 5 ? "Năm 5+ / Đã tốt nghiệp" : `Năm ${watch("year") ?? 3}`}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {[
                                            { value: 1, label: "Năm 1" },
                                            { value: 2, label: "Năm 2" },
                                            { value: 3, label: "Năm 3" },
                                            { value: 4, label: "Năm 4" },
                                            { value: 5, label: "Năm 5+" },
                                        ].map((item) => {
                                            const isSelected = (watch("year") ?? 3) === item.value;
                                            return (
                                                <button
                                                    key={item.value}
                                                    type="button"
                                                    onClick={() => setValue("year", item.value, { shouldValidate: true })}
                                                    className={cn(
                                                        "h-9 rounded-xl text-xs font-semibold transition-all border text-center flex items-center justify-center cursor-pointer",
                                                        isSelected
                                                            ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold scale-[1.02]"
                                                            : "bg-background/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                                                    )}
                                                >
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <input type="hidden" {...register("year", { valueAsNumber: true })} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">Độ tuổi</label>
                                    <Input
                                        type="number"
                                        placeholder="Ví dụ: 20"
                                        {...register("age")}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">Số điện thoại *</label>
                                    <Input
                                        placeholder="Ví dụ: 0912345678"
                                        {...register("phone")}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">Tài khoản Zalo (SĐT hoặc username)</label>
                                    <Input
                                        placeholder="Zalo để liên hệ nhóm nhanh"
                                        {...register("zalo")}
                                    />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-medium text-foreground">Telegram username (nếu có)</label>
                                    <Input
                                        placeholder="@username_telegram"
                                        {...register("telegram")}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BƯỚC 2: ẢNH CHÂN DUNG & MẠNG XÃ HỘI */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in-50 duration-200">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Ảnh chân dung & Mạng xã hội</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Ảnh chân dung rõ mặt dùng làm hồ sơ chuẩn và làm dữ liệu đối chiếu khi check-in các buổi họp.
                                </p>
                            </div>

                            <div className="p-4 bg-muted/40 rounded-xl border border-border flex flex-col items-center">
                                <WebcamCapture
                                    initialImage={portraitPhoto}
                                    title="Chụp ảnh chân dung rõ mặt"
                                    description="Vui lòng giữ khuôn mặt rõ nét, đủ ánh sáng"
                                    onCapture={(dataUrl) => {
                                        setPortraitPhoto(dataUrl);
                                        setValue("portraitPhoto", dataUrl);
                                        setError(null);
                                    }}
                                />
                            </div>

                            <div className="space-y-4 pt-2">
                                <h3 className="text-sm font-medium text-foreground">Kênh mạng xã hội & Portfolio</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">Facebook URL</label>
                                        <Input
                                            placeholder="https://facebook.com/..."
                                            {...register("facebookUrl")}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">LinkedIn URL</label>
                                        <Input
                                            placeholder="https://linkedin.com/in/..."
                                            {...register("linkedinUrl")}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">GitHub URL / Portfolio</label>
                                        <Input
                                            placeholder="https://github.com/..."
                                            {...register("githubUrl")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BƯỚC 3: TRẮC NGHIỆM TÍNH CÁCH DISC */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in-50 duration-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Trắc nghiệm phong cách làm việc (DISC)</h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Chọn 1 lựa chọn phản ánh đúng nhất cách bạn hành động trong từng tình huống
                                    </p>
                                </div>
                                <a
                                    href="https://tracnghiemdisc.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                                >
                                    Làm bài chi tiết bên ngoài <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>

                            {/* Live Result Preview */}
                            {(() => {
                                const traitInfo = discResult.traitInfo || DISC_TRAITS.D;
                                return (
                                    <div className="p-4 sm:p-5 rounded-xl border border-border bg-card space-y-3.5 shadow-xs">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-medium text-muted-foreground">Kết quả tạm tính:</span>
                                                <Badge className={traitInfo.badgeColor}>
                                                    {discResult.blendName} ({discResult.primary}{discResult.secondary ? `/${discResult.secondary}` : ""})
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-muted-foreground font-medium">
                                                Đã trả lời {Object.keys(discAnswers).length}/{DISC_QUESTIONS.length} câu
                                            </span>
                                        </div>

                                        {/* 4 Trục DISC */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                                            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40">
                                                <p className="font-semibold text-red-600">D (Quyết đoán)</p>
                                                <p className="text-base font-bold text-red-700 dark:text-red-400 mt-0.5">{discResult.scores.D}%</p>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                                                <p className="font-semibold text-amber-600">I (Ảnh hưởng)</p>
                                                <p className="text-base font-bold text-amber-700 dark:text-amber-400 mt-0.5">{discResult.scores.I}%</p>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                                                <p className="font-semibold text-emerald-600">S (Kiên định)</p>
                                                <p className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{discResult.scores.S}%</p>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                                                <p className="font-semibold text-blue-600">C (Tận tâm)</p>
                                                <p className="text-base font-bold text-blue-700 dark:text-blue-400 mt-0.5">{discResult.scores.C}%</p>
                                            </div>
                                        </div>

                                        {/* 2 Chiều hành vi khoa học */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/60">
                                            <div className="p-2 rounded-lg bg-muted/40 text-muted-foreground">
                                                <strong className="text-foreground block mb-0.5">⚡ Nhịp độ hành động (Pace):</strong>
                                                {discResult.dimensions.paceLabel}
                                            </div>
                                            <div className="p-2 rounded-lg bg-muted/40 text-muted-foreground">
                                                <strong className="text-foreground block mb-0.5">🎯 Trọng tâm chú ý (Focus):</strong>
                                                {discResult.dimensions.focusLabel}
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {discResult.blendDescription || traitInfo.description}
                                        </p>
                                    </div>
                                );
                            })()}

                            {/* Questions Section 1 */}
                            <div className="space-y-4">
                                <div className="px-1 py-1 border-b border-border/80">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                                        Phần 1: Đặc trưng phản xạ & Tương tác tự nhiên (Câu 1 - 8)
                                    </h3>
                                </div>
                                {DISC_QUESTIONS.slice(0, 8).map((q) => {
                                    const selected = discAnswers[q.id];
                                    return (
                                        <div key={q.id} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                                            <p className="text-xs font-semibold text-foreground">
                                                Câu {q.id}: {q.question}
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {q.options.map((opt) => {
                                                    const isChecked = selected === opt.trait;
                                                    return (
                                                        <button
                                                            key={opt.trait}
                                                            type="button"
                                                            onClick={() => handleDiscSelect(q.id, opt.trait)}
                                                            className={`p-3 rounded-lg border text-left transition-all text-xs flex items-start gap-2.5 cursor-pointer ${
                                                                isChecked
                                                                    ? "border-primary bg-primary/10 text-primary font-medium shadow-xs"
                                                                    : "border-border bg-card text-foreground hover:bg-muted"
                                                            }`}
                                                        >
                                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                                                                isChecked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                            }`}>
                                                                {opt.trait}
                                                            </span>
                                                            <div className="space-y-0.5">
                                                                <p className="leading-snug">{opt.text}</p>
                                                                <span className="text-[10px] text-muted-foreground block">({opt.desc})</span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="px-1 py-1 pt-4 border-b border-border/80">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                                        Phần 2: Hành vi trong nhóm Mentoring & Dưới áp lực (Câu 9 - 16)
                                    </h3>
                                </div>
                                {DISC_QUESTIONS.slice(8).map((q) => {
                                    const selected = discAnswers[q.id];
                                    return (
                                        <div key={q.id} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                                            <p className="text-xs font-semibold text-foreground">
                                                Câu {q.id}: {q.question}
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {q.options.map((opt) => {
                                                    const isChecked = selected === opt.trait;
                                                    return (
                                                        <button
                                                            key={opt.trait}
                                                            type="button"
                                                            onClick={() => handleDiscSelect(q.id, opt.trait)}
                                                            className={`p-3 rounded-lg border text-left transition-all text-xs flex items-start gap-2.5 cursor-pointer ${
                                                                isChecked
                                                                    ? "border-primary bg-primary/10 text-primary font-medium shadow-xs"
                                                                    : "border-border bg-card text-foreground hover:bg-muted"
                                                            }`}
                                                        >
                                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                                                                isChecked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                            }`}>
                                                                {opt.trait}
                                                            </span>
                                                            <div className="space-y-0.5">
                                                                <p className="leading-snug">{opt.text}</p>
                                                                <span className="text-[10px] text-muted-foreground block">({opt.desc})</span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <label className="text-xs font-medium text-foreground">Đường dẫn kết quả test ngoài (nếu có)</label>
                                <Input
                                    placeholder="Dán link bài trắc nghiệm tính cách chi tiết bạn đã làm..."
                                    {...register("personalityTestUrl")}
                                />
                            </div>
                        </div>
                    )}

                    {/* BƯỚC 4: NĂNG LỰC, ĐIỂM MẠNH & THÁCH THỨC */}
                    {step === 4 && (
                        <div className="space-y-5 animate-in fade-in-50 duration-200">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Năng lực, Điểm mạnh & Thách thức</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Chia sẻ thành thật để Mentor nhìn thấy góc độ hỗ trợ tốt nhất cho bạn
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">Kỹ năng hiện có (Tech stacks, công cụ, kỹ năng mềm)</label>
                                    <Input
                                        placeholder="Ví dụ: React, TypeScript, Git, Figma, thuyết trình, làm việc nhóm..."
                                        {...register("skills")}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">Điểm mạnh tự tin nhất của bạn *</label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-transparent text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                                            placeholder="Ví dụ: Khả năng tự học nhanh, tỉ mỉ với code, luôn đúng giờ..."
                                            {...register("strengths")}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">Điểm cần cải thiện / Điểm yếu *</label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-transparent text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                                            placeholder="Ví dụ: Ngại hỏi khi gặp bug, quản lý thời gian chưa tối ưu..."
                                            {...register("weaknesses")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">Thách thức / Khó khăn lớn nhất bạn đang đối mặt *</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-transparent text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                                        placeholder="Ví dụ: Mơ hồ về lộ trình sự nghiệp, thiếu kinh nghiệm dự án thực tế..."
                                        {...register("currentChallenges")}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BƯỚC 5: KỲ VỌNG & ĐỊNH HƯỚNG */}
                    {step === 5 && (
                        <div className="space-y-5 animate-in fade-in-50 duration-200">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Mục tiêu & Nhu cầu cá nhân</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Những gì bạn muốn gặt hái sau mùa Mentoring này
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">Mục tiêu nghề nghiệp 1 - 2 năm tới *</label>
                                    <Input
                                        placeholder="Ví dụ: Trở thành Software Engineer tại công ty công nghệ, tham gia dự án Global..."
                                        {...register("careerGoals")}
                                    />
                                    {errors.careerGoals && <p className="text-xs text-destructive">{errors.careerGoals.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">Kỳ vọng ở Mentor & Chương trình *</label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-transparent text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                                            placeholder="Bạn muốn Mentor hướng dẫn thế nào? (Chỉ ra lỗi sai, code review, định hướng tư duy...)"
                                            {...register("expectations")}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground">Nhu cầu cá nhân đặc thù</label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-transparent text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                                            placeholder="Ví dụ: Cần luyện phỏng vấn kỹ thuật, cần tìm đồng đội làm đồ án..."
                                            {...register("personalNeeds")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">Ý tưởng dự án / Startup muốn thử nghiệm (nếu có)</label>
                                    <textarea
                                        rows={2}
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-transparent text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                                        placeholder="Ý tưởng bạn ấp ủ hoặc sản phẩm muốn xây dựng trong nhóm..."
                                        {...register("startupIdeas")}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">Lời nhắn / Tâm sự gửi gắm riêng tới Mentor</label>
                                    <textarea
                                        rows={2}
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-transparent text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                                        placeholder="Bất kỳ điều gì bạn muốn Mentor lắng nghe..."
                                        {...register("personalNotes")}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {/* Actions Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                        {step > 1 ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleBack}
                                disabled={isLoading}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Quay lại
                            </Button>
                        ) : <div />}

                        {step < totalSteps ? (
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleNext}
                            >
                                Tiếp tục
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isLoading}
                                className="bg-primary text-primary-foreground font-medium"
                            >
                                {isLoading ? "Đang lưu hồ sơ..." : "Hoàn tất & Mở khóa tài khoản"}
                                <CheckCircle2 className="w-4 h-4 ml-1.5" />
                            </Button>
                        )}
                    </div>
                </form>
            </Card>
        </div>
    );
}
