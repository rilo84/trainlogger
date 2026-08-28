import { useTranslation } from 'react-i18next'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

// Destructive-action confirmation, built on the same bottom-sheet pattern as the other modals.
export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <div className="settings-sheet-backdrop" onClick={onCancel}>
      <div
        className="settings-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-sheet-header">
          <h3>{title}</h3>
          <button type="button" className="btn-icon" onClick={onCancel} aria-label={t('common.close')}>
            ×
          </button>
        </div>

        <p className="confirm-text">{message}</p>

        <div className="confirm-actions">
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
