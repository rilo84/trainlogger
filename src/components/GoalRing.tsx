import { useTranslation } from 'react-i18next'
import { formatHoursMinutes } from '../utils'

interface GoalRingProps {
  label: string
  actual: number
  target: number
  size?: number
  // Tween the progress arc when `actual` changes (used by the reward overlay).
  animate?: boolean
}

export function GoalRing({ label, actual, target, size = 160, animate = false }: GoalRingProps) {
  const { t } = useTranslation()
  const stroke = Math.round(size * 0.1)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  const fraction = target > 0 ? Math.min(1, actual / target) : 0
  const percent = target > 0 ? Math.round((actual / target) * 100) : 0
  const reached = fraction >= 1
  const arcColor = reached ? 'var(--color-accent)' : '#3987e5'
  const dashOffset = circumference * (1 - fraction)

  // Below this size the "actual / target" line is unreadable, so show just the percent, centered.
  const showDetail = size >= 80

  return (
    <div className="goal-ring">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label}: ${percent}% (${formatHoursMinutes(actual)} ${t('common.of')} ${formatHoursMinutes(target)})`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={arcColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={
            animate
              ? { transition: 'stroke-dashoffset 1100ms cubic-bezier(0.22, 1, 0.36, 1)' }
              : undefined
          }
        />
        <text
          x={size / 2}
          y={showDetail ? size / 2 - size * 0.04 : size / 2}
          textAnchor="middle"
          dominantBaseline={showDetail ? undefined : 'central'}
          className="goal-progress-percent"
          style={{ fontSize: showDetail ? size * 0.17 : size * 0.26 }}
        >
          {percent}%
        </text>
        {showDetail && (
          <text
            x={size / 2}
            y={size / 2 + size * 0.12}
            textAnchor="middle"
            className="goal-progress-hours"
            style={{ fontSize: size * 0.075 }}
          >
            {formatHoursMinutes(actual)} / {formatHoursMinutes(target)}
          </text>
        )}
      </svg>
      <div className="goal-ring-label">{label}</div>
    </div>
  )
}
