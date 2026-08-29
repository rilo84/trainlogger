import { useTranslation } from 'react-i18next'
import type { Activity, Goal } from '../types'
import { currentPeriodActualHours, currentWeekGoal, formatHoursMinutes } from '../utils'
import { GoalRing } from './GoalRing'

interface PerActivityGoalsProgressProps {
  activities: Activity[]
  goals: Goal[]
  onSelectActivity: (activityId: string) => void
}

export function PerActivityGoalsProgress({ activities, goals, onSelectActivity }: PerActivityGoalsProgressProps) {
  const { t } = useTranslation()

  const entries = activities
    .map((activity) => ({
      activity,
      weekGoal: currentWeekGoal(goals, activity.id),
    }))
    .filter((entry) => entry.weekGoal)

  if (entries.length === 0) return null

  return (
    <div className="chart-card">
      <div className="chart-controls">
        <div className="chart-title-group">
          <h2>{t('perActivityGoals.title')}</h2>
        </div>
      </div>

      <div className="per-activity-goals-grid">
        {entries.map(({ activity, weekGoal }) => {
          const actual = currentPeriodActualHours([activity], 'week', activity.id)
          const target = weekGoal!.targetHours
          return (
            <button
              type="button"
              className="per-activity-goals-item"
              key={activity.id}
              onClick={() => onSelectActivity(activity.id)}
            >
              <div className="per-activity-goals-name">{activity.name}</div>
              <GoalRing
                label={`${formatHoursMinutes(actual)} / ${formatHoursMinutes(target)}`}
                actual={actual}
                target={target}
                size={62}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
