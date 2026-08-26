import { useState } from 'react'
import type { FormEvent } from 'react'

interface LogHoursFormProps {
  onLog: (hours: number, date: string) => void
  onCancel: () => void
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function LogHoursForm({ onLog, onCancel }: LogHoursFormProps) {
  const [hours, setHours] = useState('')
  const [date, setDate] = useState(todayIso)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = parseFloat(hours)
    if (!value || value <= 0 || !date) return
    onLog(value, date)
    setHours('')
    setDate(todayIso())
  }

  return (
    <form className="log-hours-form" onSubmit={handleSubmit}>
      <input
        type="date"
        value={date}
        max={todayIso()}
        onChange={(e) => setDate(e.target.value)}
        aria-label="Datum"
      />
      <input
        type="number"
        step="0.25"
        min="0"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        placeholder="Antal timmar"
        aria-label="Antal timmar"
        autoFocus
      />
      <div className="log-hours-form-actions">
        <button type="submit" className="btn btn-primary btn-small">
          Logga
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={onCancel}>
          Avbryt
        </button>
      </div>
    </form>
  )
}
