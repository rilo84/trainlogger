import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Activity, Goal, GoalPeriod } from '../types'
import { WheelPicker, buildHourOptions } from './WheelPicker'

interface AddGoalFormProps {
  activities: Activity[]
  goals: Goal[]
  stepMinutes: number
  onAdd: (goal: { activityId: string | null; period: GoalPeriod; targetHours: number }) => void
}

const TOTAL_VALUE = '__total__'

export function AddGoalForm({ activities, goals, stepMinutes, onAdd }: AddGoalFormProps) {
  const { t } = useTranslation()
  const hourOptions = useMemo(() => buildHourOptions(40, stepMinutes / 60), [stepMinutes])
  const [period, setPeriod] = useState<GoalPeriod>('week')
  const [activityId, setActivityId] = useState(TOTAL_VALUE)
  const [hours, setHours] = useState('2')

  const selectedActivityId = activityId === TOTAL_VALUE ? null : activityId
  const isDuplicate = goals.some((g) => g.activityId === selectedActivityId && g.period === period)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isDuplicate) return
    const value = parseFloat(hours)
    if (!value || value <= 0) return
    onAdd({ activityId: selectedActivityId, period, targetHours: value })
  }

  return (
    <form className="add-goal-form" onSubmit={handleSubmit}>
      <div className="add-goal-section">
        <span className="settings-sheet-label">{t('goals.periodLabel')}</span>
        <div className="segmented" role="group" aria-label={t('goals.periodLabel')}>
          <button
            type="button"
            className={period === 'week' ? 'active' : ''}
            onClick={() => setPeriod('week')}
          >
            {t('common.perWeek')}
          </button>
          <button
            type="button"
            className={period === 'month' ? 'active' : ''}
            onClick={() => setPeriod('month')}
          >
            {t('common.perMonth')}
          </button>
        </div>
      </div>

      <div className="add-goal-section">
        <span className="settings-sheet-label">{t('goals.activityLabel')}</span>
        <div className="activity-picker" role="group" aria-label={t('goals.activityLabel')}>
          <button
            type="button"
            className={`activity-picker-chip ${activityId === TOTAL_VALUE ? 'active' : ''}`}
            onClick={() => setActivityId(TOTAL_VALUE)}
          >
            {t('goals.allActivities')}
          </button>
          {activities.map((activity) => (
            <button
              key={activity.id}
              type="button"
              className={`activity-picker-chip ${activityId === activity.id ? 'active' : ''}`}
              onClick={() => setActivityId(activity.id)}
            >
              {activity.name}
            </button>
          ))}
        </div>
      </div>

      <div className="add-goal-section">
        <span className="settings-sheet-label">{t('goals.hoursLabel')}</span>
        <WheelPicker options={hourOptions} value={hours} onChange={setHours} ariaLabel={t('goals.hoursLabel')} />
      </div>

      <button type="submit" className="btn btn-primary" disabled={isDuplicate}>
        {t('goals.submit')}
      </button>
    </form>
  )
}
