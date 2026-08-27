import type { Activity, Goal } from '../types'
import { currentPeriodActualHours } from '../utils'
import { GoalRing } from './GoalRing'

interface TotalGoalsProgressProps {
  activities: Activity[]
  goals: Goal[]
}

export function TotalGoalsProgress({ activities, goals }: TotalGoalsProgressProps) {
  const weekGoal = goals.find((g) => g.activityId === null && g.period === 'week')
  const monthGoal = goals.find((g) => g.activityId === null && g.period === 'month')

  if (!weekGoal && !monthGoal) return null

  return (
    <div className="chart-card">
      <div className="chart-controls">
        <div className="chart-title-group">
          <h2>Mål — samtliga aktiviteter</h2>
        </div>
      </div>

      <div className="goal-rings-row">
        {weekGoal && (
          <GoalRing
            label="Veckomål"
            actual={currentPeriodActualHours(activities, 'week', null)}
            target={weekGoal.targetHours}
          />
        )}
        {monthGoal && (
          <GoalRing
            label="Månadsmål"
            actual={currentPeriodActualHours(activities, 'month', null)}
            target={monthGoal.targetHours}
          />
        )}
      </div>
    </div>
  )
}
