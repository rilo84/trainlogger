import { useMemo, useState } from 'react'
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
  const { t, i18n } = useTranslation()
  const [logForm, setLogForm] = useState<LogFormState>({ open: false })
  // The overview shows activities (chart series and cards alike) in alphabetical order.
  const sortedActivities = useMemo(
    () => [...activities].sort((a, b) => a.name.localeCompare(b.name, i18n.language)),
    [activities, i18n.language],
  )
  const activityColors = buildActivityColorMap(sortedActivities)

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
        {goals.length > 0 && <TotalGoalsProgress activities={sortedActivities} goals={goals} />}

        {goals.length > 0 && (
          <PerActivityGoalsProgress
            activities={sortedActivities}
            goals={goals}
            onSelectActivity={(activityId) => setLogForm({ open: true, activityId })}
          />
        )}

        {sortedActivities.length > 0 && <ActivityHoursChart activities={sortedActivities} goals={goals} />}

        {sortedActivities.length === 0 ? (
          <div className="empty-state">
            <button type="button" className="btn btn-primary" onClick={onNavigateToActivities}>
              {t('overview.addActivityButton')}
            </button>
          </div>
        ) : (
          <div className="activity-grid">
            {sortedActivities.map((activity) => (
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
          activities={sortedActivities}
          stepMinutes={settings.hourStepMinutes}
          initialActivityId={logForm.activityId}
          onLog={onLogHours}
          onClose={() => setLogForm({ open: false })}
        />
      )}
    </>
  )
}
