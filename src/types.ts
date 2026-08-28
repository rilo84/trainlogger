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
  // Periodized weekly goals: an inclusive ISO-week range (1–53) that recurs every year.
  // Both present = the goal only counts during that block; both absent = every week.
  weekStart?: number
  weekEnd?: number
}

export type NewGoal = Omit<Goal, 'id'>

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
