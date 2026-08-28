import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Activity, Goal, GoalPeriod, NewGoal } from '../types'
import { getISOWeek, goalRange, formatMonthName } from '../utils'
import { WheelPicker, buildHourOptions } from './WheelPicker'

interface AddGoalFormProps {
  activities: Activity[]
  goals: Goal[]
  stepMinutes: number
  // Set to edit an existing goal instead of creating one. The parent remounts the form
  // (via key) when this changes, so the state initialisers below pick the values up.
  editingGoal?: Goal
  onAdd: (goal: NewGoal) => void
  onUpdate: (goal: NewGoal) => void
  onCancelEdit: () => void
}

type GoalKind = 'linear' | 'periodized'

const TOTAL_VALUE = '__total__'
const WEEKS = Array.from({ length: 53 }, (_, i) => i + 1)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

export function AddGoalForm({
  activities,
  goals,
  stepMinutes,
  editingGoal,
  onAdd,
  onUpdate,
  onCancelEdit,
}: AddGoalFormProps) {
  const { t, i18n } = useTranslation()
  const hourOptions = useMemo(() => buildHourOptions(40, stepMinutes / 60), [stepMinutes])

  const editRange = editingGoal ? goalRange(editingGoal) : null
  const initUnit = editRange
    ? editRange[0]
    : editingGoal?.period === 'month'
      ? new Date().getMonth() + 1
      : getISOWeek(new Date())

  const [period, setPeriod] = useState<GoalPeriod>(editingGoal?.period ?? 'week')
  const [goalKind, setGoalKind] = useState<GoalKind>(
    editingGoal ? (editRange ? 'periodized' : 'linear') : 'linear',
  )
  const [activityId, setActivityId] = useState(editingGoal ? (editingGoal.activityId ?? TOTAL_VALUE) : TOTAL_VALUE)
  const [hours, setHours] = useState(editingGoal ? String(editingGoal.targetHours) : '2')
  const [rangeFrom, setRangeFrom] = useState(String(initUnit))
  const [rangeTo, setRangeTo] = useState(editRange ? String(editRange[1]) : String(initUnit))

  const selectedActivityId = activityId === TOTAL_VALUE ? null : activityId
  const isWeek = period === 'week'
  const units = isWeek ? WEEKS : MONTHS
  const currentUnit = isWeek ? getISOWeek(new Date()) : new Date().getMonth() + 1

  const goalsForActivity = useMemo(
    () =>
      goals.filter(
        (g) => g.period === period && g.activityId === selectedActivityId && g.id !== editingGoal?.id,
      ),
    [goals, period, selectedActivityId, editingGoal?.id],
  )
  const hasLinear = goalsForActivity.some((g) => goalRange(g) == null)
  const hasPeriodized = goalsForActivity.some((g) => goalRange(g) != null)
  const hasAnyGoal = goalsForActivity.length > 0

  const takenUnits = useMemo(() => {
    const set = new Set<number>()
    for (const g of goalsForActivity) {
      const r = goalRange(g)
      if (r) for (let u = r[0]; u <= r[1]; u++) set.add(u)
    }
    return set
  }, [goalsForActivity])
  const freeStartUnits = useMemo(() => units.filter((u) => !takenUnits.has(u)), [units, takenUnits])

  // A block can run from the chosen start up to the unit before the next occupied one,
  // so a new block can never overlap an existing one.
  function unitsFrom(start: number): number[] {
    const max = units[units.length - 1]
    let end = max
    for (let u = start + 1; u <= max; u++) {
      if (takenUnits.has(u)) {
        end = u - 1
        break
      }
    }
    const out: number[] = []
    for (let u = start; u <= end; u++) out.push(u)
    return out
  }

  // A linear (every-period) goal can't coexist with periodized blocks for the same target.
  const linearDisabled = hasPeriodized
  const effectiveKind: GoalKind = linearDisabled ? 'periodized' : goalKind
  const showRange = effectiveKind === 'periodized' && freeStartUnits.length > 0

  // Switching week <-> month makes the old index meaningless; start from "now" again.
  // Skipped on the first render so an edited goal keeps its saved range.
  const prevPeriod = useRef(period)
  useEffect(() => {
    if (prevPeriod.current === period) return
    prevPeriod.current = period
    setRangeFrom(String(currentUnit))
    setRangeTo(String(currentUnit))
  }, [period, currentUnit])

  // Keep the range pickers pointed at a still-free, non-overlapping span.
  useEffect(() => {
    if (!showRange) return
    const from = Number(rangeFrom)
    if (!freeStartUnits.includes(from)) {
      const fallback = freeStartUnits.includes(currentUnit) ? currentUnit : freeStartUnits[0]
      setRangeFrom(String(fallback))
      setRangeTo(String(fallback))
      return
    }
    if (!unitsFrom(from).includes(Number(rangeTo))) {
      setRangeTo(String(from))
    }
  }, [showRange, period, takenUnits, freeStartUnits, rangeFrom, rangeTo, currentUnit])

  const unitOption = (u: number) => ({
    value: String(u),
    label: isWeek ? t('goals.weekShort', { week: u }) : formatMonthName(u, i18n.language, 'long'),
  })
  const fromOptions = freeStartUnits.map(unitOption)
  const toOptions = unitsFrom(Number(rangeFrom)).map(unitOption)

  let disabledReason: string | null = null
  if (effectiveKind === 'linear') {
    if (hasAnyGoal) disabledReason = t('goals.linearBlockedHint')
  } else if (hasLinear) {
    disabledReason = t('goals.linearExistsHint')
  } else if (freeStartUnits.length === 0) {
    disabledReason = t('goals.allPeriodsTaken')
  }
  const canSubmit = disabledReason == null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const value = parseFloat(hours)
    if (!value || value <= 0) return

    let payload: NewGoal
    if (effectiveKind === 'periodized') {
      const from = Number(rangeFrom)
      const to = Number(rangeTo)
      if (!from || !to || from > to) return
      const range = isWeek ? { weekStart: from, weekEnd: to } : { monthStart: from, monthEnd: to }
      payload = { activityId: selectedActivityId, period, targetHours: value, ...range }
    } else {
      payload = { activityId: selectedActivityId, period, targetHours: value }
    }

    if (editingGoal) onUpdate(payload)
    else onAdd(payload)
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

      <div className="add-goal-section">
        <span className="settings-sheet-label">{t('goals.goalTypeLabel')}</span>
        <div className="segmented" role="group" aria-label={t('goals.goalTypeLabel')}>
          <button
            type="button"
            className={effectiveKind === 'linear' ? 'active' : ''}
            disabled={linearDisabled}
            onClick={() => setGoalKind('linear')}
          >
            {isWeek ? t('goals.goalTypeLinear') : t('goals.goalTypeLinearMonth')}
          </button>
          <button
            type="button"
            className={effectiveKind === 'periodized' ? 'active' : ''}
            onClick={() => setGoalKind('periodized')}
          >
            {t('goals.goalTypePeriodized')}
          </button>
        </div>
      </div>

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

      {showRange && (
        <div className="add-goal-section">
          <span className="settings-sheet-label">
            {isWeek ? t('goals.weekRangeLabel') : t('goals.monthRangeLabel')}
          </span>
          <div className="wheel-picker-row">
            <div className="wheel-picker-col">
              <span className="settings-sheet-label">
                {isWeek ? t('goals.fromWeekLabel') : t('goals.fromMonthLabel')}
              </span>
              <WheelPicker
                options={fromOptions}
                value={rangeFrom}
                onChange={setRangeFrom}
                ariaLabel={isWeek ? t('goals.fromWeekLabel') : t('goals.fromMonthLabel')}
              />
            </div>
            <div className="wheel-picker-col">
              <span className="settings-sheet-label">
                {isWeek ? t('goals.toWeekLabel') : t('goals.toMonthLabel')}
              </span>
              <WheelPicker
                options={toOptions}
                value={rangeTo}
                onChange={setRangeTo}
                ariaLabel={isWeek ? t('goals.toWeekLabel') : t('goals.toMonthLabel')}
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

      <div className="add-goal-actions">
        <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
          {editingGoal ? t('goals.updateSubmit') : t('goals.submit')}
        </button>
        {editingGoal && (
          <button type="button" className="btn btn-ghost" onClick={onCancelEdit}>
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  )
}
