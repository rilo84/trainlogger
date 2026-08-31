import { useEffect, useRef } from 'react'

/** The payload the backend pushes on each `activity` SSE event. */
export interface StreamActivity {
  id: string
  startedAt: string
  type: string
  name: string | null
  durationMin: number
}

// The Treni backend (backend-for-frontend). Overridable for deployed builds via
// a `VITE_API_BASE_URL` env var; falls back to the local dev server.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

/**
 * Subscribes to `GET /api/activities/stream` (Server-Sent Events) and calls
 * `onActivity` once for every newly-synced activity.
 *
 * `EventSource` reconnects on its own and, via the `Last-Event-ID` header,
 * makes the backend replay anything missed while the connection was down — so
 * there is nothing to manage here beyond closing the socket on unmount. The
 * callback is held in a ref so a caller that passes a fresh function each
 * render doesn't tear down and re-open the connection.
 *
 * Connection lifecycle and every received activity are logged to the console
 * (prefix `[activity-stream]`) so it's obvious in DevTools whether the stream
 * is live even when a toast is missed.
 */
export function useActivityStream(onActivity: (activity: StreamActivity) => void) {
  const handlerRef = useRef(onActivity)

  useEffect(() => {
    handlerRef.current = onActivity
  }, [onActivity])

  useEffect(() => {
    const url = `${API_BASE}/api/activities/stream`
    const source = new EventSource(url, { withCredentials: true })

    source.onopen = () => {
      console.info('[activity-stream] connected:', url)
    }
    source.onerror = () => {
      // EventSource retries on its own (the backend sends `retry: 5000`).
      console.warn('[activity-stream] connection dropped; retrying…')
    }

    function handleActivity(event: MessageEvent) {
      try {
        const activity = JSON.parse(event.data) as StreamActivity
        console.debug('[activity-stream] activity received:', activity)
        handlerRef.current(activity)
      } catch {
        console.warn('[activity-stream] ignored a malformed frame:', event.data)
      }
    }

    source.addEventListener('activity', handleActivity as EventListener)
    return () => {
      source.removeEventListener('activity', handleActivity as EventListener)
      source.close()
    }
  }, [])
}
