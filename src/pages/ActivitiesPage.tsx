import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Activity } from '../types'
import { AddActivityForm } from '../components/AddActivityForm'

interface ActivitiesPageProps {
  activities: Activity[]
  onAdd: (name: string) => void
  onDelete: (activityId: string) => void
}

export function ActivitiesPage({ activities, onAdd, onDelete }: ActivitiesPageProps) {
  const { t } = useTranslation()
  const [pendingDelete, setPendingDelete] = useState<Activity | null>(null)

  function confirmDelete() {
    if (pendingDelete) onDelete(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <>
      <header className="page-header">
        <h1>{t('nav.activities')}</h1>
        <p className="page-subtitle">
          {activities.length === 0
            ? t('activities.emptyHint')
            : t('activities.count', { count: activities.length })}
        </p>
      </header>

      <div className="page-body">
        <AddActivityForm activities={activities} onAdd={onAdd} />

        {activities.length === 0 ? (
          <div className="empty-state">
            <p>{t('activities.emptyList')}</p>
          </div>
        ) : (
          <div className="list">
            {activities.map((activity) => (
              <div className="list-row" key={activity.id}>
                <span className="list-row-title">{activity.name}</span>
                <button
                  className="btn-icon"
                  aria-label={t('activities.deleteAria', { name: activity.name })}
                  onClick={() => setPendingDelete(activity)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {pendingDelete && (
        <div className="settings-sheet-backdrop" onClick={() => setPendingDelete(null)}>
          <div
            className="settings-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={t('activities.deleteTitle')}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settings-sheet-header">
              <h3>{t('activities.deleteTitle')}</h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setPendingDelete(null)}
                aria-label={t('common.close')}
              >
                ×
              </button>
            </div>

            <p className="confirm-text">
              {t('activities.deleteWarning', { name: pendingDelete.name })}
            </p>

            <div className="confirm-actions">
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                {t('common.delete')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setPendingDelete(null)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
