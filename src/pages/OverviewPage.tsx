import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Activity, AppSettings, Goal } from '../types'
import { buildActivityColorMap } from '../activityColors'
import { ActivityHoursChart } from '../components/ActivityHoursChart'
import { TotalGoalsProgress } from '../components/TotalGoalsProgress'
import { PerActivityGoalsProgress } from '../components/PerActivityGoalsProgress'
import { ActivityCard } from '../components/ActivityCard'
import { LogActivityForm } from '../components/LogActivityForm'

interface OverviewPageProps {
  activities: Activity[]
  goals: Goal[]
  settings: AppSettings
  onLogHours: (activityId: string, hours: number, date: string) => void
  onDeleteLog: (activityId: string, logId: string) => void
  onNavigateToActivities: () => void
}

interface LogFormState {
  open: boolean
  activityId?: string
}

export function OverviewPage({
  activities,
  goals,
  settings,
  onLogHours,
  onDeleteLog,
  onNavigateToActivities,
}: OverviewPageProps) {
  const { t } = useTranslation()
  const [logForm, setLogForm] = useState<LogFormState>({ open: false })
  const activityColors = buildActivityColorMap(activities)

  return (
    <>
      <header className="page-header page-header-compact overview-header">
        <h1>{t('nav.overview')}</h1>
        {activities.length > 0 && (
          <button
            type="button"
            className="btn btn-primary log-activity-button"
            onClick={() => setLogForm({ open: true })}
          >
            {t('overview.logActivityButton')}
          </button>
        )}
      </header>

      <div className="page-body">
        {goals.length > 0 && <TotalGoalsProgress activities={activities} goals={goals} />}

        {goals.length > 0 && (
          <PerActivityGoalsProgress
            activities={activities}
            goals={goals}
            onSelectActivity={(activityId) => setLogForm({ open: true, activityId })}
          />
        )}

        {activities.length > 0 && <ActivityHoursChart activities={activities} goals={goals} />}

        {activities.length === 0 ? (
          <div className="empty-state">
            <button type="button" className="btn btn-primary" onClick={onNavigateToActivities}>
              {t('overview.addActivityButton')}
            </button>
          </div>
        ) : (
          <div className="activity-grid">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                goals={goals}
                color={activityColors.get(activity.id)}
                stepMinutes={settings.hourStepMinutes}
                onLogHours={onLogHours}
                onDeleteLog={onDeleteLog}
              />
            ))}
          </div>
        )}
      </div>

      {logForm.open && (
        <LogActivityForm
          activities={activities}
          stepMinutes={settings.hourStepMinutes}
          initialActivityId={logForm.activityId}
          onLog={onLogHours}
          onClose={() => setLogForm({ open: false })}
        />
      )}
    </>
  )
}
