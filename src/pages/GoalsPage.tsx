import type { Activity, Goal, GoalPeriod } from '../types'
import { AddGoalForm } from '../components/AddGoalForm'

interface GoalsPageProps {
  activities: Activity[]
  goals: Goal[]
  onAdd: (goal: { activityId: string | null; period: GoalPeriod; targetHours: number }) => void
  onDelete: (goalId: string) => void
}

function periodLabel(period: GoalPeriod): string {
  return period === 'week' ? 'vecka' : 'månad'
}

export function GoalsPage({ activities, goals, onAdd, onDelete }: GoalsPageProps) {
  const nameById = new Map(activities.map((a) => [a.id, a.name]))

  return (
    <>
      <header className="page-header">
        <h1>Mål</h1>
        <p className="page-subtitle">
          {goals.length === 0
            ? 'Sätt upp mål för hur många timmar du vill träna'
            : `${goals.length} mål satta`}
        </p>
      </header>

      <div className="page-body">
        <AddGoalForm activities={activities} onAdd={onAdd} />

        {goals.length === 0 ? (
          <div className="empty-state">
            <p>Inga mål tillagda än.</p>
          </div>
        ) : (
          <div className="list">
            {goals.map((goal) => (
              <div className="list-row" key={goal.id}>
                <div>
                  <div className="list-row-title">
                    {goal.activityId === null ? 'Alla aktiviteter' : (nameById.get(goal.activityId) ?? 'Borttagen aktivitet')}
                  </div>
                  <div className="list-row-subtitle">
                    {goal.targetHours} h / {periodLabel(goal.period)}
                  </div>
                </div>
                <button
                  className="btn-icon"
                  aria-label="Ta bort mål"
                  onClick={() => onDelete(goal.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
