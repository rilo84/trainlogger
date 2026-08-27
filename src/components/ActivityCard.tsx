import { useState } from 'react'
import type { Activity, Goal } from '../types'
import { sumHours, currentPeriodActualHours, formatHoursMinutes } from '../utils'
import { LogHoursForm } from './LogHoursForm'
import { GoalRing } from './GoalRing'

const COLLAPSED_LOG_COUNT = 3

interface ActivityCardProps {
  activity: Activity
  goals: Goal[]
  onLogHours: (activityId: string, hours: number, date: string) => void
  onDeleteLog: (activityId: string, logId: string) => void
}

export function ActivityCard({ activity, goals, onLogHours, onDeleteLog }: ActivityCardProps) {
  const [isLogging, setIsLogging] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const totalHours = sumHours(activity.logs)
  const sortedLogs = [...activity.logs].sort((a, b) => b.date.localeCompare(a.date))
  const visibleLogs = isExpanded ? sortedLogs : sortedLogs.slice(0, COLLAPSED_LOG_COUNT)
  const hasMoreLogs = sortedLogs.length > COLLAPSED_LOG_COUNT

  const weekGoal = goals.find((g) => g.activityId === activity.id && g.period === 'week')
  const monthGoal = goals.find((g) => g.activityId === activity.id && g.period === 'month')

  return (
    <div className="activity-card">
      <div className="activity-card-header">
        <h3>{activity.name}</h3>
      </div>

      <div className="activity-total">
        <span className="activity-total-value">{formatHoursMinutes(totalHours)}</span>
        <span className="activity-total-label">totalt</span>
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

      {visibleLogs.length > 0 && (
        <ul className="activity-log-list">
          {visibleLogs.map((log) => (
            <li key={log.id}>
              <div className="activity-log-info">
                <span>{log.date}</span>
                <span>{formatHoursMinutes(log.hours)}</span>
              </div>
              <button
                type="button"
                className="btn-icon"
                aria-label={`Ta bort logg ${log.date}, ${log.hours} h`}
                onClick={() => onDeleteLog(activity.id, log.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasMoreLogs && (
        <button type="button" className="activity-log-toggle" onClick={() => setIsExpanded((v) => !v)}>
          {isExpanded ? 'Visa färre' : `Visa alla (${sortedLogs.length})`}
        </button>
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
