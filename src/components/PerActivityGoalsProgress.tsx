import { useTranslation } from 'react-i18next'
import type { Activity, Goal } from '../types'
import { currentPeriodActualHours } from '../utils'
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
      weekGoal: goals.find((g) => g.activityId === activity.id && g.period === 'week'),
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
        {entries.map(({ activity, weekGoal }) => (
          <button
            type="button"
            className="per-activity-goals-item"
            key={activity.id}
            onClick={() => onSelectActivity(activity.id)}
          >
            <div className="per-activity-goals-name">{activity.name}</div>
            <GoalRing
              label={t('common.weeklyGoal')}
              actual={currentPeriodActualHours([activity], 'week', activity.id)}
              target={weekGoal!.targetHours}
              size={62}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
