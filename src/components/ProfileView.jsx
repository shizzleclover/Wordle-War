import React from 'react'
import { getRankInfo } from '../utils/rankUtils'

export function ProfileView({ 
  game, 
  profileData, 
  isProfileLoading, 
  onLogout 
}) {
  if (isProfileLoading) return <div className="py-8 text-center animate-pulse">Loading profile...</div>
  if (!profileData) return <div className="py-8 text-center text-muted-foreground">Could not load profile.</div>

  const rank = getRankInfo(profileData.stats.elo)

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      <div className="flex flex-col gap-4 rounded-xl border-2 border-border bg-popover p-5 shadow-[var(--shadow-md)] relative overflow-hidden">
        {/* Decorative background rank color */}
        <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-10 blur-3xl ${rank.bg}`} />
        
        <div className="flex items-center gap-4 relative">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${rank.border} ${rank.bg} text-2xl shadow-inner shrink-0`}>
            {profileData.username[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h2 className="font-serif text-2xl font-bold">{profileData.username}</h2>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${rank.color}`}>{rank.label}</span>
              <span className="text-muted-foreground/30">•</span>
              <span className="font-mono text-sm font-bold text-primary">⚡ {profileData.stats.elo} ELO</span>
            </div>
          </div>
          
          <div className="ml-auto flex gap-2">
            {game.user?.username !== profileData.username ? (
              <button
                onClick={() => profileData.isFollowing ? game.unfollowUser(profileData.username) : game.followUser(profileData.username)}
                className={[
                  'rounded-lg border-2 px-4 py-1.5 text-xs font-bold transition-all active:scale-95',
                  profileData.isFollowing 
                    ? 'border-border bg-muted text-muted-foreground' 
                    : 'border-primary bg-primary text-primary-foreground shadow-[var(--shadow-xs)]'
                ].join(' ')}
              >
                {profileData.isFollowing ? 'UNFOLLOW' : 'FOLLOW'}
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                title="Logout"
              >
                🚪
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4 border-t border-border pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Followers</span>
            <span className="font-mono font-bold">{profileData.followersCount || 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Following</span>
            <span className="font-mono font-bold">{profileData.followingCount || 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Wins', value: profileData.stats.wins, color: 'text-tile-correct' },
          { label: 'Losses', value: profileData.stats.losses, color: 'text-destructive' },
          { label: 'Draws', value: (profileData.stats.gamesPlayed || 0) - (profileData.stats.wins || 0) - (profileData.stats.losses || 0), color: 'text-muted-foreground' }
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center rounded-lg border-2 border-border bg-card p-3 shadow-[var(--shadow-xs)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</span>
            <span className={`text-xl font-mono font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {profileData.following?.length > 0 && (
        <div className="rounded-xl border-2 border-border bg-popover overflow-hidden shadow-[var(--shadow-md)]">
          <div className="bg-secondary/50 px-4 py-3 border-b-2 border-border">
            <h3 className="font-serif font-bold">Followed</h3>
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            {profileData.following.map(f => (
              <button
                key={f.username}
                onClick={() => game.fetchUserProfile(f.username)}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm transition-all hover:border-primary/50 hover:bg-secondary"
              >
                <div className="h-4 w-4 rounded-full bg-primary/20 text-[8px] flex items-center justify-center font-bold">
                  {f.username[0].toUpperCase()}
                </div>
                <span className="font-semibold">{f.username}</span>
                <span className="text-[10px] text-muted-foreground">⚡{f.elo}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border-2 border-border bg-popover overflow-hidden shadow-[var(--shadow-md)]">
        <div className="bg-secondary/50 px-4 py-3 border-b-2 border-border flex justify-between items-center">
          <h3 className="font-serif font-bold">Recent Matches</h3>
          <span className="text-[10px] font-bold uppercase text-muted-foreground">Last 10 games</span>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {(!profileData.recentMatches || profileData.recentMatches.length === 0) ? (
            <div className="p-8 text-center text-sm text-muted-foreground italic">No matches fought yet.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-border">
                {profileData.recentMatches.map((m) => {
                  const isWinner = m.winner === profileData.username
                  const isDraw = m.winner === 'draw'
                  return (
                    <tr key={m.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${isWinner ? 'bg-tile-correct animate-pulse' : isDraw ? 'bg-muted-foreground' : 'bg-destructive'}`} />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(m.createdAt).toLocaleDateString()}</span>
                            <span className="font-semibold">{isWinner ? 'Victory' : isDraw ? 'Draw' : 'Defeat'} against {m.opponent}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`font-mono font-bold ${m.eloChange > 0 ? 'text-tile-correct' : 'text-destructive'}`}>
                          {m.eloChange > 0 ? '+' : ''}{m.eloChange}
                        </span>
                      </td>
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
