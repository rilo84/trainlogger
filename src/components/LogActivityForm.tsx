import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Activity } from '../types'
import { WheelPicker } from './WheelPicker'
import type { WheelPickerOption } from './WheelPicker'

interface LogActivityFormProps {
  activities: Activity[]
  onLog: (activityId: string, hours: number, date: string) => void
  onClose: () => void
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatDateOptionLabel(date: Date, todayDateIso: string): string {
  const iso = date.toISOString().slice(0, 10)
  if (iso === todayDateIso) return 'Idag'

  const diffDays = Math.round((new Date(todayDateIso).getTime() - date.getTime()) / 86400000)
  if (diffDays === 1) return 'Igår'

  const weekday = date.toLocaleDateString('sv-SE', { weekday: 'short' }).replace('.', '')
  const month = date.toLocaleDateString('sv-SE', { month: 'short' }).replace('.', '')
  return `${weekday} ${date.getDate()} ${month}`
}

function buildDateOptions(daysBack: number): WheelPickerOption[] {
  const today = todayIso()
  const options: WheelPickerOption[] = []
  for (let i = 0; i < daysBack; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const iso = date.toISOString().slice(0, 10)
    options.push({ value: iso, label: formatDateOptionLabel(date, today) })
  }
  return options
}

export function LogActivityForm({ activities, onLog, onClose }: LogActivityFormProps) {
  const [activityId, setActivityId] = useState(activities[0]?.id ?? '')
  const [date, setDate] = useState(todayIso)
  const [hours, setHours] = useState('1')

  const dateOptions = useMemo(() => buildDateOptions(90), [])
  const activityOptions: WheelPickerOption[] = activities.map((a) => ({ value: a.id, label: a.name }))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = parseFloat(hours)
    if (!activityId || !value || value <= 0) return
    onLog(activityId, value, date)
    onClose()
  }

  return (
    <div className="settings-sheet-backdrop" onClick={onClose}>
      <div
        className="settings-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Logga aktivitet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-sheet-header">
          <h3>Logga aktivitet</h3>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Stäng">
            ×
          </button>
        </div>

        <form className="log-activity-form" onSubmit={handleSubmit}>
          <div className="wheel-picker-row">
            <div className="wheel-picker-col">
              <span className="settings-sheet-label">Aktivitet</span>
              <WheelPicker
                options={activityOptions}
                value={activityId}
                onChange={setActivityId}
                ariaLabel="Aktivitet"
              />
            </div>
            <div className="wheel-picker-col">
              <span className="settings-sheet-label">Datum</span>
              <WheelPicker options={dateOptions} value={date} onChange={setDate} ariaLabel="Datum" />
            </div>
          </div>

          <div className="settings-sheet-row">
            <span className="settings-sheet-label">Antal timmar</span>
            <input
              type="number"
              step="0.25"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              aria-label="Antal timmar"
            />
          </div>

          <button type="submit" className="btn btn-primary login-submit">
            Logga
          </button>
        </form>
      </div>
    </div>
  )
}
