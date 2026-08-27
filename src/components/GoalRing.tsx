import { formatHours } from '../utils'

interface GoalRingProps {
  label: string
  actual: number
  target: number
  size?: number
}

export function GoalRing({ label, actual, target, size = 160 }: GoalRingProps) {
  const stroke = Math.round(size * 0.1)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  const fraction = target > 0 ? Math.min(1, actual / target) : 0
  const percent = target > 0 ? Math.round((actual / target) * 100) : 0
  const reached = fraction >= 1
  const arcColor = reached ? 'var(--color-accent)' : '#3987e5'
  const dashOffset = circumference * (1 - fraction)

  return (
    <div className="goal-ring">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label}: ${percent}% (${formatHours(actual)} av ${formatHours(target)} h)`}
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
        />
        <text
          x={size / 2}
          y={size / 2 - size * 0.04}
          textAnchor="middle"
          className="goal-progress-percent"
          style={{ fontSize: size * 0.17 }}
        >
          {percent}%
        </text>
        <text
          x={size / 2}
          y={size / 2 + size * 0.12}
          textAnchor="middle"
          className="goal-progress-hours"
          style={{ fontSize: size * 0.075 }}
        >
          {formatHours(actual)} / {formatHours(target)} h
        </text>
      </svg>
      <div className="goal-ring-label">{label}</div>
    </div>
  )
}
