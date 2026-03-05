# Slide Markdown Structure Guide

This guide describes how to structure markdown/HTML content for the Tulie Mentoring slide system. These slides are processed by a system using **BlockNote** for editing and **Reveal.js** for presentation.

## 1. Slide Separation
Slides are separated by a horizontal rule marker. Use any of the following:
- `<hr />` (Preferred for consistency with BlockNote)
- `---` (3 or more dashes on a new line)
- `***` (3 or more asterisks on a new line)

## 2. Basic Formatting
Use standard Markdown or HTML:
- `# H1` -> Large title slide heading
- `## H2` -> Section heading
- `### H3` -> Subsection heading
- `**bold**`, `*italic*`
- `<ul><li>item</li></ul>` or Markdown lists

## 3. Custom Layouts: Columns
The system supports multi-column layouts using custom tags. Note that horizontal rules (`---`) should NOT be used inside a `[cols]` block.

### Two Columns
```markdown
[cols]
[col]
### Left Column Title
- Point 1
- Point 2
[/col]
[col]
### Right Column Title
Add some description or an image here...
[/col]
[/cols]
```

### Three Columns
```markdown
[cols-3]
[col]
Content A
[/col]
[col]
Content B
[/col]
[col]
Content C
[/col]
[/cols]
```

## 4. Text Coloring
For highlighting important terms, use the following syntax (compatible with BlockNote's internal format):
- `[Your Text](textColor=red)`
- `[Success](textColor=green)`

Available colors: `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `gray`, `brown`.

## 5. Themes
The presentation supports various themes including:
- `white` (Default light)
- `black` (Default dark)
- Custom Hex codes (e.g., `#2a52be`)

## 6. Example Slide Deck
```markdown
# Welcome to Tulie Mentoring
Subheading here...

<hr />

## Our Vision
- Empowering mentors
- Impacting mentees
- Building the future together

<hr />

[cols]
[col]
### The Problem
Traditional mentoring is:
1. Fragmented
2. hard to track
3. Inconsistent
[/col]
[col]
### Our Solution
[Tulie Mentoring](textColor=blue) provides:
- Centralized hub
- Activity logs
- Goal tracking
[/col]
[/cols]
```
