export type UserRole = "admin" | "mentor" | "mentee";

export type MentorshipType = "one_on_one" | "group";
export type MentorshipStatus = "pending" | "active" | "completed" | "cancelled";

export type MeetingMode = "offline" | "online";
export type MeetingCategory = "session" | "workshop" | "checkin";
export type MeetingStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type GoalCategory = "skill" | "knowledge" | "network" | "project" | "career";
export type GoalStatus = "not_started" | "in_progress" | "completed" | "paused";
export type GoalPriority = "low" | "medium" | "high";

export type FeedbackType = "session" | "monthly" | "end_of_program";

export type MinutesStatus = "draft" | "submitted" | "approved";
export type MinutesOutcome = "productive" | "average" | "needs_improvement";

export type ResourceType = "file" | "link" | "document";
export type ResourceVisibility = "public" | "private" | "group";

export type NotificationType = "info" | "success" | "warning" | "error";

// ─── Dashboard Stats ─────────────────────────────────────────────
export interface DashboardStats {
    totalMentorships: number;
    activeMentorships: number;
    totalMeetings: number;
    completedMeetings: number;
    upcomingMeetings: number;
    totalGoals: number;
    completedGoals: number;
    averageRating: number;
}

export interface MeetingWithDetails {
    id: string;
    title: string;
    type: MeetingMode;
    meetingType: MeetingCategory;
    scheduledAt: string;
    duration: number;
    location: string | null;
    meetingUrl: string | null;
    status: MeetingStatus;
    mentorship: {
        id: string;
        mentor: { firstName: string; lastName: string; avatar: string | null };
        mentees: Array<{
            mentee: { firstName: string; lastName: string; avatar: string | null };
        }>;
    };
    attendances: Array<{
        userId: string;
        status: AttendanceStatus;
        checkInTime: string | null;
    }>;
}

export interface GoalWithProgress {
    id: string;
    title: string;
    description: string | null;
    category: GoalCategory;
    targetValue: number | null;
    currentValue: number;
    status: GoalStatus;
    priority: GoalPriority;
    dueDate: string | null;
    progressNotes: Array<{
        id: string;
        note: string;
        value: number | null;
        createdAt: string;
    }>;
}

export interface NavItem {
    label: string;
    href: string;
    icon: string;
    roles: UserRole[];
    badge?: number;
}
