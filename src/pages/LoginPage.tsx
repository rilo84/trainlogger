import { useState } from 'react'
import type { FormEvent } from 'react'
import type { User } from '../types'

interface LoginPageProps {
  onLogin: (user: User) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
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
        <div className="login-brand">💪 ClaudeTrainer</div>
        <p className="login-subtitle">Logga in för att komma till dina aktiviteter</p>

        <button type="button" className="btn btn-google" disabled title="Kopplas in senare">
          <span>🔒</span> Logga in med Google
        </button>

        <div className="login-divider">
          <span>eller</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="login-name">
            Namn
          </label>
          <input
            id="login-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ditt namn"
            aria-label="Namn"
            autoFocus
          />

          <label className="login-label" htmlFor="login-email">
            E-post
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@epost.se"
            aria-label="E-post"
          />

          <button type="submit" className="btn btn-primary login-submit">
            Logga in
          </button>
        </form>

        <p className="login-note">Tillfällig inloggning — riktig autentisering kopplas in senare.</p>
      </div>
    </div>
  )
}
