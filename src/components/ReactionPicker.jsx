import React from 'react'

const REACTIONS = ['🔥', '😂', '😲', '🤔', '👋', '💀', '🍀', '💯']

export function ReactionPicker({ onSelect }) {
  return (
    <div className="flex gap-1.5 rounded-full border-2 border-border bg-card p-1.5 shadow-[var(--shadow-md)]">
      {REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition-all hover:scale-125 hover:bg-secondary active:scale-95"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
