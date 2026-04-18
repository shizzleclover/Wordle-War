/**
 * Returns rank information (label, color, bg, border) based on Elo rating.
 * @param {number} elo - The user's Elo rating.
 * @returns {object} - Rank metadata.
 */
export function getRankInfo(elo = 0) {
  if (elo >= 1000) return { label: 'Master', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
  if (elo >= 750) return { label: 'Diamond', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' }
  if (elo >= 500) return { label: 'Platinum', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' }
  if (elo >= 300) return { label: 'Gold', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
  if (elo >= 150) return { label: 'Silver', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' }
  return { label: 'Bronze', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' }
}
