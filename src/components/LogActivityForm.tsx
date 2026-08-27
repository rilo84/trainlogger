import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Activity } from '../types'
import { WheelPicker, buildHourOptions, buildDateOptions, todayIso } from './WheelPicker'
import type { WheelPickerOption } from './WheelPicker'

interface LogActivityFormProps {
  activities: Activity[]
  stepMinutes: number
  onLog: (activityId: string, hours: number, date: string) => void
  onClose: () => void
}

export function LogActivityForm({ activities, stepMinutes, onLog, onClose }: LogActivityFormProps) {
  const { t, i18n } = useTranslation()
  const [activityId, setActivityId] = useState(activities[0]?.id ?? '')
  const [date, setDate] = useState(todayIso)
  const [hours, setHours] = useState('1')

  const locale = i18n.language === 'en' ? 'en-US' : 'sv-SE'
  const dateOptions = useMemo(
    () => buildDateOptions(90, locale, t('logActivity.today'), t('logActivity.yesterday')),
    [locale, t],
  )
  const hourOptions = useMemo(() => buildHourOptions(8, stepMinutes / 60), [stepMinutes])
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
        aria-label={t('logActivity.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-sheet-header">
          <h3>{t('logActivity.title')}</h3>
          <button type="button" className="btn-icon" onClick={onClose} aria-label={t('logActivity.closeAria')}>
            ×
          </button>
        </div>

        <form className="log-activity-form" onSubmit={handleSubmit}>
          <div className="wheel-picker-row">
            <div className="wheel-picker-col wheel-picker-col-wide">
              <span className="settings-sheet-label">{t('logActivity.activityLabel')}</span>
              <WheelPicker
                options={activityOptions}
                value={activityId}
                onChange={setActivityId}
                ariaLabel={t('logActivity.activityLabel')}
              />
            </div>
            <div className="wheel-picker-col">
              <span className="settings-sheet-label">{t('logActivity.dateLabel')}</span>
              <WheelPicker
                options={dateOptions}
                value={date}
                onChange={setDate}
                ariaLabel={t('logActivity.dateLabel')}
              />
            </div>
            <div className="wheel-picker-col">
              <span className="settings-sheet-label">{t('logActivity.hoursLabel')}</span>
              <WheelPicker
                options={hourOptions}
                value={hours}
                onChange={setHours}
                ariaLabel={t('logHours.hoursAria')}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-submit">
            {t('logActivity.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
