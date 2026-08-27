import { useTranslation } from 'react-i18next'
import type { Activity, AppSettings, Goal, GoalPeriod } from '../types'
import { AddGoalForm } from '../components/AddGoalForm'

interface GoalsPageProps {
  activities: Activity[]
  goals: Goal[]
  settings: AppSettings
  onAdd: (goal: { activityId: string | null; period: GoalPeriod; targetHours: number }) => void
  onDelete: (goalId: string) => void
}

export function GoalsPage({ activities, goals, settings, onAdd, onDelete }: GoalsPageProps) {
  const { t } = useTranslation()
  const nameById = new Map(activities.map((a) => [a.id, a.name]))

  return (
    <>
      <header className="page-header">
        <h1>{t('nav.goals')}</h1>
        <p className="page-subtitle">
          {goals.length === 0 ? t('goals.emptyHint') : t('goals.count', { count: goals.length })}
        </p>
      </header>

      <div className="page-body">
        <AddGoalForm activities={activities} stepMinutes={settings.hourStepMinutes} onAdd={onAdd} />

        {goals.length === 0 ? (
          <div className="empty-state">
            <p>{t('goals.emptyList')}</p>
          </div>
        ) : (
          <div className="list">
            {goals.map((goal) => (
              <div className="list-row" key={goal.id}>
                <div>
                  <div className="list-row-title">
                    {goal.activityId === null
                      ? t('goals.allActivities')
                      : (nameById.get(goal.activityId) ?? t('goals.deletedActivity'))}
                  </div>
                  <div className="list-row-subtitle">
                    {t('goals.targetPerPeriod', {
                      hours: goal.targetHours,
                      period: goal.period === 'week' ? t('common.week') : t('common.month'),
                    })}
                  </div>
                </div>
                <button className="btn-icon" aria-label={t('goals.deleteAria')} onClick={() => onDelete(goal.id)}>
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
