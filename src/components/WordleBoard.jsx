import React from 'react'

function BoardTile({ letter, state, index, animate }) {
  const delay = index * 100 // 100ms staggered delay

  const stateClasses = {
    correct: 'bg-tile-correct text-white border-tile-correct',
    present: 'bg-tile-present text-white border-tile-present',
    absent: 'bg-tile-absent text-white border-tile-absent',
    empty: 'border-border bg-card text-foreground',
    active: 'border-primary bg-card text-foreground animate-pop'
  }

  return (
    <div
      className={[
        'flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg border-2 text-xl font-bold uppercase transition-all duration-500',
        stateClasses[state || 'empty'],
        animate ? 'animate-flip' : ''
      ].join(' ')}
      style={animate ? { animationDelay: `${delay}ms` } : {}}
    >
      {letter}
    </div>
  )
}

export function WordleBoard({ wordLength, guesses = [], currentDraft = null }) {
  const rows = 6
  // Ensure we don't have negative count
  const emptyRowsCount = Math.max(0, rows - guesses.length - (currentDraft !== null ? 1 : 0))

  return (
    <div className="flex flex-col gap-2">
      {guesses.map((g, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-2">
          {g.feedback.map((f, i) => (
            <BoardTile
              key={i}
              letter={g.word[i]}
              state={f}
              index={i}
              animate={true}
            />
          ))}
        </div>
      ))}

      {currentDraft !== null && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: wordLength }).map((_, i) => (
            <BoardTile
              key={i}
              letter={currentDraft[i] || ''}
              state={currentDraft[i] ? 'active' : 'empty'}
            />
          ))}
        </div>
      )}

      {Array.from({ length: emptyRowsCount }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-2">
          {Array.from({ length: wordLength }).map((_, i) => (
            <BoardTile key={i} letter="" state="empty" />
          ))}
        </div>
      ))}
    </div>
  )
}
