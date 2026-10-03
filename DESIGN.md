# DESIGN.md — Playground App Dashboard

Design spec for the logged-in dashboard (notes, blogs, categories, reminders, streaks).
Direction: **minimal productivity** — clean light theme, generous whitespace, hairline
borders instead of shadows. One accent color, reserved for the streak.

References this spec is modeled on: Notion, Reflect, shadcn/ui dashboard examples.

---

## 1. Principles

1. **Borders, not shadows.** Structure comes from 1px hairlines. Shadows are
   allowed only on modals/popovers.
2. **Grayscale first.** Color appears in exactly two places: black primary
   buttons and the amber streak accent. Everything else is neutral.
3. **One accent, one job.** Amber (`#F59E0B`) belongs to the streak. Never use
   it for links, buttons, or badges.
4. **Restraint at scale.** Page titles are semibold (500), never bold. Decorative
   gradients, colored panels, and illustration clutter are out of scope.
5. **Plain rows over cards** for lists. Cards are only for stats.

---

## 2. Color tokens

| Token | Value | Usage |
|---|---|---|
| `--background` | `#FFFFFF` | App background, cards, inputs |
| `--surface` | `#FAFAF9` | Sidebar, secondary panels, table header fills |
| `--surface-hover` | `#F1F1EF` | Row/menu hover state, active sidebar item |
| `--foreground` | `#1F1F1F` | Primary text |
| `--muted-foreground` | `#787774` | Secondary text, labels, descriptions |
| `--subtle-foreground` | `#9B9A97` | Timestamps, placeholders, disabled text |
| `--border` | `#E9E9E7` | All hairlines: cards, dividers, inputs, buttons |
| `--accent` | `#F59E0B` | **Streak only** (flame, count, week dots) |
| `--accent-soft` | `#FEF3C7` | Streak dot fill / soft highlight behind flame |
| `--primary` | `#1F1F1F` | Primary button background, active toggles |
| `--primary-foreground` | `#FFFFFF` | Text on primary buttons |
| `--danger` | `#DC2626` | Destructive actions (delete) — hover state only |

Dark mode: same structure, not in v1. If added later, follow Linear's model
(`#0E0E10` bg, `#1F1F23` surfaces, hairlines at 8% white).

---

## 3. Typography — Geist + Geist Mono

Both fonts are free (Google Fonts / Vercel).

**Loading**

```tsx
// Next.js — app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
// <html className={`${geist.variable} ${geistMono.variable}`}>
```

```bash
# Vite/React
npm i @fontsource-variable/geist @fontsource-variable/geist-mono
```

**CSS variables**

```css
:root {
  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, monospace;
}
```

**Type scale**

| Element | Font | Size / Weight | Notes |
|---|---|---|---|
| Page title ("Good morning, X") | Geist | 24px / 500 | `letter-spacing: -0.02em` |
| Section header | Geist | 16px / 500 | `letter-spacing: -0.01em` |
| Note/blog title in lists | Geist | 14px / 500 | |
| UI text, inputs | Geist | 13px / 400 | |
| Button labels | Geist | 13px / 500 | |
| Note & blog body text | Geist | 15px / 400 | `line-height: 1.6` |
| Timestamps, counts, streak number | **Geist Mono** | 12–13px / 400 | see below |

**Rules**

- Negative tracking (`-0.01em` to `-0.02em`) on 16px+ only. Never on small text.
- All numeric metadata (timestamps, counts) renders in Geist Mono — this is the
  signature detail of the design. Example: `🔥 7` streak tile → number in mono.
- Stat-tile numbers get `font-variant-numeric: tabular-nums` so digits align
  across the row.
- Two fonts total. No third font anywhere, including empty states and emails.

---

## 4. Spacing, radius, elevation

| Token | Value |
|---|---|
| Base unit | 4px |
| Card padding | 24px |
| Section gap | 32px |
| List row padding | 12px 8px |
| Radius — cards | 8px |
| Radius — buttons/inputs | 6px |
| Radius — badges/dots | full |
| Shadow | **none** on cards, rows, buttons. Allowed only on modals/popovers: `0 4px 24px rgba(0,0,0,0.08)` |
| Reading content max-width | 880px |

---

## 5. Dashboard layout

```
┌────────────┬────────────────────────────────────────┐
│ sidebar    │  "Good morning, {name}"     24px/500   │
│ 220–240px  │  subline, 13px muted                   │
│ #FAFAF9    │                                        │
│            │  ┌─────────┬──────────┬─────────────┐  │
│  Notes     │  │ Streak  │ Today's  │ Notes this  │  │
│  Blogs     │  │ 🔥 7d   │ logs 2/3 │ week 14     │  │
│  Categories│  └─────────┴──────────┴─────────────┘  │
│  Reminders │                                        │
│            │  Today's entries            16px/500   │
│ ────────   │  ────────────────────────────────────  │
│  ⚙ Sett.   │  Note title             14:32 (mono)   │
│            │    one-line preview…    13px muted     │
│            │  ────────────────────────────────────  │
└────────────┴────────────────────────────────────────┘
```

- **Sidebar**: flat, full-height, 220–240px wide. Nav rows are icon (16px) +
  label (13px). Active item = `--surface-hover` fill, no accent color, no left
  border bars. A hairline separates nav from settings at the bottom.
- **Stat tiles**: 3-up row, equal widths, 1px border, 8px radius. Number
  (20px/500, mono, tabular) on top, 12px muted label below. No charts in v1.
- **Note list**: rows, not cards. Each row: title (14px/500) + one-line preview
  (13px, muted, truncated) on the left; timestamp (Geist Mono) on the right.
  Rows separated by `--border`, full-bleed hover → `--surface-hover`.
- **Streak display** (the one place with personality): 🔥 + mono count. Below
  it, a 7-dot week row — filled `--accent-soft` dot with `--accent` ring for
  logged days, empty `--border` dot for missed days. Under 7px dots.

---

## 6. Components

**Buttons**

| Variant | Style |
|---|---|
| Primary | `--primary` bg, white text, 6px radius, no shadow |
| Secondary | white bg, `--border` border, `--foreground` text |
| Ghost | transparent, `--muted-foreground` text; hover → `--surface-hover` |
| Destructive | transparent, `--danger` text — appears on row hover only |

Height 32px (sm) / 36px (md). Icon buttons 28px.

**Inputs**: white bg, `--border`, 6px radius, 36px height. Focus ring:
`2px #1F1F1F` at 15% opacity, no color.

**Badges** (categories/status): `--surface` bg, `--border`, 12px Geist, 4px
radius. No colored badges.

**Empty states**: single muted emoji + one sentence, 13px `--muted-foreground`,
centered. No illustrations.

**Modals/popovers**: white, 8px radius, the single allowed shadow, `--border`.

---

## 7. Motion

- Hover transitions: `150ms ease` on background-color/border only.
- No entrance animations, no parallax, no scale-on-hover for rows.
- Modal fade+4px rise, 150ms.

---

## 8. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Hairline dividers between rows | Drop shadows on cards |
| Mono for all timestamps/counts | Colored badges or chips |
| Black primary buttons | Amber/blue buttons |
| One amber accent for streak | Gradient anywhere |
| 8px radius everywhere consistent | Mixed 2px/12px/24px radii |
| Semibold titles | Bold 700 titles |

---

## 9. Tailwind mapping (if the frontend uses Tailwind)

```ts
// tailwind.config.ts
{
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        surface: "#FAFAF9",
        "surface-hover": "#F1F1EF",
        foreground: "#1F1F1F",
        "muted-foreground": "#787774",
        "subtle-foreground": "#9B9A97",
        border: "#E9E9E7",
        accent: "#F59E0B",
        "accent-soft": "#FEF3C7",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: { DEFAULT: "6px", card: "8px" },
      boxShadow: { overlay: "0 4px 24px rgba(0,0,0,0.08)" },
    },
  },
}
```

---

## 10. References

- ui.shadcn.com/examples/dashboard — base structure to clone
- notion.so — sidebar, hover states, table rows
- reflect.app — note list/editor polish
- linear.app — dark-mode variant (later)
- Geist: vercel.com/font · fontsource: @fontsource-variable/geist
