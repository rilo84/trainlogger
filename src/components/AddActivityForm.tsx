import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface AddActivityFormProps {
  onAdd: (name: string) => void
}

export function AddActivityForm({ onAdd }: AddActivityFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
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
      <button type="submit" className="btn btn-primary">
        {t('common.add')}
      </button>
    </form>
  )
}
