/**
 * Generates an emoji grid string (Wordle-style) based on match guesses.
 * @param {Array} guesses - Array of guess objects with { word, feedback }
 * @returns {string} - Emoji grid string
 */
export function generateEmojiGrid(guesses) {
  if (!guesses || guesses.length === 0) return ''

  const emojiMap = {
    correct: '🟩',
    present: '🟨',
    absent: '⬜'
  }

  return guesses
    .map((g) => {
      return g.feedback.map((f) => emojiMap[f] || '⬜').join('')
    })
    .join('\n')
}

/**
 * Copies text to clipboard with a fallback for older browsers.
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    }
  } catch (err) {
    console.error('Failed to copy code: ', err)
    return false
  }
}
