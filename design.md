# ISME Mentoring — Design System

> **Tài liệu quy chuẩn thiết kế** cho toàn bộ giao diện webapp.
> Mọi trang mới hoặc trang được chỉnh sửa **BẮT BUỘC** tuân theo hệ thống này.

---

## 1. Design Tokens — Màu sắc

### Quy tắc bắt buộc

> ⛔ **KHÔNG BAO GIỜ** dùng hardcoded hex/rgb: `#fafafa`, `#eaeaea`, `#666`, `#999`, `#333`, `#0070f3`
> ✅ **LUÔN** dùng CSS Variables / Tailwind semantic tokens

### Bảng ánh xạ

| ❌ Không dùng | ✅ Thay bằng | Mô tả |
|---|---|---|
| `text-black` | `text-foreground` | Màu chữ chính |
| `text-[#666]`, `text-[#999]` | `text-muted-foreground` | Chữ phụ, mô tả |
| `text-[#333]` | `text-foreground` | Chữ nội dung |
| `text-[#aaa]`, `text-[#bbb]`, `text-[#ccc]` | `text-muted-foreground` | Chữ tối nhạt |
| `text-white` (trên bg tối) | `text-primary-foreground` | Chữ trên nền primary |
| `bg-[#fafafa]` | `bg-muted` | Nền phụ |
| `bg-white` | `bg-background` hoặc `bg-card` | Nền chính |
| `bg-black` | `bg-primary` | Nền nhấn mạnh |
| `border-[#eaeaea]`, `border-[#eee]` | `border-border` | Viền mặc định |
| `border-[#333]` | `border-input` | Viền input/dark |
| `text-[#0070f3]` | `text-primary` | Màu accent (nếu phải dùng brand) |
| `shadow-black/10` | `shadow-sm` hoặc `shadow-md` | Bóng đổ |

### CSS Variables (định nghĩa trong `globals.css`)

```
Light Mode:
--background    oklch(1 0 0)        — trắng
--foreground    oklch(0.145 0 0)    — gần đen
--muted         oklch(0.97 0 0)     — xám nhạt
--muted-fg      oklch(0.556 0 0)    — xám trung
--primary       oklch(0.205 0 0)    — gần đen
--primary-fg    oklch(0.985 0 0)    — trắng
--border        oklch(0.922 0 0)    — xám viền
--destructive   oklch(0.58 0.22 27) — đỏ
```

---

## 2. Typography — Phông chữ

### Font Family

```
--font-sans: Inter, system-ui, -apple-system, sans-serif
--font-mono: ui-monospace, monospace
```

### Thang chữ chuẩn

| Semantic | Class | Dùng cho |
|---|---|---|
| **Page Title** | `text-2xl font-semibold text-foreground` | Tiêu đề trang (`<h1>`) |
| **Section Heading** | `text-lg font-semibold text-foreground` | Heading cho section trong trang |
| **Card Heading** | `text-base font-semibold text-foreground` | Heading bên trong Card |
| **Subsection Label** | `text-sm font-medium text-muted-foreground` | Label nhóm nhỏ |
| **Body Text** | `text-sm text-foreground` | Nội dung chính |
| **Description** | `text-sm text-muted-foreground` | Mô tả phụ dưới heading |
| **Caption / Meta** | `text-xs text-muted-foreground` | Timestamp, metadata |
| **Tiny Label** | `text-[10px] font-medium text-muted-foreground` | Label rất nhỏ (khi thật sự cần) |
| **Form Label** | `text-xs font-medium text-muted-foreground` | Label cho input/select |
| **Error Text** | `text-xs text-destructive font-medium` | Lỗi validation |

### Quy tắc bắt buộc

> ⛔ **TUYỆT ĐỐI KHÔNG** dùng `uppercase`, `text-transform: uppercase` (vì ghét HOA)
> ⛔ **TUYỆT ĐỐI KHÔNG** dùng `letter-spacing`, `tracking-wider`, `tracking-widest` (không giãn chữ)
> ⛔ **TUYỆT ĐỐI KHÔNG** dùng `italic`, `font-italic`, `font-style: italic`
> ⛔ **TUYỆT ĐỐI KHÔNG** dùng `font-extrabold` (800), `font-black` (900)

- `font-weight` **tối đa là 700** (`font-bold`). Không bao giờ vượt quá 700.
- `font-weight` thông thường: Chỉ dùng `font-medium` (500) hoặc `font-semibold` (600).
- `font-bold` (700): Chỉ dùng cho stat values lớn (`text-3xl font-bold`).
- **Không uppercase**: Mọi text đều giữ nguyên dạng viết (sentence case hoặc title case). Kể cả sidebar labels.
- **Không letter-spacing**: Tuyệt đối không dùng các class tracking của tailwind.
- **Không italic**: Không dùng `italic` hay `font-style: italic` ở bất kỳ đâu.
- `leading`: Dùng `leading-tight` cho heading, `leading-relaxed` cho paragraph dài.

---

## 3. Spacing — Khoảng cách

### 3.1 Page-level Spacing

```
┌──────────────────────────────────────┐
│         Page Container               │
│  class="space-y-8 pb-10"            │
│                                      │
│  ┌──── Page Header ───────────────┐  │
│  │ class="space-y-1"              │  │
│  │  <h1> Page Title               │  │
│  │  <p>  Description (mt-1)       │  │
│  └────────────────────────────────┘  │
│           ↕ gap: 32px (space-y-8)    │
│  ┌──── Stats Grid ────────────────┐  │
│  │ class="grid gap-4"             │  │
│  └────────────────────────────────┘  │
│           ↕ gap: 32px (space-y-8)    │
│  ┌──── Main Content ──────────────┐  │
│  │ grid / sections                │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

| Token | Tailwind | px | Dùng cho |
|---|---|---|---|
| **Page gap** | `space-y-8` | 32px | Giữa page header → stats → content |
| **Header internal** | `space-y-1` | 4px | Giữa `<h1>` và `<p>` description |
| **Description margin** | `mt-1` | 4px | Margin top của description |
| **Section gap** | `space-y-6` | 24px | Giữa section heading → nội dung trong section |
| **Card internal** | `space-y-4` | 16px | Giữa các block bên trong Card |
| **Grid gap (cards)** | `gap-4` | 16px | Giữa các Card trong grid |
| **Grid gap (sections)** | `gap-8` | 32px | Giữa các cột section lớn |
| **Page bottom** | `pb-10` | 40px | Padding bottom trang |

### 3.2 Card Internal Spacing

```
┌─── Card ─────────────────────────────┐
│  (py-4 px-4 tự động từ shadcn Card)  │
│                                       │
│  ┌── CardHeader ───────────────────┐  │
│  │  CardTitle                      │  │
│  │  CardDescription (gap-1)        │  │
│  └─────────────────────────────────┘  │
│        ↕ gap-4 (Card internal)        │
│  ┌── CardContent ──────────────────┐  │
│  │  ...nội dung...                 │  │
│  └─────────────────────────────────┘  │
│        ↕ gap-4 (Card internal)        │
│  ┌── CardFooter ──────────────────┐   │
│  │  ...actions...                  │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

### 3.3 Section Pattern

```tsx
{/* ✅ CHUẨN: Section với heading + content */}
<div className="space-y-6">
    <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Section Title</h3>
        <Button variant="outline" size="sm">Action</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* cards hoặc items */}
    </div>
</div>
```

### 3.4 Heading inside Card

```tsx
{/* ✅ CHUẨN: Heading bên trong Card */}
<Card>
    <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            Card Section Title
        </CardTitle>
    </CardHeader>
    <CardContent>
        {/* nội dung */}
    </CardContent>
</Card>

{/* ⚠️ Nếu Card không dùng CardHeader (custom layout): */}
<Card className="p-6">
    <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        Card Title
    </h3>
    {/* Nội dung bên dưới — LUÔN dùng mb-4 cho heading */}
</Card>
```

---

## 4. Page Layout Templates

### 4.1 Page Header

```tsx
{/* ✅ Header đơn giản */}
<div className="space-y-1">
    <h1 className="text-2xl font-semibold text-foreground">Page Title</h1>
    <p className="text-sm text-muted-foreground mt-1">Description goes here</p>
</div>

{/* ✅ Header với actions */}
<div className="flex items-center justify-between">
    <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Page Title</h1>
        <p className="text-sm text-muted-foreground mt-1">Description</p>
    </div>
    <Button>Action</Button>
</div>

{/* ✅ Header với actions phức tạp (responsive) */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
    <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Page Title</h1>
        <p className="text-sm text-muted-foreground mt-1">Description</p>
    </div>
    <div className="flex gap-3">
        <Button variant="outline">Secondary</Button>
        <Button>Primary</Button>
    </div>
</div>
```

### 4.2 Stats Grid

```tsx
{/* ✅ Grid 3 cột */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <StatCard title="Label" value={42} icon={<Icon />} />
</div>

{/* ✅ Grid 4 cột */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard title="Label" value={42} icon={<Icon />} />
</div>
```

### 4.3 Content Layout: Main + Sidebar

```tsx
{/* ✅ 2/3 + 1/3 */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 space-y-6">
        {/* Main content sections */}
    </div>
    <div className="space-y-6">
        {/* Sidebar sections */}
    </div>
</div>

{/* ✅ 8/12 + 4/12 (cho layout phức tạp hơn) */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <div className="lg:col-span-8 space-y-6">
        {/* Main */}
    </div>
    <div className="lg:col-span-4 space-y-6">
        {/* Sidebar */}
    </div>
</div>
```

### 4.4 Full Page Template

```tsx
export default function ExamplePage() {
    return (
        <div className="space-y-8 pb-10">
            {/* Page Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Page Title</h1>
                <p className="text-sm text-muted-foreground mt-1">Page description</p>
            </div>

            {/* Stats (optional) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard ... />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Sections */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Section</h3>
                        </div>
                        <div className="grid gap-4">
                            {/* Cards */}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Sidebar */}
                </div>
            </div>
        </div>
    );
}
```

---

## 5. Components — Hướng dẫn sử dụng

### 5.1 Button

| Variant | Dùng cho |
|---|---|
| `default` (primary) | CTA chính, submit forms |
| `outline` | Hành động phụ, "Xem tất cả" |
| `ghost` | Hành động nhẹ, back button, icon-only |
| `destructive` | Xóa, hủy (cần xác nhận) |
| `link` | Inline text links |
| `secondary` | Hành động trung lập |

| Size | Dùng cho |
|---|---|
| `default` (h-8) | Mặc định |
| `sm` (h-7) | Compact, inline actions |
| `lg` (h-9) | CTA nổi bật |
| `icon` (32×32) | Icon button |
| `icon-sm` (28×28) | Icon button nhỏ |

### 5.2 Card

```tsx
{/* Card cơ bản với structure chuẩn */}
<Card>
    <CardHeader>
        <CardTitle>Tiêu đề</CardTitle>
        <CardDescription>Mô tả ngắn</CardDescription>
    </CardHeader>
    <CardContent>
        {/* Nội dung */}
    </CardContent>
    <CardFooter>
        {/* Actions */}
    </CardFooter>
</Card>

{/* Card compact */}
<Card size="sm">...</Card>
```

### 5.3 Badge

| Variant | Dùng cho |
|---|---|
| `default` / `primary` | Trạng thái chính, active |
| `secondary` | Trạng thái phụ, inactive |
| `outline` | Tag, category |
| `destructive` | Lỗi, cảnh báo |

### 5.4 Avatar

```tsx
{/* Sizes */}
<Avatar size="sm" /> {/* 24px — trong lists, comments */}
<Avatar size="default" /> {/* 32px — mặc định */}
<Avatar size="lg" /> {/* 40px — profile cards */}

{/* Group */}
<AvatarGroup>
    <Avatar ... />
    <Avatar ... />
    <AvatarGroupCount>+3</AvatarGroupCount>
</AvatarGroup>
```

### 5.5 Input & Select

```tsx
{/* Input với label và error */}
<Input label="Email" error={errors.email} placeholder="you@example.com" />

{/* Select với label */}
<Select label="Vai trò" options={[
    { label: "Mentor", value: "mentor" },
    { label: "Mentee", value: "mentee" },
]} />
```

### 5.6 Dialog / Modal

```tsx
{/* Dialog chuẩn */}
<Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        {/* Content */}
        <DialogFooter showCloseButton>
            <Button>Confirm</Button>
        </DialogFooter>
    </DialogContent>
</Dialog>

{/* Hoặc dùng wrapper Modal */}
<Modal isOpen={isOpen} onClose={handleClose} title="Title" size="md">
    {/* Content */}
</Modal>
```

### 5.7 EmptyState

```tsx
<EmptyState
    icon={<Icon className="w-5 h-5" />}
    title="Không có dữ liệu"
    description="Mô tả ngắn về cách tạo dữ liệu"
    action={<Button size="sm">Tạo mới</Button>}
/>
```

### 5.8 Progress

```tsx
<Progress value={75} />
{/* Progress bar — chỉ có 1 size (h-1) */}
```

### 5.9 Skeleton (Loading)

```tsx
{/* Loading placeholder */}
<Skeleton className="h-4 w-32" />
<Skeleton className="h-8 w-full" />
<Skeleton className="h-32 w-full rounded-xl" />
```

### 5.10 Table

```tsx
<Table>
    <TableHeader>
        <TableRow>
            <TableHead>Cột 1</TableHead>
            <TableHead>Cột 2</TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        <TableRow>
            <TableCell>Data 1</TableCell>
            <TableCell>Data 2</TableCell>
        </TableRow>
    </TableBody>
</Table>
```

### 5.11 Tabs

```tsx
<Tabs defaultValue="tab1">
    <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Content 1</TabsContent>
    <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>

{/* Line variant */}
<Tabs>
    <TabsList variant="line">...</TabsList>
</Tabs>
```

### 5.12 DropdownMenu

```tsx
{/* Full dropdown */}
<DropdownMenu trigger={<Button variant="ghost">Menu</Button>}>
    <DropdownItem icon={<Edit />} onClick={handleEdit}>Edit</DropdownItem>
    <DropdownSeparator />
    <DropdownItem icon={<Trash />} destructive onClick={handleDelete}>Delete</DropdownItem>
</DropdownMenu>
```

---

## 6. Animation & Effects

### Transitions chuẩn

| Loại | Class | Dùng cho |
|---|---|---|
| **Mặc định** | `transition-all` | Mọi phần tử tương tác |
| **Chỉ màu** | `transition-colors` | Hover text/background |
| **Chỉ transform** | `transition-transform` | Scale, translate |
| **Chậm hơn** | `transition-all duration-200` | Hiệu ứng phức tạp |
| **Rất chậm** | `transition-all duration-300` | Entrance effects |

### Hover Effects

```tsx
{/* ✅ Card hover — border chuyển đen */}
<div className="border border-border hover:border-foreground/20 transition-all">

{/* ✅ Card hover — nâng lên + shadow */}
<div className="hover:shadow-lg hover:-translate-y-0.5 transition-all">

{/* ✅ Icon hover — bg chuyển primary */}
<div className="bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">

{/* ✅ Button ẩn/hiện khi hover parent */}
<Button className="opacity-0 group-hover:opacity-100 transition-opacity">
```

### Page Entrance

```tsx
{/* ✅ Fade in toàn trang — thêm vào container chính */}
<div className="animate-fade-in">
```

> ⚠️ Cần define `animate-fade-in` trong CSS nếu chưa có.

---

## 7. Responsive Breakpoints

| Breakpoint | Tailwind | Dùng cho |
|---|---|---|
| Mobile | default | 1 cột, giấu sidebar |
| Tablet | `md:` (768px) | 2 cột stats, hiện thêm info |
| Desktop | `lg:` (1024px) | 3 cột, hiện sidebar, full layout |
| Wide | `xl:` (1280px) | Max-width container (hiếm dùng) |

### Responsive Patterns

```tsx
{/* Stats: 1 → 2 → 3/4 cột */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

{/* Content + Sidebar: stack → side-by-side */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

{/* Header actions: stack → inline */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
```

---

## 8. Icon Conventions

- **Thư viện**: `lucide-react` (duy nhất)
- **Size mặc định**: `w-4 h-4` (16px)
- **Size trong stat/card icon**: `w-5 h-5` (20px)
- **Size nhỏ (inline)**: `w-3.5 h-3.5` (14px)
- **Màu**: `text-muted-foreground` (mặc định), `text-primary-foreground` (trên nền primary)
- **Trong heading**: Đặt trước text, dùng `gap-2`

```tsx
<h3 className="flex items-center gap-2">
    <Icon className="w-4 h-4 text-muted-foreground" />
    Section Title
</h3>
```

---

## 9. Checklist cho Developer

Khi tạo trang mới, hãy kiểm tra:

- [ ] Container: `space-y-8 pb-10`
- [ ] Page header: `space-y-1` → `<h1>` + `<p>` desc
- [ ] Heading dùng đúng thang chữ (xem mục 2)
- [ ] Section spacing: `space-y-6` (heading → nội dung)
- [ ] Card dùng `CardHeader` / `CardContent` (hoặc heading + `mb-4`)
- [ ] Không hardcoded colors (`#fafafa`, `#666`...)
- [ ] Design tokens cho tất cả màu
- [ ] Responsive grid (`grid-cols-1 md:... lg:...`)
- [ ] Transitions trên phần tử tương tác
- [ ] Icon size nhất quán (`w-4 h-4` mặc định)
