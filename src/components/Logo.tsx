function buildSpiralPath(
  turns: number,
  startRadius: number,
  endRadius: number,
  cx: number,
  cy: number,
  steps = 48,
): string {
  const points: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const angle = t * turns * 2 * Math.PI - Math.PI / 2
    const radius = startRadius + (endRadius - startRadius) * t
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return `M${points.join(' L')}`
}

const SPIRAL_PATH = buildSpiralPath(1.75, 5.6, 10.3, 12, 12)

interface LogoProps {
  size?: number
}

// A coiled spiral winding around a small clock face — the app mark.
export function Logo({ size = 26 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={SPIRAL_PATH} />
      <circle cx="12" cy="12" r="4.3" />
      <path d="M12 9.7v2.5l1.8 1.1" />
    </svg>
  )
}
