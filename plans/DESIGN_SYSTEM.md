# ManoBalamHealthCare — Design System

This document is the single source of truth for every visual decision in the app: colors, type, spacing, component states, and layout patterns. `FRONTEND_PLAN.md` defines what data each screen needs and how it's wired; this document defines what it looks like. Read both before building any UI. If a component's visual spec isn't covered here, stop and ask rather than inventing a one-off style — consistency across 50+ components only holds if every one of them traces back to this file's tokens, not to local judgment calls made screen-by-screen.

Base library: **shadcn/ui** (Radix primitives + Tailwind, copy-owned source, not an npm dependency) + **lucide-react** for icons. Optional: **reactbits** for occasional animated/illustrative flourishes (the breathing/check-in card, empty states) — used sparingly, never for core interactive components like buttons/inputs/forms, which stay pure shadcn for accessibility and consistency.

Grounded in the client-provided mockups (`Manobalam_Work_Flow.pdf`, pages 13-14): soft pastel-tinted cards, large rounded corners, calming lavender/violet primary, generous whitespace, pill-shaped buttons, star ratings, illustrated empty/wellness states.

---

## 1. Why shadcn + lucide (and how reactbits fits in)

shadcn isn't a component package you `npm install` — its CLI copies component source directly into `src/components/ui/`, so you own and can edit every line without fighting library internals or waiting on upstream PRs. It's built on Radix primitives, meaning accessibility (keyboard nav, focus management, ARIA) is handled correctly by default rather than something to bolt on later. Theming runs entirely on CSS custom properties, which is exactly what makes clean multi-theme support possible — change the variables, every component everywhere updates, no per-component edits.

lucide-react supplies every icon (nav icons, action icons, status icons) — consistent stroke width and style throughout, never mixed with another icon set or inline SVGs from random sources.

reactbits is optional and decorative-only: things like an animated breathing circle for the check-in card, subtle background flourishes, or empty-state illustrations with light motion. It must never be the base for a form input, button, or anything involved in a critical user flow (auth, payment, booking) — those stay on plain shadcn so behavior is predictable and accessible.

---

## 2. Color System — Centralized Tokens

All color lives in **one file**: `src/styles/globals.css`. No component ever hardcodes a hex/oklch value or a raw Tailwind color class like `bg-purple-600` — every component uses the semantic token classes (`bg-primary`, `text-foreground`, `bg-card`, etc.) that Tailwind generates from these CSS variables. This is what makes multi-theme actually work: switching themes means swapping the variable block, touching zero component files.

### 2.1 Token roles (semantic, not literal)
```
background / foreground       -> page base surface and default text
card / card-foreground         -> elevated surface (cards, panels)
popover / popover-foreground   -> dropdowns, tooltips, dialogs
primary / primary-foreground   -> main brand actions (buttons, links, active states)
secondary / secondary-foreground -> lower-emphasis actions
muted / muted-foreground       -> disabled states, placeholder text, subtle backgrounds
accent / accent-foreground     -> hover backgrounds, highlighted rows
destructive / destructive-foreground -> delete/cancel/error actions
success / success-foreground   -> confirmations, "online" indicators, completed states
warning / warning-foreground   -> caution states (e.g. slot expiring soon)
crisis / crisis-foreground     -> reserved EXCLUSIVELY for crisis banners/emergency UI — never reused for generic errors, so it keeps its visual weight when it matters most
border / input / ring          -> borders, input outlines, focus rings
```

### 2.2 `src/styles/globals.css` — full token definitions
```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));

@layer base {
  :root {
    /* base surfaces */
    --background: oklch(0.99 0.005 300);
    --foreground: oklch(0.22 0.02 280);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.22 0.02 280);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.22 0.02 280);

    /* brand */
    --primary: oklch(0.55 0.18 295);          /* violet, matches mockup CTA buttons */
    --primary-foreground: oklch(0.99 0.005 300);
    --secondary: oklch(0.94 0.02 295);
    --secondary-foreground: oklch(0.35 0.08 295);

    /* neutral/utility */
    --muted: oklch(0.96 0.01 280);
    --muted-foreground: oklch(0.52 0.02 280);
    --accent: oklch(0.95 0.03 295);
    --accent-foreground: oklch(0.35 0.08 295);

    /* semantic states */
    --destructive: oklch(0.58 0.22 25);
    --destructive-foreground: oklch(0.99 0.005 300);
    --success: oklch(0.62 0.15 145);
    --success-foreground: oklch(0.99 0.005 300);
    --warning: oklch(0.78 0.15 70);
    --warning-foreground: oklch(0.28 0.07 60);

    /* crisis — deliberately separate from destructive, reserved only for crisis UI */
    --crisis: oklch(0.55 0.21 25);
    --crisis-foreground: oklch(0.99 0.005 300);

    /* pastel accent set — Quick Action tiles, illustrated cards (from mockup) */
    --pastel-mint: oklch(0.93 0.05 165);
    --pastel-mint-foreground: oklch(0.35 0.08 165);
    --pastel-peach: oklch(0.93 0.06 50);
    --pastel-peach-foreground: oklch(0.4 0.1 40);
    --pastel-pink: oklch(0.93 0.05 10);
    --pastel-pink-foreground: oklch(0.4 0.1 5);
    --pastel-lavender: oklch(0.93 0.04 295);
    --pastel-lavender-foreground: oklch(0.4 0.1 295);

    /* structure */
    --border: oklch(0.9 0.01 280);
    --input: oklch(0.9 0.01 280);
    --ring: oklch(0.55 0.18 295);
    --radius: 1rem;                            /* large rounded corners per mockup */
  }

  .dark {
    --background: oklch(0.18 0.015 280);
    --foreground: oklch(0.95 0.01 280);
    --card: oklch(0.22 0.02 280);
    --card-foreground: oklch(0.95 0.01 280);
    --popover: oklch(0.22 0.02 280);
    --popover-foreground: oklch(0.95 0.01 280);

    --primary: oklch(0.68 0.16 295);
    --primary-foreground: oklch(0.15 0.02 280);
    --secondary: oklch(0.28 0.03 295);
    --secondary-foreground: oklch(0.9 0.02 295);

    --muted: oklch(0.26 0.02 280);
    --muted-foreground: oklch(0.65 0.02 280);
    --accent: oklch(0.3 0.04 295);
    --accent-foreground: oklch(0.9 0.02 295);

    --destructive: oklch(0.62 0.2 25);
    --destructive-foreground: oklch(0.15 0.02 280);
    --success: oklch(0.65 0.14 145);
    --success-foreground: oklch(0.15 0.02 280);
    --warning: oklch(0.72 0.14 70);
    --warning-foreground: oklch(0.18 0.05 60);

    --crisis: oklch(0.62 0.2 25);
    --crisis-foreground: oklch(0.15 0.02 280);

    --pastel-mint: oklch(0.3 0.05 165);
    --pastel-mint-foreground: oklch(0.85 0.05 165);
    --pastel-peach: oklch(0.32 0.06 50);
    --pastel-peach-foreground: oklch(0.85 0.06 50);
    --pastel-pink: oklch(0.3 0.05 10);
    --pastel-pink-foreground: oklch(0.85 0.05 10);
    --pastel-lavender: oklch(0.3 0.04 295);
    --pastel-lavender-foreground: oklch(0.85 0.04 295);

    --border: oklch(0.3 0.02 280);
    --input: oklch(0.3 0.02 280);
    --ring: oklch(0.68 0.16 295);
  }

  /* OPTIONAL future theme — example of how a third theme slots in without touching components */
  .theme-calm-teal {
    --primary: oklch(0.55 0.12 195);
    --ring: oklch(0.55 0.12 195);
    /* override only what differs from :root; everything else inherits */
  }
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-crisis: var(--crisis);
  --color-crisis-foreground: var(--crisis-foreground);
  --color-pastel-mint: var(--pastel-mint);
  --color-pastel-mint-foreground: var(--pastel-mint-foreground);
  --color-pastel-peach: var(--pastel-peach);
  --color-pastel-peach-foreground: var(--pastel-peach-foreground);
  --color-pastel-pink: var(--pastel-pink);
  --color-pastel-pink-foreground: var(--pastel-pink-foreground);
  --color-pastel-lavender: var(--pastel-lavender);
  --color-pastel-lavender-foreground: var(--pastel-lavender-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 0.25rem);
  --radius-sm: calc(var(--radius) - 0.5rem);
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

### 2.3 Theme switching mechanism
```tsx
// src/app/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "calm-teal";
interface ThemeContextValue { theme: Theme; setTheme: (t: Theme) => void; }

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("manobalam-theme") as Theme) || "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-calm-teal");
    if (theme === "dark") root.classList.add("dark");
    if (theme === "calm-teal") root.classList.add("theme-calm-teal");
    localStorage.setItem("manobalam-theme", theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
```
This is a small custom provider rather than `next-themes` (which targets Next.js's SSR hydration concerns that don't apply to Vite's pure client-side rendering) — same pattern, lighter weight. `theme` persists in `localStorage` (this is fine to use directly here since it's a UI preference, not auth/session data — unrelated to the artifact-storage `localStorage` restriction, which only applies inside Claude-rendered artifacts, not your actual deployed app). Wrap `App.tsx`'s root in this provider, alongside the existing `providers.tsx` from `FRONTEND_PLAN.md`.

### 2.4 Rule for every component going forward
Never write `className="bg-purple-600"` or `style={{ color: "#7c3aed" }}` anywhere in `features/` or `components/`. Always `bg-primary`, `text-primary-foreground`, `bg-pastel-mint`, etc. If a new color need arises that doesn't map to an existing token, add it to `globals.css` first, then use it — don't reach for a raw Tailwind palette color as a shortcut.

---

## 3. Typography

```
Font: Inter (via @fontsource/inter or Google Fonts link) — clean, highly legible, free, works well at small mobile sizes which matters given the mobile-first mockups.

Scale (Tailwind classes, applied consistently):
  text-3xl font-bold     -> page titles ("Your Mental Wellness, Our Priority")
  text-2xl font-semibold -> section headers ("Quick Actions", "Find a Psychologist")
  text-lg font-semibold  -> card titles (psychologist name, appointment title)
  text-base               -> body text, form labels
  text-sm                  -> secondary info (ratings, timestamps, helper text)
  text-xs                  -> badges, tags, fine print

Line height: leading-relaxed for paragraphs, leading-tight for headings.
```
No component picks an arbitrary font size outside this scale — if something needs to be "a bit bigger," check whether it should actually be promoted to the next scale step rather than introducing `text-[17px]` one-offs.

---

## 4. Spacing & Layout Tokens

```
Spacing scale: stick to Tailwind defaults (4px base unit) — 1, 2, 3, 4, 6, 8, 12, 16, 24.
Page horizontal padding: px-4 on mobile, px-6 md:px-8 on desktop.
Card padding: p-4 on compact cards (psychologist card, appointment row), p-6 on feature cards (the "Check In Now" hero card).
Gap between cards in a grid/list: gap-4.
Section vertical spacing: space-y-6 between major page sections (matches the mockup's generous breathing room between "Quick Actions," "Upcoming Session," "Find a Psychologist").

Border radius (uses the --radius token, never arbitrary values):
  rounded-lg  (--radius, 1rem)        -> cards, modals — matches the heavily rounded mockup cards
  rounded-md  (--radius - 0.25rem)    -> buttons, inputs
  rounded-full                          -> pills (CTA buttons), avatars, badges, the bottom-nav FAB
```

---

## 5. Core Components (shadcn-based) — States & Usage Rules

Install via `npx shadcn@latest add button input card dialog badge avatar select textarea tabs progress sonner skeleton`. Each is then customized only via the CSS variables above — never by hand-editing the copied component's hardcoded colors.

### 5.1 Button
Variants used in this app: `default` (primary, pill-shaped `rounded-full` override for main CTAs like "Check In Now," "Book a Session"), `secondary`, `outline`, `ghost` (icon-only nav actions), `destructive` (cancel appointment, delete).
States every button must visibly support: default, hover (slightly darker/lighter via the token, not a separate hardcoded color), active/pressed, disabled (muted, `cursor-not-allowed`), loading (spinner replaces label, button stays same width to avoid layout shift).

### 5.2 Card
Base for: psychologist cards, appointment cards, quick-action tiles, the wellness tip card. Quick-action tiles specifically use the pastel tokens as background (`bg-pastel-mint`, `bg-pastel-peach`, `bg-pastel-pink`, `bg-pastel-lavender`) cycling per tile, matching the mockup's four-color quick-action row exactly.
States: default, hover (subtle `shadow-md` lift on interactive cards only — static info cards don't need a hover state since they're not clickable).

### 5.3 Input / Textarea / Select
States: default, focus (`ring-2 ring-ring`), error (border switches to `border-destructive`, helper text below in `text-destructive`), disabled.
Every form field that can error must reserve space for the error message below it even when absent (e.g. a fixed-height `<p>` that's empty by default) — prevents layout jump when validation errors appear.

### 5.4 Badge
Used for: appointment status (`confirmed` = success token, `pending_payment` = warning token, `cancelled` = muted token), specialization tags on psychologist cards, risk level on assessment results (`low`/`moderate` = success/warning, `high`/`severe` = crisis token specifically, not destructive — reinforces that this is a different category of concern).

### 5.5 Avatar
Always paired with an online-status dot (a small `absolute` positioned circle, `bg-success` when online) for psychologist avatars specifically — matches the green dot in the mockup's psychologist cards. Patient avatars never show this dot since patient online status isn't tracked or shown.

### 5.6 Dialog / Sheet
Dialog (centered modal) for desktop confirmations (cancel appointment, refund confirmation). Sheet (slide-up from bottom) for mobile equivalents of the same actions — matches mobile-native interaction patterns better than a centered modal on small screens. `BookingFlowPage` and other multi-step flows use full pages, not dialogs, since they're too complex for a modal.

### 5.7 Toast (via `sonner`, already in the install list)
Used for every async action's success/failure feedback (booking confirmed, payment failed, profile updated) — never a blocking `alert()`, never a silently-failing action with no feedback at all.

### 5.8 Skeleton
Every data-fetching component (`PsychologistCard` list, `AppointmentList`, chat history load) shows skeleton placeholders matching the final content's approximate shape during loading — never a bare spinner for list content, and never a flash of empty state before data arrives.

---

## 6. Layout Patterns Per Screen Type

These patterns standardize how different *kinds* of screens are structured, so the agent doesn't reinvent layout logic per page.

### 6.1 Dashboard/Home pattern (patient `/home`)
Top: app bar (logo + notification bell + avatar). Greeting block. One large hero card (check-in / mood prompt) using a pastel/illustrated style. A horizontal-scroll or 4-column grid of Quick Action tiles (icon + label + sublabel, pastel-colored, per mockup). An "Upcoming Session" card if one exists (else an empty state prompting to book). A horizontally-scrollable "Find a Psychologist" row of cards. Bottom nav fixed on mobile (Home / Sessions / Book-FAB / Messages / Profile, matching the mockup exactly), replaced by a left `Sidebar` on desktop/tablet width — same nav items, vertical layout.

### 6.2 List/Browse pattern (psychologist list, appointments list, admin lists)
Sticky filter/search bar at top. Cards in a responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) for browsing-type lists (psychologists); a single-column stacked list for chronological/status-based lists (appointments, admin pending verifications) since order matters more than visual scanning there. Pagination controls at the bottom matching the backend's `meta.page/totalPages` — either numbered pagination (desktop/admin) or infinite-scroll-style "Load more" (patient-facing mobile lists, friendlier for touch).

### 6.3 Detail pattern (psychologist detail, appointment detail)
Header block (avatar, name, key stats) followed by sectioned content below (`bio`, `specialization` badges, `credentials`/reviews) — no sidebar-detail split on mobile (stacks vertically); optional two-column split on desktop only if content genuinely benefits (psychologist detail: profile left, booking CTA sticky right).

### 6.4 Wizard pattern (booking flow, assessment flow)
Full-page (not modal), persistent progress indicator at top (`Progress` component or numbered steps), one logical step's content per screen, sticky "Back / Continue" actions at the bottom of viewport (especially important on mobile so the primary action is always reachable without scrolling). Exiting mid-wizard always asks for confirmation if any input has been entered, rather than silently discarding it.

### 6.5 Live session pattern (`/session/:id`)
Chat mode: full-height message list with input pinned to bottom, matching standard messaging app conventions. Video/audio mode: full-bleed video tiles with floating `CallControls` overlay (mute/camera/end), session timer pinned top-center, chat collapsible into a side panel (desktop) or bottom sheet (mobile) rather than a separate page — patients shouldn't lose the call to check chat.

### 6.6 Admin/dashboard pattern
Sidebar navigation (always visible on desktop, since admin is assumed desktop-primary usage, collapsible on tablet/mobile if accessed there). Content area uses data-dense tables (a proper shadcn `Table`, not cards) for lists since admins scan many rows — pastel/illustrated styling is dropped here in favor of a more neutral, dense, utilitarian look; the calming consumer aesthetic is for patient/psychologist-facing screens, not the admin back office.

---

## 7. Responsive Breakpoints

Standard Tailwind breakpoints, used consistently:
```
(default)  -> mobile, < 640px   — primary target per mockups, bottom nav, single column
sm: 640px  -> large phone / small tablet — minor spacing increases
md: 768px  -> tablet — 2-column grids begin, sidebar nav may appear for admin
lg: 1024px -> desktop — full multi-column layouts, sidebar nav standard
xl: 1280px -> large desktop — max content width constrained (max-w-7xl mx-auto), avoid full-bleed stretching on huge monitors
```
Every page-level component is built mobile-first (base classes target mobile, `md:`/`lg:` prefixes layer on enhancements) — never the reverse (building desktop first and cramming into mobile via overrides), since the source mockups are mobile-first and that's the primary usage pattern for a teletherapy app.

---

## 8. Accessibility Baseline (non-negotiable, comes free with shadcn/Radix but must not be undermined)

Every interactive element reachable via keyboard tab order. Every icon-only button (`ghost` variant nav icons) has an `aria-label`. Color is never the only signal for status (e.g. appointment status badges pair color with text, not just a colored dot). Focus rings (`ring-2 ring-ring`) are never removed via `outline-none` without replacing them with an equally visible custom focus style. Crisis banner content must be screen-reader-announced immediately (`role="alert"`) when it appears, not silently rendered.

---

## 9. File Updates This Implies for `FRONTEND_PLAN.md`

This design system doesn't replace anything in `FRONTEND_PLAN.md` — it fills in the visual layer on top of the existing folder structure and component list. Two small additions to wire in when building:

- `src/styles/globals.css` (full token file, section 2.2 above) replaces the placeholder mention of "tailwind base + custom CSS vars" from the original frontend plan.
- `src/app/ThemeProvider.tsx` (section 2.3 above) is a new file, wrapped around the app in `src/app/providers.tsx` alongside existing providers.
- Every `components/ui/*.tsx` file in the original frontend plan's folder structure is now sourced via the shadcn CLI (`npx shadcn@latest add <component>`) rather than hand-written from scratch — faster, accessible by default, and themeable for free through the tokens above.
