import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import {
  ACCENT_SOLID_BG,
  ACCENT_SOLID_TEXT,
  CARD_BG,
  INK,
  INK_MUTED,
  INPUT_CLASS,
  LABEL_CLASS,
  PAGE_BG,
} from '../lib/theme'

export default function Login() {
  const { session, signIn, signUp } = useAuth()
  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (session) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)

    const { error } =
      mode === 'sign-in' ? await signIn(email, password) : await signUp(email, password)

    if (error) {
      setError(error.message)
    } else if (mode === 'sign-up') {
      setInfo('Check your email to confirm your account, then sign in.')
    }
    setSubmitting(false)
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: PAGE_BG }}
    >
      <h1 className="font-display mb-2 text-4xl" style={{ color: INK }}>
        Welcome <span className="italic">back</span>
      </h1>
      <p className="mb-10 text-base" style={{ color: INK_MUTED }}>
        {mode === 'sign-in' ? 'Sign in to continue' : 'Create an account to get started'}
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl p-8"
        style={{ backgroundColor: CARD_BG }}
      >
        <div>
          <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
            Email
          </label>
          <input
            type="email"
            required
            className={INPUT_CLASS}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
            Password
          </label>
          <input
            type="password"
            required
            className={INPUT_CLASS}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
          />
        </div>

        {error && (
          <p className="text-sm" style={{ color: '#C0524A' }}>
            {error}
          </p>
        )}
        {info && (
          <p className="text-sm" style={{ color: INK_MUTED }}>
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
        >
          {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'sign-in' ? 'sign-up' : 'sign-in'))
            setError('')
            setInfo('')
          }}
          className="text-sm font-medium underline"
          style={{ color: INK_MUTED }}
        >
          {mode === 'sign-in' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}
