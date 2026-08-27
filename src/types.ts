export interface LogEntry {
  id: string
  hours: number
  date: string
}

export interface Activity {
  id: string
  name: string
  logs: LogEntry[]
}

export type PageId = 'overview' | 'activities' | 'goals' | 'settings'

export type GoalPeriod = 'week' | 'month'

export interface Goal {
  id: string
  activityId: string | null
  period: GoalPeriod
  targetHours: number
}

export interface User {
  name: string
  email: string
}

export type Language = 'sv' | 'en'

export type Theme = 'dark' | 'light'

export interface AppSettings {
  hourStepMinutes: number
  language: Language
  theme: Theme
}
