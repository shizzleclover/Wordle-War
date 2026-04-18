import React from 'react'
import { getRankInfo } from '../utils/rankUtils'

export function StatsView({ stats, mode = 'personal', isLoading }) {
  if (isLoading) return <div className="py-8 text-center animate-pulse">Loading data...</div>
  
  if (mode === 'personal') {
    const personal = stats?.personal
    if (!personal) return <div className="py-8 text-center text-muted-foreground italic">No stats available.</div>

    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'ELO Rating', value: personal.elo || 100, icon: '⚡' },
            { label: 'Matches', value: personal.gamesPlayed || 0, icon: '🎮' },
            { label: 'Win Rate', value: personal.winRate ? `${personal.winRate}%` : '0%', icon: '📈' },
            { label: 'Best Streak', value: personal.bestStreak || 0, icon: '🔥' }
          ].map((item) => (
            <div key={item.label} className="rounded-lg border-2 border-border bg-card p-3 shadow-[var(--shadow-xs)]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs">{item.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</span>
              </div>
              <div className="text-xl font-mono font-bold text-foreground">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border-2 border-border bg-popover p-5 shadow-[var(--shadow-md)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif font-bold text-lg">Performance Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Average Guesses</div>
              <div className="text-xl font-mono font-bold">{personal.avgGuessesPerGame || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Fastest Win</div>
              <div className="text-xl font-mono font-bold">{personal.fastestWin ? `${personal.fastestWin}s` : 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Wins</div>
              <div className="text-xl font-mono font-bold text-tile-correct">{personal.wins || 0}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Recent Streak</div>
              <div className="text-xl font-mono font-bold text-primary">{personal.winStreak || 0}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // GLOBAL LEADERBOARD MODE
  const leaderboard = stats?.leaderboard || []
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-xl border-2 border-border bg-popover overflow-hidden shadow-[var(--shadow-md)]">
        <div className="bg-secondary/50 px-4 py-3 border-b-2 border-border flex justify-between items-center">
          <h3 className="font-serif font-bold flex items-center gap-2">
            <span>🏆</span> Hall of Fame
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top Warriors</span>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {leaderboard.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground italic">No rankings found yet.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-popover text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border shadow-sm">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Warrior</th>
                  <th className="px-4 py-3 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaderboard.map((entry, i) => {
                  const rank = getRankInfo(entry.elo)
                  return (
                    <tr key={entry.username} className="group hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-4 font-mono font-bold">
                        {i + 1 === 1 ? '🥇' : i + 1 === 2 ? '🥈' : i + 1 === 3 ? '🥉' : `#${i + 1}`}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold group-hover:text-primary transition-colors">{entry.username}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-tight ${rank.color}`}>{rank.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-primary">{entry.elo}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
