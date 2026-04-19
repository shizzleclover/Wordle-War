import React from 'react'

export function LobbyView({ 
  game, 
  gameMode, 
  setGameMode, 
  theme, 
  setTheme, 
  lengthInput, 
  setLengthInput, 
  WORD_THEMES, 
  GAME_MODES, 
  CustomSelect, 
  parseWordLengthInput, 
  QUICK_LENGTHS,
  onDailySolo // New prop
}) {
  return (
    <div className="flex flex-col gap-6">
      {!game.roomCode ? (
        <>
          {game.isMatchmaking ? (
            <div className="flex flex-col items-center gap-6 py-12">
              <div className="relative flex h-32 w-32 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <div className="absolute inset-4 animate-pulse rounded-full bg-primary/40" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl text-primary-foreground shadow-lg">
                  ⚔️
                </div>
              </div>
              <div className="text-center">
                <h2 className="font-serif text-2xl font-bold tracking-tight">Searching for opponent...</h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                  {gameMode} • {theme} • {lengthInput} letters
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full max-w-[200px]">
                <button
                  type="button"
                  onClick={() => game.joinMatchmaking(lengthInput, gameMode, theme)}
                  className="rounded-xl border-2 border-primary/20 bg-secondary px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-secondary-foreground transition-all hover:bg-secondary/80 active:scale-95 shadow-sm"
                >
                  🔄 Keep Searching
                </button>
                <button
                  type="button"
                  onClick={game.leaveMatchmaking}
                  className="rounded-xl border-2 border-border bg-popover px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-destructive transition-all hover:bg-destructive/10 active:scale-95 shadow-sm"
                >
                  Cancel Search
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Daily Challenge Section */}
              <div className="rounded-xl border-2 border-indigo-500/30 bg-indigo-500/5 p-4 shadow-[var(--shadow-sm)]">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-indigo-500 flex items-center gap-2">
                    <span>📅</span> Daily Challenge
                  </h3>
                  {game.dailyInfo?.hasPlayed && (
                    <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-indigo-500 border border-indigo-500/30">
                      Completed
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onDailySolo}
                    className="flex flex-col items-center gap-1 rounded-lg border-2 border-indigo-500/20 bg-card p-3 transition-all hover:bg-indigo-500/10 hover:border-indigo-500/40 active:scale-95"
                  >
                    <span className="text-xl">🎯</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Solo Practice</span>
                  </button>
                  <button
                    onClick={() => game.joinMatchmaking(5, 'standard', 'none', true)}
                    className="flex flex-col items-center gap-1 rounded-lg border-2 border-indigo-500/20 bg-card p-3 transition-all hover:bg-indigo-500/10 hover:border-indigo-500/40 active:scale-95"
                  >
                    <span className="text-xl">🏁</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Competitive Race</span>
                  </button>
                </div>
              </div>

              <h2 className="font-serif text-2xl font-semibold mt-2">Start a match</h2>
              <div className="flex flex-col gap-4">
                <CustomSelect
                  id="game-mode"
                  label="Match Type"
                  value={gameMode}
                  options={GAME_MODES}
                  onChange={setGameMode}
                />

                <CustomSelect
                  id="game-theme"
                  label="Word Theme"
                  value={theme}
                  options={WORD_THEMES}
                  onChange={setTheme}
                />

                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground" htmlFor="word-len">
                    Word Length
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        id="word-len"
                        type="number"
                        min="3"
                        max="10"
                        value={lengthInput}
                        onChange={(e) => setLengthInput(e.target.value)}
                        className="w-20 rounded-lg border-2 border-input bg-background px-3 py-2 text-sm font-bold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all hover:border-primary/50"
                      />
                      <input
                        type="range"
                        min="3"
                        max="10"
                        value={lengthInput}
                        onChange={(e) => setLengthInput(e.target.value)}
                        className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
                      />
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                      {QUICK_LENGTHS.map((len) => (
                        <button
                          key={len}
                          type="button"
                          onClick={() => setLengthInput(len.toString())}
                          className={`rounded-full border-2 px-3 py-1 text-[10px] font-bold uppercase transition-all ${
                            lengthInput === len.toString()
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-popover text-muted-foreground hover:border-primary/40'
                          }`}
                        >
                          {len} letters
                        </button>
                      ))}
                    </div>
                  </div>
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
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-serif text-2xl font-semibold">Waiting for opponent</h2>
          <p className="text-muted-foreground">Share this code:</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <code className="rounded-lg border-2 border-primary bg-popover px-4 py-3 font-mono text-2xl font-bold tracking-[0.2em] shadow-[var(--shadow-md)]">
              {game.roomCode}
            </code>
            <button
              type="button"
              className="rounded-lg border-2 border-border bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-[var(--shadow-sm)]"
              onClick={() => {
                navigator.clipboard.writeText(game.roomCode)
                game.showToast('Code copied!')
              }}
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
      )}
    </div>
  )
}
