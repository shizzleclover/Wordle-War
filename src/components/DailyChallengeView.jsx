import React, { useState, useEffect } from 'react'
import { WordleBoard } from './WordleBoard'
import { WarKeyboard } from './WarKeyboard'
import { letterKeyStates } from '../utils/wordleTiles'
import { apiUrl } from '../config'

export function DailyChallengeView({ 
  game, 
  onClose 
}) {
  const [dailyWord, setDailyWord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guesses, setGuesses] = useState([])
  const [currentDraft, setCurrentDraft] = useState('')
  const [isGameOver, setIsGameOver] = useState(false)
  const [won, setWon] = useState(false)

  useEffect(() => {
    const fetchWord = async () => {
      try {
        const res = await fetch(apiUrl('/api/daily/word'), {
          headers: { Authorization: `Bearer ${game.token}` }
        })
        const data = await res.json()
        setDailyWord(data.word.toLowerCase())
      } catch (err) {
        game.showToast('Failed to load daily word', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchWord()
  }, [game.token])

  const submitGuess = (word) => {
    if (isGameOver) return
    
    // Compute feedback
    const feedback = new Array(word.length).fill('absent')
    const secretArr = dailyWord.split('')
    const guessArr = word.split('')
    const secretUsed = new Array(dailyWord.length).fill(false)
    const guessUsed = new Array(word.length).fill(false)

    for (let i = 0; i < guessArr.length; i++) {
        if (guessArr[i] === secretArr[i]) {
            feedback[i] = 'correct'
            secretUsed[i] = true
            guessUsed[i] = true
        }
    }
    for (let i = 0; i < guessArr.length; i++) {
        if (guessUsed[i]) continue
        for (let j = 0; j < secretArr.length; j++) {
            if (secretUsed[j]) continue
            if (guessArr[i] === secretArr[j]) {
                feedback[i] = 'present'
                secretUsed[j] = true
                break
            }
        }
    }

    const newGuesses = [...guesses, { word, feedback }]
    setGuesses(newGuesses)
    setCurrentDraft('')

    const victory = feedback.every(f => f === 'correct')
    if (victory || newGuesses.length >= 6) {
      setIsGameOver(true)
      setWon(victory)
      // Submit result to backend
      fetch(apiUrl('/api/daily/solo'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${game.token}` 
        },
        body: JSON.stringify({ guesses: newGuesses.length, win: victory })
      }).then(res => res.json()).then(data => {
        game.showToast(victory ? `Victory! Streak: ${data.streak}` : 'Nice try! Come back tomorrow.')
        game.fetchMe() // Update user stats
      })
    }
  }

  const typeLetter = (l) => {
    if (currentDraft.length < 5) setCurrentDraft(d => d + l)
  }

  if (loading) return <div className="py-10 text-center animate-pulse">Loading daily challenge...</div>

  const states = letterKeyStates(guesses)

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold">Daily Solo Practice</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Word of the day • 5 letters</p>
        </div>
        <button onClick={onClose} className="rounded-lg border-2 border-border bg-popover px-3 py-1 text-xs font-bold">EXIT</button>
      </div>

      <WordleBoard 
        wordLength={5} 
        guesses={guesses} 
        currentDraft={isGameOver ? null : currentDraft} 
      />

      {isGameOver ? (
        <div className="text-center bg-secondary/30 p-4 rounded-xl border-2 border-border">
          <h3 className="text-xl font-bold mb-1">{won ? 'SOLVED! 🎉' : 'OUT OF GUESSES'}</h3>
          <p className="text-sm text-muted-foreground mb-4">The word was: <span className="font-mono font-black text-foreground uppercase tracking-widest">{dailyWord}</span></p>
          <button 
            onClick={onClose}
            className="w-full rounded-lg border-2 border-foreground bg-primary py-2 font-bold text-primary-foreground shadow-[var(--shadow-md)]"
          >
            CONTINUE
          </button>
        </div>
      ) : (
        <WarKeyboard 
          letterStates={states} 
          onKey={typeLetter} 
          onBackspace={() => setCurrentDraft(d => d.slice(0, -1))}
          onEnter={() => currentDraft.length === 5 && submitGuess(currentDraft.toLowerCase())}
          enterDisabled={currentDraft.length !== 5}
        />
      )}
    </div>
  )
}
