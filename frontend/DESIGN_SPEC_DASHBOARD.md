# Security SOC Dashboard — Design Specification (source of truth)

This document is the single source of truth for the SOC dashboard.
Every agent MUST follow these values exactly. Do not invent your own colours,
radii, spacing, type sizes or copy.

Reference: the two provided design images —
(a) full app frame (nav + page header + widgets) and
(b) standalone card grid (components showcase).

---

## 0. Hard rules

- **No new dependencies.** No chart libs, no icon packs beyond `lucide-react`
  (already installed). Charts are hand-built `<svg>`.
- **No AI slop.** No decorative gradients, no glow blobs, no float/pulse
  animations, no emoji, no invented sections, no lorem text. Quiet, data-first,
  reproduce the reference literally.
- **Exact copy.** Use the exact strings in §7. Do not rename or add rows.
- **Functionality is unchanged.** This task restyles/rebuilds the frontend UI
  only. Do not alter API contracts, auth, state logic, or remove existing
  routes/features. Only `frontend/` is touched.
- **Accessibility.** Real `<button>`s, `aria-label` on icon-only controls,
  `<title>` on SVG charts, focus-visible rings, `role="img"` + label on data
  viz cells.
- **Responsive.** Desktop-first to match the design; below `lg` the grid stacks
  to one column and cards keep internal layout.
- Components live in `frontend/src/components/dashboard/overview/`.
- Client components (`"use client"`) only when they use state/hooks.

## 1. Shared primitives (already written — import, do NOT re-create)

`frontend/src/components/dashboard/overview/primitives.tsx` exports:

| Export | Purpose / spec |
| --- | --- |
| `OverviewCard` | Card shell: `rounded-2xl border border-console-line bg-console-raised p-6`, hover `-translate-y-0.5` + border `#2A2A2A` |
| `CardHeading` | `{ title, action? }` → 18px/600 title + trailing node |
| `CardMenuButton` | the "•••" affordance (`label` required) |
| `CircleIconButton` | 36×36 rounded-full bordered icon button (nav) |
| `SquareControl` | h-9 rounded-lg dark pill (date range / Export / overflow) |
| `Badge` | `{ tone: high\|medium\|low\|ok\|neutral }` 12px/500, 6px radius |
| `StatusDot` | 8px dot; `active` = tone colour, else `#2A2A2A` |
| `RiskBar` | `{ value, tone }` 12-tick meter, filled = tone, empty `#2A2A2A` |

Badge tone fills (built-in): high `#E5484D` on `#2E1517`;
medium `#E8B923` on `#2B2311`; ok/low green `#2ED88F` on `#123B2A`;
neutral `#8A8A8A` on `#1A1A1A`.

## 2. Colour palette (Tailwind tokens, already in `tailwind.config.ts`)

| Token | Value | Use |
| --- | --- | --- |
| `canvas` | `#E8E8E8` | light page background outside the app frame |
| `console` | `#0A0A0A` | app frame background |
| `console-raised` | `#111111` | card background, nav bar background |
| `console-soft` | `#141414` | tab-group container, subtle surfaces |
| `console-pill` | `#1A1A1A` | buttons, "View All Alerts", muted badge bg |
| `console-line` | `#1E1E1E` | card border, dividers |
| `console-hairline` | `#222222` | secondary border |
| `console-hover` | `#2A2A2A` | hover border, empty risk ticks, read dots |
| `fg` | `#FFFFFF` | primary text |
| `fg-muted` | `#8A8A8A` | secondary text, labels, axis |
| `fg-faint` | `#6B6B6B` | tertiary text, timestamps, "•••" |
| `mint-400` | `#34D399` | chart line |
| `mint-500` | `#2ED88F` | accent green: bright heat cells, Resolved, Investigating |
| `mint-700` | `#1A7A55` | mid green: heat medium, In Progress |
| `mint-800` | `#14532D` | dark green |
| `mint-900` | `#0F3D2E` | low green: heat low, Open segment |
| `mint-300` | `#5EEAD4` | Escalated segment (lightest/top) |
| `sev-high` | `#E5484D` | High badge text, red |
| `sev-medium` | `#E8B923` | Medium badge text, warning yellow |
| `risk-high` | `#E5484D` | rose risk ticks |
| `risk-medium` | `#E8B923` | amber risk ticks |
| `risk-low` | `#2ED88F` | mint risk ticks |

Info/orange `#F5A623` (badge bg `#2B2311`) — reserved, only if a severity needs it.

Heat scale (5 levels): low `#0F3D2E`, medium `#1A7A55`, high `#2ED88F`;
"none" cell = `#141414` (`bg-console-soft`). Brightest cells may carry a faint
bloom (`shadow-[0_0_12px_-2px_rgba(46,216,143,0.45)]`), used sparingly.

Green is used sparingly — only active data, positive trends, unread indicators.

## 3. Typography

Font is **Inter** (`--font-sans`, set in `src/app/layout.tsx`). Mono is
JetBrains Mono. Use `font-mono` + `tabular-nums` for numeric columns.

| Element | Class |
| --- | --- |
| H1 "Welcome back, Edward" | `text-[36px] font-bold leading-[1.1] tracking-[-0.02em] text-fg` |
| Page subtitle | `text-[14px] text-fg-muted` |
| Card title | `text-[18px] font-semibold tracking-[-0.01em]` (in `CardHeading`) |
| Alert/row title | `text-[14px] font-semibold text-fg` |
| Body / row value | `text-[13px] text-fg` |
| Label / axis / column header | `text-[12px] text-fg-muted` |
| Timestamp / caption / legend | `text-[12px] text-fg-faint` |

Never `font-bold` on card titles (max 600). Numbers use `tabular-nums`.

## 4. Layout geometry

```
page wrapper            : bg-canvas min-h-screen
app frame               : mx-auto my-8 max-w-[1440px] rounded-[24px] bg-console
                          border border-black/5 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.5)]
                          overflow-hidden
frame inner padding     : px-8 (32px)
nav bar height          : h-16 (64px), bg-console-raised
content top padding     : pt-8 after nav
content bottom padding  : pb-8
grid                    : 12-col, gap 24px  → `grid gap-6` / `lg:grid-cols-12`
```

Row 1: three cards, 4 cols each (`lg:col-span-4` ×3) — Threat Tactics,
Detection Volume, Alert Center.
Row 2: Security Threats `lg:col-span-7` (~60%), Response Status
`lg:col-span-5` (~40%).
Row gap 24px. Row 1 card min-height ≈ 360px; row 2 ≈ 340px. Charts fill
remaining height via `flex-1 min-h-0`.

## 5. Console nav (top bar) — §4 of design prompt

Left → right, inside a `bg-console-raised` 64px bar:
1. Circular logo button: `h-10 w-10 rounded-full bg-console border border-console-line`
   with `CyberNexusMark` (`@/components/logo`) 18px, `text-fg`.
2. Tab group: outer `flex items-center gap-1 rounded-full bg-console-soft p-1`.
   Tabs (`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium`):
   - Dashboard — icon `LayoutDashboard`, ACTIVE: `bg-console-hover text-fg`
   - Threats — `ShieldAlert`, inactive `text-fg-muted hover:text-fg`
   - Assets — `Monitor`
   - Reports — `Folder`
   Links: `/dashboard`, `/dashboard#threats`, `/dashboard#assets`, `/reports`.
3. Right cluster: `CircleIconButton` + `Search`; notification bell (reuse
   `@/components/app/notification-button` logic) inside a `CircleIconButton`;
   user pill: `flex items-center gap-2.5 rounded-full border border-console-line bg-console py-1 pl-1 pr-3`
   → 30px round avatar, name `Edward Martin` `text-[14px] font-semibold text-fg`,
   email `edwardmartinpark@mail.com` `text-[12px] text-fg-muted`, `ChevronDown`
   14px `text-fg-faint`. Reuse `@/components/app/user-menu` state/logic.

## 6. Page header — §5

Left: H1 `Welcome back, Edward`; subtitle `Latest security activity overview`.
Right (gap-3):
1. Date pill `SquareControl`: `Calendar` 14px + `Jan 15 – Jan 19, 2026` +
   `ChevronDown`.
2. Export `SquareControl`: share icon (`Share2`/`Upload`) 14px + `Export`.
3. Overflow `SquareControl` `MoreHorizontal`, square (`px-0 w-9`).

## 7. Widget specs

### 7.1 Threat Tactics Activity (heatmap) — §6
`OverviewCard` + `CardHeading title="Threat Tactics Activity"` +
`CardMenuButton label="Threat tactics options"`.
Left label column `w-[110px] shrink-0`, labels 13px `text-fg-muted`:
`Initial Access`, `Execution`, `Discovery`, `Defense Evasion`,
`Lateral Movement`.
Grid: 5 cols × 5 rows, cells `h-[28px] rounded-lg` (8px radius), gap 4px.
Levels: 0 = none `#141414`, 1 = `#0F3D2E`, 2 = `#1A7A55`, 3 = `#2ED88F`.
Organic pattern (Discovery row has most bright cells):
```
Initial Access    1 1 2 1 0
Execution         1 2 1 2 1
Discovery         3 2 3 1 3
Defense Evasion   1 3 1 2 1
Lateral Movement  0 1 2 1 1
```
Bottom axis 12px `text-fg-faint`: `15 Jan`, `16 Jan`, `17 Jan`, `18 Jan`,
`19 Jan`. Each cell `role="img" aria-label="{row} {date}"`.

### 7.2 Detection Volume Trend (area chart) — §7
`OverviewCard` + `CardHeading title="Detection Volume Trend"` +
`CardMenuButton label="Detection volume options"`.
Y-axis 12px `text-fg-muted`: `100`, `80`, `60`, `40`, `20`, `0`.
X-axis 12px: `W1`, `W2`, `W3`, `W4` (W3 active = `text-fg`, rest `text-fg-faint`).
Hand-built SVG:
- Line `#34D399`, 2px, round joins/caps, jagged realistic data (~28–34 points,
  range 20–75, noisy dip to ~25 in W2, climbing W3–W4). Deterministic array —
  no `Math.random`.
- Area fill: gradient `rgba(52,211,153,0.22)` → `rgba(52,211,153,0)`.
- Horizontal dashed baseline at ~55: `stroke="#2A2A2A"` dash `4 4`.
- Vertical dashed indicator at hovered/active point.
- Marker: white circle r=4, stroke `#34D399` 2px; subtle bloom.
- Tooltip (HTML overlay): `rounded-[10px] border border-console-line bg-console-soft px-3 py-2.5 shadow-xl`,
  line1 `New Detections: 52` `text-[13px] font-medium text-fg`,
  line2 up-arrow badge `+12%` `text-[12px] font-medium text-mint-500` +
  `vs previous week` `text-[12px] text-fg-faint`.

### 7.3 Alert Center — §8
`OverviewCard` + `CardHeading title="Alert Center"` +
`CardMenuButton label="Alert center options"`.
Rows `py-4`, `border-b border-console-line last:border-0`:
1. `Privilege Escalation Detected` + `Badge tone="high"` `High` · `1 hour ago`
   · `StatusDot tone="ok" active`
2. `Privilege Escalation Detected` + `Badge tone="medium"` `Medium` · `1 hour ago`
   · `StatusDot tone="neutral"`
3. `Abnormal Login Pattern` + `Badge tone="medium"` `Medium` · `3 hours ago`
   · `StatusDot tone="neutral"`
Row: title 14px/600 + badge (`items-center gap-2`), timestamp 12px
`text-fg-faint` `mt-1`, dot vertically centred right.
Footer (mt-auto): `View All Alerts` full-width `h-10 rounded-full
bg-console-pill text-[13px] font-medium text-fg hover:bg-console-hover` +
`ArrowRight` 15px.

### 7.4 Security Threats (table) — §9
`OverviewCard`. Heading: `CardHeading title="Security Threats"` with a select
action styled `h-8 rounded-lg border border-console-line bg-console-pill px-3
text-[12px] text-fg-muted appearance-none` + `ChevronDown`, value
`View: All System`.
Column header row: `grid grid-cols-[minmax(0,1.9fr)_minmax(0,1.2fr)_minmax(0,1.15fr)_minmax(0,0.95fr)_28px] gap-4 px-1 pb-3 text-[12px] text-fg-muted`
→ `Entity`, `Category`, `Risk Level`, `Status`, empty.
Rows (`grid` same cols, `items-center gap-4 rounded-xl border
border-console-line bg-console px-4 py-3`, list `space-y-2`):

| Entity | Sub | Category | Risk | Status |
| --- | --- | --- | --- | --- |
| `tanya.hill@example.com` | `User · Azure AD` | `Authentication` | `RiskBar 56 tone="medium"` + `56%` | `Badge medium` `Monitoring` |
| `dev-28110633.okta.com` | `Service Account` | `Privilege` | `RiskBar 92 tone="low"` + `92%` | `Badge ok` `Investigating` |
| `m.scott@trexony.com` | `Endpoint · Corporate Device` | `Execution` | `RiskBar 25 tone="high"` + `25%` | `Badge high` `Mitigated` |

Entity cell: 32px circle `bg-console-pill` with icon (`AtSign`, `Cloud`/hex,
`Monitor` — 15px `text-fg`), name `text-[13px] font-semibold text-fg`, sub
`text-[12px] text-fg-faint`. % text `text-[12px] text-fg-muted tabular-nums ml-2`.
Trailing: `CardMenuButton`.

### 7.5 Response Status Distribution (stacked bars) — §10
`OverviewCard` + `CardHeading title="Response Status Distribution"` +
`CardMenuButton label="Response status options"`.
7 stacked bars `Mon…Sun`. Segment order bottom→top: Open `#0F3D2E`,
In Progress `#1A7A55`, Resolved `#2ED88F`, Escalated `#5EEAD4`.
All bars except Thu are dim/muted (low contrast, e.g. greys `#1A1A1A`/`#141414`);
Thu is active/saturated. Bar width 44px, rounded 6px, gap flexible.
Day labels 12px `text-fg-faint`, `Thu` = `text-fg`.
Per-day (Open/In Progress/Resolved/Escalated):
`Mon 6/2/1/0`, `Tue 4/1/2/0`, `Wed 5/2/1/0`, `Thu 7/3/5/2`, `Fri 3/1/1/0`,
`Sat 5/2/0/0`, `Sun 4/1/1/0`.
Tooltip on Thu (HTML overlay `rounded-[10px] border border-console-line
bg-console-soft px-3 py-2 shadow-xl`), rows = dot + label 12px `text-fg-muted`
+ count 12px `text-fg tabular-nums`:
`Escalated 2`, `Resolved 5`, `In Progress 3`, `Open 7`.
Legend below: 4 items (`flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-fg-muted`)
with 8px rounded swatch: Escalated `#5EEAD4`, Resolved `#2ED88F`,
In Progress `#1A7A55`, Open `#0F3D2E`.

## 8. Deliverable — TWO views

(a) **Full app frame** = `/dashboard` route: app frame + nav + page header +
all five widgets in the §4 grid.
(b) **Standalone card grid** (components showcase) = a separate route, e.g.
`/design` (or `/dashboard/showcase`): the five widgets rendered directly on the
`bg-canvas` background WITHOUT the app frame/nav/header, in a centered
container — a components gallery for review. It must not disturb existing
routes.

## 9. File ownership (do NOT touch files you do not own)

| Owner | Files |
| --- | --- |
| A | `overview/top-nav.tsx`, `overview/welcome-header.tsx` |
| B | `overview/threat-tactics-card.tsx` |
| C | `overview/detection-trend-card.tsx` |
| D | `overview/alert-center-card.tsx`, `overview/security-threats-card.tsx` |
| E | `overview/response-status-card.tsx`, `src/app/(app)/dashboard/page.tsx`, showcase route, `src/app/(app)/layout.tsx` (chrome suppression for the frame view only) |

Foundation (done, read-only for agents): `tailwind.config.ts`,
`src/app/globals.css`, `overview/primitives.tsx`, `src/app/layout.tsx`.

## 10. Integration contract (E composes these)

```ts
import { ConsoleTopNav }       from "@/components/dashboard/overview/top-nav";
import { WelcomeHeader }       from "@/components/dashboard/overview/welcome-header";
import { ThreatTacticsCard }   from "@/components/dashboard/overview/threat-tactics-card";
import { DetectionTrendCard }  from "@/components/dashboard/overview/detection-trend-card";
import { AlertCenterCard }     from "@/components/dashboard/overview/alert-center-card";
import { SecurityThreatsCard } from "@/components/dashboard/overview/security-threats-card";
import { ResponseStatusCard }  from "@/components/dashboard/overview/response-status-card";
```
All take no required props. `ConsoleTopNav` and `WelcomeHeader` render full
width inside the frame (page supplies padding).
