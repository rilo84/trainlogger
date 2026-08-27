import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { User } from '../types'
import { Logo } from '../components/Logo'

interface LoginPageProps {
  onLogin: (user: User) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    onLogin({ name: trimmedName, email: email.trim() })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <Logo />
          <span>Treni</span>
        </div>
        <p className="login-subtitle">{t('login.subtitle')}</p>

        <button type="button" className="btn btn-google" disabled title={t('login.comingSoon')}>
          <span>🔒</span> {t('login.googleButton')}
        </button>

        <div className="login-divider">
          <span>{t('login.or')}</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="login-name">
            {t('common.name')}
          </label>
          <input
            id="login-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('login.namePlaceholder')}
            aria-label={t('common.name')}
            autoFocus
          />

          <label className="login-label" htmlFor="login-email">
            {t('common.email')}
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('login.emailPlaceholder')}
            aria-label={t('common.email')}
          />

          <button type="submit" className="btn btn-primary login-submit">
            {t('login.submit')}
          </button>
        </form>

        <p className="login-note">{t('login.note')}</p>
      </div>
    </div>
  )
}
