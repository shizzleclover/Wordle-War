import React from 'react'
import { generateEmojiGrid, copyToClipboard } from '../utils/shareUtils'

export function GameOverView({ 
  game, 
  openProfileView 
}) {
  const handleShare = async () => {
    const grid = generateEmojiGrid(game.guesses)
    const resultText = game.gameOver.result === 'win' ? 'WON' : 'LOST'
    const shareText = `Wordle War ${game.wordLength} letters: I ${resultText} against ${game.opponentName}!\n\n${grid}\n\nPlay at: ${window.location.origin}`
    
    const success = await copyToClipboard(shareText)
    if (success) {
      game.showToast('Result copied to clipboard! 🟩🟨⬜')
    } else {
      game.showToast('Failed to copy. Try again.', 'error')
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in duration-500">
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
          <span className="block mt-1 text-xs text-destructive/80 font-bold uppercase tracking-wider">(opponent disconnected)</span>
        ) : game.gameOver.endReason === 'forfeit' ? (
          <span className="block mt-1 text-xs text-destructive/80 font-bold uppercase tracking-wider">(surrendered)</span>
        ) : null}
      </p>
      
      <div className="mt-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition-all active:scale-95"
        >
          <span>📊</span> Share Results
        </button>
      </div>

      <div className="mt-4 rounded-lg border-2 border-border bg-popover p-4 text-left text-sm shadow-[var(--shadow-xs)]">
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
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {game.rematchRequestedBy ? (
          <>
            <button
              type="button"
              onClick={game.requestRematch}
              disabled={game.rematchPending}
              className="rounded-lg border-2 border-foreground bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-md)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 animate-pulse disabled:opacity-80"
            >
              {game.rematchPending ? '⏳ Accepting Rematch...' : '✅ Accept Rematch'}
            </button>
            {!game.rematchPending && (
              <button
                type="button"
                onClick={game.leaveRoom}
                className="rounded-lg border-2 border-border bg-popover px-6 py-3 font-semibold shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
              >
                ❌ Decline
              </button>
            )}
          </>
        ) : game.rematchPending ? (
          <>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                disabled
                className="rounded-lg border-2 border-foreground bg-primary/50 px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-md)] opacity-70 cursor-not-allowed"
              >
                🔄 Rematch Requested...
              </button>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Waiting for opponent</p>
            </div>
            <button
              type="button"
              onClick={game.leaveRoom}
              className="rounded-lg border-2 border-border bg-popover px-6 py-3 font-semibold shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
            >
              Leave room
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={game.requestRematch}
              className="rounded-lg border-2 border-foreground bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-md)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              🔄 Request Rematch
            </button>
            <button
              type="button"
              onClick={game.leaveRoom}
              className="rounded-lg border-2 border-border bg-popover px-6 py-3 font-semibold shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
            >
              🚪 Leave Room
            </button>
          </>
        )}
      </div>
    </div>
    </div>
  )}