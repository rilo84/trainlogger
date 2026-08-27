import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Activity, AppSettings, Goal } from '../types'
import { totalHoursForActivities } from '../utils'
import { ActivityHoursChart } from '../components/ActivityHoursChart'
import { TotalGoalsProgress } from '../components/TotalGoalsProgress'
import { ActivityCard } from '../components/ActivityCard'
import { LogActivityForm } from '../components/LogActivityForm'

interface OverviewPageProps {
  activities: Activity[]
  goals: Goal[]
  settings: AppSettings
  onLogHours: (activityId: string, hours: number, date: string) => void
  onDeleteLog: (activityId: string, logId: string) => void
}

export function OverviewPage({ activities, goals, settings, onLogHours, onDeleteLog }: OverviewPageProps) {
  const { t } = useTranslation()
  const [logFormOpen, setLogFormOpen] = useState(false)
  const totalHoursAllTime = totalHoursForActivities(activities)

  return (
    <>
      <header className="page-header">
        <h1>{t('nav.overview')}</h1>
        <p className="page-subtitle">
          {activities.length === 0
            ? t('overview.noActivities')
            : t('overview.summary', { count: activities.length, hours: totalHoursAllTime })}
        </p>
      </header>

      <div className="page-body">
        {activities.length > 0 && (
          <button type="button" className="btn btn-primary log-activity-button" onClick={() => setLogFormOpen(true)}>
            {t('overview.logActivityButton')}
          </button>
        )}

        {goals.length > 0 && <TotalGoalsProgress activities={activities} goals={goals} />}

        {activities.length > 0 && <ActivityHoursChart activities={activities} goals={goals} />}

        {activities.length === 0 ? (
          <div className="empty-state">
            <p>{t('overview.emptyHint')}</p>
          </div>
        ) : (
          <div className="activity-grid">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                goals={goals}
                stepMinutes={settings.hourStepMinutes}
                onLogHours={onLogHours}
                onDeleteLog={onDeleteLog}
              />
            ))}
          </div>
        )}
      </div>

      {logFormOpen && (
        <LogActivityForm
          activities={activities}
          stepMinutes={settings.hourStepMinutes}
          onLog={onLogHours}
          onClose={() => setLogFormOpen(false)}
        />
      )}
    </>
  )
}
