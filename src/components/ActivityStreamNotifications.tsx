import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useActivityStream, type StreamActivity } from '../hooks/useActivityStream'

// How long a notification stays on screen once the user can actually see it.
const TOAST_TTL_MS = 6000

interface Toast {
  key: number
  activity: StreamActivity
}

/**
 * Listens to the backend activity stream and shows each new activity as a
 * transient toast in the top-right corner. Mounted once, alongside <App />.
 *
 * Synced activities are rare and can land while the tab is in the background,
 * so the auto-dismiss countdown only starts while the page is visible — a toast
 * that arrived while you were away is still there when you come back.
 */
export function ActivityStreamNotifications() {
  const { t } = useTranslation()
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextKey = useRef(0)
  const timers = useRef<Map<number, number>>(new Map())

  const dismiss = useCallback((key: number) => {
    const timer = timers.current.get(key)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      timers.current.delete(key)
    }
    setToasts((current) => current.filter((toast) => toast.key !== key))
  }, [])

  const armDismiss = useCallback(
    (key: number) => {
      if (timers.current.has(key)) return
      timers.current.set(
        key,
        window.setTimeout(() => dismiss(key), TOAST_TTL_MS),
      )
    },
    [dismiss],
  )

  const handleActivity = useCallback(
    (activity: StreamActivity) => {
      const key = nextKey.current++
      setToasts((current) => [...current, { key, activity }])
      if (!document.hidden) armDismiss(key)
    },
    [armDismiss],
  )

  useActivityStream(handleActivity)

  // Start (or let run) the countdown for any still-visible toast once the user
  // returns to the tab; clear every pending timer on unmount.
  useEffect(() => {
    const pending = timers.current
    const onVisibility = () => {
      if (!document.hidden) {
        setToasts((current) => {
          current.forEach((toast) => armDismiss(toast.key))
          return current
        })
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      pending.forEach(window.clearTimeout)
      pending.clear()
    }
  }, [armDismiss])

  if (toasts.length === 0) return null

  return (
    <div className="activity-toast-stack" role="region" aria-live="polite">
      {toasts.map(({ key, activity }) => (
        <div key={key} className="activity-toast">
          <div className="activity-toast-body">
            <span className="activity-toast-title">
              {t('activityStream.newActivity')}
            </span>
            <span className="activity-toast-detail">
              {activity.name ?? t('activityStream.unnamed')}
              {' · '}
              {t('activityStream.minutes', { count: activity.durationMin })}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={() => dismiss(key)}
            aria-label={t('common.close')}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
