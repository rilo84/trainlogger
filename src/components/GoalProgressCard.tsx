import { useState } from 'react'
import type { Activity, Goal, GoalPeriod } from '../types'
import { getWeekStart, getMonthStart, formatHours } from '../utils'

type Scope = 'total' | 'activity'

const SIZE = 160
const STROKE = 16
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function computeCurrentPeriodActual(
  activities: Activity[],
  period: GoalPeriod,
  scope: Scope,
  activityId: string | null,
): number {
  const now = new Date()
  const periodStart = (period === 'week' ? getWeekStart(now) : getMonthStart(now)).getTime()
  let total = 0
  for (const activity of activities) {
    if (scope === 'activity' && activity.id !== activityId) continue
    for (const log of activity.logs) {
      const logDate = new Date(log.date)
      const logPeriodStart = (period === 'week' ? getWeekStart(logDate) : getMonthStart(logDate)).getTime()
      if (logPeriodStart === periodStart) total += log.hours
    }
  }
  return Math.round(total * 100) / 100
}

interface GoalProgressCardProps {
  activities: Activity[]
  goals: Goal[]
}

export function GoalProgressCard({ activities, goals }: GoalProgressCardProps) {
  const firstGoal = goals[0]
  const [period, setPeriod] = useState<GoalPeriod>(firstGoal?.period ?? 'week')
  const [scope, setScope] = useState<Scope>(firstGoal && firstGoal.activityId !== null ? 'activity' : 'total')
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(firstGoal?.activityId ?? null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (goals.length === 0) return null

  const nameById = new Map(activities.map((a) => [a.id, a.name]))
  const goal = goals.find(
    (g) => g.period === period && (scope === 'total' ? g.activityId === null : g.activityId === selectedActivityId),
  )

  const scopeLabel = scope === 'total' ? 'Totalt' : (nameById.get(selectedActivityId ?? '') ?? 'Aktivitet')
  const periodLabel = period === 'week' ? 'veckomål' : 'månadsmål'

  const actual = goal ? computeCurrentPeriodActual(activities, period, scope, selectedActivityId) : 0
  const fraction = goal ? Math.min(1, actual / goal.targetHours) : 0
  const percent = goal ? Math.round((actual / goal.targetHours) * 100) : 0
  const reached = fraction >= 1
  const arcColor = reached ? 'var(--color-accent)' : '#3987e5'
  const dashOffset = CIRCUMFERENCE * (1 - fraction)

  return (
    <div className="chart-card">
      <div className="chart-controls">
        <div className="chart-title-group">
          <h2>
            {scopeLabel} · {periodLabel}
          </h2>
        </div>
        <button
          type="button"
          className="chart-settings-button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Målinställningar"
        >
          ⚙️
        </button>
      </div>

      {goal ? (
        <div className="goal-progress-body">
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${percent}% av ${scopeLabel} ${periodLabel}`}>
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={STROKE}
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={arcColor}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
            <text x={SIZE / 2} y={SIZE / 2 - 6} textAnchor="middle" className="goal-progress-percent">
              {percent}%
            </text>
            <text x={SIZE / 2} y={SIZE / 2 + 16} textAnchor="middle" className="goal-progress-hours">
              {formatHours(actual)} / {formatHours(goal.targetHours)} h
            </text>
          </svg>
        </div>
      ) : (
        <div className="empty-state">
          <p>Inget mål satt för den här kombinationen. Ändra i inställningarna eller skapa ett nytt mål.</p>
        </div>
      )}

      {settingsOpen && (
        <div className="settings-sheet-backdrop" onClick={() => setSettingsOpen(false)}>
          <div
            className="settings-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Målinställningar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settings-sheet-header">
              <h3>Målinställningar</h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setSettingsOpen(false)}
                aria-label="Stäng"
              >
                ×
              </button>
            </div>

            <div className="settings-sheet-row">
              <span className="settings-sheet-label">Vy</span>
              <div className="segmented" role="group" aria-label="Vy">
                <button
                  type="button"
                  className={scope === 'total' ? 'active' : ''}
                  onClick={() => setScope('total')}
                >
                  Samtliga aktiviteter
                </button>
                <button
                  type="button"
                  className={scope === 'activity' ? 'active' : ''}
                  onClick={() => {
                    setScope('activity')
                    if (!selectedActivityId) setSelectedActivityId(activities[0]?.id ?? null)
                  }}
                >
                  Aktivitet
                </button>
              </div>
            </div>

            {scope === 'activity' && (
              <div className="settings-sheet-row">
                <span className="settings-sheet-label">Välj aktivitet</span>
                <select
                  value={selectedActivityId ?? ''}
                  onChange={(e) => setSelectedActivityId(e.target.value)}
                  aria-label="Välj aktivitet"
                >
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="settings-sheet-row">
              <span className="settings-sheet-label">Tidsperiod</span>
              <div className="segmented" role="group" aria-label="Tidsperiod">
                <button
                  type="button"
                  className={period === 'week' ? 'active' : ''}
                  onClick={() => setPeriod('week')}
                >
                  Veckomål
                </button>
                <button
                  type="button"
                  className={period === 'month' ? 'active' : ''}
                  onClick={() => setPeriod('month')}
                >
                  Månadsmål
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
