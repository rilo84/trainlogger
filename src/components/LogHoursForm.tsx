import { useState } from 'react'
import type { FormEvent } from 'react'
import { WheelPicker, buildHourOptions } from './WheelPicker'

interface LogHoursFormProps {
  onLog: (hours: number, date: string) => void
  onCancel: () => void
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

const HOUR_OPTIONS = buildHourOptions(8, 0.25)

export function LogHoursForm({ onLog, onCancel }: LogHoursFormProps) {
  const [hours, setHours] = useState('1')
  const [date, setDate] = useState(todayIso)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = parseFloat(hours)
    if (!value || value <= 0 || !date) return
    onLog(value, date)
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
      <WheelPicker options={HOUR_OPTIONS} value={hours} onChange={setHours} ariaLabel="Antal timmar" />
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
