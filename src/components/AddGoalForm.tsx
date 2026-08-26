import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Activity, GoalPeriod } from '../types'

interface AddGoalFormProps {
  activities: Activity[]
  onAdd: (goal: { activityId: string | null; period: GoalPeriod; targetHours: number }) => void
}

const TOTAL_VALUE = '__total__'

export function AddGoalForm({ activities, onAdd }: AddGoalFormProps) {
  const [activityId, setActivityId] = useState(TOTAL_VALUE)
  const [period, setPeriod] = useState<GoalPeriod>('week')
  const [targetHours, setTargetHours] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const hours = parseFloat(targetHours)
    if (!hours || hours <= 0) return
    onAdd({ activityId: activityId === TOTAL_VALUE ? null : activityId, period, targetHours: hours })
    setTargetHours('')
  }

  return (
    <form className="add-goal-form" onSubmit={handleSubmit}>
      <select
        value={activityId}
        onChange={(e) => setActivityId(e.target.value)}
        aria-label="Aktivitet"
      >
        <option value={TOTAL_VALUE}>Alla aktiviteter (totalt)</option>
        {activities.map((activity) => (
          <option key={activity.id} value={activity.id}>
            {activity.name}
          </option>
        ))}
      </select>

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

      <input
        type="number"
        step="0.25"
        min="0"
        value={targetHours}
        onChange={(e) => setTargetHours(e.target.value)}
        placeholder="Antal timmar"
        aria-label="Måltimmar"
      />

      <button type="submit" className="btn btn-primary">
        Lägg till mål
      </button>
    </form>
  )
}
