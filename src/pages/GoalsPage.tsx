import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Activity, AppSettings, Goal, NewGoal } from '../types'
import { AddGoalForm } from '../components/AddGoalForm'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { GoalDescription } from '../components/GoalDescription'

interface GoalsPageProps {
  activities: Activity[]
  goals: Goal[]
  settings: AppSettings
  onAdd: (goal: NewGoal) => void
  onUpdate: (goalId: string, goal: NewGoal) => void
  onDelete: (goalId: string) => void
}

export function GoalsPage({ activities, goals, settings, onAdd, onUpdate, onDelete }: GoalsPageProps) {
  const { t } = useTranslation()
  const nameById = new Map(activities.map((a) => [a.id, a.name]))

  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const editingGoal = editingGoalId ? (goals.find((g) => g.id === editingGoalId) ?? null) : null
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editingGoalId) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [editingGoalId])

  return (
    <>
      <header className="page-header">
        <h1>{t('nav.goals')}</h1>
        <p className="page-subtitle">
          {goals.length === 0 ? t('goals.emptyHint') : t('goals.count', { count: goals.length })}
        </p>
      </header>

      <div className="page-body">
        <div ref={formRef}>
          <AddGoalForm
            key={editingGoal?.id ?? 'new'}
            activities={activities}
            goals={goals}
            stepMinutes={settings.hourStepMinutes}
            editingGoal={editingGoal ?? undefined}
            onAdd={onAdd}
            onUpdate={(updated) => {
              onUpdate(editingGoal!.id, updated)
              setEditingGoalId(null)
            }}
            onCancelEdit={() => setEditingGoalId(null)}
          />
        </div>

        {goals.length === 0 ? (
          <div className="empty-state">
            <p>{t('goals.emptyList')}</p>
          </div>
        ) : (
          <div className="list">
            {goals.map((goal) => (
              <div className={`list-row ${goal.id === editingGoalId ? 'editing' : ''}`} key={goal.id}>
                <button
                  type="button"
                  className="list-row-main"
                  aria-label={t('goals.editAria')}
                  onClick={() => setEditingGoalId((cur) => (cur === goal.id ? null : goal.id))}
                >
                  <GoalDescription goal={goal} nameById={nameById} />
                </button>
                <button
                  className="btn-icon"
                  aria-label={t('goals.deleteAria')}
                  onClick={() => setPendingDeleteId(goal.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {pendingDeleteId && (
        <ConfirmDialog
          title={t('goals.deleteTitle')}
          message={t('goals.deleteWarning')}
          confirmLabel={t('common.delete')}
          onConfirm={() => {
            if (editingGoalId === pendingDeleteId) setEditingGoalId(null)
            onDelete(pendingDeleteId)
            setPendingDeleteId(null)
          }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </>
  )
}
