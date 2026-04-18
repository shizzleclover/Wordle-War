import { useCallback, useEffect, useRef, useState } from 'react'
import { useWarGame } from './hooks/useWarGame'
import { HowToPlayFab, HowToPlayModal } from './components/HowToPlayModal'
import { letterKeyStates } from './utils/wordleTiles'
import { WORD_LEN_MAX, WORD_LEN_MIN, parseWordLengthInput } from './gameConstants'

// New Components
import { AuthCard } from './components/AuthCard'
import { LobbyView } from './components/LobbyView'
import { SetupView } from './components/SetupView'
import { PlayingView } from './components/PlayingView'
import { GameOverView } from './components/GameOverView'
import { StatsView } from './components/StatsView'
import { ProfileView } from './components/ProfileView'
import { ToastContainer } from './components/ToastContainer'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DailyChallengeView } from './components/DailyChallengeView'

const QUICK_LENGTHS = [4, 5, 6, 7]
const DARK_KEY = 'wordle-war-theme'

import { getRankInfo } from './utils/rankUtils'

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
  { value: 'naija', label: 'Nigerian / Naija' },
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

function App() {
  const game = useWarGame()
  const [activeTab, setActiveTab] = useState('play')
  const [showHowTo, setShowHowTo] = useState(false)
  const [isDailyMode, setIsDailyMode] = useState(false)

  // Local UI state
  const [lengthInput, setLengthInput] = useState('5')
  const [gameMode, setGameMode] = useState('standard')
  const [theme, setTheme] = useState('none')
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(DARK_KEY)
    return saved !== null ? saved === 'true' : true
  })

  // Theme effect
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem(DARK_KEY, String(darkMode))
  }, [darkMode])

  // Sync tab with game phase
  useEffect(() => {
    if (game.uiPhase !== 'lobby' && activeTab !== 'play') {
      setActiveTab('play')
    }
    if (game.uiPhase !== 'lobby') {
      setIsDailyMode(false)
    }
  }, [game.uiPhase, activeTab])

  useEffect(() => {
    if (game.socketConnected && game.user) {
      game.fetchDailyInfo()
    }
  }, [game.socketConnected, game.user, game.fetchDailyInfo])

  const typeLetter = (letter) => {
    if (game.uiPhase === 'setup') {
      if (game.secretDraft.length < game.wordLength) {
        game.setSecretDraft((d) => d + letter)
      }
    } else if (game.uiPhase === 'playing' && game.yourTurn) {
      if (game.draftGuess.length < game.wordLength) {
        game.setDraftGuess((d) => d + letter)
      }
    }
  }

  const openProfileView = (username) => {
    if (!username) return
    setActiveTab('profile')
    game.fetchUserProfile(username)
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      game.logout()
    }
  }

  const letterStates = letterKeyStates(game.guesses)

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <header className="sticky top-0 z-40 w-full border-b-2 border-border bg-background/80 backdrop-blur-md px-4 py-3 sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('play')}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-lg group-hover:rotate-12 transition-transform shadow-[var(--shadow-xs)]">
                ⚔️
              </div>
              <h1 className="hidden font-serif text-xl font-black italic tracking-tighter sm:block">
                WORDLE<span className="text-primary">WAR</span>
              </h1>
            </div>

            {game.user ? (
              <div className="flex flex-1 items-center justify-center max-w-md">
                <PillNav
                  active={activeTab}
                  onPlay={() => setActiveTab('play')}
                  onStats={() => {
                    setActiveTab('stats')
                    game.fetchStats()
                  }}
                  onProfile={() => {
                    setActiveTab('profile')
                    game.fetchUserProfile(game.user.username)
                  }}
                  onPlayers={() => {
                    setActiveTab('players')
                    game.fetchLeaderboard()
                  }}
                />
              </div>
            ) : (
              <div className="flex-1" />
            )}

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-lg p-2 hover:bg-secondary transition-colors"
                title="Toggle Theme"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              {game.user && (
                <div className="hidden items-center gap-2 rounded-full border-2 border-border bg-card px-3 py-1 sm:flex shadow-[var(--shadow-sm)]">
                  <div className="h-2 w-2 rounded-full bg-tile-correct shrink-0 animate-pulse" />
                  <span className="font-mono text-xs font-bold truncate max-w-[80px]">
                    {game.user.username}
                  </span>
                  <span className="text-primary text-[10px] font-bold">⚡ {game.user?.stats?.elo || 100}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto flex-1 px-4 py-4 sm:px-8 sm:py-8">
          {!game.user ? (
            <div className="mx-auto max-w-md">
              <div className="mb-8 text-center">
                <h2 className="mb-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">Ultimate Vocabulary Duel</h2>
                <p className="text-muted-foreground">Pick a word, power up, and outsmart your opponent in real-time wordle battles.</p>
              </div>
              <AuthCard onLogin={game.login} onRegister={game.register} />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Quick Join Bar (Only in play tab, lobby phase) */}
              {activeTab === 'play' && game.uiPhase === 'lobby' && !game.isMatchmaking && (
                <div className="mx-auto w-full max-w-sm">
                  <div className="group relative flex h-14 items-center overflow-hidden rounded-2xl border-4 border-primary bg-card p-1 shadow-[0_6px_0_0_oklch(0.6209_0.1801_348.1385_/_0.2)] transition-all focus-within:translate-y-1 focus-within:shadow-none">
                    <input
                      type="text"
                      placeholder="ENTER ROOM CODE..."
                      className="h-full w-full bg-transparent pl-4 pr-24 font-mono text-lg font-black uppercase tracking-[0.2em] text-foreground outline-none placeholder:font-sans placeholder:text-[10px] placeholder:tracking-normal placeholder:opacity-40"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                    <button
                      onClick={() => game.joinRoom(joinCodeInput)}
                      className="absolute bottom-1 right-1 top-1 flex items-center justify-center rounded-xl bg-primary px-6 font-black tracking-widest text-primary-foreground transition-all hover:scale-[1.02] hover:brightness-110 active:scale-95 whitespace-nowrap"
                    >
                      JOIN
                    </button>
                  </div>
                  <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                    Have a code? Warp to the battlefield.
                  </p>
                </div>
              )}

              {/* View Rendering Logic */}
              <div className="min-h-[400px]">
                {activeTab === 'play' && (
                  <>
                    {isDailyMode ? (
                      <DailyChallengeView 
                        game={game} 
                        onClose={() => setIsDailyMode(false)}
                      />
                    ) : (
                      <>
                        {game.uiPhase === 'lobby' && (
                          <LobbyView 
                            game={game}
                            gameMode={gameMode}
                            setGameMode={setGameMode}
                            theme={theme}
                            setTheme={setTheme}
                            lengthInput={lengthInput}
                            setLengthInput={setLengthInput}
                            WORD_THEMES={WORD_THEMES}
                            GAME_MODES={GAME_MODES}
                            CustomSelect={CustomSelect}
                            parseWordLengthInput={parseWordLengthInput}
                            QUICK_LENGTHS={QUICK_LENGTHS}
                            onDailySolo={() => setIsDailyMode(true)}
                          />
                        )}

                        {game.uiPhase === 'setup' && (
                          <SetupView 
                            game={game}
                            WORD_THEMES={WORD_THEMES}
                            typeLetter={typeLetter}
                          />
                        )}

                        {game.uiPhase === 'playing' && (
                          <PlayingView 
                            game={game}
                            letterStates={letterStates}
                            typeLetter={typeLetter}
                            openProfileView={openProfileView}
                          />
                        )}

                        {game.uiPhase === 'gameover' && (
                          <GameOverView 
                            game={game}
                            openProfileView={openProfileView}
                          />
                        )}
                      </>
                    )}
                  </>
                )}

                {(activeTab === 'stats' || activeTab === 'players') && (
                  <StatsView 
                    stats={game.stats}
                    mode={activeTab === 'players' ? 'global' : 'personal'}
                    isLoading={game.isStatsLoading}
                    getRankInfo={getRankInfo}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileView 
                    game={game}
                    profileData={game.profileData}
                    isProfileLoading={game.isProfileLoading}
                    getRankInfo={getRankInfo}
                    onLogout={handleLogout}
                  />
                )}
              </div>
            </div>
          )}
        </main>

        <footer className="mt-auto border-t-2 border-border py-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-50">
            Wordle War Remastered &copy; {new Date().getFullYear()}
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => setShowHowTo(true)}
              className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
            >
              How to Play
            </button>
            <a href="#" className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:underline">
              Terms
            </a>
            <a href="#" className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:underline">
              Privacy
            </a>
          </div>
        </footer>

        {/* Global UI Components */}
        <HowToPlayModal open={showHowTo} onClose={() => setShowHowTo(false)} />
        <HowToPlayFab onClick={() => setShowHowTo(true)} />
        <ToastContainer toasts={game.toasts} removeToast={game.removeToast} />

        {/* Surrender Button Overlay */}
        {game.uiPhase === 'playing' && (
          <div className="fixed bottom-4 right-4 z-50">
            <button
              onClick={() => {
                if (window.confirm('Surrender? You will lose Elo.')) {
                  game.forfeitGame()
                }
              }}
              className="group flex h-12 w-12 items-center justify-center rounded-full border-2 border-destructive bg-popover text-xl shadow-[var(--shadow-md)] transition-all hover:scale-110 active:scale-95"
              title="Surrender"
            >
              🏳️
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App
