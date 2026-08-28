# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server.
- `npm run build` — type-check the whole project (`tsc -b`) then produce a production build in `dist/`. Run this to verify a change compiles; there is no separate lint step and no test suite.
- `npm run preview` — serve the built `dist/` locally (useful for testing the PWA service worker, which is not active under `dev`).

`tsconfig.app.json` enables `strict`, `noUnusedLocals`, and `noUnusedParameters`, so unused imports/variables fail the build.

## Architecture

A single-page React 19 + TypeScript app built with Vite, packaged as an installable PWA (`vite-plugin-pwa`, `registerType: 'prompt'`). The product is branded **Treni** in the UI and PWA manifest; `claudetrainer` is only the repo/package name and the localStorage key prefix. It lets a user log training hours per activity and track them against weekly/monthly goals.

### PWA update flow

`src/components/PwaUpdatePrompt.tsx` (mounted alongside `<App />` in `main.tsx`) uses `useRegisterSW` from `virtual:pwa-register/react`. Because the SW is registered in `prompt` mode, a newly deployed service worker installs but waits; the component shows a toast (`.pwa-toast`) and only calls `updateServiceWorker(true)` — which triggers `skipWaiting` + reload — when the user confirms. It also polls `registration.update()` hourly and on tab focus/visibility so a long-lived installed session notices deploys. Type references for the virtual module are in `src/vite-env.d.ts`.

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
- `Goal` has `activityId: string | null` where **`null` means a total goal across all activities**, plus `period: 'week' | 'month'` and `targetHours`.
- A goal is either *linear* (counts every week / every month) or *periodized* — an inclusive range that recurs every year: `weekStart`/`weekEnd` (ISO weeks 1–53) for weekly goals, `monthStart`/`monthEnd` (calendar months 1–12) for monthly goals. `goalRange(goal)` in `utils.ts` returns `[start, end] | null` regardless of period. For one `(activityId, period)` target you may have **one** linear goal **or** any number of non-overlapping periodized blocks — never both, never two blocks over the same unit. `goalConflicts(existing, candidate)` in `utils.ts` is the single check; `handleAddGoal`/`handleUpdateGoal` call it (update passes `existing` with the edited goal removed), and `AddGoalForm` mirrors it for its own disabled state while also restricting the range pickers to still-free units.
- `AddGoalForm` doubles as the edit form: `GoalsPage` tracks `editingGoalId`, renders the form with `key={goal.id}` (so state initialisers re-read the goal) and an `editingGoal` prop, and the submit button switches to "Uppdatera mål". Clicking a goal row (`.list-row-main`) enters edit mode.
- Overview goal lookups use `currentWeekGoal` / `currentMonthGoal` from `utils.ts` (the linear goal, or the block covering the current ISO week / month, or nothing). `currentPeriodActualHours` already scopes actuals to the current period, so the rings just work.
- In the chart, each `ChartPoint` carries its `isoWeek` (week granularity) or `month` (month granularity), and `goalCoversPoint(goal, point)` decides per bucket whether a goal's ribbon is drawn — a periodized block only ribbons its own units, linear goals ribbon every bucket. `relevantGoals` also drops goals that cover no visible bucket, and the goal legend de-dupes by `activityId`.

### Time / progress calculations (`src/utils.ts`)

- Weeks start **Monday** (`getWeekStart`).
- `currentPeriodActualHours(activities, period, activityId)` is the core progress function: it sums log hours whose period-start matches the current period-start; `activityId === null` aggregates across all activities (for total goals). Overview goal components (`TotalGoalsProgress`, `PerActivityGoalsProgress`, `GoalRing`) build on this.

### Internationalization

`i18next` + `react-i18next`, configured in `src/i18n/i18n.ts`. Swedish (`sv`) is the default and fallback language; English (`en`) is the other. UI strings live in `src/i18n/locales/sv.json` and `en.json` — **keep both files in sync** when adding keys. Components read strings via `useTranslation()` / `t('nav.overview')`.

The selected language is stored inside the `settings` object. `i18n.ts` reads `claudetrainer.settings` directly from `localStorage` at module load (before React mounts) to pick the initial language; `App.tsx` then calls `i18n.changeLanguage` in an effect whenever `settings.language` changes.

### Input widgets and modals

`WheelPicker` (`src/components/WheelPicker.tsx`) is a custom touch scroll picker (iOS-style) used for entering hours, dates, and activity selection. It snaps by rounding `scrollTop / ITEM_HEIGHT` after a 120 ms debounce. Helper builders live in the same file: `buildHourOptions(maxHours, step)` where callers pass `stepMinutes / 60` as the step, `buildDateOptions(daysBack, …)` (90 days back, with localized "today"/"yesterday" labels), and `todayIso()`. The minute granularity is `settings.hourStepMinutes` (default 15, options 1–60), configurable on the Settings page.

Modals are mostly an ad-hoc pattern: a `.settings-sheet-backdrop` div with `onClick={onClose}` wrapping a `.settings-sheet` div that calls `e.stopPropagation()` (used by `LogActivityForm` and the chart's settings sheet). The one real modal component is `ConfirmDialog` — every destructive action (delete activity, delete a logged time, delete a goal) renders it with a `title`/`message`/`confirmLabel` and `onConfirm`/`onCancel`; the caller keeps a `pending…` piece of state for the target.

Forms validate inline and **silently `return` on invalid input** (empty name, non-positive hours) — there are no error messages by design.

### Charting engine

`src/components/ActivityHoursChart.tsx` is by far the largest and most intricate file — a hand-rolled SVG chart engine with no charting library. It supports:

- **bar or line** rendering (settings sheet) × **week or month** granularity; the card title follows granularity — "Månadsöversikt" for week, "Årsöversikt" for month;
- a **focus filter** (`focusedActivityId` state): a chip row under the chart with "Samtliga aktiviteter" (default, `null`) plus one chip per logged activity. `null` = every activity stacked into one bar / summed into one line; an id = only that activity's bars/line. Clicking the active chip again clears the focus. The chip row doubles as the colour legend and stays visible in table view.
- period navigation (previous/next month for the week view, year for the month view; "next" is clamped at offset 0 = current);
- **goal overlays**: dashed reference lines when a period is under target, solid `--color-accent` when met, computed via `getGoalActual` (which treats `activityId === null` as the sum across activities). `relevantGoals` shows the total goal when unfocused, the focused activity's goal when focused;
- a hover band + absolutely-positioned tooltip, a "show as table" toggle, and `ResizeObserver`-driven responsive width.

`buildChartData` is the core transform: it buckets logs by week-start/month-start ISO keys, generates the *expected* buckets for the visible window (so empty weeks/months still render). When `focusedActivityId` is set it returns a single series; otherwise it ranks activities by hours in the window, keeps at most 8 series with their own bar (busiest win the slots) and rolls the rest into a grey `__other__` bucket. Either way the visible series are ordered **alphabetically** for display (stack order, table columns). Week labels use real ISO-8601 week numbers (`getISOWeekLabel`).

`OverviewPage` sorts `activities` alphabetically once (`sortedActivities`, locale-aware) and passes that single ordering to the chart, the goal-progress cards, the `ActivityCard` grid, and the log-activity picker — so cards and chart series line up.

Series colors come from `src/activityColors.ts` — `buildActivityColorMap(activities)` assigns `SERIES_COLORS` (validated for contrast/CVD on the dark surface) by each activity's index in the stored array (creation order), cycling past 8. This map is the single source of truth for "the color of an activity": the chart uses rank only to decide bar-vs-`Other`, not to pick the color, so an activity keeps the same color across time-window navigation **and** the `ActivityCard` border (`color` prop, set from the same map in `OverviewPage`) always matches its chart bar.

### Styling

Design tokens are CSS custom properties in `src/index.css`: the dark palette on bare `:root` (the default), the light palette overriding it under `:root[data-theme='light']`. `App.tsx` writes `settings.theme` (`'dark' | 'light'`, default dark) to `document.documentElement.dataset.theme` and updates the `theme-color` meta; an inline script in `index.html` applies the saved theme pre-paint to avoid a flash. Component styles are one flat ~1100-line `src/App.css` with hand-written class names (no CSS modules, no Tailwind, no CSS-in-JS), almost entirely `var(--color-…)` driven — so new UI is theme-safe as long as it uses the tokens (the one exception in the codebase is `GoalRing`'s `#3987e5`, a palette color that reads on both themes). Charts and rings reference the same tokens via `var(--color-…)` inside SVG.
