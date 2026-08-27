import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { AppSettings, Language, User } from '../types'

interface SettingsPageProps {
  user: User
  settings: AppSettings
  onUpdateUser: (user: User) => void
  onUpdateSettings: (settings: AppSettings) => void
}

const STEP_OPTIONS = [1, 5, 10, 15, 30, 60]
const LANGUAGE_OPTIONS: { value: Language; labelKey: string }[] = [
  { value: 'sv', labelKey: 'settingsPage.swedish' },
  { value: 'en', labelKey: 'settingsPage.english' },
]

export function SettingsPage({ user, settings, onUpdateUser, onUpdateSettings }: SettingsPageProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [saved, setSaved] = useState(false)

  function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    onUpdateUser({ name: trimmedName, email: email.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <header className="page-header">
        <h1>{t('settingsPage.title')}</h1>
        <p className="page-subtitle">{t('settingsPage.subtitle')}</p>
      </header>

      <div className="page-body">
        <div className="chart-card">
          <div className="chart-controls">
            <div className="chart-title-group">
              <h2>{t('settingsPage.profileTitle')}</h2>
            </div>
          </div>

          <form className="settings-profile-form" onSubmit={handleSaveProfile}>
            <label className="login-label" htmlFor="settings-name">
              {t('common.name')}
            </label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label={t('common.name')}
            />

            <label className="login-label" htmlFor="settings-email">
              {t('common.email')}
            </label>
            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label={t('common.email')}
            />

            <button type="submit" className="btn btn-primary settings-save-button">
              {saved ? t('settingsPage.savedConfirm') : t('settingsPage.saveProfile')}
            </button>
          </form>
        </div>

        <div className="chart-card">
          <div className="chart-controls">
            <div className="chart-title-group">
              <h2>{t('settingsPage.languageTitle')}</h2>
            </div>
          </div>
          <div className="activity-picker" role="group" aria-label={t('settingsPage.languageTitle')}>
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`activity-picker-chip ${settings.language === option.value ? 'active' : ''}`}
                onClick={() => onUpdateSettings({ ...settings, language: option.value })}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-controls">
            <div className="chart-title-group">
              <h2>{t('settingsPage.precisionTitle')}</h2>
            </div>
          </div>
          <p className="page-subtitle settings-hint">{t('settingsPage.precisionHint')}</p>
          <div className="activity-picker" role="group" aria-label={t('settingsPage.precisionTitle')}>
            {STEP_OPTIONS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                className={`activity-picker-chip ${settings.hourStepMinutes === minutes ? 'active' : ''}`}
                onClick={() => onUpdateSettings({ ...settings, hourStepMinutes: minutes })}
              >
                {minutes} min
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
