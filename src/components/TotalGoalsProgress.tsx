import { useTranslation } from 'react-i18next'
import type { Activity, Goal } from '../types'
import {
  currentPeriodActualHours,
  currentWeekGoal,
  currentMonthGoal,
  formatHoursMinutes,
} from '../utils'
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
  const weekActual = currentPeriodActualHours(activities, 'week', null)
  const monthActual = currentPeriodActualHours(activities, 'month', null)

  return (
    <div className="chart-card">
      <div className="chart-controls">
        <div className="chart-title-group">
          <h2>{t('totalGoals.title')}</h2>
        </div>
      </div>

      <div className="goal-rings-row">
        {weekGoal && (
          <div className="goal-ring-group">
            <div className="per-activity-goals-name">{t('common.weeklyGoal')}</div>
            <GoalRing
              label={`${formatHoursMinutes(weekActual)} / ${formatHoursMinutes(weekGoal.targetHours)}`}
              actual={weekActual}
              target={weekGoal.targetHours}
              size={ringSize}
            />
          </div>
        )}
        {monthGoal && (
          <div className="goal-ring-group">
            <div className="per-activity-goals-name">{t('common.monthlyGoal')}</div>
            <GoalRing
              label={`${formatHoursMinutes(monthActual)} / ${formatHoursMinutes(monthGoal.targetHours)}`}
              actual={monthActual}
              target={monthGoal.targetHours}
              size={ringSize}
            />
          </div>
        )}
      </div>
    </div>
  )
}
