import { keyCapClass } from '../utils/wordleTiles'

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

export function WarKeyboard({ letterStates, onKey, onBackspace, onEnter, enterDisabled, isBlindfolded }) {
  return (
    <div className="mt-4 flex w-full flex-col gap-1 sm:gap-2 relative">
      {isBlindfolded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-lg backdrop-blur-sm pointer-events-none">
          <span className="text-white font-bold text-lg">🙈 BLINDFOLDED</span>
        </div>
      )}
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-1 sm:gap-1">
          {ri === 2 && (
            <button
              type="button"
              className="h-10 rounded-md border-2 border-border bg-accent px-2 text-xs font-semibold text-accent-foreground shadow-[var(--shadow-xs)] sm:px-3 sm:text-sm"
              onClick={onEnter}
              disabled={enterDisabled}
            >
              Enter
            </button>
          )}
          {row.map((k) => (
            <button
              key={k}
              type="button"
              className={[
                'h-10 min-w-[1.75rem] flex-1 max-w-[2.5rem] rounded-md border-2 px-0 text-xs font-semibold shadow-[var(--shadow-xs)] sm:min-w-[2.25rem] sm:px-2 sm:text-sm relative transition-all active:scale-95',
                keyCapClass(letterStates[k]),
              ].join(' ')}
              onClick={() => onKey(k)}
            >
              <span className={isBlindfolded ? 'opacity-0' : 'opacity-100'}>{k}</span>
            </button>
          ))}
          {ri === 2 && (
            <button
              type="button"
              className="h-10 rounded-md border-2 border-border bg-muted px-2 text-xs font-semibold text-muted-foreground shadow-[var(--shadow-xs)] sm:px-3 sm:text-sm"
              onClick={onBackspace}
            >
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
