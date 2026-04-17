import { useEffect } from 'react'

export function HowToPlayModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-play-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]"
        aria-label="Close help"
        onClick={onClose}
      />
      <div
        className="relative z-[101] max-h-[min(90vh,32rem)] w-full max-w-lg overflow-y-auto rounded-xl border-2 border-primary bg-card p-5 shadow-[var(--shadow-xl)] sm:p-6"
        style={{ scrollbarColor: 'var(--primary) var(--card)' }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="how-to-play-title" className="font-serif text-xl font-semibold text-card-foreground sm:text-2xl">
            How to play
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border-2 border-border bg-popover px-3 py-1 text-sm font-semibold shadow-[var(--shadow-xs)]"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 text-left text-sm text-card-foreground sm:text-base">
          <p>
            You and your opponent each choose a <strong>secret word</strong> (same length). Take turns guessing
            the other person&apos;s word. <strong>First to guess correctly wins.</strong>
          </p>

          <p className="text-muted-foreground">
            After each guess, every letter is colored to show how close you were. These colors match the tiles on
            your board:
          </p>

          <div className="rounded-lg border-2 border-border bg-popover p-4 shadow-[var(--shadow-xs)]">
            <h3 className="mb-3 font-semibold text-foreground">Tile colors</h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-foreground bg-tile-correct text-base font-bold text-primary-foreground"
                  aria-hidden
                >
                  G
                </span>
                <span>
                  <strong className="text-foreground">Green</strong> — correct letter in the{' '}
                  <strong>right spot</strong>.
                </span>
              </li>
              <li className="flex gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-foreground bg-tile-present text-base font-bold text-foreground"
                  aria-hidden
                >
                  Y
                </span>
                <span>
                  <strong className="text-foreground">Yellow / gold</strong> — letter is in the word but in the{' '}
                  <strong>wrong spot</strong>.
                </span>
              </li>
              <li className="flex gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-foreground/40 bg-tile-absent text-base font-bold text-primary-foreground"
                  aria-hidden
                >
                  X
                </span>
                <span>
                  <strong className="text-foreground">Gray</strong> — letter is{' '}
                  <strong>not in the word</strong> (or all copies are already used elsewhere in the guess).
                </span>
              </li>
            </ul>
          </div>

          <p className="text-muted-foreground">
            Words can be <strong className="text-foreground">any letters you like</strong> — they do not have to
            be dictionary words. Only use <strong className="text-foreground">A–Z</strong>, no spaces or numbers.
          </p>

          <div className="rounded-lg border-2 border-border bg-popover p-4 shadow-[var(--shadow-xs)]">
            <h3 className="mb-3 font-semibold text-foreground">Competitive & Ranks</h3>
            <p className="mb-3 text-[11px] text-muted-foreground leading-relaxed">
              Win matches to earn <strong>EP (Elo Points)</strong>. The amount depends on the rating difference:
              <br />• ⚔️ <strong>Beating stronger</strong> players awards more EP.
              <br />• ⚖️ <strong>Losing to weaker</strong> players results in a larger deduction.
              <br />• 📉 EP cannot drop below <strong>0</strong>.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { l: 'Master', v: '1000+', c: 'text-purple-400' },
                { l: 'Diamond', v: '750+', c: 'text-cyan-400' },
                { l: 'Platinum', v: '500+', c: 'text-sky-400' },
                { l: 'Gold', v: '300+', c: 'text-amber-400' },
                { l: 'Silver', v: '150+', c: 'text-slate-400' },
                { l: 'Bronze', v: '0+', c: 'text-orange-500' },
              ].map(r => (
                <div key={r.l} className="flex justify-between border-b border-border/50 pb-1">
                  <span className={`font-bold ${r.c}`}>{r.l}</span>
                  <span className="font-mono text-muted-foreground">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HowToPlayFab({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'fixed z-50 flex items-center justify-center rounded-full border-2 border-foreground bg-primary font-bold text-primary-foreground shadow-[var(--shadow-lg)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        /* Mobile: above header + quick-join so we do not sit on browser back / tab bar */
        'right-3 top-[calc(10rem+env(safe-area-inset-top\,0px))] h-11 w-11 text-lg sm:right-4',
        /* Desktop: bottom-right FAB */
        'md:bottom-6 md:right-6 md:top-auto md:h-14 md:w-14 md:text-xl',
      ].join(' ')}
      aria-label="How to play"
      title="How to play"
    >
      ?
    </button>
  )
}
