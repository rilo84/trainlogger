import { useTranslation } from 'react-i18next'
import type { Activity, Goal } from '../types'
import { currentPeriodActualHours } from '../utils'
import { GoalRing } from './GoalRing'

interface TotalGoalsProgressProps {
  activities: Activity[]
  goals: Goal[]
}

export function TotalGoalsProgress({ activities, goals }: TotalGoalsProgressProps) {
  const { t } = useTranslation()
  const weekGoal = goals.find((g) => g.activityId === null && g.period === 'week')
  const monthGoal = goals.find((g) => g.activityId === null && g.period === 'month')

  if (!weekGoal && !monthGoal) return null

  const ringSize = weekGoal && monthGoal ? 96 : 112

  return (
    <div className="chart-card">
      <div className="chart-controls">
        <div className="chart-title-group">
          <h2>{t('totalGoals.title')}</h2>
        </div>
      </div>

      <div className="goal-rings-row">
        {weekGoal && (
          <GoalRing
            label={t('common.weeklyGoal')}
            actual={currentPeriodActualHours(activities, 'week', null)}
            target={weekGoal.targetHours}
            size={ringSize}
          />
        )}
        {monthGoal && (
          <GoalRing
            label={t('common.monthlyGoal')}
            actual={currentPeriodActualHours(activities, 'month', null)}
            target={monthGoal.targetHours}
            size={ringSize}
          />
        )}
      </div>
    </div>
  )
}
