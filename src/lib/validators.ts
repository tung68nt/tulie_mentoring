import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────
export const loginSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const registerSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "Họ không được để trống"),
    lastName: z.string().min(1, "Tên không được để trống"),
    role: z.enum(["mentor", "mentee"]),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

// ─── Meeting ─────────────────────────────────────────────────────
export const meetingSchema = z.object({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    description: z.string().optional(),
    type: z.enum(["offline", "online"]),
    meetingType: z.enum(["session", "workshop", "checkin"]),
    scheduledAt: z.preprocess((arg) => (typeof arg === "string" ? new Date(arg) : arg), z.date({ message: "Vui lòng chọn thời gian" })),
    duration: z.coerce.number().min(15).max(180),
    location: z.string().optional(),
    meetingUrl: z.string().url().optional().or(z.literal("")),
    mentorshipId: z.string().min(1, "Vui lòng chọn mentorship"),
});

// ─── Goal ────────────────────────────────────────────────────────
export const goalSchema = z.object({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    description: z.string().optional(),
    category: z.enum(["skill", "knowledge", "network", "project", "career"]),
    targetValue: z.coerce.number().min(1).max(100).default(100),
    currentValue: z.coerce.number().min(0).max(100).default(0),
    unit: z.string().optional().default("percent"),
    priority: z.enum(["low", "medium", "high"]),
    dueDate: z.preprocess((arg) => (typeof arg === "string" ? new Date(arg) : arg), z.date().optional()),
    mentorshipId: z.string().min(1),
});

// ─── Feedback ────────────────────────────────────────────────────
export const feedbackSchema = z.object({
    rating: z.coerce.number().min(1).max(5),
    communication: z.coerce.number().min(1).max(5).default(5),
    engagement: z.coerce.number().min(1).max(5).default(5),
    content: z.string().optional(),
    strengths: z.string().optional(),
    improvements: z.string().optional(),
    type: z.enum(["session", "monthly", "end_of_program"]),
    mentorshipId: z.string().min(1),
    toUserId: z.string().min(1),
    isAnonymous: z.boolean().default(false),
});

// ─── Meeting Minutes ─────────────────────────────────────────────
export const minutesSchema = z.object({
    agenda: z.string().optional(),
    keyPoints: z.string().min(1, "Nội dung chính không được để trống"),
    actionItems: z.string().optional(),
    outcome: z.enum(["productive", "average", "needs_improvement"]),
    meetingId: z.string().min(1),
});

// ─── Resource ────────────────────────────────────────────────────
export const resourceSchema = z.object({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    description: z.string().optional(),
    type: z.enum(["file", "link", "document"]),
    linkUrl: z.string().url().optional().or(z.literal("")),
    category: z.string().optional(),
    tags: z.string().optional(),
    visibility: z.enum(["public", "private", "group"]),
});

// ─── Portfolio ───────────────────────────────────────────────────
export const portfolioSchema = z.object({
    personalityMbti: z.string().optional(),
    personalityDisc: z.string().optional(),
    personalityHolland: z.string().optional(),
    competencies: z.string().optional(),
    shortTermGoals: z.string().optional(),
    longTermGoals: z.string().optional(),
});

// ─── Mentorship ──────────────────────────────────────────────────
export const mentorshipSchema = z.object({
    mentorId: z.string().min(1, "Vui lòng chọn mentor"),
    type: z.enum(["one_on_one", "group"]),
    programCycleId: z.string().min(1, "Vui lòng chọn chương trình"),
    startDate: z.preprocess((arg) => (typeof arg === "string" ? new Date(arg) : arg), z.date({ message: "Vui lòng chọn ngày bắt đầu" })),
    endDate: z.preprocess((arg) => (typeof arg === "string" ? new Date(arg) : arg), z.date({ message: "Vui lòng chọn ngày kết thúc" })),
    maxMentees: z.coerce.number().min(1).max(20).default(1),
    menteeIds: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 mentee"),
});

// ─── Mentee Onboarding ───────────────────────────────────────────
export const menteeOnboardingSchema = z.object({
    studentId: z.string().optional(),
    major: z.string().min(1, "Vui lòng nhập ngành học"),
    year: z.coerce.number().min(1).max(6).optional(),
    background: z.string().optional(),
    experience: z.string().optional(),
    skills: z.string().optional(),
    strengths: z.string().optional(),
    weaknesses: z.string().optional(),
    currentChallenges: z.string().optional(),
    careerGoals: z.string().min(1, "Vui lòng nhập mục tiêu nghề nghiệp"),
    endGoals: z.string().optional(),
    expectations: z.string().optional(),
});

// ─── Availability ────────────────────────────────────────────────
export const availabilitySchema = z.object({
    dayOfWeek: z.coerce.number().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Định dạng HH:mm"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Định dạng HH:mm"),
    duration: z.coerce.number().min(15).max(180).default(60),
});

// ─── Todo / Tasks ───────────────────────────────────────────────
export const todoSchema = z.object({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    status: z.enum(["todo", "doing", "review", "done"]).default("todo"),
    column: z.string().default("todo"),
    dueDate: z.preprocess((arg) => (typeof arg === "string" ? new Date(arg) : arg), z.date().optional().nullable()),
    reflectionId: z.string().optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type MeetingInput = z.infer<typeof meetingSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type MinutesInput = z.infer<typeof minutesSchema>;
export type ResourceInput = z.infer<typeof resourceSchema>;
export type PortfolioInput = z.infer<typeof portfolioSchema>;
export type MentorshipInput = z.infer<typeof mentorshipSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type MenteeOnboardingInput = z.infer<typeof menteeOnboardingSchema>;
export type TaskInput = z.infer<typeof todoSchema>;
