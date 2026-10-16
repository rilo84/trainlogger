import { useTranslation } from 'react-i18next'
import type { Goal } from '../types'
import { formatMonthName } from '../utils'

interface GoalDescriptionProps {
  goal: Goal
  nameById: Map<string, string>
}

// Title + subtitle lines of a goal row: whose goal it is, its target and (for a
// periodized goal) the weeks/months it covers.
export function GoalDescription({ goal, nameById }: GoalDescriptionProps) {
  const { t, i18n } = useTranslation()

  return (
    <>
      <div className="list-row-title">
        {goal.activityId === null
          ? t('goals.allActivities')
          : (nameById.get(goal.activityId) ?? t('goals.deletedActivity'))}
      </div>
      <div className="list-row-subtitle">
        {t('goals.targetPerPeriod', {
          hours: goal.targetHours,
          period: goal.period === 'week' ? t('common.week') : t('common.month'),
        })}
        {goal.weekStart != null && goal.weekEnd != null && (
          <> · {t('goals.weekRange', { from: goal.weekStart, to: goal.weekEnd })}</>
        )}
        {goal.monthStart != null && goal.monthEnd != null && (
          <>
            {' · '}
            {formatMonthName(goal.monthStart, i18n.language, 'short')}–
            {formatMonthName(goal.monthEnd, i18n.language, 'short')}
          </>
        )}
      </div>
    </>
  )
}
