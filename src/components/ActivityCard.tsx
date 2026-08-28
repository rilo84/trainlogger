import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Activity, Goal } from '../types'
import {
  sumHours,
  currentPeriodActualHours,
  currentWeekGoal,
  currentMonthGoal,
  formatHoursMinutes,
} from '../utils'
import { LogHoursForm } from './LogHoursForm'
import { GoalRing } from './GoalRing'

const COLLAPSED_LOG_COUNT = 3

interface ActivityCardProps {
  activity: Activity
  goals: Goal[]
  color?: string
  stepMinutes: number
  onLogHours: (activityId: string, hours: number, date: string) => void
  onDeleteLog: (activityId: string, logId: string) => void
}

export function ActivityCard({ activity, goals, color, stepMinutes, onLogHours, onDeleteLog }: ActivityCardProps) {
  const { t } = useTranslation()
  const [isLogging, setIsLogging] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const totalHours = sumHours(activity.logs)
  const sortedLogs = [...activity.logs].sort((a, b) => b.date.localeCompare(a.date))
  const visibleLogs = isExpanded ? sortedLogs : sortedLogs.slice(0, COLLAPSED_LOG_COUNT)
  const hasMoreLogs = sortedLogs.length > COLLAPSED_LOG_COUNT

  const weekGoal = currentWeekGoal(goals, activity.id)
  const monthGoal = currentMonthGoal(goals, activity.id)

  return (
    <div className="activity-card" style={color ? { borderColor: color } : undefined}>
      <div className="activity-card-header">
        <h3>{activity.name}</h3>
      </div>

      <div className="activity-total">
        <span className="activity-total-value">{formatHoursMinutes(totalHours)}</span>
        <span className="activity-total-label">{t('activityCard.totalLabel')}</span>
      </div>

      {(weekGoal || monthGoal) && (
        <div className="goal-rings-row goal-rings-row-small">
          {weekGoal && (
            <GoalRing
              label={t('common.weeklyGoal')}
              actual={currentPeriodActualHours([activity], 'week', activity.id)}
              target={weekGoal.targetHours}
              size={88}
            />
          )}
          {monthGoal && (
            <GoalRing
              label={t('common.monthlyGoal')}
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
                aria-label={t('activityCard.deleteLogAria', { date: log.date, hours: log.hours })}
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
          {isExpanded ? t('activityCard.showFewer') : t('activityCard.showAll', { count: sortedLogs.length })}
        </button>
      )}

      {isLogging ? (
        <LogHoursForm
          stepMinutes={stepMinutes}
          onLog={(hours, date) => {
            onLogHours(activity.id, hours, date)
            setIsLogging(false)
          }}
          onCancel={() => setIsLogging(false)}
        />
      ) : (
        <button className="btn btn-secondary" onClick={() => setIsLogging(true)}>
          {t('activityCard.logHoursButton')}
        </button>
      )}
    </div>
  )
}
