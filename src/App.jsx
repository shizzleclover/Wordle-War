import { useCallback, useEffect, useRef, useState } from 'react'
import { useWarGame } from './hooks/useWarGame'
import { WarKeyboard } from './components/WarKeyboard'
import { WordleBoard } from './components/WordleBoard'
import { HowToPlayFab, HowToPlayModal } from './components/HowToPlayModal'
import { letterKeyStates } from './utils/wordleTiles'
import { WORD_LEN_MAX, WORD_LEN_MIN, parseWordLengthInput } from './gameConstants'

const QUICK_LENGTHS = [4, 5, 6, 7]
const DARK_KEY = 'wordle-war-theme'

function getRankInfo(elo = 0) {
  if (elo >= 1000) return { label: 'Master', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
  if (elo >= 750) return { label: 'Diamond', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' }
  if (elo >= 500) return { label: 'Platinum', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' }
  if (elo >= 300) return { label: 'Gold', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
  if (elo >= 150) return { label: 'Silver', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' }
  return { label: 'Bronze', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' }
}


const GAME_MODES = [
  { value: 'standard', label: 'Standard (No timer)' },
  { value: 'blitz', label: 'Blitz (30s turns)' },
  { value: 'custom', label: 'Custom Mode (Settings below)' },
]

const WORD_THEMES = [
  { value: 'none', label: 'Any Word' },
  { value: 'animals', label: 'Animals' },
  { value: 'sports', label: 'Sports' },
  { value: 'foods', label: 'Foods' },
  { value: 'colors', label: 'Colors' },
  { value: 'countries', label: 'Countries' },
  { value: 'brands', label: 'Brands' },
  { value: 'cities', label: 'Cities' },
  { value: 'tech', label: 'Technology' },
  { value: 'music', label: 'Music' },
  { value: 'science', label: 'Science' },
  { value: 'movies', label: 'Movies' },
  { value: 'nature', label: 'Nature' },
]

function CustomSelect({ id, label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor={id}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border-2 border-border bg-input px-3 py-2 text-sm text-foreground shadow-[var(--shadow-xs)] outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all hover:border-primary/50"
      >
        <span className="truncate">{selectedOption?.label || 'Select...'}</span>
        <span className={`ml-2 transform text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border-2 border-border bg-popover shadow-[var(--shadow-md)] animate-in fade-in zoom-in-95 duration-200 origin-top">
          <ul className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors text-left ${
                    opt.value === value
                      ? 'bg-primary/20 font-bold text-primary'
                      : 'text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <span className="flex-1 truncate">{opt.label}</span>
                  {opt.value === value && <span className="ml-2 font-bold text-primary">✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function PillNav({ active, onPlay, onStats, onProfile, onPlayers }) {
  return (
    <nav className="flex flex-nowrap items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium w-full overflow-x-auto pb-1 sm:pb-0" style={{ scrollbarWidth: 'none' }}>
      <button
        type="button"
        onClick={onPlay}
        className={[
          'rounded-full border-2 px-3 sm:px-4 py-1 sm:py-1.5 transition whitespace-nowrap',
          active === 'play'
            ? 'border-primary bg-primary text-primary-foreground shadow-[var(--shadow-xs)]'
            : 'border-transparent text-muted-foreground hover:text-primary',
        ].join(' ')}
      >
        Play
      </button>
      <button
        type="button"
        onClick={onStats}
        className={[
          'rounded-full border-2 px-3 sm:px-4 py-1 sm:py-1.5 transition whitespace-nowrap',
          active === 'stats'
            ? 'border-primary bg-primary text-primary-foreground shadow-[var(--shadow-xs)]'
            : 'border-transparent text-muted-foreground hover:text-primary',
        ].join(' ')}
      >
        Stats
      </button>
      <button
        type="button"
        onClick={onProfile}
        className={[
          'rounded-full border-2 px-3 sm:px-4 py-1 sm:py-1.5 transition whitespace-nowrap',
          active === 'profile'
            ? 'border-primary bg-primary text-primary-foreground shadow-[var(--shadow-xs)]'
            : 'border-transparent text-muted-foreground hover:text-primary',
        ].join(' ')}
      >
        Profile
      </button>
      <button
        type="button"
        onClick={onPlayers}
        className={[
          'rounded-full border-2 px-3 sm:px-4 py-1 sm:py-1.5 transition whitespace-nowrap',
          active === 'players'
            ? 'border-primary bg-primary text-primary-foreground shadow-[var(--shadow-xs)]'
            : 'border-transparent text-muted-foreground hover:text-primary',
        ].join(' ')}
      >
        Players
      </button>
    </nav>
  )
}

function AuthCard({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="rounded-xl border-2 border-border bg-popover p-6 shadow-[var(--shadow-md)] sm:p-8">
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
              'flex-1 rounded-md border-2 py-2 text-sm font-semibold capitalize transition',
              mode === m
                ? 'border-primary bg-popover text-foreground shadow-[var(--shadow-xs)]'
                : 'border-transparent text-muted-foreground',
            ].join(' ')}
          >
            {m}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="block text-left text-sm font-medium text-foreground">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="mt-1 w-full rounded-lg border-2 border-border bg-input px-3 py-2 font-sans text-foreground shadow-[var(--shadow-xs)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block text-left text-sm font-medium text-foreground">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="mt-1 w-full rounded-lg border-2 border-border bg-input px-3 py-2 font-sans text-foreground shadow-[var(--shadow-xs)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        {err ? (
          <p className="rounded-lg border-2 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {err}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className={`rounded-lg border-2 border-foreground py-3 font-semibold shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${busy ? 'bg-primary/50 text-foreground overflow-hidden relative animate-shimmer opacity-80' : 'bg-primary text-primary-foreground hover:shadow-lg hover:brightness-105'}`}
        >
          {busy ? (mode === 'login' ? 'Signing in...' : 'Registering...') : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </div>
  )
}

export default function App() {
  const [nav, setNav] = useState('play')
  const [joinCode, setJoinCode] = useState('')
  const [dark, setDark] = useState(() => localStorage.getItem(DARK_KEY) === '1')
  const [helpOpen, setHelpOpen] = useState(false)
  const [lengthInput, setLengthInput] = useState('5')
  const [gameMode, setGameMode] = useState('standard')
  const [theme, setTheme] = useState('none')
  const [profileTargetInput, setProfileTargetInput] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedUsername, setEditedUsername] = useState('')

  const game = useWarGame()

  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem(DARK_KEY, dark ? '1' : '0')
  }, [dark])

  useEffect(() => {
    if (game.statsOpen && game.token) void game.fetchStats()
  }, [game.statsOpen, game.token, game.fetchStats])

  const openProfileView = (username) => {
    setNav('profile')
    setIsEditingProfile(false)
    if (username) {
      game.fetchUserProfile(username)
      // If it's the current user, also sync the global state
      if (game.user && username === game.user.username) {
        game.fetchMe()
      }
    }
  }

  const openStats = () => {
    setNav('stats')
    game.setStatsOpen(true)
    game.fetchMe() // Sync global stats
  }

  const openPlayersView = () => {
    setNav('players')
    game.setProfileData(null)
  }

  const letterStates = letterKeyStates(game.guesses)

  const draftRef = useRef(game.draftGuess)
  const secretRef = useRef(game.secretDraft)

  useEffect(() => {
    draftRef.current = game.draftGuess
  }, [game.draftGuess])

  useEffect(() => {
    secretRef.current = game.secretDraft
  }, [game.secretDraft])

  /* eslint-disable react-hooks/exhaustive-deps -- game setters + slice of game state */
  const typeLetter = useCallback(
    (L) => {
      if (game.uiPhase === 'playing' && game.yourTurn) {
        game.setDraftGuess((d) => (d.length < game.wordLength ? d + L : d))
        return
      }
      if (game.uiPhase === 'setup' && !game.hasSetWord) {
        game.setSecretDraft((d) => (d.length < game.wordLength ? d + L : d))
      }
    },
    [
      game.uiPhase,
      game.yourTurn,
      game.hasSetWord,
      game.wordLength,
      game.setDraftGuess,
      game.setSecretDraft,
    ]
  )
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const active =
        (game.uiPhase === 'playing' && game.yourTurn) ||
        (game.uiPhase === 'setup' && !game.hasSetWord)
      if (!active) return
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (game.uiPhase === 'playing') game.setDraftGuess((d) => d.slice(0, -1))
        else game.setSecretDraft((d) => d.slice(0, -1))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (game.uiPhase === 'playing') {
          const w = draftRef.current
          if (w.length === game.wordLength) game.submitGuess(w.toLowerCase())
        } else {
          const w = secretRef.current
          if (w.length === game.wordLength) game.submitSecretWord(w.toLowerCase())
        }
        return
      }
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault()
        typeLetter(e.key.toUpperCase())
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs track latest draft strings for Enter
  }, [
    game.uiPhase,
    game.yourTurn,
    game.hasSetWord,
    game.wordLength,
    game.setDraftGuess,
    game.setSecretDraft,
    game.submitGuess,
    game.submitSecretWord,
    typeLetter,
  ])

  const closeHelp = useCallback(() => setHelpOpen(false), [])

  const copyCode = () => {
    if (!game.roomCode) return
    void navigator.clipboard.writeText(game.roomCode)
    game.showToast('Room code copied')
  }



  if (game.authLoading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center p-6 bg-background font-sans text-foreground">
        <div className="w-full max-w-md space-y-8 rounded-xl border-2 border-border bg-card p-10 shadow-[var(--shadow-md)]">
          <div className="mx-auto h-8 w-3/4 rounded bg-muted animate-shimmer" />
          <div className="space-y-4 pt-4">
            <div className="h-10 w-full rounded-lg bg-muted animate-shimmer" />
            <div className="h-10 w-full rounded-lg bg-muted animate-shimmer" />
            <div className="h-12 w-full rounded-lg bg-primary/20 animate-shimmer mt-6" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background font-sans text-foreground">
      <HowToPlayModal open={helpOpen} onClose={closeHelp} />

      {game.toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-50 max-w-[min(90vw,24rem)] -translate-x-1/2 rounded-lg border-2 border-border bg-card px-4 py-3 text-center text-sm font-medium text-card-foreground shadow-[var(--shadow-lg)]"
          role="status"
        >
          {game.toast}
        </div>
      ) : null}

      <header className="sticky top-0 z-40 border-b-2 border-border bg-sidebar/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate font-serif text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Wordle War
              </span>
            </div>

            <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-2 mr-1 sm:mr-2">
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg border-2 border-border bg-popover text-sm sm:text-lg shadow-[var(--shadow-xs)] transition-all hover:-translate-y-0.5 active:scale-95"
                  title="How to play"
                >
                  ❔
                </button>
                <button
                  type="button"
                  onClick={() => setDark((d) => !d)}
                  className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg border-2 border-border bg-popover text-sm sm:text-lg shadow-[var(--shadow-xs)] transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  {dark ? '☀' : '☾'}
                </button>
              </div>

              {game.user ? (
                <div className="flex min-w-0 items-center gap-2 rounded-xl border-2 border-border bg-card p-1 pr-2 sm:p-1.5 sm:pr-3 shadow-[var(--shadow-sm)]">
                  <div className={`flex items-center justify-center rounded-lg px-1.5 py-0.5 sm:px-2 text-[9px] sm:text-xs font-bold uppercase tracking-wider ${getRankInfo(game.user.stats?.elo).bg} ${getRankInfo(game.user.stats?.elo).color} border ${getRankInfo(game.user.stats?.elo).border}`}>
                    <span className="hidden xs:inline">{getRankInfo(game.user.stats?.elo).label}</span>
                    <span className="xs:hidden uppercase">{getRankInfo(game.user.stats?.elo).label.charAt(0)}</span>
                  </div>
                  <div className="flex flex-col min-w-0 relative">
                    <span className="max-w-[4rem] sm:max-w-[7rem] truncate text-[10px] sm:text-xs font-bold leading-none">
                      {game.user.username}
                      {game.isLoadingAuth && <span className="ml-1 inline-block h-1 w-1 rounded-full bg-primary animate-ping" />}
                    </span>
                    <span className="font-mono text-[9px] sm:text-[10px] font-semibold text-muted-foreground mt-0.5 leading-none">{game.user.stats?.elo || 100} EP</span>
                  </div>
                  <button
                    type="button"
                    onClick={game.logout}
                    className="ml-1 flex aspect-square h-6 w-6 items-center justify-center rounded-md bg-muted text-[9px] font-bold text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95 sm:aspect-auto sm:h-auto sm:w-auto sm:px-1.5 sm:py-1 sm:text-[10px]"
                  >
                    <span className="hidden sm:inline">OUT</span>
                    <span className="sm:hidden">✕</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {game.user ? (
            <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-2 sm:pt-0 sm:border-t-0">
              <PillNav 
                active={nav} 
                onPlay={() => setNav('play')} 
                onStats={openStats} 
                onProfile={() => openProfileView(game.user.username)} 
                onPlayers={openPlayersView} 
              />
              {game.socketConnected ? (
                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-bold text-destructive border border-destructive/20 uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  OFFLINE
                </div>
              )}
            </div>
          ) : null}
        </div>
      </header>

      {game.user && nav === 'play' && game.uiPhase === 'lobby' && !game.roomCode ? (
        <div className="border-b-2 border-border bg-secondary py-3">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground/80">
              Quick join
            </p>
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                placeholder="Room code (6 chars)"
                className="min-w-[12rem] flex-1 rounded-lg border-2 border-primary bg-popover px-3 py-2 font-mono text-sm font-semibold tracking-widest text-foreground shadow-[var(--shadow-xs)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={6}
              />
              <button
                type="button"
                onClick={() => {
                  if (joinCode.length === 6) {
                    game.joinRoom(joinCode)
                    setJoinCode('')
                  }
                }}
                disabled={joinCode.length !== 6 || !game.socketConnected}
                className="rounded-lg border-2 border-foreground bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                Join
              </button>
            </div>
            <span
              className={`text-xs font-medium ${game.socketConnected ? 'text-secondary-foreground' : 'text-destructive'}`}
            >
              {game.socketConnected ? '● Live' : '○ Offline'}
            </span>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {!game.user ? (
          <div className="mx-auto max-w-md">
            <AuthCard onLogin={game.login} onRegister={game.register} />
          </div>
        ) : (
          <>
            {nav === 'play' && game.uiPhase === 'lobby' && !game.roomCode ? (
              <section className="mb-10 text-center">
                <div className="mb-6 flex justify-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-secondary text-2xl shadow-[var(--shadow-md)] sm:h-24 sm:w-24">
                    ⚔
                  </div>
                  <div className="flex items-center text-2xl font-bold text-muted-foreground">×</div>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-secondary text-2xl shadow-[var(--shadow-md)] sm:h-24 sm:w-24">
                    ✦
                  </div>
                </div>
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Guess their word first
                </h1>
                <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
                  <span className="font-semibold text-foreground">1.</span> Create or join a room.{' '}
                  <span className="font-semibold text-foreground">2.</span> Pick a secret word — then take turns
                  guessing on a shared board. Words are{' '}
                  <span className="rounded-md border border-primary bg-secondary px-1.5 py-0.5 font-mono text-xs text-secondary-foreground">
                    {WORD_LEN_MIN}–{WORD_LEN_MAX} letters
                  </span>
                  .
                </p>
              </section>
            ) : null}

            <div className="rounded-xl border-2 border-border bg-card p-5 shadow-[var(--shadow-md)] sm:p-8">
              {nav === 'stats' ? (
                <div>
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="font-serif text-2xl font-semibold">Your stats</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setNav('play')
                        game.setStatsOpen(false)
                      }}
                      className="flex items-center gap-2 rounded-lg border-2 border-border bg-popover px-4 py-2 text-sm font-semibold text-muted-foreground shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground hover:shadow-md active:scale-95"
                    >
                      ⬅ Back
                    </button>
                  </div>
                  {game.isStatsLoading ? (
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="rounded-lg border-2 border-border bg-popover p-4 shadow-[var(--shadow-xs)]"
                        >
                          <div className="h-3 w-16 mb-2 rounded bg-muted animate-shimmer" />
                          <div className="h-6 w-12 rounded bg-muted animate-shimmer" />
                        </div>
                      ))}
                    </dl>
                  ) : game.stats ? (
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {[
                        ['Games', game.stats.gamesPlayed],
                        ['Wins', game.stats.wins],
                        ['Losses', game.stats.losses],
                        ['Win rate', `${game.stats.winRate}%`],
                        ['Avg guesses', game.stats.avgGuessesPerGame],
                        ['Best streak', game.stats.bestStreak],
                        ['Elo Rating', game.stats.elo || 100],
                      ].map(([k, v]) => (
                        <div
                          key={k}
                          className="rounded-lg border-2 border-border bg-popover p-4 shadow-[var(--shadow-xs)]"
                        >
                          <dt className="text-xs font-medium uppercase text-muted-foreground">{k}</dt>
                          <dd className="mt-1 font-mono text-xl font-semibold">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-muted-foreground">No stats yet.</p>
                  )}
                </div>
              ) : nav === 'profile' ? (
                <div>
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="font-serif text-2xl font-semibold">My Profile</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setNav('play')
                        setIsEditingProfile(false)
                      }}
                      className="flex items-center gap-2 rounded-lg border-2 border-border bg-popover px-4 py-2 text-sm font-semibold text-muted-foreground shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground hover:shadow-md active:scale-95"
                    >
                      ⬅ Back
                    </button>
                  </div>

                  {game.isProfileLoading ? (
                    <div className="space-y-6">
                      <div className="h-24 w-full rounded-xl bg-muted animate-shimmer" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 rounded-lg bg-muted animate-shimmer" />
                        <div className="h-20 rounded-lg bg-muted animate-shimmer" />
                      </div>
                    </div>
                  ) : game.profileData ? (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border-2 border-border bg-card p-4 sm:p-6 shadow-[var(--shadow-sm)] gap-4 hover:border-primary/50 transition-all">
                        <div className="flex-1 min-w-0">
                          {isEditingProfile ? (
                            <form 
                              onSubmit={async (e) => {
                                e.preventDefault()
                                if (await game.updateUsername(editedUsername)) {
                                  setIsEditingProfile(false)
                                  game.fetchUserProfile(editedUsername)
                                }
                              }}
                              className="flex items-center gap-2 mt-1"
                            >
                              <input
                                autoFocus
                                value={editedUsername}
                                onChange={e => setEditedUsername(e.target.value)}
                                className="flex-1 min-w-0 rounded-lg border-2 border-primary bg-background px-3 py-1.5 text-lg font-bold outline-none shadow-[var(--shadow-xs)]"
                              />
                              <button type="submit" className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-[var(--shadow-xs)] hover:brightness-110 active:scale-95">Save</button>
                              <button type="button" onClick={() => setIsEditingProfile(false)} className="rounded-lg border-2 border-border bg-popover px-3 py-2 text-xs font-bold shadow-[var(--shadow-xs)] hover:text-destructive active:scale-95">Cancel</button>
                            </form>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground truncate" title={game.profileData.username}>{game.profileData.username}</h3>
                                {game.user?.username === game.profileData.username && (
                                  <button 
                                    onClick={() => {
                                      setEditedUsername(game.user.username)
                                      setIsEditingProfile(true)
                                    }}
                                    className="text-primary hover:scale-110 transition-transform p-1"
                                    title="Edit username"
                                  >
                                    ✏️
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getRankInfo(game.profileData.stats.elo).bg} ${getRankInfo(game.profileData.stats.elo).color} border ${getRankInfo(game.profileData.stats.elo).border}`}>
                                  {getRankInfo(game.profileData.stats.elo).label}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"> Rank</span>
                              </div>
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mt-1 block">
                            Joined {new Date(game.profileData.joinedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="sm:text-right flex sm:block items-center justify-between border-t-2 sm:border-t-0 border-border pt-4 sm:pt-0 sm:mt-0 mt-2">
                          <div className="text-xs font-semibold uppercase text-muted-foreground sm:mt-2 order-1 sm:order-none">Elo Rating</div>
                          <div className="text-2xl sm:text-3xl font-mono rounded-lg text-primary font-bold order-2 sm:order-none">
                            {game.profileData.stats.elo}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        {[
                          ['Win Rate', `${game.profileData.stats.winRate}%`],
                          ['Matches', game.profileData.stats.gamesPlayed],
                          ['Best Streak', game.profileData.stats.bestStreak]
                        ].map(([k, v]) => (
                          <div key={k} className="rounded-lg border-2 border-border bg-popover p-3 sm:p-4 text-center shadow-[var(--shadow-xs)] flex flex-col justify-center">
                            <div className="text-xl sm:text-2xl font-mono font-bold text-foreground max-w-full truncate">{v}</div>
                            <div className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground mt-1 truncate">{k}</div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
                        <h4 className="bg-popover p-4 text-sm font-bold uppercase border-b-2 border-border tracking-wider text-muted-foreground">Recent Games</h4>
                        {game.profileData.recentMatches?.length > 0 ? (
                          <ul className="divide-y-2 divide-border">
                            {game.profileData.recentMatches.map(m => (
                              <li key={m.id} className="p-4 flex items-center justify-between hover:bg-popover/50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className={`w-3 h-3 rounded-full shadow-sm ${m.isDraw ? 'bg-amber-400' : m.winner === game.profileData.username ? 'bg-tile-correct' : 'bg-destructive'}`} />
                                  <div>
                                    <div className="font-semibold">{m.opponent}</div>
                                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{m.endReason}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`font-mono text-sm font-bold ${m.myEloChange > 0 ? 'text-tile-correct' : 'text-destructive'}`}>
                                    {m.myEloChange > 0 ? '+' : ''}{m.myEloChange}
                                  </div>
                                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                    {new Date(m.date).toLocaleDateString()}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="p-6 text-center text-sm text-muted-foreground">No recent games found.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground border-2 border-border border-dashed rounded-xl">
                      Click "Fetch My Profile" to load your stats.
                    </div>
                  )}
                </div>
              ) : nav === 'players' ? (
                <div>
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="font-serif text-2xl font-semibold">Player Search</h2>
                    <button
                      type="button"
                      onClick={() => setNav('play')}
                      className="flex items-center gap-2 rounded-lg border-2 border-border bg-popover px-4 py-2 text-sm font-semibold text-muted-foreground shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground hover:shadow-md active:scale-95"
                    >
                      ⬅ Back
                    </button>
                  </div>
                  
                  <div className="mb-8 flex flex-row gap-2">
                    <input
                      value={profileTargetInput}
                      onChange={e => setProfileTargetInput(e.target.value)}
                      placeholder="Enter username..."
                      className="flex-1 min-w-0 rounded-lg border-2 border-input bg-background px-4 py-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onKeyDown={e => {
                        if (e.key === 'Enter') game.fetchUserProfile(profileTargetInput)
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => game.fetchUserProfile(profileTargetInput)}
                      className="shrink-0 rounded-lg border-2 border-foreground bg-primary px-4 sm:px-6 py-2 font-semibold text-primary-foreground shadow-[var(--shadow-sm)] transition-all active:scale-95"
                    >
                      Search
                    </button>
                  </div>

                  {game.isProfileLoading ? (
                    <div className="space-y-6">
                      <div className="h-24 w-full rounded-xl bg-muted animate-shimmer" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 rounded-lg bg-muted animate-shimmer" />
                        <div className="h-20 rounded-lg bg-muted animate-shimmer" />
                      </div>
                    </div>
                  ) : game.profileData ? (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border-2 border-border bg-card p-4 sm:p-6 shadow-[var(--shadow-sm)] gap-4 hover:border-primary/50 transition-all">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground truncate" title={game.profileData.username}>{game.profileData.username}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getRankInfo(game.profileData.stats.elo).bg} ${getRankInfo(game.profileData.stats.elo).color} border ${getRankInfo(game.profileData.stats.elo).border}`}>
                              {getRankInfo(game.profileData.stats.elo).label}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"> Rank</span>
                          </div>
                        </div>
                        <div className="sm:text-right flex sm:block items-center justify-between border-t-2 sm:border-t-0 border-border pt-4 sm:pt-0 sm:mt-0 mt-2">
                          <div className="text-xs font-semibold uppercase text-muted-foreground sm:mt-2 order-1 sm:order-none">Elo Rating</div>
                          <div className="text-2xl sm:text-3xl font-mono rounded-lg text-primary font-bold order-2 sm:order-none leading-none">
                            {game.profileData.stats.elo}
                          </div>
                          <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5 order-3 sm:order-none">Current Rating</div>
                        </div>
                      </div>

                      {/* Rank Progression Guide */}
                      <div className="rounded-xl border-2 border-border bg-card overflow-hidden shadow-[var(--shadow-sm)]">
                        <h4 className="bg-popover p-3 text-[10px] font-bold uppercase border-b-2 border-border tracking-[0.2em] text-muted-foreground/80 flex items-center justify-between">
                          <span>Rank Guide</span>
                          <span className="opacity-50">Thresholds</span>
                        </h4>
                        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { l: 'Master', v: '1000+', c: 'text-purple-400', b: 'bg-purple-500/5' },
                            { l: 'Diamond', v: '750+', c: 'text-cyan-400', b: 'bg-cyan-500/5' },
                            { l: 'Platinum', v: '500+', c: 'text-sky-400', b: 'bg-sky-500/5' },
                            { l: 'Gold', v: '300+', c: 'text-amber-400', b: 'bg-amber-500/5' },
                            { l: 'Silver', v: '150+', c: 'text-slate-400', b: 'bg-slate-500/5' },
                            { l: 'Bronze', v: '0+', c: 'text-orange-500', b: 'bg-orange-500/5' },
                          ].map(r => (
                            <div key={r.l} className={`flex flex-col items-center p-2 rounded-lg ${r.b} border border-border/40 transition-transform hover:scale-[1.02]`}>
                              <span className={`text-[11px] font-bold ${r.c} uppercase tracking-tight`}>{r.l}</span>
                              <span className="font-mono text-[10px] text-muted-foreground font-bold">{r.v}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        {[
                          ['Win Rate', `${game.profileData.stats.winRate}%`],
                          ['Matches', game.profileData.stats.gamesPlayed],
                          ['Best Streak', game.profileData.stats.bestStreak]
                        ].map(([k, v]) => (
                          <div key={k} className="rounded-lg border-2 border-border bg-popover p-3 sm:p-4 text-center shadow-[var(--shadow-xs)] flex flex-col justify-center">
                            <div className="text-xl sm:text-2xl font-mono font-bold text-foreground max-w-full truncate">{v}</div>
                            <div className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground mt-1 truncate">{k}</div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
                        <h4 className="bg-popover p-4 text-sm font-bold uppercase border-b-2 border-border tracking-wider text-muted-foreground">Recent Games</h4>
                        {game.profileData.recentMatches?.length > 0 ? (
                          <ul className="divide-y-2 divide-border">
                            {game.profileData.recentMatches.map(m => (
                              <li key={m.id} className="p-4 flex items-center justify-between hover:bg-popover/50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className={`w-3 h-3 rounded-full shadow-sm ${m.isDraw ? 'bg-amber-400' : m.winner === game.profileData.username ? 'bg-tile-correct' : 'bg-destructive'}`} />
                                  <div>
                                    <div className="font-semibold">{m.opponent}</div>
                                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{m.endReason}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`font-mono text-sm font-bold ${m.myEloChange > 0 ? 'text-tile-correct' : 'text-destructive'}`}>
                                    {m.myEloChange > 0 ? '+' : ''}{m.myEloChange}
                                  </div>
                                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                    {new Date(m.date).toLocaleDateString()}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="p-6 text-center text-sm text-muted-foreground">No recent games found.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground border-2 border-border border-dashed rounded-xl">
                      Search for a player to view their profile.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {game.disconnectBanner ? (
                    <div className="mb-4 rounded-lg border-2 border-primary bg-secondary/60 px-4 py-3 text-sm font-medium text-secondary-foreground shadow-[var(--shadow-xs)]">
                      {game.disconnectBanner.username} disconnected — waiting up to{' '}
                      {Math.ceil((game.disconnectBanner.graceMs || 0) / 1000)}s for reconnect…
                    </div>
                  ) : null}

                  {game.uiPhase === 'lobby' && !game.roomCode ? (
                    <div className="flex flex-col gap-6">
                      {game.isMatchmaking ? (
                        <div className="flex flex-col items-center gap-4 py-8">
                          <h2 className="font-serif text-2xl font-semibold animate-pulse text-primary">Searching for opponent...</h2>
                          <p className="text-muted-foreground text-sm">Mode: {gameMode} • Theme: {theme} • Length: {lengthInput}</p>
                          <button
                            type="button"
                            onClick={game.leaveMatchmaking}
                            className="mt-4 rounded-lg border-2 border-foreground bg-destructive px-6 py-2 font-semibold text-destructive-foreground shadow-[var(--shadow-md)]"
                          >
                            Cancel Search
                          </button>
                        </div>
                      ) : (
                        <>
                          <h2 className="font-serif text-2xl font-semibold">Start a match</h2>
                          <div className="flex flex-col gap-4">
                            <div>
                              <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="word-len">
                                Word length ({WORD_LEN_MIN}–{WORD_LEN_MAX} letters)
                              </label>
                              <div className="flex flex-wrap items-center gap-3">
                                <input
                                  id="word-len"
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={2}
                                  value={lengthInput}
                                  onChange={(e) =>
                                    setLengthInput(e.target.value.replace(/\D/g, '').slice(0, 2))
                                  }
                                  onBlur={() => {
                                    const n = parseWordLengthInput(lengthInput)
                                    setLengthInput(String(n))
                                  }}
                                  className="w-24 rounded-lg border-2 border-border bg-input px-3 py-2 font-mono text-lg font-bold text-foreground shadow-[var(--shadow-xs)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                {QUICK_LENGTHS.map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => setLengthInput(String(n))}
                                    className={`rounded-lg border-2 px-3 py-1.5 font-mono text-sm font-semibold shadow-[var(--shadow-xs)] transition ${lengthInput === String(n) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-popover hover:border-primary/50'}`}
                                  >
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <CustomSelect
                                id="game-mode"
                                label="Game mode"
                                value={gameMode}
                                options={GAME_MODES}
                                onChange={setGameMode}
                              />
                              <CustomSelect
                                id="theme"
                                label="Word Theme"
                                value={theme}
                                options={WORD_THEMES}
                                onChange={setTheme}
                              />
                            </div>

                            {gameMode === 'custom' && (
                              <div className="mt-4 rounded-lg border-2 border-primary/30 bg-primary/5 p-3 text-sm text-primary">
                                <p className="flex items-center gap-2 font-semibold">
                                  <span>⚙️</span> Custom Mode active:
                                </p>
                                <p className="mt-1 text-xs opacity-80">Adjust word length above. More custom parameters coming soon!</p>
                              </div>
                            )}

                            <div className="mt-4 flex flex-col gap-3">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    game.joinMatchmaking(lengthInput, gameMode, theme)
                                  }}
                                  disabled={!game.socketConnected}
                                  className="w-full sm:flex-1 rounded-lg border-2 border-foreground bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-md)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                  Find Match
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    game.joinMatchmaking(5, 'random', 'none')
                                  }}
                                  disabled={!game.socketConnected}
                                  className="w-full sm:flex-1 rounded-lg border-2 border-indigo-500 bg-indigo-600/10 px-5 py-3 font-semibold text-indigo-500 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-600/20 hover:shadow-md active:scale-95 disabled:opacity-50"
                                >
                                  🎲 Surprise Match (Random)
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const n = parseWordLengthInput(lengthInput)
                                  game.createRoom(n, gameMode, theme)
                                }}
                                disabled={!game.socketConnected}
                                className="w-full rounded-lg border-2 border-border bg-popover px-5 py-3 font-semibold text-muted-foreground shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground hover:shadow-md active:scale-95 disabled:opacity-50"
                              >
                                🔗 Play with Friend (Private)
                              </button>
                            </div>

                            <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                              🏆 All matches (including private) currently impact Elo
                            </p>

                            <p className="text-sm text-muted-foreground text-center mt-2">
                              Or use <strong className="text-foreground">Quick join</strong> above to enter a friend&apos;s code.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    ) : null}

                  {game.uiPhase === 'lobby' && game.roomCode ? (
                    <div className="flex flex-col items-center gap-4 text-center">
                      <h2 className="font-serif text-2xl font-semibold">Waiting for opponent</h2>
                      <p className="text-muted-foreground">Share this code:</p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <code className="rounded-lg border-2 border-primary bg-popover px-4 py-3 font-mono text-2xl font-bold tracking-[0.2em] shadow-[var(--shadow-md)]">
                          {game.roomCode}
                        </code>
                        <button
                          type="button"
                          onClick={copyCode}
                          className="rounded-lg border-2 border-border bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-[var(--shadow-sm)]"
                        >
                          Copy
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={game.leaveRoom}
                        className="mt-2 text-sm font-semibold text-destructive underline-offset-2 hover:underline"
                      >
                        Cancel room
                      </button>
                    </div>
                  ) : null}

                  {game.uiPhase === 'setup' ? (
                    <div className="mx-auto max-w-lg">
                      <h2 className="mb-2 font-serif text-2xl font-semibold">Pick your secret word</h2>
                      <p className="mb-4 text-sm text-muted-foreground flex flex-wrap items-center gap-y-1 gap-x-2">
                        <span>{game.wordLength} letters</span>
                        <span>—</span>
                        <span>your opponent will try to guess it.</span>
                        {game.theme && game.theme !== 'none' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-500 border border-indigo-500/20">
                            Theme: {WORD_THEMES.find(t => t.value === game.theme)?.label || game.theme}
                          </span>
                        )}
                        {game.hasSetWord ? (
                          <span className="w-full mt-1 font-semibold text-primary">Locked in. Waiting for the other player…</span>
                        ) : null}
                      </p>
                      {!game.hasSetWord ? (
                        <>
                          <WordleBoard
                            wordLength={game.wordLength}
                            guesses={[]}
                            currentDraft={game.secretDraft}
                          />
                          <DuelKeyboard
                            letterStates={{}}
                            onKey={typeLetter}
                            onBackspace={() => game.setSecretDraft((d) => d.slice(0, -1))}
                            onEnter={() => {
                              if (game.secretDraft.length === game.wordLength) {
                                game.submitSecretWord(game.secretDraft.toLowerCase())
                              }
                            }}
                            enterDisabled={game.secretDraft.length !== game.wordLength}
                          />
                        </>
                      ) : (
                        <WordleBoard wordLength={game.wordLength} guesses={[]} currentDraft={null} />
                      )}
                    </div>
                  ) : null}

                  {game.uiPhase === 'playing' ? (
                    <div className="mx-auto max-w-lg">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-serif text-xl font-semibold sm:text-2xl flex items-center gap-2">
                          vs 
                          <button 
                            type="button"
                            onClick={() => openProfileView(game.opponentName)}
                            className="hover:underline hover:text-primary transition-colors cursor-pointer"
                          >
                            {game.opponentName || 'Opponent'}
                          </button>
                          <span className="bg-primary/20 text-primary border border-primary px-2 py-0.5 rounded text-sm min-w-[50px] text-center">
                            ⚡ {game.actionPoints || 0} AP
                          </span>
                        </h2>
                        <div className="flex items-center gap-3">
                          {game.gameMode === 'blitz' && game.timeRemaining !== null ? (
                            <span
                              className={[
                                'font-mono text-sm font-bold',
                                game.timeRemaining <= 10 ? 'text-destructive animate-pulse' : 'text-primary'
                              ].join(' ')}
                            >
                              ⏱ {game.timeRemaining}s
                            </span>
                          ) : null}
                          <span
                            className={[
                              'rounded-full border-2 px-3 py-1 text-xs font-bold uppercase',
                              game.yourTurn
                                ? 'border-primary bg-secondary text-secondary-foreground'
                                : 'border-border bg-muted text-muted-foreground',
                            ].join(' ')}
                          >
                            {game.yourTurn ? 'Your turn' : 'Their turn'}
                          </span>
                        </div>
                      </div>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Their guesses so far:{' '}
                        <span className="font-mono font-semibold text-foreground">{game.opponentGuessCount}</span>
                      </p>
                      
                      <WordleBoard
                        wordLength={game.wordLength}
                        guesses={game.isScrambled ? [...game.guesses].reverse() : game.guesses}
                        currentDraft={game.yourTurn ? game.draftGuess : null}
                      />
                      
                      {game.yourTurn ? (
                        <>
                          <div className="my-4 flex items-center justify-center gap-2 border-y border-border py-3">
                            <span className="text-xs uppercase font-bold text-muted-foreground mr-2">Power-ups</span>
                            <button
                              onClick={() => game.usePowerup('hint')}
                              disabled={game.actionPoints < 3}
                              title="Hint (Cost: 3 AP) - Reveal a letter"
                              className="rounded bg-sky-500/20 border border-sky-500 px-3 py-1.5 text-xs font-bold text-sky-600 disabled:opacity-30 transition-transform active:scale-95"
                            >
                              💡 Hint (3)
                            </button>
                            <button
                              onClick={() => game.usePowerup('scramble')}
                              disabled={game.actionPoints < 4}
                              title="Scramble (Cost: 4 AP) - Shuffle their board"
                              className="rounded bg-purple-500/20 border border-purple-500 px-3 py-1.5 text-xs font-bold text-purple-600 disabled:opacity-30 transition-transform active:scale-95"
                            >
                              🌪️ Scramble (4)
                            </button>
                            <button
                              onClick={() => game.usePowerup('blindfold')}
                              disabled={game.actionPoints < 5}
                              title="Blindfold (Cost: 5 AP) - Hide their keyboard"
                              className="rounded bg-stone-500/20 border border-stone-500 px-3 py-1.5 text-xs font-bold text-stone-600 disabled:opacity-30 transition-transform active:scale-95"
                            >
                              🙈 Blindfold (5)
                            </button>
                          </div>
                          <WarKeyboard
                            letterStates={letterStates}
                            onKey={typeLetter}
                            onBackspace={() => game.setDraftGuess((d) => d.slice(0, -1))}
                            onEnter={() => {
                              if (game.draftGuess.length === game.wordLength) {
                                game.submitGuess(game.draftGuess.toLowerCase())
                              }
                            }}
                            enterDisabled={game.draftGuess.length !== game.wordLength}
                            isBlindfolded={game.isBlindfolded}
                          />
                        </>
                      ) : (
                        <p className="mt-4 text-center text-sm text-muted-foreground">
                          Watch the board — it&apos;s their turn to guess.
                        </p>
                      )}
                    </div>
                  ) : null}

                  {game.uiPhase === 'gameover' && game.gameOver ? (
                    <div className="flex flex-col items-center gap-6 text-center">
                      <div className="relative">
                        <h2 className="font-serif text-4xl font-bold italic tracking-tight sm:text-5xl">
                          {game.gameOver.result === 'win' ? 'Victory!' : game.gameOver.result === 'loss' ? 'Defeat' : 'Draw'}
                        </h2>
                        <div className="mt-3 flex flex-col items-center gap-1">
                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                            Competitive Rating
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-mono font-bold text-foreground">
                              {game.gameOver.newElo || game.user?.stats?.elo || 100}
                            </span>
                            {(typeof game.gameOver.eloChange === 'number' && game.gameOver.eloChange !== 0) && (
                              <span className={`text-lg font-mono font-bold drop-shadow-sm ${game.gameOver.eloChange > 0 ? 'text-tile-correct' : 'text-destructive'}`}>
                                {game.gameOver.eloChange > 0 ? '↑' : '↓'}
                                {Math.abs(game.gameOver.eloChange)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Winner: <button type="button" className="font-semibold text-foreground hover:text-primary transition-colors hover:underline" onClick={() => openProfileView(game.gameOver.winner)}>{game.gameOver.winner}</button>
                        {game.gameOver.endReason === 'disconnect' ? (
                          <span className="block mt-1 text-xs">(opponent disconnected)</span>
                        ) : null}
                      </p>
                      <div className="mt-6 rounded-lg border-2 border-border bg-popover p-4 text-left text-sm shadow-[var(--shadow-xs)]">
                        <p>
                          <span className="text-muted-foreground">Your word:</span>{' '}
                          <span className="font-mono font-bold">{game.gameOver.yourWord}</span>
                        </p>
                        <p className="mt-2">
                          <span className="text-muted-foreground">Their word:</span>{' '}
                          <span className="font-mono font-bold">{game.gameOver.opponentWord}</span>
                        </p>
                        <p className="mt-2 text-muted-foreground">
                          Guesses — you: {game.gameOver.yourGuesses}, them: {game.gameOver.opponentGuesses}
                          {game.gameOver.duration != null ? ` · ${game.gameOver.duration}s` : ''}
                        </p>
                      </div>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <button
                          type="button"
                          onClick={game.requestRematch}
                          className="rounded-lg border-2 border-foreground bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-md)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                        >
                          Rematch
                        </button>
                        <button
                          type="button"
                          onClick={game.leaveRoom}
                          className="rounded-lg border-2 border-border bg-popover px-6 py-3 font-semibold shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                        >
                          Leave room
                        </button>
                      </div>
                      {game.rematchPending || game.rematchRequestedBy ? (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Waiting for opponent to accept rematch…
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {game.uiPhase === 'gameover' && !game.gameOver ? (
                    <div className="text-center">
                      <p className="text-muted-foreground">Game finished. Use rematch or leave from the menu.</p>
                      <button
                        type="button"
                        onClick={game.leaveRoom}
                        className="mt-4 rounded-lg border-2 border-border bg-popover px-4 py-2 text-sm font-semibold"
                      >
                        Leave room
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
