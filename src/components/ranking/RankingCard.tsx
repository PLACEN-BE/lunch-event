import type { RankingEntry } from '@/types'
import { Avatar } from '@/components/ui/Avatar'

const medals = ['👑', '🥈', '🥉']

export function RankingCard({ entry, rank }: { entry: RankingEntry; rank: number }) {
  const medal = rank < 3 ? medals[rank] : null
  const bgClass =
    rank === 0
      ? 'bg-gradient-to-r from-gold/20 to-transparent border-gold/30'
      : rank === 1
        ? 'bg-gradient-to-r from-silver/20 to-transparent border-silver/30'
        : rank === 2
          ? 'bg-gradient-to-r from-bronze/20 to-transparent border-bronze/30'
          : 'bg-white border-foreground/5'

  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-2xl border shadow-sm ${bgClass}`}>
      <div className="text-2xl w-8 text-center font-black">
        {medal ?? <span className="text-foreground/30 text-base">{rank + 1}</span>}
      </div>
      <Avatar src={entry.avatar_url} nickname={entry.nickname} size={36} />
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">{entry.nickname}</p>
        <p className="text-xs text-foreground/40">@{entry.login_id}</p>
      </div>
      <div className="text-right">
        <span className="text-xl font-black text-primary">{entry.treat_count}</span>
        <span className="text-xs text-foreground/40 ml-1">회</span>
      </div>
    </div>
  )
}
