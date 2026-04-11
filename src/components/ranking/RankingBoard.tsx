import type { RankingEntry } from '@/types'
import { RankingCard } from './RankingCard'

interface RankingBoardProps {
  rankings: RankingEntry[]
  title: string
  emptyMessage?: string
}

export function RankingBoard({ rankings, title, emptyMessage = '아직 기록이 없습니다' }: RankingBoardProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {rankings.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <div className="text-4xl mb-2">🏆</div>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rankings.map((entry, i) => (
            <RankingCard key={entry.uid} entry={entry} rank={i} />
          ))}
        </div>
      )}
    </div>
  )
}
