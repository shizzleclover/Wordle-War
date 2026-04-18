import { useCallback, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { TOKEN_KEY, apiUrl, getSocketUrl } from '../config'

function mapPhaseToUi(serverPhase, playerCount) {
  if (serverPhase === 'waiting') return playerCount >= 2 ? 'setup' : 'lobby'
  if (serverPhase === 'setup') return 'setup'
  if (serverPhase === 'playing') return 'playing'
  if (serverPhase === 'finished') return 'gameover'
  return 'lobby'
}

export function useWarGame() {
  const socketRef = useRef(null)
  const lastGameOverRef = useRef(null)

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(!!localStorage.getItem(TOKEN_KEY))
  const [socketConnected, setSocketConnected] = useState(false)

  const [toast, setToast] = useState(null)
  const [uiPhase, setUiPhase] = useState('lobby')
  const [roomCode, setRoomCode] = useState(null)
  const [wordLength, setWordLength] = useState(5)
  const [playerCount, setPlayerCount] = useState(0)
  const [players, setPlayers] = useState([])
  const [opponentName, setOpponentName] = useState('')
  const [yourTurn, setYourTurn] = useState(false)
  const [guesses, setGuesses] = useState([])
  const [draftGuess, setDraftGuess] = useState('')
  const [secretDraft, setSecretDraft] = useState('')
  const [hasSetWord, setHasSetWord] = useState(false)
  const [opponentGuessCount, setOpponentGuessCount] = useState(0)
  const [gameOver, setGameOver] = useState(null)
  const [rematchRequestedBy, setRematchRequestedBy] = useState(null)
  const [rematchPending, setRematchPending] = useState(false)
  const [disconnectBanner, setDisconnectBanner] = useState(null)
  const [stats, setStats] = useState(null)
  const [statsOpen, setStatsOpen] = useState(false)
  const [isMatchmaking, setIsMatchmaking] = useState(false)
  const [gameMode, setGameMode] = useState('standard')
  const [turnStartedAt, setTurnStartedAt] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [actionPoints, setActionPoints] = useState(0)
  const [isScrambled, setIsScrambled] = useState(false)
  const [isBlindfolded, setIsBlindfolded] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(false)
  const [isStatsLoading, setIsStatsLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [theme, setTheme] = useState('none')

  const showToast = useCallback((msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 4200)
  }, [])

  const resetLobby = useCallback(() => {
    setUiPhase('lobby')
    setRoomCode(null)
    setPlayerCount(0)
    setPlayers([])
    setOpponentName('')
    setYourTurn(false)
    setGuesses([])
    setDraftGuess('')
    setSecretDraft('')
    setHasSetWord(false)
    setOpponentGuessCount(0)
    setGameOver(null)
    lastGameOverRef.current = null
    setRematchRequestedBy(null)
    setRematchPending(false)
    setDisconnectBanner(null)
    setIsMatchmaking(false)
    setActionPoints(0)
    setIsScrambled(false)
    setIsBlindfolded(false)
  }, [])

  const applyRoomState = useCallback(
    (s) => {
      if (!s) return
      setRoomCode(s.roomCode)
      setWordLength(s.wordLength)
      setPlayers(s.players || [])
      const oc = s.players?.length || 0
      setPlayerCount(oc)
      const opp = s.opponent
      setOpponentName(opp?.username || '')
      setYourTurn(Boolean(s.yourTurn))
      setHasSetWord(Boolean(s.you?.hasSetWord))
      setDraftGuess('')
      setOpponentGuessCount(opp?.guessCount ?? 0)
      setGameMode(s.gameMode || 'standard')
      setTurnStartedAt(s.turnStartedAt || null)
      setActionPoints(s.you?.actionPoints || 0)
      setUiPhase(mapPhaseToUi(s.phase, oc))
      setIsMatchmaking(false)
      if (s.phase === 'finished' && lastGameOverRef.current) {
        setGameOver(lastGameOverRef.current)
      }
      if (s.theme) setTheme(s.theme)
      if (s.phase !== 'finished') {
        setGameOver(null)
        lastGameOverRef.current = null
      }
    },
    []
  )

  useEffect(() => {
    if (!token) {
      setUser(null)
      setAuthLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(apiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Session expired')
        const data = await res.json()
        if (!cancelled) setUser(data.user)
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
          showToast('Session expired. Sign in again.')
        }
      } finally {
        if (!cancelled) setAuthLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token, showToast])

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setSocketConnected(false)
      return
    }

    const socket = io(getSocketUrl(), {
      auth: { token },
      autoConnect: true,
      transports: ['polling', 'websocket'],
    })
    socketRef.current = socket

    const onConnect = () => {
      setSocketConnected(true)
      socket.emit('request-room-state')
    }
    const onDisconnect = () => setSocketConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', (err) => {
      showToast(err.message || 'Could not connect to game server')
    })

    socket.on('room-state', (s) => {
      applyRoomState(s)
      setIsMatchmaking(false) // Extra safety to clear overlay
    })

    socket.on('match-found', ({ roomCode }) => {
      setRoomCode(roomCode)
      setIsMatchmaking(false)
      showToast('Match found!')
      socket.emit('request-room-state')
    })

    socket.on('room-created', ({ code, wordLength: wl, theme: th }) => {
      setRoomCode(code)
      setWordLength(wl)
      if (th) setTheme(th)
      setPlayerCount(1)
      setPlayers([{ username: user.username, ready: false, disconnected: false }])
      setUiPhase('lobby')
      setIsMatchmaking(false) // Success means we aren't searching
      showToast(`Room ${code} created — share the code`)
    })

    socket.on('player-joined', ({ players: pl, playerCount: pc, wordLength: wl, theme: th, phase }) => {
      setPlayers(pl || [])
      setPlayerCount(pc ?? pl?.length ?? 0)
      if (wl) setWordLength(wl)
      if (th) setTheme(th)
      setUiPhase(mapPhaseToUi(phase, pc ?? pl?.length ?? 0))
      setIsMatchmaking(false) // We found/joined a room
    })

    socket.on('word-set', () => {
      setSecretDraft('')
      setHasSetWord(true)
    })

    socket.on('opponent-ready', () => showToast('Opponent is ready'))

    socket.on('word-suggestion', ({ word }) => {
      setSecretDraft(word.toUpperCase())
      showToast(`Suggested: ${word.toUpperCase()}`)
    })

    socket.on('game-start', ({ yourTurn: yt, opponentName: on, wordLength: wl, gameMode: gm, theme: th, turnStartedAt: tsa }) => {
      if (wl) setWordLength(wl)
      if (gm) setGameMode(gm)
      if (th) setTheme(th)
      setTurnStartedAt(tsa || null)
      setOpponentName(on || '')
      setYourTurn(yt)
      setGuesses([])
      setDraftGuess('')
      setActionPoints(0)
      setIsScrambled(false)
      setIsBlindfolded(false)
      setUiPhase('playing')
      setDisconnectBanner(null)
    })

    socket.on('guess-result', ({ word, feedback, actionPoints: ap }) => {
      setGuesses((g) => [...g, { word, feedback }])
      setDraftGuess('')
      if (typeof ap === 'number') setActionPoints(ap)
    })

    socket.on('turn-update', ({ yourTurn: yt, opponentGuessCount: ogc, turnStartedAt: tsa, actionPoints: ap }) => {
      setYourTurn((prev) => {
        if (!prev && yt) {
          // It became our turn. Unset statuses.
          setIsScrambled(false)
          setIsBlindfolded(false)
        }
        return yt
      })
      if (typeof ogc === 'number') setOpponentGuessCount(ogc)
      setTurnStartedAt(tsa || null)
      if (typeof ap === 'number') setActionPoints(ap)
    })

    socket.on('powerup-used', ({ type, payload, actionPoints: ap }) => {
      if (typeof ap === 'number') setActionPoints(ap)
      if (type === 'hint') {
        showToast(`Hint: Position ${payload.index + 1} is '${payload.letter.toUpperCase()}'`)
      } else if (type === 'scramble') {
        showToast('You scrambled their board!')
      } else if (type === 'blindfold') {
        showToast('You blindfolded their keyboard!')
      }
    })

    socket.on('opponent-used-powerup', ({ type, payload }) => {
      if (type === 'scramble') {
        setIsScrambled(true)
        showToast('Your opponent used Scramble!')
      } else if (type === 'blindfold') {
        setIsBlindfolded(true)
        showToast('Your opponent used Blindfold!')
      }
    })

    socket.on('game-over', (payload) => {
      lastGameOverRef.current = payload
      setGameOver(payload)
      setUiPhase('gameover')
      setRematchRequestedBy(null)
      setRematchPending(false)
      setDisconnectBanner(null)
      
      if (payload.result === 'win') {
        const msg = payload.endReason === 'forfeit' ? 'OPPONENT FORFEITED! YOU WIN' : 'YOU WIN!'
        showToast(`${msg} +${payload.eloChange || 0} EP`)
      } else if (payload.result === 'loss') {
        const msg = payload.endReason === 'forfeit' ? 'YOU FORFEITED. YOU LOST' : 'YOU LOST.'
        showToast(`${msg} ${payload.eloChange || 0} EP`)
      } else {
        showToast('MATCH DRAWN')
      }

      // Sync user elo locally and trigger background refetch for full stats
      setUser((curr) => {
        if (!curr) return null
        const updatedUser = {
          ...curr,
          stats: {
            ...curr.stats,
            elo: payload.newElo ?? curr.stats.elo
          }
        }
        return updatedUser
      })

      // Also update the stats state immediately if it's currently held
      setStats((curr) => {
        if (!curr) return null
        return {
          ...curr,
          elo: payload.newElo ?? curr.elo
        }
      })

      void fetchMe()
      void fetchStats()
    })

    socket.on('rematch-start', ({ wordLength: wl }) => {
      if (wl) setWordLength(wl)
      setGuesses([])
      setDraftGuess('')
      setSecretDraft('')
      setHasSetWord(false)
      setRematchRequestedBy(null)
      setRematchPending(false)
      setGameOver(null)
      lastGameOverRef.current = null
      setUiPhase('setup')
    })

    socket.on('rematch-requested', ({ by }) => {
      setRematchRequestedBy(by)
      showToast(`${by} wants a rematch`)
    })

    socket.on('setup-abandoned', ({ by, self }) => {
      showToast(self ? 'You left the game' : `${by} left during setup`)
      resetLobby()
    })

    socket.on('opponent-disconnected', ({ username, graceMs, graceEndsAt }) => {
      setDisconnectBanner({
        username,
        graceMs,
        graceEndsAt,
      })
    })

    socket.on('opponent-reconnected', ({ username }) => {
      setDisconnectBanner(null)
      showToast(`${username} is back`)
    })

    socket.on('player-left', ({ name }) => {
      showToast(`${name} left`)
    })

    socket.on('matchmaking-joined', () => {
      setIsMatchmaking(true)
    })

    socket.on('matchmaking-left', () => {
      setIsMatchmaking(false)
    })



    socket.on('error', (payload) => {
      const msg =
        typeof payload === 'string'
          ? payload
          : payload?.message || 'Something went wrong'
      showToast(msg)
    })

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
      setSocketConnected(false)
    }
  }, [token, user, applyRoomState, resetLobby, showToast])

  useEffect(() => {
    if (!turnStartedAt || uiPhase !== 'playing' || gameMode !== 'blitz') {
      setTimeRemaining(null)
      return
    }
    const update = () => {
      const remaining = 30 - Math.floor((Date.now() - turnStartedAt) / 1000)
      setTimeRemaining(Math.max(0, remaining))
    }
      update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [turnStartedAt, uiPhase, gameMode])

  const fetchMe = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(apiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch user')
      const data = await res.json()
      setUser(data.user)
    } catch (err) {
      console.error('fetchMe error:', err)
    }
  }, [token])

  const login = useCallback(async (username, password) => {
    setIsLoadingAuth(true)
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Login failed')
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
      return data.user
    } finally {
      setIsLoadingAuth(false)
    }
  }, [])

  const register = useCallback(async (username, password) => {
    setIsLoadingAuth(true)
    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Register failed')
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
      return data.user
    } finally {
      setIsLoadingAuth(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    resetLobby()
  }, [resetLobby])

  const fetchStats = useCallback(async () => {
    if (!token) return
    setIsStatsLoading(true)
    try {
      const res = await fetch(apiUrl('/api/stats'), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setStats(data)
    } finally {
      setIsStatsLoading(false)
    }
  }, [token])

  const fetchUserProfile = useCallback(async (username) => {
    setIsProfileLoading(true)
    try {
      const res = await fetch(apiUrl(`/api/users/${username}/profile`))
      if (!res.ok) {
        setProfileData(null)
        showToast('Profile not found')
        return
      }
      const data = await res.json()
      setProfileData(data)
    } finally {
      setIsProfileLoading(false)
    }
  }, [showToast])

  const updateUsername = useCallback(async (newUsername) => {
    if (!token) return
    try {
      const res = await fetch(apiUrl('/api/profile'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username: newUsername })
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.message || 'Failed to update username')
        return false
      }
      showToast('Username updated!')
      setUser((curr) => {
        if (!curr) return null
        return { ...curr, username: newUsername }
      })
      void fetchMe()
      return true
    } catch (err) {
      showToast('Error updating username')
      return false
    }
  }, [token, showToast, fetchMe])

  const createRoom = useCallback(
    (wl, mode, thm) => {
      socketRef.current?.emit('create-room', { wordLength: wl, gameMode: mode, theme: thm })
    },
    []
  )

  const joinRoom = useCallback((code) => {
    const c = code.trim().toUpperCase()
    setRoomCode(c)
    socketRef.current?.emit('join-room', { code: c })
  }, [])

  const submitSecretWord = useCallback((word) => {
    socketRef.current?.emit('set-word', { word })
  }, [])

  const submitGuess = useCallback((word) => {
    socketRef.current?.emit('make-guess', { word })
  }, [])

  const requestRematch = useCallback(() => {
    setRematchPending(true)
    socketRef.current?.emit('request-rematch')
  }, [])

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit('leave-room')
    resetLobby()
  }, [resetLobby])

  const joinMatchmaking = useCallback((wordLength, gameMode, theme) => {
    socketRef.current?.emit('join-matchmaking', { wordLength, gameMode, theme })
  }, [])

  const leaveMatchmaking = useCallback(() => {
    socketRef.current?.emit('leave-matchmaking')
    setIsMatchmaking(false)
  }, [])

  const forfeitGame = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room')
      // Important: don't resetLobby() here, wait for server's setup-abandoned or game-over
    }
  }, [])

  const getSuggestion = useCallback(() => {
    socketRef.current?.emit('get-word-suggestion')
  }, [])

  const usePowerup = useCallback((type) => {
    socketRef.current?.emit('use-powerup', { type })
  }, [])

  return {
    token,
    user,
    authLoading,
    socketConnected,
    toast,
    uiPhase,
    roomCode,
    wordLength,
    playerCount,
    players,
    opponentName,
    yourTurn,
    guesses,
    draftGuess,
    setDraftGuess,
    secretDraft,
    setSecretDraft,
    hasSetWord,
    opponentGuessCount,
    gameOver,
    rematchRequestedBy,
    rematchPending,
    disconnectBanner,
    stats,
    statsOpen,
    setStatsOpen,
    login,
    register,
    logout,
    fetchStats,
    createRoom,
    joinRoom,
    submitSecretWord,
    submitGuess,
    requestRematch,
    leaveRoom,
    forfeitGame,
    getSuggestion,
    isMatchmaking,
    joinMatchmaking,
    leaveMatchmaking,
    gameMode,
    timeRemaining,
    actionPoints,
    isScrambled,
    isBlindfolded,
    usePowerup,
    disconnectBanner,
    stats,
    statsOpen,
    wordLength, // adding this just in case, since App might use it
    isLoadingAuth,
    isStatsLoading,
    profileData,
    setProfileData,
    isProfileLoading,
    fetchUserProfile,
    updateUsername,
    fetchMe,
    theme
  }
}
