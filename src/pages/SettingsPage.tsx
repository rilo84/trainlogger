import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AppSettings, Language, Theme } from '../types'
import { ConfirmDialog } from '../components/ConfirmDialog'

interface SettingsPageProps {
  settings: AppSettings
  onUpdateSettings: (settings: AppSettings) => void
  onDeleteAllData: () => void
}

const STEP_OPTIONS = [1, 5, 10, 15, 30, 60]
export const LANGUAGE_OPTIONS: { value: Language; labelKey: string }[] = [
  { value: 'sv', labelKey: 'settingsPage.swedish' },
  { value: 'en', labelKey: 'settingsPage.english' },
]
export const THEME_OPTIONS: { value: Theme; labelKey: string }[] = [
  { value: 'dark', labelKey: 'settingsPage.themeDark' },
  { value: 'light', labelKey: 'settingsPage.themeLight' },
]

export function SettingsPage({ settings, onUpdateSettings, onDeleteAllData }: SettingsPageProps) {
  const { t } = useTranslation()
  const [confirmDelete, setConfirmDelete] = useState(false)

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
              <h2>{t('settingsPage.nameTitle')}</h2>
            </div>
          </div>
          <input
            className="settings-name-input"
            type="text"
            value={settings.name}
            onChange={(e) => onUpdateSettings({ ...settings, name: e.target.value })}
            placeholder={t('settingsPage.namePlaceholder')}
            aria-label={t('settingsPage.nameTitle')}
          />
        </div>

        <div className="chart-card">
          <div className="chart-controls">
            <div className="chart-title-group">
              <h2>{t('settingsPage.themeTitle')}</h2>
            </div>
          </div>
          <div className="activity-picker" role="group" aria-label={t('settingsPage.themeTitle')}>
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`activity-picker-chip ${settings.theme === option.value ? 'active' : ''}`}
                onClick={() => onUpdateSettings({ ...settings, theme: option.value })}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
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

        <div className="chart-card settings-danger">
          <div className="chart-controls">
            <div className="chart-title-group">
              <h2>{t('settingsPage.deleteAllTitle')}</h2>
            </div>
          </div>
          <p className="page-subtitle settings-hint">{t('settingsPage.deleteAllHint')}</p>
          <button type="button" className="btn btn-danger settings-danger-button" onClick={() => setConfirmDelete(true)}>
            {t('settingsPage.deleteAllButton')}
          </button>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title={t('settingsPage.deleteAllConfirmTitle')}
          message={t('settingsPage.deleteAllWarning')}
          confirmLabel={t('settingsPage.deleteAllConfirm')}
          confirmText="del"
          onConfirm={onDeleteAllData}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}
