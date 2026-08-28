import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Activity } from '../types'

interface AddActivityFormProps {
  activities: Activity[]
  onAdd: (name: string) => void
}

export function AddActivityForm({ activities, onAdd }: AddActivityFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')

  const trimmed = name.trim()
  const isDuplicate =
    trimmed !== '' && activities.some((a) => a.name.trim().toLowerCase() === trimmed.toLowerCase())

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!trimmed || isDuplicate) return
    onAdd(trimmed)
    setName('')
  }

  return (
    <form className="add-activity-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('activities.newActivityPlaceholder')}
        aria-label={t('activities.nameAria')}
      />
      <button type="submit" className="btn btn-primary" disabled={isDuplicate}>
        {t('common.add')}
      </button>
      {isDuplicate && <p className="add-activity-hint">{t('activities.duplicateHint')}</p>}
    </form>
  )
}
