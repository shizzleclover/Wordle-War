import React from 'react'
import { WordleBoard } from './WordleBoard'
import { WarKeyboard } from './WarKeyboard'

export function SetupView({ 
  game, 
  WORD_THEMES, 
  typeLetter 
}) {
  return (
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
        ) : (
          <button
            type="button"
            onClick={game.getSuggestion}
            className="inline-flex items-center gap-1 mt-1 rounded-lg border-2 border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-500 hover:bg-indigo-500/20 transition-all active:scale-95"
          >
            🪄 Suggest a Word
          </button>
        )}
      </p>
      {!game.hasSetWord ? (
        <>
          <WordleBoard
            wordLength={game.wordLength}
            guesses={[]}
            currentDraft={game.secretDraft}
          />
          <WarKeyboard
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
  )
}
