import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import type { Language } from '../types'
import { Logo } from '../components/Logo'
import { DownloadIcon } from '../components/NavIcons'
import { SERIES_COLORS } from '../activityColors'
import { isIos, useInstallPrompt } from '../hooks/useInstallPrompt'
import { LANGUAGE_OPTIONS } from './SettingsPage'

interface LandingPageProps {
  language: Language
  onChangeLanguage: (language: Language) => void
  onContinueInBrowser: () => void
}

const FEATURES = ['log', 'goals', 'offline'] as const
const FEATURE_ICONS: Record<(typeof FEATURES)[number], string> = { log: '⏱', goals: '🎯', offline: '📲' }

// Bar heights (percent) of the little chart inside the phone mock-up.
const MOCK_BARS = [45, 70, 55, 90, 65, 80]

type Delay = CSSProperties & Record<`--${string}`, string>

// Shown when the web address is opened in a normal browser tab. The goal is to get the
// app installed as a PWA; using it in the browser is offered as the secondary choice.
export function LandingPage({ language, onChangeLanguage, onContinueInBrowser }: LandingPageProps) {
  const { t } = useTranslation()
  const { canInstall, installed, promptInstall } = useInstallPrompt()
  const [showHowTo, setShowHowTo] = useState(false)
  const ios = isIos()

  async function handleDownload() {
    // Browsers that support it get their native install dialog; everyone else
    // (iOS Safari, Firefox, a prompt not yet fired) gets manual instructions.
    if (canInstall) {
      await promptInstall()
    } else {
      setShowHowTo(true)
    }
  }

  return (
    <div className="landing">
      <div className="landing-blob landing-blob-1" aria-hidden="true" />
      <div className="landing-blob landing-blob-2" aria-hidden="true" />

      <header className="landing-top">
        <span className="landing-brand">
          <span className="landing-logo">
            <Logo size={30} />
          </span>
          <span>Treni</span>
        </span>
        <div className="segmented" role="group" aria-label={t('settingsPage.languageTitle')}>
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={language === option.value ? 'active' : ''}
              onClick={() => onChangeLanguage(option.value)}
            >
              {option.value.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main className="landing-hero">
        <div className="landing-copy">
          <p className="landing-eyebrow landing-rise" style={{ '--delay': '0s' } as Delay}>
            {t('landing.tagline')}
          </p>
          <h1 className="landing-headline landing-rise" style={{ '--delay': '0.08s' } as Delay}>
            {t('landing.headline')}
          </h1>
          <p className="landing-lead landing-rise" style={{ '--delay': '0.16s' } as Delay}>
            {t('landing.lead')}
          </p>

          <div className="landing-actions landing-rise" style={{ '--delay': '0.24s' } as Delay}>
            {installed ? (
              <div className="landing-installed" role="status">
                <strong>{t('landing.installedTitle')}</strong>
                <span>{t('landing.installedText')}</span>
              </div>
            ) : (
              <button type="button" className="landing-cta" onClick={handleDownload}>
                <span className="landing-cta-icon">
                  <DownloadIcon size={22} />
                </span>
                {t('landing.downloadButton')}
              </button>
            )}
            <p className="landing-fineprint">{t('landing.fineprint')}</p>
            <button type="button" className="landing-browser-link" onClick={onContinueInBrowser}>
              {t('landing.continueInBrowser')} →
            </button>
          </div>
        </div>

        <div className="landing-phone-wrap landing-rise" style={{ '--delay': '0.2s' } as Delay} aria-hidden="true">
          <div className="landing-phone">
            <div className="landing-phone-notch" />
            <div className="landing-phone-header">
              <Logo size={16} />
              <span>Treni</span>
            </div>
            <div className="landing-phone-ring-card">
              <svg viewBox="0 0 100 100" className="landing-phone-ring">
                <circle cx="50" cy="50" r="38" className="landing-ring-track" />
                <circle cx="50" cy="50" r="38" className="landing-ring-fill" />
              </svg>
              <div className="landing-phone-ring-text">
                <span className="landing-phone-ring-label">{t('common.weeklyGoal')}</span>
                <span className="landing-phone-ring-value">4,5 / 6 h</span>
              </div>
            </div>
            <div className="landing-phone-chart">
              {MOCK_BARS.map((height, i) => (
                <span
                  key={i}
                  className="landing-phone-bar"
                  style={
                    {
                      '--h': `${height}%`,
                      '--delay': `${0.6 + i * 0.12}s`,
                      background: SERIES_COLORS[i % SERIES_COLORS.length],
                    } as Delay
                  }
                />
              ))}
            </div>
            <div className="landing-phone-log">{t('overview.logActivityButton')}</div>
          </div>
        </div>
      </main>

      <section className="landing-features">
        {FEATURES.map((id, i) => (
          <div key={id} className="landing-feature landing-rise" style={{ '--delay': `${0.4 + i * 0.1}s` } as Delay}>
            <span className="landing-feature-icon" aria-hidden="true">
              {FEATURE_ICONS[id]}
            </span>
            <h2>{t(`landing.features.${id}.title`)}</h2>
            <p>{t(`landing.features.${id}.text`)}</p>
          </div>
        ))}
      </section>

      {showHowTo && (
        <div className="settings-sheet-backdrop" onClick={() => setShowHowTo(false)}>
          <div
            className="settings-sheet landing-howto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="landing-howto-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="landing-howto-title">{ios ? t('landing.iosTitle') : t('landing.manualTitle')}</h2>
            <ol className="landing-howto-steps">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <span className="landing-howto-num">{n}</span>
                  <span>{t(`landing.${ios ? 'ios' : 'manual'}Step${n}`)}</span>
                </li>
              ))}
            </ol>
            <button type="button" className="btn btn-primary" onClick={() => setShowHowTo(false)}>
              {t('landing.gotIt')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
