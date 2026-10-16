import { useEffect, useState } from 'react'
import i18n from './i18n/i18n'
import type { Activity, AppSettings, Goal, GoalPeriod, NewGoal, PageId } from './types'
import { currentMonthGoal, currentPeriodActualHours, currentWeekGoal, goalConflicts } from './utils'
import { Layout } from './components/Layout'
import { Celebration } from './components/Celebration'
import type { CelebrationData } from './components/Celebration'
import { OverviewPage } from './pages/OverviewPage'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { GoalsPage } from './pages/GoalsPage'
import { SettingsPage } from './pages/SettingsPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { LandingPage } from './pages/LandingPage'
import { isRunningStandalone } from './hooks/useInstallPrompt'
import type { OnboardingResult } from './pages/OnboardingPage'
import './App.css'

const ACTIVITIES_STORAGE_KEY = 'claudetrainer.activities'
const GOALS_STORAGE_KEY = 'claudetrainer.goals'
const SETTINGS_STORAGE_KEY = 'claudetrainer.settings'
// Set once the visitor picks "use in the browser" on the landing page.
const USE_IN_BROWSER_STORAGE_KEY = 'claudetrainer.useInBrowser'
// Left behind by the old login screen; its name is carried over into settings.
const LEGACY_USER_STORAGE_KEY = 'claudetrainer.user'

const DEFAULT_SETTINGS: AppSettings = { name: '', hourStepMinutes: 15, language: 'sv', theme: 'dark', onboardingDone: false }

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

function loadLegacyUserName(): string {
  try {
    const raw = localStorage.getItem(LEGACY_USER_STORAGE_KEY)
    return raw ? ((JSON.parse(raw) as { name?: string }).name ?? '') : ''
  } catch {
    return ''
  }
}

function loadSettings(): AppSettings {
  const defaults = { ...DEFAULT_SETTINGS, name: loadLegacyUserName() }
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    // Settings saved before the guide existed belong to an existing user, who skips it.
    return raw ? { ...defaults, onboardingDone: true, ...(JSON.parse(raw) as Partial<AppSettings>) } : defaults
  } catch {
    return defaults
  }
}

// The landing page is for browser tabs only; an installed PWA goes straight to the app.
function shouldShowLanding(): boolean {
  if (isRunningStandalone()) return false
  try {
    return localStorage.getItem(USE_IN_BROWSER_STORAGE_KEY) !== '1'
  } catch {
    return true
  }
}

function createId() {
  return crypto.randomUUID()
}

function App() {
  const [activities, setActivities] = useState<Activity[]>(loadActivities)
  const [goals, setGoals] = useState<Goal[]>(loadGoals)
  const [settings, setSettings] = useState<AppSettings>(loadSettings)
  const [activePage, setActivePage] = useState<PageId>('overview')
  // Where the gear button returns to when Settings is closed again.
  const [pageBeforeSettings, setPageBeforeSettings] = useState<PageId>('overview')
  const [celebration, setCelebration] = useState<CelebrationData | null>(null)
  const [showLanding, setShowLanding] = useState(shouldShowLanding)

  useEffect(() => {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities))
  }, [activities])

  useEffect(() => {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    localStorage.removeItem(LEGACY_USER_STORAGE_KEY)
  }, [settings])

  useEffect(() => {
    if (i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language)
    }
  }, [settings.language])

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', settings.theme === 'light' ? '#ffffff' : '#171a21')
  }, [settings.theme])

  function handleAddActivity(name: string) {
    setActivities((prev) => {
      const exists = prev.some((a) => a.name.trim().toLowerCase() === name.trim().toLowerCase())
      if (exists) return prev
      return [...prev, { id: createId(), name, logs: [] }]
    })
  }

  function handleDeleteActivity(activityId: string) {
    setActivities((prev) => prev.filter((a) => a.id !== activityId))
    setGoals((prev) => prev.filter((g) => g.activityId !== activityId))
  }

  function handleLogHours(activityId: string, hours: number, date: string) {
    const entry = { id: createId(), hours, date }
    const nextActivities = activities.map((a) =>
      a.id === activityId ? { ...a, logs: [...a.logs, entry] } : a,
    )
    setActivities(nextActivities)

    // Reward the user with a full-screen celebration. It shows the activity's
    // active goal ring climbing from its old fill to the new one; with no goal
    // it is just confetti and a "nice job" heading.
    const activity = activities.find((a) => a.id === activityId)
    if (!activity) return
    const goal = currentWeekGoal(goals, activityId) ?? currentMonthGoal(goals, activityId)
    const period: GoalPeriod | null = goal ? goal.period : null
    setCelebration({
      id: entry.id,
      activityName: activity.name,
      period,
      target: goal ? goal.targetHours : null,
      actualBefore: period ? currentPeriodActualHours(activities, period, activityId) : 0,
      actualAfter: period ? currentPeriodActualHours(nextActivities, period, activityId) : 0,
    })
  }

  function handleDeleteLog(activityId: string, logId: string) {
    setActivities((prev) =>
      prev.map((a) => (a.id === activityId ? { ...a, logs: a.logs.filter((l) => l.id !== logId) } : a)),
    )
  }

  function handleAddGoal(goal: NewGoal) {
    setGoals((prev) => {
      const sameTarget = prev.filter((g) => g.activityId === goal.activityId && g.period === goal.period)
      if (goalConflicts(sameTarget, goal)) return prev
      return [...prev, { id: createId(), ...goal }]
    })
  }

  function handleUpdateGoal(goalId: string, goal: NewGoal) {
    setGoals((prev) => {
      const sameTarget = prev.filter(
        (g) => g.id !== goalId && g.activityId === goal.activityId && g.period === goal.period,
      )
      if (goalConflicts(sameTarget, goal)) return prev
      return prev.map((g) => (g.id === goalId ? { id: goalId, ...goal } : g))
    })
  }

  function handleDeleteGoal(goalId: string) {
    setGoals((prev) => prev.filter((g) => g.id !== goalId))
  }

  // The gear works as a toggle: open Settings, or go back to the page it was opened from.
  // Settings save as they change, so leaving needs no confirm step.
  function handleToggleSettings() {
    if (activePage === 'settings') {
      setActivePage(pageBeforeSettings)
    } else {
      setPageBeforeSettings(activePage)
      setActivePage('settings')
    }
  }

  function handleCompleteOnboarding(result: OnboardingResult) {
    setActivities((prev) => [...prev, ...result.activities])
    setGoals((prev) => [...prev, ...result.goals])
    setSettings((prev) => ({ ...prev, name: result.name, onboardingDone: true }))
    setActivePage('overview')
  }

  // Wipes activities, logs, goals and the name, then sends the user back through the
  // first-run guide. Theme and language are kept so the screen doesn't change under them.
  function handleDeleteAllData() {
    setActivities([])
    setGoals([])
    setSettings((prev) => ({ ...DEFAULT_SETTINGS, theme: prev.theme, language: prev.language }))
    setCelebration(null)
    setActivePage('overview')
    setPageBeforeSettings('overview')
  }

  function handleContinueInBrowser() {
    localStorage.setItem(USE_IN_BROWSER_STORAGE_KEY, '1')
    setShowLanding(false)
  }

  if (showLanding) {
    return (
      <LandingPage
        language={settings.language}
        onChangeLanguage={(language) => setSettings((prev) => ({ ...prev, language }))}
        onContinueInBrowser={handleContinueInBrowser}
      />
    )
  }

  if (!settings.onboardingDone) {
    return (
      <OnboardingPage
        settings={settings}
        onUpdateSettings={setSettings}
        onComplete={handleCompleteOnboarding}
        onSkip={() => setSettings((prev) => ({ ...prev, onboardingDone: true }))}
      />
    )
  }

  return (
    <>
    <Layout
      activePage={activePage}
      onNavigate={setActivePage}
      userName={settings.name.trim()}
      onToggleSettings={handleToggleSettings}
    >
      {activePage === 'overview' && (
        <OverviewPage
          activities={activities}
          goals={goals}
          settings={settings}
          onLogHours={handleLogHours}
          onDeleteLog={handleDeleteLog}
          onNavigateToActivities={() => setActivePage('activities')}
        />
      )}
      {activePage === 'activities' && (
        <ActivitiesPage activities={activities} onAdd={handleAddActivity} onDelete={handleDeleteActivity} />
      )}
      {activePage === 'goals' && (
        <GoalsPage
          activities={activities}
          goals={goals}
          settings={settings}
          onAdd={handleAddGoal}
          onUpdate={handleUpdateGoal}
          onDelete={handleDeleteGoal}
        />
      )}
      {activePage === 'settings' && (
        <SettingsPage settings={settings} onUpdateSettings={setSettings} onDeleteAllData={handleDeleteAllData} />
      )}
    </Layout>
    {celebration && (
      <Celebration key={celebration.id} data={celebration} onDone={() => setCelebration(null)} />
    )}
    </>
  )
}

export default App
