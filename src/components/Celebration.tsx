import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import type { GoalPeriod } from '../types'
import { SERIES_COLORS } from '../activityColors'
import { GoalRing } from './GoalRing'

// Everything the full-screen reward overlay needs to celebrate one logged entry.
export interface CelebrationData {
  id: string
  activityName: string
  // The activity's active goal for `period`, or null when the activity has no goal —
  // then the overlay is just confetti + heading, with no ring.
  period: GoalPeriod | null
  target: number | null
  actualBefore: number
  actualAfter: number
}

interface CelebrationProps {
  data: CelebrationData
  onDone: () => void
}

// How long the overlay stays before it fades itself out.
const VISIBLE_MS = 4600
const FADE_MS = 320
const CONFETTI_COUNT = 90

interface ConfettiPiece {
  left: number
  delay: number
  duration: number
  drift: string
  spin: string
  size: number
  round: boolean
  color: string
}

type PieceStyle = CSSProperties & Record<`--${string}`, string>

function pieceStyle(c: ConfettiPiece): PieceStyle {
  return {
    left: `${c.left}vw`,
    width: `${c.size}px`,
    height: `${c.size}px`,
    borderRadius: c.round ? '50%' : '2px',
    background: c.color,
    animationDelay: `${c.delay}s`,
    animationDuration: `${c.duration}s`,
    '--drift': c.drift,
    '--spin': c.spin,
  }
}

function trophyStyle(c: ConfettiPiece): PieceStyle {
  return {
    left: `${c.left}vw`,
    fontSize: `${c.size * 2.4}px`,
    animationDelay: `${c.delay}s`,
    animationDuration: `${c.duration}s`,
    '--drift': c.drift,
    '--spin': c.spin,
  }
}

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

export function Celebration({ data, onDone }: CelebrationProps) {
  const { t } = useTranslation()
  const [ringActual, setRingActual] = useState(reducedMotion ? data.actualAfter : data.actualBefore)
  const [leaving, setLeaving] = useState(false)

  const hasGoal = data.period != null && data.target != null && data.target > 0
  const target = data.target ?? 0
  const percent = hasGoal ? Math.round((data.actualAfter / target) * 100) : 0
  // Goal cleared (by this log or an earlier one): it rains gold trophies instead of confetti.
  const goalMet = hasGoal && data.actualAfter >= target

  const pieces = useMemo<ConfettiPiece[]>(
    () =>
      Array.from({ length: goalMet ? 26 : CONFETTI_COUNT }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.8,
        duration: 2.6 + Math.random() * 2.4,
        drift: `${(Math.random() * 2 - 1) * 18}vw`,
        spin: `${540 + Math.random() * 720}deg`,
        size: 6 + Math.random() * 8,
        round: Math.random() > 0.5,
        color: SERIES_COLORS[i % SERIES_COLORS.length],
      })),
    // Rebuild only when a new entry is celebrated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.id],
  )

  // Pick a milestone message from how far this log carried the goal.
  let titleKey = 'celebration.title'
  let body: string
  if (!hasGoal) {
    body = t('celebration.logged')
  } else if (data.actualBefore >= target) {
    // Goal was already met before this log — they just keep going.
    titleKey = 'celebration.titleBeyond'
    body = t('celebration.beyond')
  } else if (data.actualAfter >= target) {
    titleKey = 'celebration.titleReached'
    body = t('celebration.reached')
  } else if (percent > 50) {
    titleKey = 'celebration.titleClose'
    body = t('celebration.close', { remaining: Math.max(1, 100 - percent) })
  } else {
    body = t('celebration.progress', { percent })
  }

  useEffect(() => {
    // Paint the ring at its "before" value for one frame, then let the CSS
    // transition carry it up to the new value.
    const raf = requestAnimationFrame(() => setRingActual(data.actualAfter))
    const fadeAt = window.setTimeout(() => setLeaving(true), VISIBLE_MS)
    const doneAt = window.setTimeout(onDone, VISIBLE_MS + FADE_MS)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(fadeAt)
      window.clearTimeout(doneAt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.id])

  function dismiss() {
    setLeaving(true)
    window.setTimeout(onDone, FADE_MS)
  }

  return (
    <div
      className={`celebration-overlay${leaving ? ' celebration-overlay-leaving' : ''}`}
      role="dialog"
      aria-live="polite"
      aria-label={t('celebration.title')}
      onClick={dismiss}
    >
      <div className="celebration-confetti" aria-hidden="true">
        {pieces.map((c, i) =>
          goalMet ? (
            <span key={i} className="celebration-trophy" style={trophyStyle(c)}>
              🏆
            </span>
          ) : (
            <span key={i} className="celebration-confetti-piece" style={pieceStyle(c)} />
          ),
        )}
      </div>

      <div className="celebration-card">
        <h2 className="celebration-title">{t(titleKey)}</h2>
        <p className="celebration-activity">{data.activityName}</p>
        {hasGoal && (
          <GoalRing
            label={t(data.period === 'week' ? 'common.weeklyGoal' : 'common.monthlyGoal')}
            actual={ringActual}
            target={target}
            size={200}
            animate={!reducedMotion}
          />
        )}
        <p className="celebration-progress">{body}</p>
      </div>
    </div>
  )
}
