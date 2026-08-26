import { useState } from 'react'
import type { Activity } from '../types'
import { sumHours } from '../utils'
import { LogHoursForm } from './LogHoursForm'

interface ActivityCardProps {
  activity: Activity
  onLogHours: (activityId: string, hours: number, date: string) => void
}

export function ActivityCard({ activity, onLogHours }: ActivityCardProps) {
  const [isLogging, setIsLogging] = useState(false)

  const totalHours = sumHours(activity.logs)
  const recentLogs = [...activity.logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  return (
    <div className="activity-card">
      <div className="activity-card-header">
        <h3>{activity.name}</h3>
      </div>

      <div className="activity-total">
        <span className="activity-total-value">{totalHours}</span>
        <span className="activity-total-label">timmar totalt</span>
      </div>

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
