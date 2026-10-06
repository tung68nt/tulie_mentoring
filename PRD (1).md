# Product Requirements Document (PRD)
# IMP Mentoring Management Platform

**Version:** 1.0  
**Date:** February 11, 2026  
**Program:** ISME Mentoring Program (IMP) - NEU  
**Organization:** Viện Đào tạo Quốc tế, Đại học Kinh tế Quốc dân (ISME@NEU)

---

## 1. Executive Summary

### 1.1 Product Overview
IMP Mentoring Management Platform là webapp quản trị toàn diện cho chương trình ISME Mentoring Program, kết nối mentors (các chuyên gia, doanh nhân, quản lý cấp cao) với mentees (sinh viên NEU) trong hành trình phát triển cá nhân và nghề nghiệp.

### 1.2 Vision Statement
Xây dựng nền tảng mentoring chuyên nghiệp, hiện đại, tạo môi trường trao đổi hiệu quả, theo dõi tiến độ minh bạch, và tối ưu hóa giá trị từ mối quan hệ mentor-mentee.

### 1.3 Target Users
- **Mentors:** Chủ doanh nghiệp, quản lý cấp cao, cựu học viên ISME
- **Mentees:** 
  - Senior Mentees (1:1): Sinh viên năm cuối
  - Junior Mentees (Group): Sinh viên năm 1-2
- **Administrators:** Đội ngũ quản lý chương trình IMP
- **School Management:** Ban lãnh đạo nhà trường

---

## 2. Program Context

### 2.1 Program Structure

#### 2.1.1 Mentoring Models
- **1:1 Mentoring:** Một mentor - một mentee (sinh viên năm cuối)
- **Group Mentoring:** Một mentor - nhiều mentees
  - Nhóm nhỏ: 1:6
  - Nhóm lớn: 1:12

#### 2.1.2 Program Duration
- **Thời gian chuẩn:** 3 tháng từ ngày ký kết mentor-mentee
- **Flexible timeline:** Có thể điều chỉnh theo yêu cầu nhà trường

#### 2.1.3 Activity Types
- **Offline meetings:** Các buổi gặp mặt trực tiếp
- **Online meetings:** Video calls, virtual sessions
- **Asynchronous communication:** Chat, updates, file sharing

---

## 3. Core Features & Requirements

### 3.1 User Management & Authentication

#### 3.1.1 User Roles
```
├── Admin (School Management)
│   ├── Quản lý toàn bộ hệ thống
│   ├── Thiết lập program cycles
│   └── Truy cập tất cả dữ liệu
├── Mentor
│   ├── Quản lý mentees
│   ├── Lên lịch meetings
│   └── Đánh giá & feedback
└── Mentee
    ├── Cập nhật tiến độ
    ├── Book lịch tư vấn
    └── Tự đánh giá
```

#### 3.1.2 Authentication & Security
- **Multi-factor Authentication (MFA)**
- **Role-based Access Control (RBAC)**
- **SSO Integration** (optional: NEU email)
- **Session management:** Auto logout sau 30 phút không hoạt động
- **Data encryption:** 
  - At rest: AES-256
  - In transit: TLS 1.3

#### 3.1.3 User Profiles
**Mentor Profile:**
- Thông tin cá nhân (tên, ảnh, chức danh, công ty)
- Lĩnh vực chuyên môn
- Kinh nghiệm & thành tựu
- Lịch availability
- Danh sách mentees hiện tại & quá khứ

**Mentee Profile:**
- Thông tin sinh viên (MSSV, khóa, ngành)
- Ảnh đại diện
- Mục tiêu nghề nghiệp
- Kỹ năng & điểm mạnh/yếu
- Lịch sử chương trình

---

### 3.2 Mentee Portfolio System

#### 3.2.1 Initial Assessment (Hồ sơ đầu chương trình)
**Assessment Components:**
- **Personality Tests:**
  - MBTI / Big Five Personality
  - DISC Assessment
  - Holland Code (RIASEC)
  
- **Competency Tests:**
  - Soft skills assessment
  - Hard skills evaluation (theo ngành)
  - Leadership potential
  - Communication skills

- **Self-Assessment:**
  - Career goals (short-term & long-term)
  - Areas of improvement
  - Expected outcomes từ program

**Data Structure:**
```json
{
  "initial_assessment": {
    "personality": {
      "mbti": "ENFP",
      "disc": "I/D",
      "holland_code": "SEC"
    },
    "competencies": {
      "communication": 7.5,
      "leadership": 6.0,
      "problem_solving": 8.0,
      "technical_skills": 7.0
    },
    "goals": {
      "short_term": ["Improve public speaking", "Build network"],
      "long_term": ["Product Manager in tech", "Start own business"]
    }
  }
}
```

#### 3.2.2 Progress Tracking
**Continuous Updates:**
- Meeting notes & feedback integration
- Skill development tracking (weekly/monthly)
- Goal achievement percentage
- Mentor observations

#### 3.2.3 Final Portfolio (Hồ sơ cuối chương trình)
**Components:**
- **Achievement Summary:**
  - % completion of planned meetings
  - % achievement of goals
  - Skills gained
  
- **360° Feedback:**
  - Mentor assessment
  - Self-assessment
  - Peer feedback (for group mentoring)
  
- **Development Areas:**
  - Kỹ năng (Skills): Before → After ratings
  - Kinh nghiệm (Experience): New insights, knowledge
  - Thái độ (Attitude): Work ethic, professionalism
  
- **Recommendations:**
  - Next steps
  - Future focus areas
  - Mentor's endorsement

**Export Format:**
- PDF report với branding IMP
- Shareable link
- Raw data export (JSON/CSV)

---

### 3.3 Meeting Management

#### 3.3.1 Meeting Scheduling
**Calendar Integration:**
- Google Calendar sync (two-way)
- iCal export
- View: Day / Week / Month / Agenda

**Meeting Types:**
- 1:1 session
- Group session
- Workshop / Training
- Check-in call

**Scheduling Features:**
- Drag-and-drop calendar
- Recurring meetings
- Time zone support
- Conflict detection

#### 3.3.2 Calendly-style Booking System
**Mentor Availability:**
- Set available time slots
- Buffer time between meetings
- Meeting duration templates (30min, 60min, 90min)
- Maximum bookings per day/week

**Mentee Booking:**
- View mentor's available slots
- One-click booking
- Reason/topic selection
- Automatic confirmation email
- Reminder notifications (24h, 1h before)

**Booking Rules:**
- Minimum notice period (e.g., 24h advance)
- Cancellation policy (e.g., cancel up to 6h before)
- Rescheduling limits

#### 3.3.3 QR Code Check-in System
**Check-in Process:**
1. Admin/Mentor generates unique QR code per meeting
2. QR code contains:
   - Meeting ID
   - Timestamp
   - Location validation
   - Single-use token

**Anti-fraud Mechanisms:**
- **Location verification:** GPS coordinates check (±50m radius)
- **Device fingerprinting:** One device per mentee
- **Facial verification (optional):** Camera snapshot on check-in
- **Time window:** QR valid only 15 min before - 15 min after start
- **Single scan:** Token expires after first successful scan
- **Offline mode:** Check-in data synced when online

**Check-in Data:**
```json
{
  "check_in": {
    "mentee_id": "SV123456",
    "meeting_id": "MTG-20260211-001",
    "timestamp": "2026-02-11T14:30:15Z",
    "location": {"lat": 21.0285, "lng": 105.8542},
    "device_id": "hash_device_fingerprint",
    "status": "verified"
  }
}
```

**Attendance Reports:**
- Real-time attendance tracking
- Automated attendance percentage calculation
- Export to điểm chuyên cần system

#### 3.3.4 Meeting Minutes & Reports
**During Meeting:**
- Live note-taking (collaborative doc)
- Action items tracking
- Attendee list (auto from check-in)

**Post-Meeting:**
- **Meeting Summary Template:**
  ```
  - Date & time
  - Attendees
  - Agenda items
  - Key discussion points
  - Action items (owner, deadline)
  - Next meeting date
  - Attachments
  ```

- **Required Fields:**
  - Meeting outcome (Productive / Average / Needs improvement)
  - Topics covered
  - Mentee's questions/concerns
  - Mentor's advice
  - Follow-up actions

- **Submission Workflow:**
  1. Mentee drafts minutes within 24h
  2. Mentor reviews & approves
  3. Auto-archive to portfolio
  4. Visibility: Mentee, Mentor, Admin

---

### 3.4 Goal Setting & Progress Management

#### 3.4.1 SMART Goals Framework
**Goal Structure:**
- **Specific:** Clear objective
- **Measurable:** Quantifiable metrics
- **Achievable:** Realistic given resources
- **Relevant:** Aligned với career path
- **Time-bound:** Deadline/milestones

**Goal Categories:**
- Skill Development
- Knowledge Acquisition
- Network Building
- Project Completion
- Career Exploration

#### 3.4.2 Progress Tracking
**Update Frequency:**
- Weekly check-ins (quick update)
- Monthly reviews (detailed)
- Quarterly assessments

**Progress Indicators:**
- % completion
- Milestones achieved
- Challenges encountered
- Support needed

**Visualization:**
- Progress bars
- Gantt charts
- Burndown charts
- Kanban boards

#### 3.4.3 Reporting Requirements
**For Mentees:**
- Meeting count vs. planned
- Goals achieved vs. set
- Skills developed
- Key learnings

**For School:**
- Program completion rate
- Satisfaction scores
- Outcome metrics
- ROI analysis

---

### 3.5 Feedback System

#### 3.5.1 Two-way Feedback
**Mentee → Mentor:**
- Session effectiveness (1-5 stars)
- Communication quality
- Guidance relevance
- Areas for improvement
- Anonymous option

**Mentor → Mentee:**
- Engagement level
- Initiative & proactivity
- Receptiveness to feedback
- Progress rate
- Strengths & development areas

#### 3.5.2 Feedback Timing
- **Post-session:** Quick rating (1 min)
- **Monthly:** Detailed feedback (5-10 min)
- **End-of-program:** Comprehensive review (15 min)

#### 3.5.3 Feedback Analytics
- Sentiment analysis
- Trend tracking
- Issue flagging
- Improvement suggestions

---

### 3.6 Resource Sharing & Knowledge Base

#### 3.6.1 File Management
**Upload & Organization:**
- Folders structure
- Tags & categories
- Search functionality
- Version control

**Supported File Types:**
- Documents: PDF, DOCX, XLSX, PPTX
- Images: JPG, PNG, SVG
- Videos: MP4, MOV (max 500MB)
- Links: URLs, Google Drive, Dropbox

**Access Control:**
- Public (all mentees)
- Private (specific mentee)
- Group-specific

#### 3.6.2 Content Types
- **Templates:** Resume, cover letter, business plan
- **Reading Materials:** Articles, e-books, case studies
- **Video Tutorials:** Recorded sessions, industry insights
- **Tools & Resources:** Software links, frameworks
- **Best Practices:** Guidelines, checklists

#### 3.6.3 Wiki/Knowledge Base (Notion-style)
**Features:**
- Rich text editor (Markdown support)
- Nested pages
- Templates
- Database views (Table, Kanban, Gallery)
- @mentions
- Comments & discussions

**Use Cases:**
- Program handbook
- FAQ section
- Success stories
- Industry insights library

---

### 3.7 Communication Hub

#### 3.7.1 Messaging System
**1:1 Chat:**
- Text messages
- File attachments
- Voice notes
- Emoji reactions
- Read receipts
- Online/offline status

**Group Chat:**
- Group mentoring sessions
- Announcements channel
- Q&A forum

**Notifications:**
- In-app
- Email
- Push (mobile)
- SMS (critical only)

#### 3.7.2 Updates & News Feed
**Activity Stream:**
- Meeting scheduled/completed
- Goals achieved
- Files shared
- Feedback received
- Milestones reached

**Filtering:**
- By type
- By date
- By person
- By importance

---

### 3.8 Analytics & Reporting

#### 3.8.1 Dashboard Views
**Mentee Dashboard:**
- Progress summary
- Upcoming meetings
- Pending action items
- Recent feedback
- Resource recommendations

**Mentor Dashboard:**
- Mentees overview
- Meeting schedule
- Feedback summary
- Portfolio progress
- Time investment

**Admin Dashboard:**
- Program metrics
- Engagement rates
- Completion statistics
- Satisfaction scores
- Resource usage

#### 3.8.2 Reports for School
**Automated Reports:**
- Weekly activity summary
- Monthly program review
- Quarterly outcome report
- End-of-cycle comprehensive

**Export Formats:**
- Excel (detailed data)
- PDF (executive summary)
- PowerPoint (presentation)
- Shareable link (web view)

**Key Metrics:**
- Participation rate
- Meeting frequency
- Goal achievement %
- Satisfaction scores (NPS)
- Skills improvement
- ROI indicators

---

## 4. Technical Requirements

### 4.1 Architecture

#### 4.1.1 System Architecture
**Pattern:** Microservices / Modular Monolith
```
┌─────────────────────────────────────────┐
│           Frontend (Web App)            │
│    React 19 + TypeScript + Vite        │
└─────────────┬───────────────────────────┘
              │ REST/GraphQL API
┌─────────────▼───────────────────────────┐
│         API Gateway / BFF               │
│         (Next.js 15 API Routes)        │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
┌───▼───┐ ┌──▼──┐ ┌───▼────┐
│ Auth  │ │Core │ │Analytics│
│Service│ │API  │ │Service  │
└───┬───┘ └──┬──┘ └───┬────┘
    │        │        │
    └────────┼────────┘
             │
    ┌────────▼─────────┐
    │    Database      │
    │ PostgreSQL 16    │
    └──────────────────┘
```

#### 4.1.2 Technology Stack

**Frontend:**
- **Framework:** React 19 (Latest)
- **Language:** TypeScript 5.x
- **Build Tool:** Vite 5.x
- **State Management:** 
  - Zustand / Jotai (lightweight)
  - TanStack Query (server state)
- **Routing:** TanStack Router / React Router 7
- **UI Components:**
  - Radix UI / shadcn/ui (headless, accessible)
  - Tailwind CSS 4.x (utility-first)
- **Forms:** React Hook Form + Zod (validation)
- **Calendar:** FullCalendar / react-big-calendar
- **Rich Text:** Tiptap / Lexical
- **Charts:** Recharts / Chart.js
- **Tables:** TanStack Table
- **Date/Time:** date-fns / Day.js

**Backend:**
- **Runtime:** Node.js 22 LTS
- **Framework:** 
  - Option 1: Next.js 15 (Full-stack)
  - Option 2: Fastify 5.x / Hono (API-only)
- **Language:** TypeScript 5.x
- **API:** 
  - REST (primary)
  - GraphQL (optional: Apollo Server)
  - WebSocket (real-time)
- **Authentication:** 
  - Auth.js (next-auth)
  - Lucia Auth
  - Passport.js
- **Validation:** Zod
- **ORM:** Prisma 6.x / Drizzle ORM
- **File Upload:** Uploadthing / AWS S3

**Database:**
- **Primary:** PostgreSQL 16
- **Caching:** Redis 7.x
- **Search:** MeiliSearch / Typesense
- **File Storage:** AWS S3 / Cloudflare R2

**Infrastructure:**
- **Hosting:** 
  - Vercel (recommended)
  - AWS (EC2, ECS, Lambda)
  - Cloudflare Pages
- **CDN:** Cloudflare
- **Monitoring:** 
  - Sentry (error tracking)
  - PostHog (analytics)
  - Grafana + Prometheus (metrics)
- **CI/CD:** GitHub Actions
- **Container:** Docker + Docker Compose

**Mobile (Future):**
- React Native / Expo
- Capacitor (web to mobile)

### 4.2 Security Requirements

#### 4.2.1 Authentication & Authorization
- **OAuth 2.0 / OpenID Connect**
- **JWT tokens** (short-lived access, refresh tokens)
- **Password hashing:** Argon2id / bcrypt
- **Rate limiting:** 
  - Login attempts: 5 per 15 min
  - API calls: 100 per minute
  - File uploads: 10 per hour

#### 4.2.2 Data Protection
- **Encryption at rest:** AES-256
- **Encryption in transit:** TLS 1.3
- **PII handling:** 
  - GDPR/PDPA compliance
  - Data anonymization
  - Right to deletion
- **Database security:**
  - Row-level security (RLS)
  - Prepared statements (SQL injection prevention)
  - Connection pooling với SSL

#### 4.2.3 Application Security
- **OWASP Top 10 mitigation:**
  - XSS prevention (CSP headers, sanitization)
  - CSRF protection (tokens)
  - Clickjacking prevention (X-Frame-Options)
  - SQL Injection (ORM, parameterized queries)
  - Insecure deserialization
  
- **Security headers:**
  ```
  Content-Security-Policy
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Strict-Transport-Security: max-age=31536000
  Permissions-Policy
  ```

- **Input validation:**
  - Client-side (Zod schemas)
  - Server-side (double validation)
  - File type/size restrictions
  - Sanitization before storage

#### 4.2.4 QR Code Security
- **One-time tokens:** UUID v4 + HMAC signature
- **Short expiration:** 30 minutes max
- **Location binding:** GPS coordinates hashed
- **Device fingerprinting:** Canvas fingerprint + UserAgent hash
- **Replay attack prevention:** Nonce tracking

#### 4.2.5 API Security
- **API key rotation:** Every 90 days
- **Webhook signatures:** HMAC-SHA256
- **IP whitelisting:** For admin APIs
- **CORS policy:** Strict origin control

### 4.3 Performance Requirements

#### 4.3.1 Load Time
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms

#### 4.3.2 Optimization Techniques
**Frontend:**
- Code splitting (route-based)
- Lazy loading (images, components)
- Tree shaking
- Asset compression (Brotli/Gzip)
- Image optimization (WebP, AVIF, responsive)
- Service Workers (offline support)
- Virtual scrolling (long lists)

**Backend:**
- Database indexing (B-tree, GiST)
- Query optimization (EXPLAIN ANALYZE)
- Connection pooling (PgBouncer)
- Caching strategy:
  - Redis cache (hot data)
  - CDN cache (static assets)
  - Browser cache (Cache-Control headers)
- Compression (gzip response)
- Background jobs (Bull/BullMQ)

#### 4.3.3 Scalability
- **Horizontal scaling:** Load balancer ready
- **Database replication:** Primary-replica setup
- **Caching layers:** Multi-tier caching
- **Asset CDN:** Global edge caching
- **Capacity planning:**
  - Support 1,000 concurrent users
  - 10,000 total users
  - 100,000 meetings/year

### 4.4 UI/UX Requirements

#### 4.4.1 Design System
**Color Palette:**
```css
/* Primary Colors */
--color-black: #000000
--color-white: #FFFFFF
--color-gray-50: #F9FAFB
--color-gray-100: #F3F4F6
--color-gray-900: #111827

/* Accent Colors (Pastel Modern) */
--color-accent-blue: #93C5FD      /* Soft Blue */
--color-accent-green: #86EFAC     /* Soft Green */
--color-accent-yellow: #FDE68A    /* Soft Yellow */
--color-accent-pink: #FBCFE8      /* Soft Pink */
--color-accent-purple: #DDD6FE    /* Soft Purple */

/* Status Colors */
--status-success: #86EFAC
--status-warning: #FDE68A
--status-error: #FCA5A5
--status-info: #93C5FD
--status-neutral: #D1D5DB
```

**Typography:**
```css
/* Font Family */
--font-sans: 'Inter', system-ui, sans-serif
--font-mono: 'JetBrains Mono', monospace

/* Font Sizes */
--text-xs: 0.75rem     /* 12px */
--text-sm: 0.875rem    /* 14px */
--text-base: 1rem      /* 16px */
--text-lg: 1.125rem    /* 18px */
--text-xl: 1.25rem     /* 20px */
--text-2xl: 1.5rem     /* 24px */
--text-3xl: 1.875rem   /* 30px */
```

**Spacing:**
- 4px base unit (0.25rem)
- 8px, 12px, 16px, 24px, 32px, 48px, 64px

**Border Radius:**
- Small: 4px
- Medium: 8px
- Large: 12px
- Full: 9999px (pills, avatars)

#### 4.4.2 Component Library
**Core Components:**
- Button (primary, secondary, ghost, destructive)
- Input (text, email, password, search)
- Select / Combobox
- Checkbox / Radio / Switch
- Dropdown Menu
- Dialog / Modal
- Toast / Notification
- Card
- Table
- Tabs
- Accordion
- Calendar / Date Picker
- Avatar
- Badge
- Progress Bar
- Skeleton Loader
- Empty State
- Error State

**Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support (ARIA labels)
- Focus indicators
- Color contrast ratios (4.5:1 minimum)

#### 4.4.3 Responsive Design
**Breakpoints:**
```css
--screen-sm: 640px   /* Mobile landscape */
--screen-md: 768px   /* Tablet */
--screen-lg: 1024px  /* Desktop */
--screen-xl: 1280px  /* Large desktop */
--screen-2xl: 1536px /* Extra large */
```

**Mobile-first approach:**
- Touch-friendly targets (44x44px minimum)
- Swipe gestures
- Bottom navigation (mobile)
- Collapsible sidebars

#### 4.4.4 Animation & Transitions
**Principles:**
- Meaningful motion (guide attention)
- Subtle (not distracting)
- Fast (200-300ms typical)
- Respect user preferences (prefers-reduced-motion)

**Common Animations:**
- Fade in/out
- Slide in/out
- Scale (button press)
- Skeleton loading
- Progress indicators
- Smooth scrolling

### 4.5 Code Quality & Maintainability

#### 4.5.1 Code Structure
```
webapp/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── (auth)/         # Auth routes
│   │   ├── (dashboard)/    # Dashboard routes
│   │   └── api/            # API routes
│   ├── components/
│   │   ├── ui/             # Base components
│   │   ├── forms/          # Form components
│   │   └── features/       # Feature components
│   ├── lib/
│   │   ├── db/             # Database client
│   │   ├── auth/           # Auth utilities
│   │   └── utils/          # Helper functions
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # State management
│   ├── types/              # TypeScript types
│   └── config/             # Configuration files
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/                 # Static assets
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/                   # Documentation
```

#### 4.5.2 Code Standards
**Linting & Formatting:**
- ESLint 9.x (strict config)
- Prettier 3.x
- TypeScript strict mode
- Husky (pre-commit hooks)
- lint-staged

**Naming Conventions:**
- Components: PascalCase
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Files: kebab-case
- CSS: BEM or utility classes

**Documentation:**
- JSDoc comments
- README per module
- API documentation (OpenAPI/Swagger)
- Storybook (component docs)

#### 4.5.3 Testing Strategy
**Test Coverage Target:** 80%+

**Testing Layers:**
- **Unit Tests:** Vitest
  - Utilities
  - Hooks
  - Pure functions
  
- **Integration Tests:** Vitest + Testing Library
  - Components
  - Forms
  - API routes
  
- **E2E Tests:** Playwright
  - Critical user flows
  - Booking process
  - Check-in flow
  - Report generation
  
- **Performance Tests:** Lighthouse CI
- **Security Tests:** OWASP ZAP
- **Load Tests:** k6 / Artillery

#### 4.5.4 CI/CD Pipeline
**GitHub Actions Workflow:**
```yaml
1. Lint & Format Check
2. Type Check (TypeScript)
3. Unit Tests
4. Integration Tests
5. Build
6. E2E Tests (staging)
7. Security Scan
8. Deploy (staging)
9. Smoke Tests
10. Deploy (production)
```

**Deployment Strategy:**
- Blue-green deployment
- Automated rollback
- Database migrations (separate step)
- Zero-downtime updates

#### 4.5.5 Monitoring & Observability
**Logging:**
- Structured logging (JSON)
- Log levels (debug, info, warn, error)
- Request ID tracking
- Retention: 30 days

**Metrics:**
- Application metrics (Prometheus)
- Business metrics (custom)
- Database performance (pg_stat_statements)
- Real-time dashboards (Grafana)

**Error Tracking:**
- Sentry (errors & performance)
- Source maps
- User context
- Breadcrumbs

**Uptime Monitoring:**
- Pingdom / UptimeRobot
- Health check endpoints
- Alerts (PagerDuty / Slack)

---

## 5. User Journeys

### 5.1 Mentee Onboarding Journey
```
1. Account creation (NEU email verification)
2. Complete profile
3. Take initial assessments
   - Personality test
   - Skill evaluation
   - Goal setting
4. Review assigned mentor
5. Book first session
6. Receive welcome package (resources)
7. Pre-session checklist
```

### 5.2 Booking & Meeting Flow
```
Mentee:
1. Browse mentor's calendar
2. Select available slot
3. Add meeting topic/questions
4. Confirm booking
5. Receive confirmation + calendar invite
6. Get reminder (24h before)
7. Get reminder (1h before)
8. Check-in via QR code
9. Attend meeting
10. Draft meeting minutes
11. Submit for mentor approval
12. Receive feedback request

Mentor:
1. Set availability
2. Receive booking notification
3. Review meeting topic
4. Prepare materials
5. Generate QR code
6. Conduct meeting
7. Review & approve minutes
8. Provide feedback
9. Update mentee portfolio
```

### 5.3 Progress Review Cycle
```
Weekly:
- Mentee updates progress
- Quick status check

Monthly:
- Detailed review meeting
- Goal adjustment if needed
- Feedback exchange
- Portfolio update

End of Program:
- Final assessment
- Portfolio completion
- Comprehensive feedback
- Certificate generation
- Export reports
```

---

## 6. Data Models

### 6.1 Core Entities

#### User
```typescript
type User = {
  id: string
  email: string
  role: 'admin' | 'mentor' | 'mentee'
  profile: Profile
  createdAt: Date
  updatedAt: Date
}

type Profile = {
  firstName: string
  lastName: string
  avatar?: string
  phone?: string
  bio?: string
  // Role-specific fields
  mentorProfile?: MentorProfile
  menteeProfile?: MenteeProfile
}
```

#### Mentorship
```typescript
type Mentorship = {
  id: string
  mentorId: string
  menteeIds: string[] // For group mentoring
  type: '1:1' | 'group'
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  startDate: Date
  endDate: Date
  programCycle: string
  goals: Goal[]
  meetings: Meeting[]
  portfolio: Portfolio
}
```

#### Meeting
```typescript
type Meeting = {
  id: string
  mentorshipId: string
  title: string
  type: 'offline' | 'online'
  scheduledAt: Date
  duration: number // minutes
  location?: string
  meetingUrl?: string
  qrCode?: {
    code: string
    expiresAt: Date
    usedAt?: Date
  }
  attendees: Attendance[]
  minutes?: MeetingMinutes
  status: 'scheduled' | 'completed' | 'cancelled'
}

type Attendance = {
  userId: string
  checkInTime?: Date
  checkInLocation?: GeoLocation
  status: 'present' | 'absent' | 'late'
}
```

#### Portfolio
```typescript
type Portfolio = {
  id: string
  menteeId: string
  initialAssessment: {
    personalityTests: Record<string, any>
    competencyScores: Record<string, number>
    goals: string[]
    completedAt: Date
  }
  progressUpdates: ProgressUpdate[]
  finalAssessment?: {
    goalsAchieved: number // percentage
    skillsGained: string[]
    mentorFeedback: string
    menteeSelfAssessment: string
    recommendations: string[]
    completedAt: Date
  }
}
```

#### Resource
```typescript
type Resource = {
  id: string
  title: string
  description?: string
  type: 'file' | 'link' | 'document'
  fileUrl?: string
  linkUrl?: string
  category: string
  tags: string[]
  uploadedBy: string
  visibility: 'public' | 'private' | 'group'
  targetAudience?: string[] // mentee IDs
  createdAt: Date
}
```

---

## 7. API Endpoints (Examples)

### 7.1 Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### 7.2 Users & Profiles
```
GET    /api/users/:id
PATCH  /api/users/:id
GET    /api/mentors
GET    /api/mentees
GET    /api/users/:id/portfolio
```

### 7.3 Mentorships
```
GET    /api/mentorships
POST   /api/mentorships
GET    /api/mentorships/:id
PATCH  /api/mentorships/:id
DELETE /api/mentorships/:id
GET    /api/mentorships/:id/goals
POST   /api/mentorships/:id/goals
```

### 7.4 Meetings
```
GET    /api/meetings
POST   /api/meetings
GET    /api/meetings/:id
PATCH  /api/meetings/:id
DELETE /api/meetings/:id
POST   /api/meetings/:id/qr-code
POST   /api/meetings/:id/check-in
GET    /api/meetings/:id/minutes
POST   /api/meetings/:id/minutes
```

### 7.5 Availability & Booking
```
GET    /api/mentors/:id/availability
POST   /api/mentors/:id/availability
POST   /api/bookings
GET    /api/bookings/:id
DELETE /api/bookings/:id
```

### 7.6 Resources
```
GET    /api/resources
POST   /api/resources
GET    /api/resources/:id
DELETE /api/resources/:id
POST   /api/resources/upload
```

### 7.7 Feedback
```
POST   /api/feedback
GET    /api/feedback/mentorship/:id
GET    /api/feedback/user/:id
```

### 7.8 Reports
```
GET    /api/reports/mentee/:id
GET    /api/reports/mentor/:id
GET    /api/reports/program/:cycleId
POST   /api/reports/export
```

---

## 8. Third-party Integrations

### 8.1 Calendar
- **Google Calendar API:** Sync meetings
- **Microsoft Outlook Calendar:** Alternative sync

### 8.2 Communication
- **Email Service:** SendGrid / AWS SES
  - Transactional emails
  - Notifications
  - Reminders
  
- **SMS (Optional):** Twilio
  - Critical reminders
  - OTP for MFA

### 8.3 File Storage
- **AWS S3 / Cloudflare R2:** File uploads
- **Cloudinary (Optional):** Image optimization

### 8.4 Analytics
- **Google Analytics 4:** Usage tracking
- **PostHog:** Product analytics
- **Mixpanel (Optional):** Event tracking

### 8.5 Authentication
- **Google OAuth:** SSO
- **Microsoft Azure AD (Optional):** NEU integration

### 8.6 Payment (Future)
- **Stripe:** If premium features needed

---

## 9. Compliance & Legal

### 9.1 Data Privacy
- **GDPR compliance** (if EU users)
- **Vietnam PDPA compliance**
- **Privacy Policy:** Clear, accessible
- **Terms of Service**
- **Cookie Policy**

### 9.2 Data Retention
- **Active data:** Unlimited during program
- **Archived data:** 7 years (for school records)
- **User-requested deletion:** 30-day grace period
- **Logs:** 90 days

### 9.3 Intellectual Property
- **User-generated content:** Users retain ownership
- **Platform license:** NEU owns platform
- **Open-source licenses:** Proper attribution

---

## 10. Success Metrics (KPIs)

### 10.1 Engagement Metrics
- **Active users:** Daily/Weekly/Monthly
- **Session duration:** Average time per visit
- **Feature adoption:** % using each feature
- **Meeting completion rate:** Scheduled vs. completed
- **Check-in accuracy:** % verified check-ins

### 10.2 Quality Metrics
- **Goal achievement rate:** % of goals met
- **Satisfaction scores:**
  - Mentee NPS
  - Mentor NPS
  - Program NPS
- **Portfolio completion rate**
- **Feedback submission rate**

### 10.3 Technical Metrics
- **Uptime:** 99.9% target
- **Page load time:** < 2.5s LCP
- **Error rate:** < 0.1%
- **API response time:** < 200ms p95

### 10.4 Business Metrics
- **Program completion rate:** Target 90%+
- **Mentor retention:** Year-over-year
- **Mentee retention:** Program-to-program
- **Resource utilization:** Downloads, views
- **ROI:** Time saved, outcomes improved

---

## 11. Roadmap

### 11.1 MVP (Phase 1) - 3 months
**Core Features:**
- User authentication & profiles
- Mentorship matching (manual by admin)
- Basic calendar & meeting scheduling
- Meeting minutes & reports
- Simple progress tracking
- File sharing
- Basic analytics dashboard

### 11.2 Phase 2 - 2 months
**Enhanced Features:**
- Calendly-style booking system
- QR check-in system
- Portfolio system (assessments)
- Goal tracking with visualization
- Two-way feedback system
- Resource library with search
- Email notifications

### 11.3 Phase 3 - 2 months
**Advanced Features:**
- Wiki/Knowledge base
- Advanced analytics & reporting
- Automated matching algorithm
- Mobile app (React Native)
- AI-powered recommendations
- Video call integration (Zoom/Teams)
- Gamification (badges, achievements)

### 11.4 Phase 4 - Ongoing
**Optimization & Scale:**
- Performance optimization
- Security hardening
- UX improvements based on feedback
- Additional integrations
- Multi-language support (EN/VN)
- Advanced AI features (chatbot, insights)

---

## 12. Risks & Mitigation

### 12.1 Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data breach | High | Low | Multi-layer security, penetration testing |
| System downtime | High | Medium | High availability setup, automated backups |
| Performance issues | Medium | Medium | Load testing, caching, CDN |
| Integration failures | Medium | Low | Fallback mechanisms, error handling |

### 12.2 User Adoption Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Low mentor engagement | High | Training, incentives, streamlined UX |
| Low mentee usage | High | Onboarding, gamification, mobile app |
| Resistance to QR check-in | Medium | Education, ease of use, offline mode |

### 12.3 Operational Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Lack of admin resources | Medium | Automation, intuitive admin tools |
| Data quality issues | Medium | Validation, mandatory fields, audits |
| Scope creep | Medium | Strict prioritization, phased approach |

---

## 13. Budget & Resources (Estimated)

### 13.1 Development Team
- **1x Full-stack Lead Developer** (6 months)
- **1x Frontend Developer** (4 months)
- **1x Backend Developer** (4 months)
- **1x UI/UX Designer** (2 months)
- **1x QA Engineer** (3 months)
- **1x DevOps Engineer** (part-time, 2 months)

### 13.2 Infrastructure Costs (Annual)
- **Hosting (Vercel Pro):** ~$200/month = $2,400/year
- **Database (managed PostgreSQL):** ~$100/month = $1,200/year
- **File Storage (S3):** ~$50/month = $600/year
- **CDN (Cloudflare):** Free tier / ~$20/month = $240/year
- **Monitoring (Sentry, etc.):** ~$50/month = $600/year
- **Email Service (SendGrid):** ~$20/month = $240/year
- **Domain & SSL:** ~$50/year
- **Total Infrastructure:** ~$5,500/year

### 13.3 Third-party Tools
- **Figma (Design):** $12/user/month
- **GitHub (Enterprise):** $21/user/month
- **Testing tools:** ~$100/month

---

## 14. Appendices

### 14.1 Glossary
- **IMP:** ISME Mentoring Program
- **ISME:** International School of Management and Economics
- **NEU:** National Economics University (Đại học Kinh tế Quốc dân)
- **PRD:** Product Requirements Document
- **MFA:** Multi-factor Authentication
- **RBAC:** Role-based Access Control
- **QR:** Quick Response (code)
- **NPS:** Net Promoter Score
- **MVP:** Minimum Viable Product
- **WCAG:** Web Content Accessibility Guidelines

### 14.2 References
- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [OWASP Security Guidelines](https://owasp.org/)
- [Web Vitals](https://web.dev/vitals/)

### 14.3 Change Log
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-11 | Claude | Initial PRD creation |

---

## 15. Approval & Sign-off

**Prepared by:** IMP Development Team  
**Reviewed by:** [Name, Title]  
**Approved by:** [Name, Title]  
**Date:** [Date]

---

**Contact Information:**
- **Project Lead:** [Email]
- **Technical Lead:** [Email]
- **Product Owner:** [Email]

---

*This document is confidential and proprietary to ISME@NEU. Distribution is limited to authorized personnel only.*
