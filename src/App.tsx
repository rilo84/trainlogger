import { useEffect, useState } from 'react'
import type { Activity, Goal, GoalPeriod, PageId, User } from './types'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { OverviewPage } from './pages/OverviewPage'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { GoalsPage } from './pages/GoalsPage'
import './App.css'

const ACTIVITIES_STORAGE_KEY = 'claudetrainer.activities'
const GOALS_STORAGE_KEY = 'claudetrainer.goals'
const USER_STORAGE_KEY = 'claudetrainer.user'

function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(ACTIVITIES_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Activity[]) : []
  } catch {
    return []
  }
}

function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Goal[]) : []
  } catch {
    return []
  }
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function createId() {
  return crypto.randomUUID()
}

function App() {
  const [activities, setActivities] = useState<Activity[]>(loadActivities)
  const [goals, setGoals] = useState<Goal[]>(loadGoals)
  const [user, setUser] = useState<User | null>(loadUser)
  const [activePage, setActivePage] = useState<PageId>('overview')

  useEffect(() => {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities))
  }, [activities])

  useEffect(() => {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }, [user])

  function handleAddActivity(name: string) {
    setActivities((prev) => [...prev, { id: createId(), name, logs: [] }])
  }

  function handleDeleteActivity(activityId: string) {
    setActivities((prev) => prev.filter((a) => a.id !== activityId))
    setGoals((prev) => prev.filter((g) => g.activityId !== activityId))
  }

  function handleLogHours(activityId: string, hours: number, date: string) {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId ? { ...a, logs: [...a.logs, { id: createId(), hours, date }] } : a,
      ),
    )
  }

  function handleDeleteLog(activityId: string, logId: string) {
    setActivities((prev) =>
      prev.map((a) => (a.id === activityId ? { ...a, logs: a.logs.filter((l) => l.id !== logId) } : a)),
    )
  }

  function handleAddGoal(goal: { activityId: string | null; period: GoalPeriod; targetHours: number }) {
    setGoals((prev) => [...prev, { id: createId(), ...goal }])
  }

  function handleDeleteGoal(goalId: string) {
    setGoals((prev) => prev.filter((g) => g.id !== goalId))
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />
  }

  return (
    <Layout activePage={activePage} onNavigate={setActivePage} user={user} onLogout={() => setUser(null)}>
      {activePage === 'overview' && (
        <OverviewPage
          activities={activities}
          goals={goals}
          onLogHours={handleLogHours}
          onDeleteLog={handleDeleteLog}
        />
      )}
      {activePage === 'activities' && (
        <ActivitiesPage activities={activities} onAdd={handleAddActivity} onDelete={handleDeleteActivity} />
      )}
      {activePage === 'goals' && (
        <GoalsPage activities={activities} goals={goals} onAdd={handleAddGoal} onDelete={handleDeleteGoal} />
      )}
    </Layout>
  )
}

export default App
