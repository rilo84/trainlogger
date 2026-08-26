import type { Activity, LogEntry } from './types'

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
