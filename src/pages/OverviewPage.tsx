import { useState } from 'react'
import type { Activity, Goal } from '../types'
import { totalHoursForActivities } from '../utils'
import { ActivityHoursChart } from '../components/ActivityHoursChart'
import { GoalProgressCard } from '../components/GoalProgressCard'
import { ActivityCard } from '../components/ActivityCard'
import { LogActivityForm } from '../components/LogActivityForm'

interface OverviewPageProps {
  activities: Activity[]
  goals: Goal[]
  onLogHours: (activityId: string, hours: number, date: string) => void
}

export function OverviewPage({ activities, goals, onLogHours }: OverviewPageProps) {
  const [logFormOpen, setLogFormOpen] = useState(false)
  const totalHoursAllTime = totalHoursForActivities(activities)

  return (
    <>
      <header className="page-header">
        <h1>Översikt</h1>
        <p className="page-subtitle">
          {activities.length === 0
            ? 'Inga aktiviteter tillagda än'
            : `${activities.length} aktivitet${activities.length === 1 ? '' : 'er'} · ${totalHoursAllTime} timmar totalt`}
        </p>
      </header>

      <div className="page-body">
        {activities.length > 0 && (
          <button type="button" className="btn btn-primary log-activity-button" onClick={() => setLogFormOpen(true)}>
            + Logga aktivitet
          </button>
        )}

        {goals.length > 0 && <GoalProgressCard activities={activities} goals={goals} />}

        {activities.length > 0 && <ActivityHoursChart activities={activities} goals={goals} />}

        {activities.length === 0 ? (
          <div className="empty-state">
            <p>Gå till Aktiviteter för att skapa din första aktivitet.</p>
          </div>
        ) : (
          <div className="activity-grid">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} onLogHours={onLogHours} />
            ))}
          </div>
        )}
      </div>

      {logFormOpen && (
        <LogActivityForm activities={activities} onLog={onLogHours} onClose={() => setLogFormOpen(false)} />
      )}
    </>
  )
}
