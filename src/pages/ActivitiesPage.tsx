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
        <AddActivityForm onAdd={onAdd} />

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
                  onClick={() => onDelete(activity.id)}
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
