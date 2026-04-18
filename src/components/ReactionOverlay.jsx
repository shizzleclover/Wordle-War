import React, { useEffect, useState } from 'react'

export function ReactionOverlay({ reaction, onClear }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (reaction) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onClear()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [reaction, onClear])

  if (!reaction || !visible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div className="animate-in fade-in zoom-in slide-in-from-bottom-32 duration-1000 ease-out fill-mode-forwards text-[120px] filter drop-shadow-2xl">
        {reaction.emoji}
      </div>
    </div>
  )
}
