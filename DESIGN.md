# WarungCuan Design System

## 1. Atmosphere & Identity

A practical, no-nonsense POS dashboard for a small grocery store ("warung sembako"). Clean, operational, approachable. The signature is a fresh green accent (`#2ECC9A`) against a calm dark sidebar and light main surface — conveying trust, simplicity, and the lifeblood of a small business: cash flow. The interface prioritizes density where it matters (product lists, transactions) and breathing room in summaries. It should feel like a reliable daily tool, not a spectacle.

## 2. Color

### Palette

| Role | Token | Light | Usage |
|------|-------|-------|-------|
| Surface/base | `--bg` | `#F0F4F8` | Main page background |
| Surface/card | `--card` | `#FFFFFF` | Cards, panels, dropdowns |
| Surface/sidebar | `--sidebar` | `#1E2D3D` | Sidebar background |
| Text/primary | `--text` | `#1E2D3D` | Headlines, body |
| Text/muted | `--text-muted` | `#607080` | Captions, hints, metadata |
| Text/sidebar | `--sidebar-text` | `#E8F4F0` | Sidebar navigation text |
| Text/sidebar-muted | `--sidebar-muted` | rgba(255,255,255,0.55) | Sidebar secondary text |
| Border/default | `--border` | `#D8E4EC` | Cards, dividers, inputs |
| Accent/primary | `--accent` | `#2ECC9A` | Buttons, active states, highlight |
| Accent/text | `--accent-text` | `#1E2D3D` | Text on accent backgrounds |
| Danger/primary | `--danger` | `#E05252` | Negative amounts, destructive actions |
| Danger/light | `--danger-light` | `#FEF0F0` | Danger badge backgrounds |
| Status/success-bg | — | `#E8FFF5` | Success indication background |
| Status/success-text | — | `#1A7A50` | Success indication text |
| Sidebar/active | `--sidebar-active` | rgba(255,255,255,0.12) | Active nav item background |

### Rules
- Accent green is used exclusively for interactive elements (buttons, links, active nav) and positive financial values.
- Danger red is used only for negative amounts, voids, and destructive actions.
- Sidebar uses dark background with white text — no light mode variant.
- Never introduce a color not in this table. Extend the table first.

## 3. Typography

### Font Stack
- **Primary**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Mono/Numbers**: system-ui (tabular figures via `font-variant-numeric: tabular-nums`)

> Note: The project uses system fonts for performance. No external font dependencies.

### Scale

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | 18px / 1.125rem | 700 | 1.3 | Page titles |
| H2 | 15px / 0.9375rem | 700 | 1.3 | Section headers |
| Body | 14px / 0.875rem | 400 | 1.5 | Default text |
| Body/sm | 13px / 0.8125rem | 400 | 1.5 | Dense text |
| Caption | 12px / 0.75rem | 400 | 1.4 | Secondary info |
| Overline | 10px / 0.625rem | 600 | 1.3 | Card labels, uppercase |
| Label | 12px / 0.75rem | 600 | 1.4 | Form labels |
| Metric | 18px / 1.125rem | 700 | 1.2 | Dashboard numbers |
| Metric/lg | 22px / 1.375rem | 700 | 1.2 | Hero metrics (kekayaan) |
| Badge | 9px / 0.5625rem | 700 | 1 | Status badges |

### Rules
- Body text never below 12px (except badges at 9px).
- Numbers in financial contexts should use `<span class="tabular-nums">` for proper alignment.
- H1 is used once per page.

## 4. Spacing & Layout

### Base Unit
All spacing derives from a base of **4px**.

| Token | Value | Usage |
|-------|-------|-------|
| --space-1 | 4px | Tight gaps, badge padding |
| --space-2 | 8px | Input padding Y, tight groups |
| --space-3 | 12px | Button padding Y, inline groups |
| --space-4 | 16px | Card padding, nav padding |
| --space-5 | 20px | Main content padding (mobile) |
| --space-6 | 24px | Main content padding (desktop), card padding |
| --space-8 | 32px | Between card groups |
| --space-10 | 40px | Section spacing |

### Grid
- **Max content width**: 1280px, but most pages use constrained widths (max-w-2xl for forms, max-w-4xl for dashboard)
- **Column system**: Tailwind CSS Grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- **Card gap**: 20px (gap-5)
- **Responsive**: Mobile-first with `md:` breakpoint at 768px

### Layout
- **Page pattern**: `main.p-6.md:p-8` with optional `max-w-*` constraint
- **Section pattern**: cards inside `space-y-*` containers
- **Sidebar**: fixed 180px left sidebar, full viewport height

### Rules
- No magic numbers. Every spacing value maps to a 4px multiple.
- Page padding: p-6 (24px) mobile, md:p-8 (32px) desktop.

## 5. Components

### Button
- **Structure**: `<button>` with optional disabled state
- **Variants**: `primary` (filled accent), `secondary` (bordered), `ghost` (text), `danger` (filled danger)
- **Spacing**: px-5 py-2.5 (horizontal 20px, vertical 10px)
- **Typography**: text-sm (14px), font-bold
- **Border radius**: 8px
- **States**:
  - **Default**: as described per variant
  - **Hover (primary)**: opacity-90
  - **Hover (ghost)**: bg-bg/50
  - **Active**: scale(0.98) via transform
  - **Disabled**: bg-border, text-muted, cursor-not-allowed
  - **Loading**: disabled state + "Memproses..." text
- **Accessibility**: focus-visible ring (accent/50)

### Card
- **Structure**: `<div>` container
- **Variants**: `default` (bordered+shadow), `highlight` (border-2 accent for hero metric), `hoverable` (hover:border-accent/30)
- **Spacing**: p-5 (20px) inside
- **Typography**: title optional, body content
- **Border radius**: 10px
- **States**:
  - **Default**: bg-card, border border-border, shadow-sm
  - **Hover (hoverable)**: hover:border-accent/40, hover:bg-bg/10
  - **Disabled/void**: opacity-50

### Input
- **Structure**: `<input>` with label and optional placeholder
- **Spacing**: px-3 py-2
- **Typography**: text-sm
- **Border radius**: 8px
- **States**:
  - **Default**: bg-card, border border-border
  - **Focus**: border-accent, ring-1 ring-accent/50
  - **Placeholder**: text-text-muted/60
  - **Disabled**: bg-border, text-muted

### Select
- **Structure**: `<select>` with label
- **Spacing**: px-3 py-2
- **Typography**: text-sm
- **Border radius**: 8px
- **States**: Same as Input

### Badge
- **Structure**: `<span>` inline element
- **Variants**: `danger` (danger-light bg, danger text), `success` (success-bg bg, success-text text), `outline` (border only)
- **Typography**: 9px, font-bold, uppercase, tracking-wider
- **Border radius**: 2px (rounded)
- **Spacing**: px-1.5 py-0.5

### EmptyState
- **Structure**: Centered container with icon + message + optional sub-message
- **Typography**: centered, muted text

### LoadingState
- **Structure**: Text-only loading indicator
- **Typography**: text-sm, text-muted

### PageHeader
- **Structure**: `<h1>` heading with optional description/subtitle and back link
- **Spacing**: mb-6 below heading

### FormSection (Group)
- **Structure**: Card container wrapping form fields in space-y-5
- **Spacing**: p-6 inside, space-y-5 between fields
- **Width**: max-w-md constrained

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 150ms | ease | Button hover, color transitions |
| Standard | 200-300ms | ease | Panel transitions |

### Rules
- Only animate `opacity`, `color`, `background`, `border-color`, `transform` (hover scale).
- Every interactive element has hover + focus-visible states.
- Reduced motion: rely on CSS `transition` only — no JS-driven animations.
- Slop animation forbidden: no motion on non-interactive elements, no decorative-only animation.

## 7. Depth & Surface

### Strategy: Mixed (borders + subtle shadows)

Cards use both a border and a subtle shadow for separation:

| Level | Value | Usage |
|-------|-------|-------|
| Default | `0 1px 2px rgba(0,0,0,0.04)` combined with `1px solid var(--border)` | Cards at rest |
| Elevated | `0 2px 8px rgba(0,0,0,0.08)` | Highlight cards (e.g. Kekayaan Warung) |

Sidebar uses no borders or shadows — depth is created purely by the dark background color against the light main area.

### Rules
- Sidebar sections separated by subtle rgba(255,255,255,0.08-0.1) borders.
- Interactive cards get hover border accent effect.
- Void/disabled items get 50% opacity.
