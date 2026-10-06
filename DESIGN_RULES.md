# Tulie Mentoring - Design Rules

> [!IMPORTANT]
> **STRICT ENFORCEMENT REQUIRED**
> These rules must be followed in ALL UI components. AI Assistants must read and adhere to these rules before generating or modifying any UI code.

## 1. Typography

### ❌ FORBIDDEN:
- **No Uppercase**: Do NOT use `uppercase` class or `text-transform: uppercase` for headers, labels, buttons, or badges.
  - *Exception*: Only if specifically required by a third-party library constraint (extremely rare) or for specific acronyms (e.g., "ID", "URL").
- **No Letter Spacing**: Do NOT use `tracking-wide`, `tracking-wider`, `tracking-widest`.
  - Standard tracking (`tracking-normal`) is the default.
  - `tracking-tight` may be used sparingly for large headings (text-3xl+).

### ✅ REQUIRED:
- **Sentence Case**: Use standard sentence case for all text.
- **Font Weights**: Use `font-medium` (500) or `font-semibold` (600) for headers. Avoid overuse of `font-bold` (700) unless necessary for hierarchy.

## 2. Spacing & Layout

### ❌ FORBIDDEN:
- **Tight Headers**: Do NOT use `mb-1` for section headers or labels. It creates a cramped look.

### ✅ REQUIRED:
- **Comfortable Spacing**: 
  - Use `mb-2` to `mb-4` for section headers.
  - Ensure distinct separation between "Box Information" (cards/containers) and their internal content.
  - Add `gap-4` or `gap-6` in flex/grid layouts for clear component separation.

## 4. shadcn/ui Standardization

### ✅ REQUIRED:
- **Component Source**: ONLY use components from `@/components/ui`. Custom components representing similar UI (e.g., a custom Button) must be refactored to use the shadcn primitive.
- **Color Tokens**: Use semantic Tailwinds classes based on [shadcn tokens](https://ui.shadcn.com/docs/theming):
  - Backgrounds: `bg-background`, `bg-muted`, `bg-card`, `bg-secondary`.
  - Foregrounds: `text-foreground`, `text-muted-foreground`, `text-primary-foreground`.
  - Borders: `border-border`, `border-input`.
  - Primary Action: `bg-primary`, `text-primary-foreground`.
- **Border Radius**: Use standard `rounded-lg` (default) for cards and main containers. Use `rounded-md` for inputs and small buttons. Do NOT use `rounded-2xl` or `rounded-3xl` unless part of a specific branding element (e.g., avatars).
- **Shadows**: Use `shadow-sm` or `shadow-none` for a clean, flat look. Avoid `shadow-lg` or `shadow-xl`.

## 5. Implementation Workflow for New Features

1. **Schema First**: Update `prisma/schema.prisma` before building UI.
2. **shadcn/ui First**: Check if a component exists in shadcn before building from scratch.
3. **Responsive Design**: All new features MUST be mobile-first and responsive.
4. **Dark Mode**: Always test with the `.dark` class to ensure visibility.

---
*Last Updated: March 2026*
