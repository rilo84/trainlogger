# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server.
- `npm run build` — type-check the whole project (`tsc -b`) then produce a production build in `dist/`. Run this to verify a change compiles; there is no separate lint step and no test suite.
- `npm run preview` — serve the built `dist/` locally (useful for testing the PWA service worker, which is not active under `dev`).

`tsconfig.app.json` enables `strict`, `noUnusedLocals`, and `noUnusedParameters`, so unused imports/variables fail the build.

## Architecture

A single-page React 19 + TypeScript app built with Vite, packaged as an installable PWA (`vite-plugin-pwa`, `registerType: 'autoUpdate'`). The product is branded **Treni** in the UI and PWA manifest; `claudetrainer` is only the repo/package name and the localStorage key prefix. It lets a user log training hours per activity and track them against weekly/monthly goals.

**No backend, no real authentication.** Everything runs client-side. `LoginPage` simply constructs a `User` object (name + email) and stores it; presence of that object is the only gate on the rest of the app.

### State and persistence

All application state lives in `src/App.tsx` as four `useState` hooks: `activities`, `goals`, `user`, `settings`. Each is:

- initialized lazily from `localStorage` via a `load*` function that returns a default on any parse error, and
- written back to `localStorage` by a dedicated `useEffect` whenever it changes.

Storage keys are `claudetrainer.activities`, `claudetrainer.goals`, `claudetrainer.user`, `claudetrainer.settings`. Mutations are plain immutable-update handler functions in `App.tsx` (`handleAddActivity`, `handleLogHours`, `handleAddGoal`, …) passed down as props. IDs come from `crypto.randomUUID()`. There is no state library and no context — props are threaded explicitly. Deleting an activity also cascades to delete its goals.

### Navigation

There is no router. `App.tsx` holds an `activePage` state of type `PageId` (`'overview' | 'activities' | 'goals' | 'settings'`) and conditionally renders one page component inside `Layout`. To add a page: extend the `PageId` union in `src/types.ts`, add an entry to `NAV_ITEMS` in `src/components/Layout.tsx` (drives both the sidebar and the mobile bottom nav), and render it in `App.tsx`. `Layout` is responsive with three nav surfaces (sidebar / mobile header / bottom nav).

### Data model (`src/types.ts`)

- `Activity` owns its `logs: LogEntry[]` inline; a `LogEntry` is `{ hours, date }`.
- `Goal` has `activityId: string | null` where **`null` means a total goal across all activities**, plus `period: 'week' | 'month'` and `targetHours`. Duplicate goals (same `activityId` + `period`) are rejected in `handleAddGoal`.

### Time / progress calculations (`src/utils.ts`)

- Weeks start **Monday** (`getWeekStart`).
- `currentPeriodActualHours(activities, period, activityId)` is the core progress function: it sums log hours whose period-start matches the current period-start; `activityId === null` aggregates across all activities (for total goals). Overview goal components (`TotalGoalsProgress`, `PerActivityGoalsProgress`, `GoalRing`) build on this.

### Internationalization

`i18next` + `react-i18next`, configured in `src/i18n/i18n.ts`. Swedish (`sv`) is the default and fallback language; English (`en`) is the other. UI strings live in `src/i18n/locales/sv.json` and `en.json` — **keep both files in sync** when adding keys. Components read strings via `useTranslation()` / `t('nav.overview')`.

The selected language is stored inside the `settings` object. `i18n.ts` reads `claudetrainer.settings` directly from `localStorage` at module load (before React mounts) to pick the initial language; `App.tsx` then calls `i18n.changeLanguage` in an effect whenever `settings.language` changes.

### Input widgets and modals

`WheelPicker` (`src/components/WheelPicker.tsx`) is a custom touch scroll picker (iOS-style) used for entering hours, dates, and activity selection. It snaps by rounding `scrollTop / ITEM_HEIGHT` after a 120 ms debounce. Helper builders live in the same file: `buildHourOptions(maxHours, step)` where callers pass `stepMinutes / 60` as the step, `buildDateOptions(daysBack, …)` (90 days back, with localized "today"/"yesterday" labels), and `todayIso()`. The minute granularity is `settings.hourStepMinutes` (default 15, options 1–60), configurable on the Settings page.

Modals are not a component — they are an ad-hoc pattern: a `.settings-sheet-backdrop` div with `onClick={onClose}` wrapping a `.settings-sheet` div that calls `e.stopPropagation()`. `LogActivityForm` and the chart's settings sheet both use it.

Forms validate inline and **silently `return` on invalid input** (empty name, non-positive hours) — there are no error messages by design.

### Charting engine

`src/components/ActivityHoursChart.tsx` is by far the largest and most intricate file — a hand-rolled SVG chart engine with no charting library. It supports:

- **bar or line** rendering × **per-activity or total** view (`total` stacks activities into one bar / sums into one line; `line` is disabled in per-activity view) × **week or month** granularity;
- period navigation (previous/next month for the week view, year for the month view; "next" is clamped at offset 0 = current);
- **goal overlays**: dashed reference lines when a period is under target, solid `--color-accent` when met, computed via `getGoalActual` (which again treats `activityId === null` as the sum across activities);
- a hover band + absolutely-positioned tooltip, a "show as table" toggle, and `ResizeObserver`-driven responsive width.

`buildChartData` is the core transform: it buckets logs by week-start/month-start ISO keys, generates the *expected* buckets for the visible window (so empty weeks/months still render), ranks activities by hours in the window, keeps at most 8 colored series (`SERIES_COLORS`, chosen for contrast/CVD on the dark surface) and rolls the rest into a grey `__other__` bucket. Week labels use real ISO-8601 week numbers (`getISOWeekLabel`).

### Styling

Dark theme only (`color-scheme: dark`). Design tokens are CSS custom properties defined on `:root` in `src/index.css` (`--color-bg`, `--color-surface`, `--color-accent`, `--radius-*`, …); component styles are one flat ~1100-line `src/App.css` with hand-written class names (no CSS modules, no Tailwind, no CSS-in-JS). Charts and rings reference the same tokens via `var(--color-…)` inside SVG.
