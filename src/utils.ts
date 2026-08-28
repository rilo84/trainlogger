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

// A weekly goal with a week range only counts during that inclusive range (recurring
// every year); a weekly goal without a range counts every week.
export function isWeekGoalActive(goal: Goal, isoWeek: number): boolean {
  if (goal.weekStart == null || goal.weekEnd == null) return true
  return isoWeek >= goal.weekStart && isoWeek <= goal.weekEnd
}

// The one weekly goal that applies right now for a target (activityId === null = the total
// goal). At most one can match because the goal form forbids two goals covering the same week.
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
