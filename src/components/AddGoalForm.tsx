import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Activity, Goal, GoalPeriod, NewGoal } from '../types'
import { getISOWeek } from '../utils'
import { WheelPicker, buildHourOptions } from './WheelPicker'

interface AddGoalFormProps {
  activities: Activity[]
  goals: Goal[]
  stepMinutes: number
  onAdd: (goal: NewGoal) => void
}

type WeekMode = 'linear' | 'periodized'

const TOTAL_VALUE = '__total__'
const ALL_WEEKS = Array.from({ length: 53 }, (_, i) => i + 1)

export function AddGoalForm({ activities, goals, stepMinutes, onAdd }: AddGoalFormProps) {
  const { t } = useTranslation()
  const hourOptions = useMemo(() => buildHourOptions(40, stepMinutes / 60), [stepMinutes])
  const [period, setPeriod] = useState<GoalPeriod>('week')
  const [weekMode, setWeekMode] = useState<WeekMode>('linear')
  const [activityId, setActivityId] = useState(TOTAL_VALUE)
  const [hours, setHours] = useState('2')
  const [fromWeek, setFromWeek] = useState(() => String(getISOWeek(new Date())))
  const [toWeek, setToWeek] = useState(fromWeek)

  const selectedActivityId = activityId === TOTAL_VALUE ? null : activityId

  const weekGoalsForActivity = useMemo(
    () => goals.filter((g) => g.period === 'week' && g.activityId === selectedActivityId),
    [goals, selectedActivityId],
  )
  const hasLinearWeekGoal = weekGoalsForActivity.some((g) => g.weekStart == null)
  const hasPeriodizedWeekGoal = weekGoalsForActivity.some((g) => g.weekStart != null)
  const hasAnyWeekGoal = weekGoalsForActivity.length > 0

  const takenWeeks = useMemo(() => {
    const set = new Set<number>()
    for (const g of weekGoalsForActivity) {
      if (g.weekStart != null && g.weekEnd != null) {
        for (let w = g.weekStart; w <= g.weekEnd; w++) set.add(w)
      }
    }
    return set
  }, [weekGoalsForActivity])
  const freeFromWeeks = useMemo(() => ALL_WEEKS.filter((w) => !takenWeeks.has(w)), [takenWeeks])

  // "To week" can run from the chosen start up to the week before the next occupied one,
  // so a new block can never overlap an existing one.
  function weeksFrom(start: number): number[] {
    let end = 53
    for (let w = start + 1; w <= 53; w++) {
      if (takenWeeks.has(w)) {
        end = w - 1
        break
      }
    }
    const out: number[] = []
    for (let w = start; w <= end; w++) out.push(w)
    return out
  }

  // A linear (every-week) goal can't coexist with periodized blocks for the same activity.
  const linearDisabled = period === 'week' && hasPeriodizedWeekGoal
  const effectiveWeekMode: WeekMode =
    period !== 'week' ? 'linear' : linearDisabled ? 'periodized' : weekMode
  const showWeekRange = period === 'week' && effectiveWeekMode === 'periodized' && freeFromWeeks.length > 0

  // Keep the week pickers pointed at a still-free, non-overlapping range.
  useEffect(() => {
    if (!showWeekRange) return
    const from = Number(fromWeek)
    if (!freeFromWeeks.includes(from)) {
      const current = getISOWeek(new Date())
      const fallback = freeFromWeeks.includes(current) ? current : freeFromWeeks[0]
      setFromWeek(String(fallback))
      setToWeek(String(fallback))
      return
    }
    if (!weeksFrom(from).includes(Number(toWeek))) {
      setToWeek(String(from))
    }
  }, [showWeekRange, takenWeeks, freeFromWeeks, fromWeek, toWeek])

  const weekLabel = (w: number) => ({ value: String(w), label: t('goals.weekShort', { week: w }) })
  const fromWeekOptions = freeFromWeeks.map(weekLabel)
  const toWeekOptions = weeksFrom(Number(fromWeek)).map(weekLabel)

  let disabledReason: string | null = null
  if (period === 'month') {
    if (goals.some((g) => g.activityId === selectedActivityId && g.period === 'month')) {
      disabledReason = t('goals.alreadyExistsHint')
    }
  } else if (effectiveWeekMode === 'linear') {
    if (hasAnyWeekGoal) disabledReason = t('goals.linearBlockedHint')
  } else if (hasLinearWeekGoal) {
    disabledReason = t('goals.linearExistsHint')
  } else if (freeFromWeeks.length === 0) {
    disabledReason = t('goals.allWeeksTaken')
  }
  const canSubmit = disabledReason == null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const value = parseFloat(hours)
    if (!value || value <= 0) return

    if (period === 'week' && effectiveWeekMode === 'periodized') {
      const from = Number(fromWeek)
      const to = Number(toWeek)
      if (!from || !to || from > to) return
      onAdd({ activityId: selectedActivityId, period: 'week', targetHours: value, weekStart: from, weekEnd: to })
    } else {
      onAdd({ activityId: selectedActivityId, period, targetHours: value })
    }
  }

  return (
    <form className="add-goal-form" onSubmit={handleSubmit}>
      <div className="add-goal-section">
        <span className="settings-sheet-label">{t('goals.periodLabel')}</span>
        <div className="segmented" role="group" aria-label={t('goals.periodLabel')}>
          <button
            type="button"
            className={period === 'week' ? 'active' : ''}
            onClick={() => setPeriod('week')}
          >
            {t('common.perWeek')}
          </button>
          <button
            type="button"
            className={period === 'month' ? 'active' : ''}
            onClick={() => setPeriod('month')}
          >
            {t('common.perMonth')}
          </button>
        </div>
      </div>

      {period === 'week' && (
        <div className="add-goal-section">
          <span className="settings-sheet-label">{t('goals.goalTypeLabel')}</span>
          <div className="segmented" role="group" aria-label={t('goals.goalTypeLabel')}>
            <button
              type="button"
              className={effectiveWeekMode === 'linear' ? 'active' : ''}
              disabled={linearDisabled}
              onClick={() => setWeekMode('linear')}
            >
              {t('goals.goalTypeLinear')}
            </button>
            <button
              type="button"
              className={effectiveWeekMode === 'periodized' ? 'active' : ''}
              onClick={() => setWeekMode('periodized')}
            >
              {t('goals.goalTypePeriodized')}
            </button>
          </div>
        </div>
      )}

      <div className="add-goal-section">
        <span className="settings-sheet-label">{t('goals.activityLabel')}</span>
        <div className="activity-picker" role="group" aria-label={t('goals.activityLabel')}>
          <button
            type="button"
            className={`activity-picker-chip ${activityId === TOTAL_VALUE ? 'active' : ''}`}
            onClick={() => setActivityId(TOTAL_VALUE)}
          >
            {t('goals.allActivities')}
          </button>
          {activities.map((activity) => (
            <button
              key={activity.id}
              type="button"
              className={`activity-picker-chip ${activityId === activity.id ? 'active' : ''}`}
              onClick={() => setActivityId(activity.id)}
            >
              {activity.name}
            </button>
          ))}
        </div>
      </div>

      {showWeekRange && (
        <div className="add-goal-section">
          <span className="settings-sheet-label">{t('goals.weekRangeLabel')}</span>
          <div className="wheel-picker-row">
            <div className="wheel-picker-col">
              <span className="settings-sheet-label">{t('goals.fromWeekLabel')}</span>
              <WheelPicker
                options={fromWeekOptions}
                value={fromWeek}
                onChange={setFromWeek}
                ariaLabel={t('goals.fromWeekLabel')}
              />
            </div>
            <div className="wheel-picker-col">
              <span className="settings-sheet-label">{t('goals.toWeekLabel')}</span>
              <WheelPicker
                options={toWeekOptions}
                value={toWeek}
                onChange={setToWeek}
                ariaLabel={t('goals.toWeekLabel')}
              />
            </div>
          </div>
        </div>
      )}

      <div className="add-goal-section">
        <span className="settings-sheet-label">{t('goals.hoursLabel')}</span>
        <WheelPicker options={hourOptions} value={hours} onChange={setHours} ariaLabel={t('goals.hoursLabel')} />
      </div>

      {disabledReason && <p className="add-goal-hint">{disabledReason}</p>}

      <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
        {t('goals.submit')}
      </button>
    </form>
  )
}
