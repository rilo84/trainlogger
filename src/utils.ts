import type { Activity, Goal, GoalPeriod, LogEntry } from './types'

export function sumHours(logs: LogEntry[]): number {
  const total = logs.reduce((sum, log) => sum + log.hours, 0)
  return Math.round(total * 100) / 100
}

export function totalHoursForActivities(activities: Activity[]): number {
  const total = activities.reduce((sum, a) => sum + sumHours(a.logs), 0)
  return Math.round(total * 100) / 100
}

export function formatHours(value: number): string {
  return Number(value.toFixed(2)).toString()
}

export function formatHoursMinutes(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return d
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

// ISO 8601 week number (1–53): the week containing the year's first Thursday is week 1.
export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3)
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000))
}

type GoalRangeFields = Pick<Goal, 'period' | 'weekStart' | 'weekEnd' | 'monthStart' | 'monthEnd'>

// The inclusive [start, end] a periodized goal covers (ISO weeks 1–53 for a weekly goal,
// calendar months 1–12 for a monthly one), or null for a linear (every-period) goal.
export function goalRange(goal: GoalRangeFields): [number, number] | null {
  if (goal.period === 'week') {
    return goal.weekStart != null && goal.weekEnd != null ? [goal.weekStart, goal.weekEnd] : null
  }
  return goal.monthStart != null && goal.monthEnd != null ? [goal.monthStart, goal.monthEnd] : null
}

// A goal with a range only counts during that inclusive range (recurring every year);
// a goal without a range counts every week / every month.
export function isWeekGoalActive(goal: Goal, isoWeek: number): boolean {
  if (goal.weekStart == null || goal.weekEnd == null) return true
  return isoWeek >= goal.weekStart && isoWeek <= goal.weekEnd
}

export function isMonthGoalActive(goal: Goal, month: number): boolean {
  if (goal.monthStart == null || goal.monthEnd == null) return true
  return month >= goal.monthStart && month <= goal.monthEnd
}

// Whether `candidate` may NOT be saved for a target that already has `existing` goals of
// the same period: a linear goal needs a clean slate; a block must not sit alongside a
// linear goal or overlap another block. Pass `existing` already filtered to the target
// (and, when editing, with the goal being edited removed).
export function goalConflicts(existing: Goal[], candidate: GoalRangeFields): boolean {
  const range = goalRange(candidate)
  if (range == null) return existing.length > 0
  if (existing.some((g) => goalRange(g) == null)) return true
  const [start, end] = range
  return existing.some((g) => {
    const r = goalRange(g)
    return r != null && start <= r[1] && r[0] <= end
  })
}

// The one goal of the given period that applies right now for a target (activityId === null
// = the total goal). At most one matches because the goal form forbids two goals covering
// the same week / month for a target.
export function currentWeekGoal(
  goals: Goal[],
  activityId: string | null,
  now: Date = new Date(),
): Goal | undefined {
  const isoWeek = getISOWeek(now)
  return goals.find(
    (g) => g.period === 'week' && g.activityId === activityId && isWeekGoalActive(g, isoWeek),
  )
}

export function currentMonthGoal(
  goals: Goal[],
  activityId: string | null,
  now: Date = new Date(),
): Goal | undefined {
  const month = now.getMonth() + 1
  return goals.find(
    (g) => g.period === 'month' && g.activityId === activityId && isMonthGoalActive(g, month),
  )
}

// Localized month name for 1–12, capitalized (e.g. "Mars", "March", "Mar").
export function formatMonthName(month: number, locale: string, style: 'short' | 'long' = 'long'): string {
  const raw = new Date(2000, month - 1, 1).toLocaleDateString(locale, { month: style }).replace('.', '')
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

// activityId === null sums across all activities (a "total" goal's progress).
export function currentPeriodActualHours(
  activities: Activity[],
  period: GoalPeriod,
  activityId: string | null,
): number {
  const now = new Date()
  const periodStart = (period === 'week' ? getWeekStart(now) : getMonthStart(now)).getTime()
  let total = 0
  for (const activity of activities) {
    if (activityId !== null && activity.id !== activityId) continue
    for (const log of activity.logs) {
      const logDate = new Date(log.date)
      const logPeriodStart = (period === 'week' ? getWeekStart(logDate) : getMonthStart(logDate)).getTime()
      if (logPeriodStart === periodStart) total += log.hours
    }
  }
  return Math.round(total * 100) / 100
}
