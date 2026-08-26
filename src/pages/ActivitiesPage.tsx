import type { Activity } from '../types'
import { AddActivityForm } from '../components/AddActivityForm'

interface ActivitiesPageProps {
  activities: Activity[]
  onAdd: (name: string) => void
  onDelete: (activityId: string) => void
}

export function ActivitiesPage({ activities, onAdd, onDelete }: ActivitiesPageProps) {
  return (
    <>
      <header className="page-header">
        <h1>Aktiviteter</h1>
        <p className="page-subtitle">
          {activities.length === 0
            ? 'Skapa din första aktivitet för att börja logga träningstid'
            : `${activities.length} aktivitet${activities.length === 1 ? '' : 'er'}`}
        </p>
      </header>

      <div className="page-body">
        <AddActivityForm onAdd={onAdd} />

        {activities.length === 0 ? (
          <div className="empty-state">
            <p>Inga aktiviteter än.</p>
          </div>
        ) : (
          <div className="list">
            {activities.map((activity) => (
              <div className="list-row" key={activity.id}>
                <span className="list-row-title">{activity.name}</span>
                <button
                  className="btn-icon"
                  aria-label={`Ta bort ${activity.name}`}
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
