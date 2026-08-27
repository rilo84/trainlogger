import { useState } from 'react'
import type { Activity, Goal } from '../types'
import { sumHours, currentPeriodActualHours } from '../utils'
import { LogHoursForm } from './LogHoursForm'
import { GoalRing } from './GoalRing'

interface ActivityCardProps {
  activity: Activity
  goals: Goal[]
  onLogHours: (activityId: string, hours: number, date: string) => void
}

export function ActivityCard({ activity, goals, onLogHours }: ActivityCardProps) {
  const [isLogging, setIsLogging] = useState(false)

  const totalHours = sumHours(activity.logs)
  const recentLogs = [...activity.logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  const weekGoal = goals.find((g) => g.activityId === activity.id && g.period === 'week')
  const monthGoal = goals.find((g) => g.activityId === activity.id && g.period === 'month')

  return (
    <div className="activity-card">
      <div className="activity-card-header">
        <h3>{activity.name}</h3>
      </div>

      <div className="activity-total">
        <span className="activity-total-value">{totalHours}</span>
        <span className="activity-total-label">timmar totalt</span>
      </div>

      {(weekGoal || monthGoal) && (
        <div className="goal-rings-row goal-rings-row-small">
          {weekGoal && (
            <GoalRing
              label="Veckomål"
              actual={currentPeriodActualHours([activity], 'week', activity.id)}
              target={weekGoal.targetHours}
              size={88}
            />
          )}
          {monthGoal && (
            <GoalRing
              label="Månadsmål"
              actual={currentPeriodActualHours([activity], 'month', activity.id)}
              target={monthGoal.targetHours}
              size={88}
            />
          )}
        </div>
      )}

      {recentLogs.length > 0 && (
        <ul className="activity-log-list">
          {recentLogs.map((log) => (
            <li key={log.id}>
              <span>{log.date}</span>
              <span>{log.hours} h</span>
            </li>
          ))}
        </ul>
      )}

      {isLogging ? (
        <LogHoursForm
          onLog={(hours, date) => {
            onLogHours(activity.id, hours, date)
            setIsLogging(false)
          }}
          onCancel={() => setIsLogging(false)}
        />
      ) : (
        <button className="btn btn-secondary" onClick={() => setIsLogging(true)}>
          + Logga timmar
        </button>
      )}
    </div>
  )
}
