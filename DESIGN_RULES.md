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

## 3. Data & Content

- **Real Data Priority**: All layouts must be designed to handle real data lengths. Avoid hardcoded short strings that break when real data is injected.
- **Mock Data**: When active, mock data should be realistic (full names, paragraphs) to test layout robustness.
