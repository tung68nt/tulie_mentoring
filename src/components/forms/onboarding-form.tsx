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
import { User, Briefcase, AlertTriangle, Target, Sparkles } from "lucide-react";

export function OnboardingForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    const {
        register,
        handleSubmit,
        formState: { errors },
        trigger,
    } = useForm<MenteeOnboardingInput>({
        resolver: zodResolver(menteeOnboardingSchema) as any,
    });

    const stepFields: Record<number, (keyof MenteeOnboardingInput)[]> = {
        1: ["studentId", "major", "year"],
        2: ["background", "experience", "skills"],
        3: ["strengths", "weaknesses", "currentChallenges"],
        4: ["careerGoals", "endGoals", "expectations"],
    };

    const handleNext = async () => {
        const valid = await trigger(stepFields[step]);
        if (valid) setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    const onSubmit = async (data: MenteeOnboardingInput) => {
        setIsLoading(true);
        setError(null);

        const result = await saveMenteeOnboarding(data);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            router.push("/mentee");
            router.refresh();
        }
    };

    const stepIcons = [
        <User key="1" className="w-4 h-4" />,
        <Briefcase key="2" className="w-4 h-4" />,
        <AlertTriangle key="3" className="w-4 h-4" />,
        <Target key="4" className="w-4 h-4" />,
    ];

    const stepLabels = [
        "Thông tin cá nhân",
        "Kinh nghiệm",
        "Điểm mạnh & Thách thức",
        "Mục tiêu",
    ];

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-black">Khai hồ sơ ban đầu</h1>
                <p className="text-sm text-[#666] mt-2">Giúp chúng tôi hiểu bạn hơn để ghép đôi mentor phù hợp nhất</p>
            </div>

            {/* Progress steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {Array.from({ length: totalSteps }, (_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => { if (i + 1 < step) setStep(i + 1); }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${i + 1 === step
                                    ? "bg-black text-white"
                                    : i + 1 < step
                                        ? "bg-black/10 text-black"
                                        : "bg-[#f5f5f5] text-[#999]"
                                }`}
                        >
                            {stepIcons[i]}
                        </button>
                        {i < totalSteps - 1 && (
                            <div className={`w-8 h-px ${i + 1 < step ? "bg-black/20" : "bg-[#eaeaea]"}`} />
                        )}
                    </div>
                ))}
            </div>

            <Card className="p-8">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-black">{stepLabels[step - 1]}</h2>
                    <p className="text-sm text-[#999] mt-1">Bước {step}/{totalSteps}</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 text-sm text-[#ee0000] bg-[#ee0000]/5 rounded-[6px] border border-[#ee0000]/10">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                        <>
                            <Input
                                label="Mã sinh viên (MSSV)"
                                placeholder="VD: 20211234"
                                {...register("studentId")}
                                error={errors.studentId?.message}
                            />
                            <Input
                                label="Ngành học *"
                                placeholder="VD: Quản trị Kinh doanh"
                                {...register("major")}
                                error={errors.major?.message}
                            />
                            <Select
                                label="Năm học"
                                options={[
                                    { value: "1", label: "Năm 1" },
                                    { value: "2", label: "Năm 2" },
                                    { value: "3", label: "Năm 3" },
                                    { value: "4", label: "Năm 4" },
                                    { value: "5", label: "Năm 5+" },
                                ]}
                                {...register("year")}
                                error={errors.year?.message}
                            />
                        </>
                    )}

                    {/* Step 2: Experience */}
                    {step === 2 && (
                        <>
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-medium text-[#666]">Giới thiệu bản thân</label>
                                <textarea
                                    {...register("background")}
                                    placeholder="Bạn là ai? Đến từ đâu? Đam mê và sở thích..."
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-[6px] border border-[#eaeaea] bg-white text-black text-sm placeholder:text-[#999] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-[#999] resize-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-medium text-[#666]">Kinh nghiệm cá nhân / làm việc</label>
                                <textarea
                                    {...register("experience")}
                                    placeholder="Dự án, thực tập, hoạt động ngoại khóa, công việc part-time..."
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-[6px] border border-[#eaeaea] bg-white text-black text-sm placeholder:text-[#999] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-[#999] resize-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-medium text-[#666]">Kỹ năng hiện có</label>
                                <textarea
                                    {...register("skills")}
                                    placeholder="VD: Excel, Python, thuyết trình, teamwork..."
                                    rows={2}
                                    className="w-full px-3 py-2.5 rounded-[6px] border border-[#eaeaea] bg-white text-black text-sm placeholder:text-[#999] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-[#999] resize-none"
                                />
                            </div>
                        </>
                    )}

                    {/* Step 3: Strengths & Challenges */}
                    {step === 3 && (
                        <>
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-medium text-[#666]">Điểm mạnh của bạn</label>
                                <textarea
                                    {...register("strengths")}
                                    placeholder="Những điều bạn tự tin và làm tốt..."
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-[6px] border border-[#eaeaea] bg-white text-black text-sm placeholder:text-[#999] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-[#999] resize-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-medium text-[#666]">Điểm yếu / hạn chế</label>
                                <textarea
                                    {...register("weaknesses")}
                                    placeholder="Những điều bạn muốn cải thiện..."
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-[6px] border border-[#eaeaea] bg-white text-black text-sm placeholder:text-[#999] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-[#999] resize-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-medium text-[#666]">Khó khăn hiện tại</label>
                                <textarea
                                    {...register("currentChallenges")}
                                    placeholder="Những thách thức bạn đang gặp phải trong học tập, công việc, cuộc sống..."
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-[6px] border border-[#eaeaea] bg-white text-black text-sm placeholder:text-[#999] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-[#999] resize-none"
                                />
                            </div>
                        </>
                    )}

                    {/* Step 4: Goals */}
                    {step === 4 && (
                        <>
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-medium text-[#666]">Mục tiêu nghề nghiệp *</label>
                                <textarea
                                    {...register("careerGoals")}
                                    placeholder="Bạn muốn trở thành gì? Làm việc trong lĩnh vực nào?"
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-[6px] border border-[#eaeaea] bg-white text-black text-sm placeholder:text-[#999] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-[#999] resize-none"
                                />
                                {errors.careerGoals && (
                                    <p className="text-[12px] text-[#ee0000] font-medium">{errors.careerGoals.message}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-medium text-[#666]">Đích đến sau chương trình</label>
                                <textarea
                                    {...register("endGoals")}
                                    placeholder="Sau khi kết thúc mentoring, bạn kỳ vọng đạt được gì?"
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-[6px] border border-[#eaeaea] bg-white text-black text-sm placeholder:text-[#999] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-[#999] resize-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-medium text-[#666]">Kỳ vọng từ chương trình</label>
                                <textarea
                                    {...register("expectations")}
                                    placeholder="Bạn mong muốn nhận được gì từ mentor và chương trình?"
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-[6px] border border-[#eaeaea] bg-white text-black text-sm placeholder:text-[#999] transition-all duration-200 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 hover:border-[#999] resize-none"
                                />
                            </div>
                        </>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#eaeaea]">
                        {step > 1 ? (
                            <Button type="button" variant="outline" onClick={handleBack}>
                                Quay lại
                            </Button>
                        ) : (
                            <div />
                        )}

                        {step < totalSteps ? (
                            <Button type="button" onClick={handleNext}>
                                Tiếp theo
                            </Button>
                        ) : (
                            <Button type="submit" isLoading={isLoading}>
                                Hoàn thành hồ sơ
                            </Button>
                        )}
                    </div>
                </form>
            </Card>
        </div>
    );
}
