import { useTranslation } from 'react-i18next'
import type { Activity, Goal } from '../types'
import { currentPeriodActualHours } from '../utils'
import { GoalRing } from './GoalRing'

interface PerActivityGoalsProgressProps {
  activities: Activity[]
  goals: Goal[]
}

export function PerActivityGoalsProgress({ activities, goals }: PerActivityGoalsProgressProps) {
  const { t } = useTranslation()

  const entries = activities
    .map((activity) => ({
      activity,
      weekGoal: goals.find((g) => g.activityId === activity.id && g.period === 'week'),
      monthGoal: goals.find((g) => g.activityId === activity.id && g.period === 'month'),
    }))
    .filter((entry) => entry.weekGoal || entry.monthGoal)

  if (entries.length === 0) return null

  return (
    <div className="chart-card">
      <div className="chart-controls">
        <div className="chart-title-group">
          <h2>{t('perActivityGoals.title')}</h2>
        </div>
      </div>

      <div className="per-activity-goals-grid">
        {entries.map(({ activity, weekGoal, monthGoal }) => (
          <div className="per-activity-goals-item" key={activity.id}>
            <div className="per-activity-goals-name">{activity.name}</div>
            <div className="goal-rings-row goal-rings-row-small">
              {weekGoal && (
                <GoalRing
                  label={t('common.weeklyGoal')}
                  actual={currentPeriodActualHours([activity], 'week', activity.id)}
                  target={weekGoal.targetHours}
                  size={88}
                />
              )}
              {monthGoal && (
                <GoalRing
                  label={t('common.monthlyGoal')}
                  actual={currentPeriodActualHours([activity], 'month', activity.id)}
                  target={monthGoal.targetHours}
                  size={88}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
