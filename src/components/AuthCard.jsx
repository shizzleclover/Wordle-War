import React, { useState } from 'react'

export function AuthCard({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      if (mode === 'login') await onLogin(username, password)
      else await onRegister(username, password)
    } catch (er) {
      setErr(er.message || 'Request failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-xl border-2 border-border bg-popover p-6 shadow-[var(--shadow-md)] sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex gap-2 rounded-lg border-2 border-border bg-card p-1 shadow-[var(--shadow-xs)]">
        {['login', 'register'].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m)
              setErr('')
            }}
            className={[
              'flex-1 rounded-md border-2 py-2 text-sm font-semibold capitalize transition-all duration-200',
              mode === m
                ? 'border-primary bg-popover text-foreground shadow-[var(--shadow-xs)]'
                : 'border-transparent text-muted-foreground hover:bg-secondary/30',
            ].join(' ')}
          >
            {m}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border-2 border-input bg-background px-4 py-2.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all hover:border-primary/50"
            placeholder="Choose your handle"
          />
        </div>

        <div className="relative">
          <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border-2 border-input bg-background pl-4 pr-11 py-2.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all hover:border-primary/50"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? '🐵' : '🙈'}
            </button>
          </div>
        </div>

        {err && (
          <div className="rounded-lg border-2 border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive animate-in shake-in duration-300">
            ⚠️ {err}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className={`mt-2 rounded-lg border-2 border-foreground py-3.5 font-bold shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
            busy
              ? 'bg-primary/50 text-foreground overflow-hidden relative animate-pulse opacity-80'
              : 'bg-primary text-primary-foreground hover:shadow-lg hover:brightness-110'
          }`}
        >
          {busy ? (mode === 'login' ? 'SIGNING IN...' : 'CREATING ACCOUNT...') : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
        </button>
      </form>
    </div>
  )
}
