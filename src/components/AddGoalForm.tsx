import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Activity, GoalPeriod } from '../types'
import { WheelPicker, buildHourOptions } from './WheelPicker'

interface AddGoalFormProps {
  activities: Activity[]
  onAdd: (goal: { activityId: string | null; period: GoalPeriod; targetHours: number }) => void
}

const TOTAL_VALUE = '__total__'
const HOUR_OPTIONS = buildHourOptions(40, 0.25)

export function AddGoalForm({ activities, onAdd }: AddGoalFormProps) {
  const [period, setPeriod] = useState<GoalPeriod>('week')
  const [activityId, setActivityId] = useState(TOTAL_VALUE)
  const [hours, setHours] = useState('2')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = parseFloat(hours)
    if (!value || value <= 0) return
    onAdd({ activityId: activityId === TOTAL_VALUE ? null : activityId, period, targetHours: value })
  }

  return (
    <form className="add-goal-form" onSubmit={handleSubmit}>
      <div className="add-goal-section">
        <span className="settings-sheet-label">Period</span>
        <div className="segmented" role="group" aria-label="Period">
          <button
            type="button"
            className={period === 'week' ? 'active' : ''}
            onClick={() => setPeriod('week')}
          >
            Per vecka
          </button>
          <button
            type="button"
            className={period === 'month' ? 'active' : ''}
            onClick={() => setPeriod('month')}
          >
            Per månad
          </button>
        </div>
      </div>

      <div className="add-goal-section">
        <span className="settings-sheet-label">Aktivitet</span>
        <div className="activity-picker" role="group" aria-label="Aktivitet">
          <button
            type="button"
            className={`activity-picker-chip ${activityId === TOTAL_VALUE ? 'active' : ''}`}
            onClick={() => setActivityId(TOTAL_VALUE)}
          >
            Alla aktiviteter
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
        <span className="settings-sheet-label">Antal timmar</span>
        <WheelPicker options={HOUR_OPTIONS} value={hours} onChange={setHours} ariaLabel="Måltimmar" />
      </div>

      <button type="submit" className="btn btn-primary">
        Lägg till mål
      </button>
    </form>
  )
}
