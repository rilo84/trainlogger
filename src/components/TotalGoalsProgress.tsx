import { useTranslation } from 'react-i18next'
import type { Activity, Goal } from '../types'
import { currentPeriodActualHours, currentWeekGoal, currentMonthGoal } from '../utils'
import { GoalRing } from './GoalRing'

interface TotalGoalsProgressProps {
  activities: Activity[]
  goals: Goal[]
}

export function TotalGoalsProgress({ activities, goals }: TotalGoalsProgressProps) {
  const { t } = useTranslation()
  const weekGoal = currentWeekGoal(goals, null)
  const monthGoal = currentMonthGoal(goals, null)

  if (!weekGoal && !monthGoal) return null

  const ringSize = 62

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
