import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'

// How often an open PWA session polls the server for a newly deployed service worker.
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

export function PwaUpdatePrompt() {
  const { t } = useTranslation()
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      registrationRef.current = registration
      if (registration) {
        setInterval(() => {
          registration.update()
        }, UPDATE_CHECK_INTERVAL_MS)
      }
    },
  })

  // Also check the moment the user comes back to the app, so a deploy that
  // happened while the tab was backgrounded is picked up without a restart.
  useEffect(() => {
    function checkForUpdate() {
      if (document.visibilityState === 'visible') {
        registrationRef.current?.update()
      }
    }
    document.addEventListener('visibilitychange', checkForUpdate)
    window.addEventListener('focus', checkForUpdate)
    return () => {
      document.removeEventListener('visibilitychange', checkForUpdate)
      window.removeEventListener('focus', checkForUpdate)
    }
  }, [])

  if (!needRefresh) return null

  return (
    <div className="pwa-toast" role="alert" aria-live="polite">
      <span className="pwa-toast-text">{t('pwa.updateAvailable')}</span>
      <div className="pwa-toast-actions">
        <button
          type="button"
          className="btn btn-primary btn-small"
          onClick={() => updateServiceWorker(true)}
        >
          {t('pwa.reload')}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={() => setNeedRefresh(false)}
        >
          {t('pwa.dismiss')}
        </button>
      </div>
    </div>
  )
}
