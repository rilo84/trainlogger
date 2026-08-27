import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { WheelPicker, buildHourOptions, buildDateOptions, todayIso } from './WheelPicker'

interface LogHoursFormProps {
  stepMinutes: number
  onLog: (hours: number, date: string) => void
  onCancel: () => void
}

export function LogHoursForm({ stepMinutes, onLog, onCancel }: LogHoursFormProps) {
  const { t, i18n } = useTranslation()
  const [hours, setHours] = useState('1')
  const [date, setDate] = useState(todayIso)

  const locale = i18n.language === 'en' ? 'en-US' : 'sv-SE'
  const dateOptions = useMemo(
    () => buildDateOptions(90, locale, t('logActivity.today'), t('logActivity.yesterday')),
    [locale, t],
  )
  const hourOptions = useMemo(() => buildHourOptions(8, stepMinutes / 60), [stepMinutes])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = parseFloat(hours)
    if (!value || value <= 0 || !date) return
    onLog(value, date)
    setDate(todayIso())
  }

  return (
    <form className="log-hours-form" onSubmit={handleSubmit}>
      <div className="wheel-picker-col">
        <span className="settings-sheet-label">{t('logActivity.dateLabel')}</span>
        <WheelPicker options={dateOptions} value={date} onChange={setDate} ariaLabel={t('logHours.dateAria')} />
      </div>
      <div className="wheel-picker-col">
        <span className="settings-sheet-label">{t('logActivity.hoursLabel')}</span>
        <WheelPicker options={hourOptions} value={hours} onChange={setHours} ariaLabel={t('logHours.hoursAria')} />
      </div>
      <div className="log-hours-form-actions">
        <button type="submit" className="btn btn-primary btn-small">
          {t('logHours.submit')}
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}
