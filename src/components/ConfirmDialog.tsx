import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  // When set, the user must type this word before the confirm button unlocks.
  confirmText?: string
  onConfirm: () => void
  onCancel: () => void
}

// Destructive-action confirmation, built on the same bottom-sheet pattern as the other modals.
export function ConfirmDialog({ title, message, confirmLabel, confirmText, onConfirm, onCancel }: ConfirmDialogProps) {
  const { t } = useTranslation()
  const [typed, setTyped] = useState('')
  const canConfirm = !confirmText || typed.trim().toLowerCase() === confirmText.toLowerCase()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (canConfirm) onConfirm()
  }

  return (
    <div className="settings-sheet-backdrop" onClick={onCancel}>
      <form
        className="settings-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="settings-sheet-header">
          <h3>{title}</h3>
          <button type="button" className="btn-icon" onClick={onCancel} aria-label={t('common.close')}>
            ×
          </button>
        </div>

        <p className="confirm-text">{message}</p>

        {confirmText && (
          <label className="confirm-type">
            <span>{t('common.typeToConfirm', { word: confirmText })}</span>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </label>
        )}

        <div className="confirm-actions">
          <button type="submit" className="btn btn-danger" disabled={!canConfirm}>
            {confirmLabel}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
