# Tulie Mentoring — AI Context

Next.js 16 + React 19 + Prisma 7 + shadcn/ui + Tailwind v4 + TypeScript
PostgreSQL, NextAuth v5, Zustand, React Hook Form + Zod v4, Recharts, Framer Motion

## Workflow bắt buộc
1. Schema first → `prisma/schema.prisma`
2. Server Action → `src/lib/actions/*.ts` (luôn `await auth()` check)
3. Validation → `src/lib/validators.ts` (Zod)
4. Component → `src/components/features/` (client component)
5. Page → `src/app/(dashboard)/` (server component)

## UI rules
- **CHỈ** dùng `@/components/ui` (shadcn primitives), `lucide-react` icons (`w-4 h-4`)
- **CHỈ** dùng semantic tokens: `text-foreground`, `bg-muted`, `border-border`, v.v.
- **CẤM**: uppercase, italic, letter-spacing, hardcoded colors (#fff, #000), shadow-lg, rounded-2xl
- Font weight max 700, thường dùng 500-600
- Page container: `space-y-8 pb-10`, heading: `text-2xl font-semibold`

## Khi cần context chi tiết
- UI task → đọc `.knowns/docs/core/design-system`
- Architecture → đọc `.knowns/docs/core/codebase-architecture`
- Conventions → đọc `.knowns/docs/core/coding-conventions`
- Overview → đọc `.knowns/docs/core/project-overview`

## Roles
`admin`, `program_manager`, `facilitator`, `mentor`, `mentee`, `manager`

## Commands
- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npx prisma db push` — sync schema
- `npx prisma studio` — DB GUI
