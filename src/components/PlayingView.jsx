import React from 'react'
import { WordleBoard } from './WordleBoard'
import { WarKeyboard } from './WarKeyboard'
import { ReactionPicker } from './ReactionPicker'
import { ReactionOverlay } from './ReactionOverlay'

export function PlayingView({ 
  game, 
  letterStates, 
  typeLetter, 
  openProfileView 
}) {
  return (
    <div className="mx-auto max-w-lg relative">
      <ReactionOverlay 
        reaction={game.incomingReaction} 
        onClear={() => game.setIncomingReaction(null)} 
      />
      
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
      
      <div className="mt-6 flex justify-center">
        <ReactionPicker onSelect={game.sendReaction} />
      </div>
      
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
  )
}
