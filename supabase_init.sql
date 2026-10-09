-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatar" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "role" TEXT NOT NULL DEFAULT 'mentee',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT,
    "jobTitle" TEXT,
    "expertise" TEXT,
    "experience" TEXT,
    "linkedIn" TEXT,
    "maxMentees" INTEGER NOT NULL DEFAULT 6,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenteeProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT,
    "major" TEXT,
    "year" INTEGER,
    "careerGoals" TEXT,
    "skills" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "background" TEXT,
    "currentChallenges" TEXT,
    "endGoals" TEXT,
    "expectations" TEXT,
    "experience" TEXT,
    "isOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompletedAt" TIMESTAMP(3),
    "personalNotes" TEXT,
    "startupIdeas" TEXT,
    "softSkills" TEXT,
    "contactLink" TEXT,

    CONSTRAINT "MenteeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramCycle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mentorship" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'one_on_one',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "programCycleId" TEXT NOT NULL,
    "maxMentees" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mentorship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipMentee" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "MentorshipMentee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'offline',
    "meetingType" TEXT NOT NULL DEFAULT 'session',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "location" TEXT,
    "meetingUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "sessionNumber" INTEGER,
    "qrToken" TEXT,
    "qrExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "checkInCode" TEXT,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkInTime" TIMESTAMP(3),
    "checkInLat" DOUBLE PRECISION,
    "checkInLng" DOUBLE PRECISION,
    "deviceHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'absent',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutTime" TIMESTAMP(3),
    "selfieFileId" TEXT,
    "checkInIp" TEXT,
    "checkInUa" TEXT,
    "lateMinutes" INTEGER,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingMinutes" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "agenda" TEXT,
    "keyPoints" TEXT,
    "actionItems" TEXT,
    "outcome" TEXT,
    "attachments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingMinutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'skill',
    "targetValue" INTEGER,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mentorConfirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubGoal" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressNote" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "value" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'session',
    "rating" INTEGER,
    "communication" INTEGER,
    "engagement" INTEGER,
    "content" TEXT,
    "strengths" TEXT,
    "improvements" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'file',
    "fileUrl" TEXT,
    "linkUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "uploadedById" TEXT NOT NULL,
    "mentorshipId" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "personalityMbti" TEXT,
    "personalityDisc" TEXT,
    "personalityHolland" TEXT,
    "competencies" TEXT,
    "shortTermGoals" TEXT,
    "longTermGoals" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "challenges" TEXT,
    "personalNotes" TEXT,
    "startupIdeas" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioEntry" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'reflection',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioSnapshot" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionReflection" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mentorConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedAt" TIMESTAMP(3),
    "linkUrl" TEXT,
    "mentorFeedback" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,

    CONSTRAINT "SessionReflection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoItem" (
    "id" TEXT NOT NULL,
    "reflectionId" TEXT,
    "menteeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "column" TEXT NOT NULL DEFAULT 'todo',
    "labels" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attachments" TEXT,
    "comments" TEXT,
    "description" TEXT,
    "checklist" TEXT,
    "completedPercentage" INTEGER NOT NULL DEFAULT 0,
    "actualCompletedAt" TIMESTAMP(3),
    "actualStartDate" TIMESTAMP(3),

    CONSTRAINT "TodoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" TEXT,
    "entityType" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "userId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'system',
    "firstResponseAt" TIMESTAMP(3),
    "meetingId" TEXT,
    "wikiPageId" TEXT,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketComment" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WikiCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WikiCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wiki" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "categoryId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wiki_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WikiPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "wikiId" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "authorId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "coverImage" TEXT,
    "tags" TEXT,
    "mentorshipId" TEXT,

    CONSTRAINT "WikiPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WikiPageShare" (
    "id" TEXT NOT NULL,
    "wikiPageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WikiPageShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Whiteboard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'private',
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mentorshipId" TEXT,

    CONSTRAINT "Whiteboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artboard" (
    "id" TEXT NOT NULL,
    "whiteboardId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT,
    "elements" JSONB,
    "appState" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'black',
    "status" TEXT NOT NULL DEFAULT 'private',
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mentorshipId" TEXT,

    CONSTRAINT "Slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitLog" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HabitLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyDiary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "content" TEXT NOT NULL,
    "mood" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyDiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilitatorAssignment" (
    "id" TEXT NOT NULL,
    "facilitatorId" TEXT NOT NULL,
    "programCycleId" TEXT,
    "mentorshipId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacilitatorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationForm" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationQuestion" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "options" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "EvaluationQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationResponse" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "submitterId" TEXT NOT NULL,
    "targetMenteeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionAnswer" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "score" DOUBLE PRECISION,

    CONSTRAINT "QuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenteeRanking" (
    "id" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "programCycleId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "metrics" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenteeRanking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "visibility" TEXT NOT NULL DEFAULT 'program',
    "programCycleId" TEXT,
    "mentorshipId" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostReaction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostAttachment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT NOT NULL DEFAULT 'direct',
    "mentorshipId" TEXT,
    "programCycleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatParticipant" (
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("roomId","userId")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'file',
    "fileUrl" TEXT,
    "formFields" TEXT,
    "targetRole" TEXT NOT NULL DEFAULT 'mentee',
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "deadline" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "programCycleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureSubmission" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "fileUrl" TEXT,
    "formData" TEXT,
    "note" TEXT,
    "reviewNote" TEXT,
    "reviewedById" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramMilestone" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'calendar',
    "color" TEXT NOT NULL DEFAULT 'blue',
    "programCycleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorNote" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "aboutUserId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "entityType" TEXT,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileAsset" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reflectionId" TEXT,
    "submissionId" TEXT,
    "resourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'assignment',
    "title" TEXT NOT NULL,
    "note" TEXT,
    "linkUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "feedback" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Account_provider_idx" ON "Account"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "MentorProfile_userId_key" ON "MentorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MenteeProfile_userId_key" ON "MenteeProfile"("userId");

-- CreateIndex
CREATE INDEX "Mentorship_mentorId_idx" ON "Mentorship"("mentorId");

-- CreateIndex
CREATE INDEX "Mentorship_programCycleId_idx" ON "Mentorship"("programCycleId");

-- CreateIndex
CREATE INDEX "Mentorship_status_idx" ON "Mentorship"("status");

-- CreateIndex
CREATE INDEX "MentorshipMentee_menteeId_idx" ON "MentorshipMentee"("menteeId");

-- CreateIndex
CREATE UNIQUE INDEX "MentorshipMentee_mentorshipId_menteeId_key" ON "MentorshipMentee"("mentorshipId", "menteeId");

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_qrToken_key" ON "Meeting"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_checkInCode_key" ON "Meeting"("checkInCode");

-- CreateIndex
CREATE INDEX "Meeting_mentorshipId_idx" ON "Meeting"("mentorshipId");

-- CreateIndex
CREATE INDEX "Meeting_scheduledAt_idx" ON "Meeting"("scheduledAt");

-- CreateIndex
CREATE INDEX "Meeting_status_idx" ON "Meeting"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_selfieFileId_key" ON "Attendance"("selfieFileId");

-- CreateIndex
CREATE INDEX "Attendance_userId_idx" ON "Attendance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_meetingId_userId_key" ON "Attendance"("meetingId", "userId");

-- CreateIndex
CREATE INDEX "MeetingMinutes_meetingId_idx" ON "MeetingMinutes"("meetingId");

-- CreateIndex
CREATE INDEX "Goal_mentorshipId_idx" ON "Goal"("mentorshipId");

-- CreateIndex
CREATE INDEX "Goal_status_idx" ON "Goal"("status");

-- CreateIndex
CREATE INDEX "SubGoal_goalId_idx" ON "SubGoal"("goalId");

-- CreateIndex
CREATE INDEX "ProgressNote_goalId_idx" ON "ProgressNote"("goalId");

-- CreateIndex
CREATE INDEX "Feedback_mentorshipId_idx" ON "Feedback"("mentorshipId");

-- CreateIndex
CREATE INDEX "Feedback_fromUserId_idx" ON "Feedback"("fromUserId");

-- CreateIndex
CREATE INDEX "Feedback_toUserId_idx" ON "Feedback"("toUserId");

-- CreateIndex
CREATE INDEX "Resource_mentorshipId_idx" ON "Resource"("mentorshipId");

-- CreateIndex
CREATE INDEX "Resource_category_idx" ON "Resource"("category");

-- CreateIndex
CREATE INDEX "Resource_uploadedById_idx" ON "Resource"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_menteeId_key" ON "Portfolio"("menteeId");

-- CreateIndex
CREATE INDEX "Portfolio_menteeId_idx" ON "Portfolio"("menteeId");

-- CreateIndex
CREATE INDEX "PortfolioEntry_portfolioId_idx" ON "PortfolioEntry"("portfolioId");

-- CreateIndex
CREATE INDEX "PortfolioSnapshot_portfolioId_idx" ON "PortfolioSnapshot"("portfolioId");

-- CreateIndex
CREATE INDEX "Availability_userId_idx" ON "Availability"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "SessionReflection_menteeId_idx" ON "SessionReflection"("menteeId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionReflection_meetingId_menteeId_key" ON "SessionReflection"("meetingId", "menteeId");

-- CreateIndex
CREATE INDEX "TodoItem_menteeId_idx" ON "TodoItem"("menteeId");

-- CreateIndex
CREATE INDEX "TodoItem_reflectionId_idx" ON "TodoItem"("reflectionId");

-- CreateIndex
CREATE INDEX "TodoItem_status_idx" ON "TodoItem"("status");

-- CreateIndex
CREATE INDEX "TodoItem_dueDate_idx" ON "TodoItem"("dueDate");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "SupportTicket_userId_idx" ON "SupportTicket"("userId");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "TicketComment_ticketId_idx" ON "TicketComment"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "WikiCategory_slug_key" ON "WikiCategory"("slug");

-- CreateIndex
CREATE INDEX "WikiCategory_order_idx" ON "WikiCategory"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Wiki_slug_key" ON "Wiki"("slug");

-- CreateIndex
CREATE INDEX "Wiki_categoryId_idx" ON "Wiki"("categoryId");

-- CreateIndex
CREATE INDEX "Wiki_authorId_idx" ON "Wiki"("authorId");

-- CreateIndex
CREATE INDEX "Wiki_order_idx" ON "Wiki"("order");

-- CreateIndex
CREATE UNIQUE INDEX "WikiPage_slug_key" ON "WikiPage"("slug");

-- CreateIndex
CREATE INDEX "WikiPage_authorId_idx" ON "WikiPage"("authorId");

-- CreateIndex
CREATE INDEX "WikiPage_wikiId_idx" ON "WikiPage"("wikiId");

-- CreateIndex
CREATE INDEX "WikiPage_mentorshipId_idx" ON "WikiPage"("mentorshipId");

-- CreateIndex
CREATE INDEX "WikiPage_visibility_idx" ON "WikiPage"("visibility");

-- CreateIndex
CREATE INDEX "WikiPage_order_idx" ON "WikiPage"("order");

-- CreateIndex
CREATE INDEX "WikiPageShare_userId_idx" ON "WikiPageShare"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WikiPageShare_wikiPageId_userId_key" ON "WikiPageShare"("wikiPageId", "userId");

-- CreateIndex
CREATE INDEX "Whiteboard_creatorId_idx" ON "Whiteboard"("creatorId");

-- CreateIndex
CREATE INDEX "Whiteboard_status_idx" ON "Whiteboard"("status");

-- CreateIndex
CREATE INDEX "Whiteboard_mentorshipId_idx" ON "Whiteboard"("mentorshipId");

-- CreateIndex
CREATE INDEX "Artboard_whiteboardId_idx" ON "Artboard"("whiteboardId");

-- CreateIndex
CREATE INDEX "Artboard_order_idx" ON "Artboard"("order");

-- CreateIndex
CREATE INDEX "Slide_creatorId_idx" ON "Slide"("creatorId");

-- CreateIndex
CREATE INDEX "Slide_mentorshipId_idx" ON "Slide"("mentorshipId");

-- CreateIndex
CREATE INDEX "Habit_userId_idx" ON "Habit"("userId");

-- CreateIndex
CREATE INDEX "HabitLog_habitId_idx" ON "HabitLog"("habitId");

-- CreateIndex
CREATE UNIQUE INDEX "HabitLog_habitId_date_key" ON "HabitLog"("habitId", "date");

-- CreateIndex
CREATE INDEX "DailyDiary_userId_idx" ON "DailyDiary"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyDiary_userId_date_key" ON "DailyDiary"("userId", "date");

-- CreateIndex
CREATE INDEX "FacilitatorAssignment_facilitatorId_idx" ON "FacilitatorAssignment"("facilitatorId");

-- CreateIndex
CREATE INDEX "FacilitatorAssignment_programCycleId_idx" ON "FacilitatorAssignment"("programCycleId");

-- CreateIndex
CREATE INDEX "FacilitatorAssignment_mentorshipId_idx" ON "FacilitatorAssignment"("mentorshipId");

-- CreateIndex
CREATE UNIQUE INDEX "FacilitatorAssignment_facilitatorId_programCycleId_mentorsh_key" ON "FacilitatorAssignment"("facilitatorId", "programCycleId", "mentorshipId");

-- CreateIndex
CREATE INDEX "EvaluationQuestion_formId_idx" ON "EvaluationQuestion"("formId");

-- CreateIndex
CREATE INDEX "EvaluationResponse_formId_idx" ON "EvaluationResponse"("formId");

-- CreateIndex
CREATE INDEX "EvaluationResponse_submitterId_idx" ON "EvaluationResponse"("submitterId");

-- CreateIndex
CREATE INDEX "EvaluationResponse_targetMenteeId_idx" ON "EvaluationResponse"("targetMenteeId");

-- CreateIndex
CREATE INDEX "QuestionAnswer_responseId_idx" ON "QuestionAnswer"("responseId");

-- CreateIndex
CREATE INDEX "QuestionAnswer_questionId_idx" ON "QuestionAnswer"("questionId");

-- CreateIndex
CREATE INDEX "MenteeRanking_menteeId_idx" ON "MenteeRanking"("menteeId");

-- CreateIndex
CREATE INDEX "MenteeRanking_programCycleId_idx" ON "MenteeRanking"("programCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "MenteeRanking_menteeId_programCycleId_key" ON "MenteeRanking"("menteeId", "programCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_programCycleId_idx" ON "Post"("programCycleId");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "PostReaction_postId_idx" ON "PostReaction"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostReaction_postId_userId_type_key" ON "PostReaction"("postId", "userId", "type");

-- CreateIndex
CREATE INDEX "PostAttachment_postId_idx" ON "PostAttachment"("postId");

-- CreateIndex
CREATE INDEX "ChatRoom_mentorshipId_idx" ON "ChatRoom"("mentorshipId");

-- CreateIndex
CREATE INDEX "ChatRoom_programCycleId_idx" ON "ChatRoom"("programCycleId");

-- CreateIndex
CREATE INDEX "ChatParticipant_userId_idx" ON "ChatParticipant"("userId");

-- CreateIndex
CREATE INDEX "ChatMessage_roomId_idx" ON "ChatMessage"("roomId");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");

-- CreateIndex
CREATE INDEX "ChatMessage_roomId_createdAt_idx" ON "ChatMessage"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "Procedure_targetRole_idx" ON "Procedure"("targetRole");

-- CreateIndex
CREATE INDEX "Procedure_programCycleId_idx" ON "Procedure"("programCycleId");

-- CreateIndex
CREATE INDEX "ProcedureSubmission_userId_idx" ON "ProcedureSubmission"("userId");

-- CreateIndex
CREATE INDEX "ProcedureSubmission_status_idx" ON "ProcedureSubmission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureSubmission_procedureId_userId_key" ON "ProcedureSubmission"("procedureId", "userId");

-- CreateIndex
CREATE INDEX "ProgramMilestone_programCycleId_idx" ON "ProgramMilestone"("programCycleId");

-- CreateIndex
CREATE INDEX "ProgramMilestone_date_idx" ON "ProgramMilestone"("date");

-- CreateIndex
CREATE INDEX "MentorNote_mentorshipId_idx" ON "MentorNote"("mentorshipId");

-- CreateIndex
CREATE INDEX "MentorNote_authorId_idx" ON "MentorNote"("authorId");

-- CreateIndex
CREATE INDEX "MentorNote_aboutUserId_idx" ON "MentorNote"("aboutUserId");

-- CreateIndex
CREATE INDEX "MentorNote_mentorshipId_aboutUserId_idx" ON "MentorNote"("mentorshipId", "aboutUserId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FileAsset_path_key" ON "FileAsset"("path");

-- CreateIndex
CREATE INDEX "FileAsset_ownerId_idx" ON "FileAsset"("ownerId");

-- CreateIndex
CREATE INDEX "FileAsset_reflectionId_idx" ON "FileAsset"("reflectionId");

-- CreateIndex
CREATE INDEX "FileAsset_submissionId_idx" ON "FileAsset"("submissionId");

-- CreateIndex
CREATE INDEX "FileAsset_status_createdAt_idx" ON "FileAsset"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Submission_menteeId_idx" ON "Submission"("menteeId");

-- CreateIndex
CREATE INDEX "Submission_mentorshipId_status_idx" ON "Submission"("mentorshipId", "status");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorProfile" ADD CONSTRAINT "MentorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenteeProfile" ADD CONSTRAINT "MenteeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_programCycleId_fkey" FOREIGN KEY ("programCycleId") REFERENCES "ProgramCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipMentee" ADD CONSTRAINT "MentorshipMentee_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipMentee" ADD CONSTRAINT "MentorshipMentee_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_selfieFileId_fkey" FOREIGN KEY ("selfieFileId") REFERENCES "FileAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingMinutes" ADD CONSTRAINT "MeetingMinutes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingMinutes" ADD CONSTRAINT "MeetingMinutes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubGoal" ADD CONSTRAINT "SubGoal_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressNote" ADD CONSTRAINT "ProgressNote_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioEntry" ADD CONSTRAINT "PortfolioEntry_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioSnapshot" ADD CONSTRAINT "PortfolioSnapshot_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionReflection" ADD CONSTRAINT "SessionReflection_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionReflection" ADD CONSTRAINT "SessionReflection_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoItem" ADD CONSTRAINT "TodoItem_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoItem" ADD CONSTRAINT "TodoItem_reflectionId_fkey" FOREIGN KEY ("reflectionId") REFERENCES "SessionReflection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wiki" ADD CONSTRAINT "Wiki_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "WikiCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wiki" ADD CONSTRAINT "Wiki_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiPage" ADD CONSTRAINT "WikiPage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiPage" ADD CONSTRAINT "WikiPage_wikiId_fkey" FOREIGN KEY ("wikiId") REFERENCES "Wiki"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiPage" ADD CONSTRAINT "WikiPage_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiPageShare" ADD CONSTRAINT "WikiPageShare_wikiPageId_fkey" FOREIGN KEY ("wikiPageId") REFERENCES "WikiPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiPageShare" ADD CONSTRAINT "WikiPageShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Whiteboard" ADD CONSTRAINT "Whiteboard_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Whiteboard" ADD CONSTRAINT "Whiteboard_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artboard" ADD CONSTRAINT "Artboard_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "Whiteboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slide" ADD CONSTRAINT "Slide_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slide" ADD CONSTRAINT "Slide_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitLog" ADD CONSTRAINT "HabitLog_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyDiary" ADD CONSTRAINT "DailyDiary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilitatorAssignment" ADD CONSTRAINT "FacilitatorAssignment_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilitatorAssignment" ADD CONSTRAINT "FacilitatorAssignment_programCycleId_fkey" FOREIGN KEY ("programCycleId") REFERENCES "ProgramCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilitatorAssignment" ADD CONSTRAINT "FacilitatorAssignment_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationQuestion" ADD CONSTRAINT "EvaluationQuestion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "EvaluationForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationResponse" ADD CONSTRAINT "EvaluationResponse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "EvaluationForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationResponse" ADD CONSTRAINT "EvaluationResponse_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationResponse" ADD CONSTRAINT "EvaluationResponse_targetMenteeId_fkey" FOREIGN KEY ("targetMenteeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "EvaluationResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "EvaluationQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenteeRanking" ADD CONSTRAINT "MenteeRanking_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenteeRanking" ADD CONSTRAINT "MenteeRanking_programCycleId_fkey" FOREIGN KEY ("programCycleId") REFERENCES "ProgramCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_programCycleId_fkey" FOREIGN KEY ("programCycleId") REFERENCES "ProgramCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostAttachment" ADD CONSTRAINT "PostAttachment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_programCycleId_fkey" FOREIGN KEY ("programCycleId") REFERENCES "ProgramCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_programCycleId_fkey" FOREIGN KEY ("programCycleId") REFERENCES "ProgramCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureSubmission" ADD CONSTRAINT "ProcedureSubmission_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramMilestone" ADD CONSTRAINT "ProgramMilestone_programCycleId_fkey" FOREIGN KEY ("programCycleId") REFERENCES "ProgramCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorNote" ADD CONSTRAINT "MentorNote_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorNote" ADD CONSTRAINT "MentorNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorNote" ADD CONSTRAINT "MentorNote_aboutUserId_fkey" FOREIGN KEY ("aboutUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_reflectionId_fkey" FOREIGN KEY ("reflectionId") REFERENCES "SessionReflection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ==========================================
-- SUPABASE STORAGE BUCKET & INITIAL SEED DATA
-- ==========================================

-- 1. Create Supabase Storage bucket for tulie-files (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('tulie-files', 'tulie-files', false, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- 2. Program Cycle
INSERT INTO "ProgramCycle" ("id", "name", "description", "startDate", "endDate", "status", "createdAt", "updatedAt")
VALUES (
    'seed-cycle-id',
    'Tulie Mentoring 2026',
    'Chương trình mentoring chính thức',
    '2026-01-01 00:00:00',
    '2026-12-31 23:59:59',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO UPDATE SET "status" = 'active';

-- 3. Initial Users (Password: password123)
-- Admin / Mentor
INSERT INTO "User" ("id", "email", "passwordHash", "firstName", "lastName", "role", "isActive", "image", "createdAt", "updatedAt")
VALUES (
    'seed-mentor-admin-id',
    'mentor@tulie.vn',
    '$2b$10$g8kGHEQg0oOZZbnDDlZ8UOrMk7sxd4CIEdrEJCpqcLsj9q8oX37a2',
    'Nguyễn Văn',
    'Mentor',
    'admin',
    true,
    'https://ui-avatars.com/api/?name=NV+Mentor&background=6366f1&color=fff',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE SET "role" = 'admin';

INSERT INTO "MentorProfile" ("id", "userId", "company", "jobTitle", "maxMentees", "createdAt", "updatedAt")
VALUES (
    'seed-mentor-profile-id',
    'seed-mentor-admin-id',
    'Tulie Agency',
    'Senior Product Manager',
    10,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- Mentee
INSERT INTO "User" ("id", "email", "passwordHash", "firstName", "lastName", "role", "isActive", "image", "createdAt", "updatedAt")
VALUES (
    'seed-mentee-id',
    'mentee@tulie.vn',
    '$2b$10$g8kGHEQg0oOZZbnDDlZ8UOrMk7sxd4CIEdrEJCpqcLsj9q8oX37a2',
    'Trần Thị',
    'Mentee',
    'mentee',
    true,
    'https://ui-avatars.com/api/?name=TT+Mentee&background=ec4899&color=fff',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE SET "role" = 'mentee';

INSERT INTO "MenteeProfile" ("id", "userId", "studentId", "major", "year", "isOnboardingComplete", "createdAt", "updatedAt")
VALUES (
    'seed-mentee-profile-id',
    'seed-mentee-id',
    'SV2026',
    'Công nghệ thông tin',
    4,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- 4. Initial Mentorship Pairing
INSERT INTO "Mentorship" ("id", "mentorId", "type", "status", "programCycleId", "maxMentees", "createdAt", "updatedAt")
VALUES (
    'seed-mentorship-id',
    'seed-mentor-admin-id',
    'one_on_one',
    'active',
    'seed-cycle-id',
    5,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO UPDATE SET "status" = 'active';

INSERT INTO "MentorshipMentee" ("id", "mentorshipId", "menteeId", "joinedAt")
VALUES (
    'seed-mm-id',
    'seed-mentorship-id',
    'seed-mentee-id',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- 5. System Settings
INSERT INTO "SystemSetting" ("id", "key", "value", "description", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid()::text, 'site_name', 'Tulie Mentoring', 'Tên hệ thống', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'favicon', '', 'Biểu tượng trang web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'sidebar_logo', '', 'Logo thanh bên', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'auth_logo', '', 'Logo trang đăng nhập', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

