import { useMemo, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Activity, Goal } from '../types'

type ChartType = 'bar' | 'line'
type Granularity = 'week' | 'month'
type ViewMode = 'activity' | 'total'

// Validated against the app's dark card surface (#171a21): all 8 slots clear
// the CVD/contrast checks for adjacent series (see dataviz skill palette.md).
const SERIES_COLORS = [
  '#3987e5',
  '#d95926',
  '#199e70',
  '#c98500',
  '#d55181',
  '#008300',
  '#9085e9',
  '#e66767',
]
const OTHER_COLOR = '#898781'
const MAX_SERIES = SERIES_COLORS.length

interface Series {
  id: string
  label: string
  color: string
}

interface ChartPoint {
  key: string
  label: string
  values: number[]
  activityTotals: Map<string, number>
}

const WIDTH = 640
const HEIGHT = 300
const MARGIN = { top: 16, right: 16, bottom: 32, left: 34 }
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return d
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

// ISO 8601 week number: the week containing the year's first Thursday is week 1.
function getISOWeekLabel(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3)
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000))
  return `v.${week}`
}

function getMonthLabel(date: Date): string {
  const raw = date.toLocaleDateString('sv-SE', { month: 'short' }).replace('.', '')
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function getFullMonthYearLabel(date: Date): string {
  const raw = date.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function niceMax(value: number): number {
  if (value <= 0) return 1
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const residual = value / magnitude
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10
  return niceResidual * magnitude
}

function formatHours(value: number): string {
  return Number(value.toFixed(2)).toString()
}

interface ExpectedBucket {
  key: string
  start: Date
}

function getWeekBucketsForMonth(monthDate: Date): ExpectedBucket[] {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const lastDay = new Date(year, month + 1, 0)
  const buckets: ExpectedBucket[] = []
  const cursor = getWeekStart(new Date(year, month, 1))
  while (cursor <= lastDay) {
    buckets.push({ key: cursor.toISOString().slice(0, 10), start: new Date(cursor) })
    cursor.setDate(cursor.getDate() + 7)
  }
  return buckets
}

function getMonthBucketsForYear(year: number): ExpectedBucket[] {
  return Array.from({ length: 12 }, (_, month) => {
    const start = new Date(year, month, 1)
    return { key: start.toISOString().slice(0, 10), start }
  })
}

function buildChartData(
  activities: Activity[],
  granularity: Granularity,
  monthOffset: number,
  yearOffset: number,
): { series: Series[]; points: ChartPoint[]; windowLabel: string } {
  const bucketMap = new Map<string, { start: Date; totals: Map<string, number> }>()

  for (const activity of activities) {
    for (const log of activity.logs) {
      const date = new Date(log.date)
      const start = granularity === 'week' ? getWeekStart(date) : getMonthStart(date)
      const key = start.toISOString().slice(0, 10)
      if (!bucketMap.has(key)) bucketMap.set(key, { start, totals: new Map() })
      const bucket = bucketMap.get(key)!
      bucket.totals.set(activity.id, (bucket.totals.get(activity.id) ?? 0) + log.hours)
    }
  }

  const now = new Date()
  let expected: ExpectedBucket[]
  let windowLabel: string
  if (granularity === 'week') {
    const refMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
    expected = getWeekBucketsForMonth(refMonth)
    windowLabel = getFullMonthYearLabel(refMonth)
  } else {
    const year = now.getFullYear() + yearOffset
    expected = getMonthBucketsForYear(year)
    windowLabel = String(year)
  }

  const nameById = new Map(activities.map((a) => [a.id, a.name]))
  const windowTotal = (activityId: string) =>
    expected.reduce((sum, b) => sum + (bucketMap.get(b.key)?.totals.get(activityId) ?? 0), 0)

  // Keep any activity that has ever logged something, even if it has zero hours in
  // the currently visible window - otherwise its goal ribbon would vanish along with it.
  const rankedIds = activities
    .filter((a) => a.logs.length > 0)
    .map((a) => ({ id: a.id, total: windowTotal(a.id) }))
    .sort((a, b) => b.total - a.total)
    .map((a) => a.id)

  let series: Series[]
  let otherIds: string[] = []
  if (rankedIds.length <= MAX_SERIES) {
    series = rankedIds.map((id, i) => ({ id, label: nameById.get(id) ?? '', color: SERIES_COLORS[i] }))
  } else {
    const head = rankedIds.slice(0, MAX_SERIES - 1)
    otherIds = rankedIds.slice(MAX_SERIES - 1)
    series = head.map((id, i) => ({ id, label: nameById.get(id) ?? '', color: SERIES_COLORS[i] }))
    series.push({ id: '__other__', label: 'Övrigt', color: OTHER_COLOR })
  }

  const points: ChartPoint[] = expected.map(({ key, start }) => {
    const totals = bucketMap.get(key)?.totals ?? new Map<string, number>()
    const values = series.map((s) =>
      s.id === '__other__'
        ? otherIds.reduce((sum, id) => sum + (totals.get(id) ?? 0), 0)
        : (totals.get(s.id) ?? 0),
    )
    const label = granularity === 'week' ? getISOWeekLabel(start) : getMonthLabel(start)
    return {
      key,
      label,
      values: values.map((v) => Math.round(v * 100) / 100),
      activityTotals: totals,
    }
  })

  return { series, points, windowLabel }
}

function roundedTopRectPath(x: number, y: number, width: number, height: number, radius: number): string {
  const r = Math.max(0, Math.min(radius, width / 2, height))
  return `M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`
}

function getGoalActual(goal: Goal, point: ChartPoint): number {
  if (goal.activityId === null) {
    return [...point.activityTotals.values()].reduce((sum, v) => sum + v, 0)
  }
  return point.activityTotals.get(goal.activityId) ?? 0
}

function resolveGoalColor(actual: number, targetHours: number, baseColor: string): { color: string; passed: boolean } {
  const passed = actual >= targetHours
  return { passed, color: passed ? 'var(--color-accent)' : baseColor }
}

function goalBaseColor(goal: Goal, series: Series[]): string {
  if (goal.activityId === null) return 'var(--color-danger)'
  return series.find((s) => s.id === goal.activityId)?.color ?? OTHER_COLOR
}

function goalActivityLabel(goal: Goal, nameById: Map<string, string>): string {
  return goal.activityId === null ? 'Totalt' : (nameById.get(goal.activityId) ?? '')
}

interface ActivityHoursChartProps {
  activities: Activity[]
  goals: Goal[]
}

export function ActivityHoursChart({ activities, goals }: ActivityHoursChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [granularity, setGranularity] = useState<Granularity>('week')
  const [viewMode, setViewMode] = useState<ViewMode>('total')
  const [monthOffset, setMonthOffset] = useState(0)
  const [yearOffset, setYearOffset] = useState(0)
  const [showTable, setShowTable] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const { series, points, windowLabel } = useMemo(
    () => buildChartData(activities, granularity, monthOffset, yearOffset),
    [activities, granularity, monthOffset, yearOffset],
  )

  const hasAnyLogs = activities.some((a) => a.logs.length > 0)

  function goToPrevMonth() {
    setMonthOffset((v) => v - 1)
  }

  function goToNextMonth() {
    setMonthOffset((v) => Math.min(0, v + 1))
  }

  function goToPrevYear() {
    setYearOffset((v) => v - 1)
  }

  function goToNextYear() {
    setYearOffset((v) => Math.min(0, v + 1))
  }

  const nameById = useMemo(() => new Map(activities.map((a) => [a.id, a.name])), [activities])
  const relevantGoals = useMemo(
    () =>
      goals.filter((g) => {
        if (g.period !== granularity) return false
        return viewMode === 'total' ? g.activityId === null : g.activityId !== null && nameById.has(g.activityId)
      }),
    [goals, granularity, nameById, viewMode],
  )

  const periodTotals = points.map((p) => p.values.reduce((sum, v) => sum + v, 0))
  const maxValue = Math.max(
    0,
    ...(viewMode === 'total' ? periodTotals : points.flatMap((p) => p.values)),
    ...relevantGoals.map((g) => g.targetHours),
  )
  const yMax = niceMax(maxValue || 1)
  const tickCount = 4
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => (yMax / tickCount) * i)

  function yScale(value: number): number {
    return MARGIN.top + PLOT_HEIGHT - (value / yMax) * PLOT_HEIGHT
  }

  const bandWidth = points.length > 0 ? PLOT_WIDTH / points.length : PLOT_WIDTH

  function handlePointerMove(event: ReactPointerEvent<SVGRectElement>, index: number) {
    const container = event.currentTarget.closest('.chart-svg-wrap') as HTMLElement | null
    if (!container) return
    const rect = container.getBoundingClientRect()
    setHoverIndex(index)
    setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top })
  }

  if (!hasAnyLogs) {
    return (
      <div className="chart-card">
        <div className="chart-controls">
          <h2>Timmar per aktivitet</h2>
        </div>
        <div className="empty-state">
          <p>Logga timmar på en aktivitet för att se diagrammet.</p>
        </div>
      </div>
    )
  }

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null
  const showLegend = !(viewMode === 'total' && chartType === 'line')

  return (
    <div className="chart-card">
      <div className="chart-controls">
        <div className="chart-title-group">
          <h2>{viewMode === 'total' ? 'Totalt antal timmar' : 'Timmar per aktivitet'}</h2>
          <div className="chart-period-nav">
            <span className="chart-period-nav-label">{granularity === 'week' ? 'Månad' : 'År'}</span>
            <div className="month-nav">
              <button
                type="button"
                onClick={granularity === 'week' ? goToPrevMonth : goToPrevYear}
                aria-label={granularity === 'week' ? 'Föregående månad' : 'Föregående år'}
              >
                ‹
              </button>
              <span className="month-nav-label">{windowLabel}</span>
              <button
                type="button"
                onClick={granularity === 'week' ? goToNextMonth : goToNextYear}
                disabled={granularity === 'week' ? monthOffset >= 0 : yearOffset >= 0}
                aria-label={granularity === 'week' ? 'Nästa månad' : 'Nästa år'}
              >
                ›
              </button>
            </div>
            <button
              type="button"
              className="chart-settings-button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Diagraminställningar"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {settingsOpen && (
        <div className="settings-sheet-backdrop" onClick={() => setSettingsOpen(false)}>
          <div
            className="settings-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Diagraminställningar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settings-sheet-header">
              <h3>Diagraminställningar</h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setSettingsOpen(false)}
                aria-label="Stäng"
              >
                ×
              </button>
            </div>

            <div className="settings-sheet-row">
              <span className="settings-sheet-label">Vy</span>
              <div className="segmented" role="group" aria-label="Vy">
                <button
                  type="button"
                  className={viewMode === 'activity' ? 'active' : ''}
                  onClick={() => {
                    setViewMode('activity')
                    setChartType('bar')
                  }}
                >
                  Aktivitet
                </button>
                <button
                  type="button"
                  className={viewMode === 'total' ? 'active' : ''}
                  onClick={() => setViewMode('total')}
                >
                  Samtliga aktiviteter
                </button>
              </div>
            </div>

            <div className="settings-sheet-row">
              <span className="settings-sheet-label">Diagramtyp</span>
              <div className="segmented" role="group" aria-label="Diagramtyp">
                <button
                  type="button"
                  className={chartType === 'bar' ? 'active' : ''}
                  onClick={() => setChartType('bar')}
                >
                  Stapeldiagram
                </button>
                <button
                  type="button"
                  className={chartType === 'line' ? 'active' : ''}
                  disabled={viewMode === 'activity'}
                  onClick={() => setChartType('line')}
                >
                  Linjediagram
                </button>
              </div>
            </div>

            <div className="settings-sheet-row">
              <span className="settings-sheet-label">Tidsperiod</span>
              <div className="segmented" role="group" aria-label="Tidsperiod">
                <button
                  type="button"
                  className={granularity === 'week' ? 'active' : ''}
                  onClick={() => setGranularity('week')}
                >
                  Per vecka
                </button>
                <button
                  type="button"
                  className={granularity === 'month' ? 'active' : ''}
                  onClick={() => setGranularity('month')}
                >
                  Per månad
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showTable && (
        <div className="chart-svg-wrap">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-label={`Diagram över loggade timmar per aktivitet, ${granularity === 'week' ? 'per vecka' : 'per månad'}`}
          >
            {ticks.map((tick) => {
              const y = yScale(tick)
              return (
                <g key={tick}>
                  <line
                    x1={MARGIN.left}
                    x2={WIDTH - MARGIN.right}
                    y1={y}
                    y2={y}
                    className="chart-gridline"
                  />
                  <text x={MARGIN.left - 8} y={y} className="chart-axis-label" textAnchor="end" dy="0.32em">
                    {formatHours(tick)} h
                  </text>
                </g>
              )
            })}

            {points.map((point, index) => {
              const bandX = MARGIN.left + bandWidth * index
              const labelY = MARGIN.top + PLOT_HEIGHT + 18
              return (
                <text
                  key={point.key}
                  x={bandX + bandWidth / 2}
                  y={labelY}
                  className="chart-axis-label"
                  textAnchor="middle"
                >
                  {point.label}
                </text>
              )
            })}

            {hoverIndex !== null && (
              <rect
                x={MARGIN.left + bandWidth * hoverIndex}
                y={MARGIN.top}
                width={bandWidth}
                height={PLOT_HEIGHT}
                className="chart-hover-band"
              />
            )}

            {chartType === 'bar' && viewMode === 'activity'
              ? points.map((point, pointIndex) => {
                  const bandX = MARGIN.left + bandWidth * pointIndex
                  const gap = 2
                  const barSlot = Math.min(24, (bandWidth - 8 - (series.length - 1) * gap) / series.length)
                  const totalWidth = series.length * barSlot + (series.length - 1) * gap
                  const startX = bandX + bandWidth / 2 - totalWidth / 2
                  const baseline = MARGIN.top + PLOT_HEIGHT
                  return (
                    <g key={point.key}>
                      {series.map((s, seriesIndex) => {
                        const value = point.values[seriesIndex]
                        const barX = startX + seriesIndex * (barSlot + gap)
                        const goal = relevantGoals.find((g) => g.activityId === s.id)
                        return (
                          <g key={s.id}>
                            {value > 0 &&
                              (() => {
                                const barY = yScale(value)
                                return (
                                  <path
                                    d={roundedTopRectPath(barX, barY, barSlot, baseline - barY, 4)}
                                    fill={s.color}
                                  />
                                )
                              })()}
                            {goal &&
                              (() => {
                                const { color, passed } = resolveGoalColor(
                                  getGoalActual(goal, point),
                                  goal.targetHours,
                                  s.color,
                                )
                                const y = yScale(goal.targetHours)
                                return (
                                  <line
                                    x1={barX}
                                    x2={barX + barSlot}
                                    y1={y}
                                    y2={y}
                                    className="chart-goal-line"
                                    style={{ stroke: color, strokeDasharray: passed ? 'none' : '4 3' }}
                                  />
                                )
                              })()}
                          </g>
                        )
                      })}
                    </g>
                  )
                })
              : null}

            {chartType === 'bar' && viewMode === 'total'
              ? points.map((point, pointIndex) => {
                  const bandX = MARGIN.left + bandWidth * pointIndex
                  const barWidth = Math.min(24, bandWidth - 8)
                  const barX = bandX + bandWidth / 2 - barWidth / 2
                  const gap = 2
                  const segments = series
                    .map((s, seriesIndex) => ({ s, value: point.values[seriesIndex] }))
                    .filter((seg) => seg.value > 0)
                  let cumulative = 0
                  const drawn = segments.map((seg, i) => {
                    const bottom = cumulative
                    const top = cumulative + seg.value
                    cumulative = top
                    const isTopmost = i === segments.length - 1
                    const yTop = yScale(top)
                    const yBottom = yScale(bottom)
                    return { s: seg.s, yTop, yBottom, isTopmost }
                  })
                  const goal = relevantGoals.find((g) => g.activityId === null)
                  return (
                    <g key={point.key}>
                      {drawn.map(({ s, yTop, yBottom, isTopmost }) =>
                        isTopmost ? (
                          <path
                            key={s.id}
                            d={roundedTopRectPath(barX, yTop, barWidth, yBottom - yTop, 4)}
                            fill={s.color}
                          />
                        ) : (
                          <rect
                            key={s.id}
                            x={barX}
                            y={yTop + gap}
                            width={barWidth}
                            height={Math.max(0, yBottom - yTop - gap)}
                            fill={s.color}
                          />
                        ),
                      )}
                      {goal &&
                        (() => {
                          const { color, passed } = resolveGoalColor(
                            periodTotals[pointIndex],
                            goal.targetHours,
                            'var(--color-danger)',
                          )
                          const y = yScale(goal.targetHours)
                          return (
                            <line
                              x1={barX}
                              x2={barX + barWidth}
                              y1={y}
                              y2={y}
                              className="chart-goal-line"
                              style={{ stroke: color, strokeDasharray: passed ? 'none' : '4 3' }}
                            />
                          )
                        })()}
                    </g>
                  )
                })
              : null}

            {chartType === 'line' && viewMode === 'activity'
              ? series.map((s, seriesIndex) => {
                  const linePoints = points
                    .map((point, i) => {
                      const x = MARGIN.left + bandWidth * i + bandWidth / 2
                      const y = yScale(point.values[seriesIndex])
                      return `${x},${y}`
                    })
                    .join(' ')
                  return (
                    <g key={s.id}>
                      <polyline points={linePoints} fill="none" stroke={s.color} strokeWidth={2} />
                      {points.map((point, i) => {
                        const x = MARGIN.left + bandWidth * i + bandWidth / 2
                        const y = yScale(point.values[seriesIndex])
                        return (
                          <circle key={point.key} cx={x} cy={y} r={4} fill={s.color} className="chart-dot" />
                        )
                      })}
                    </g>
                  )
                })
              : null}

            {chartType === 'line' && viewMode === 'total'
              ? (() => {
                  const totalLinePoints = periodTotals
                    .map((total, i) => {
                      const x = MARGIN.left + bandWidth * i + bandWidth / 2
                      const y = yScale(total)
                      return `${x},${y}`
                    })
                    .join(' ')
                  return (
                    <g>
                      <polyline
                        points={totalLinePoints}
                        fill="none"
                        stroke={SERIES_COLORS[0]}
                        strokeWidth={2}
                      />
                      {periodTotals.map((total, i) => {
                        const x = MARGIN.left + bandWidth * i + bandWidth / 2
                        const y = yScale(total)
                        return (
                          <circle
                            key={points[i].key}
                            cx={x}
                            cy={y}
                            r={4}
                            fill={SERIES_COLORS[0]}
                            className="chart-dot"
                          />
                        )
                      })}
                    </g>
                  )
                })()
              : null}

            {chartType === 'line' &&
              relevantGoals.map((goal) => {
                const y = yScale(goal.targetHours)
                const lastPoint = points[points.length - 1]
                const baseColor = goalBaseColor(goal, series)
                const { color, passed } = resolveGoalColor(getGoalActual(goal, lastPoint), goal.targetHours, baseColor)
                return (
                  <line
                    key={goal.id}
                    x1={MARGIN.left}
                    x2={WIDTH - MARGIN.right}
                    y1={y}
                    y2={y}
                    className="chart-goal-line"
                    style={{ stroke: color, strokeDasharray: passed ? 'none' : '6 4' }}
                  />
                )
              })}

            {points.map((point, index) => (
              <rect
                key={point.key}
                x={MARGIN.left + bandWidth * index}
                y={MARGIN.top}
                width={bandWidth}
                height={PLOT_HEIGHT}
                fill="transparent"
                onPointerMove={(e) => handlePointerMove(e, index)}
                onPointerLeave={() => setHoverIndex(null)}
              />
            ))}
          </svg>

          {hoveredPoint && (
            <div
              className="chart-tooltip"
              style={{ left: tooltipPos.x, top: tooltipPos.y }}
            >
              <div className="chart-tooltip-header">{hoveredPoint.label}</div>
              {series
                .map((s, i) => ({ s, value: hoveredPoint.values[i] }))
                .sort((a, b) => b.value - a.value)
                .map(({ s, value }) => (
                  <div className="chart-tooltip-row" key={s.id}>
                    <span className="chart-tooltip-key" style={{ backgroundColor: s.color }} />
                    <span className="chart-tooltip-name">{s.label}</span>
                    <span className="chart-tooltip-value">{formatHours(value)} h</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {!showTable && showLegend && (
        <div className="chart-legend">
          {series.map((s) => (
            <div className="chart-legend-item" key={s.id}>
              <span
                className={chartType === 'bar' ? 'chart-legend-swatch' : 'chart-legend-line'}
                style={chartType === 'bar' ? { backgroundColor: s.color } : { backgroundColor: s.color }}
              />
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {!showTable && relevantGoals.length > 0 && (
        <div className="chart-goal-legend">
          {relevantGoals.map((goal) => {
            const color = goalBaseColor(goal, series)
            return (
              <div className="chart-goal-legend-item" key={goal.id}>
                <svg
                  className="chart-goal-legend-swatch"
                  width="22"
                  height="8"
                  viewBox="0 0 22 8"
                  aria-hidden="true"
                >
                  <line x1="0" y1="4" x2="5" y2="4" stroke={color} strokeWidth="2" />
                  <line x1="8.5" y1="4" x2="13.5" y2="4" stroke={color} strokeWidth="2" />
                  <line x1="17" y1="4" x2="22" y2="4" stroke={color} strokeWidth="2" />
                </svg>
                <span>Mål {goalActivityLabel(goal, nameById)}</span>
              </div>
            )
          })}
        </div>
      )}

      {showTable && (
        <div className="chart-table-wrap">
          <table className="chart-table">
            <thead>
              <tr>
                <th>Period</th>
                {series.map((s) => (
                  <th key={s.id}>{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.key}>
                  <td>{point.label}</td>
                  {point.values.map((value, i) => (
                    <td key={series[i].id}>{formatHours(value)} h</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button type="button" className="chart-table-toggle" onClick={() => setShowTable((v) => !v)}>
        {showTable ? 'Visa som diagram' : 'Visa som tabell'}
      </button>
    </div>
  )
}
