import type { Activity, GoalPeriod, LogEntry } from './types'

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
