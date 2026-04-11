import Link from 'next/link'
import { getCurrentUser } from '@/lib/actions/auth'
import { getMonthlyRanking, getRecentEvents } from '@/lib/actions/ranking'

export default async function HomePage() {
  const user = await getCurrentUser()
  const monthlyRanking = await getMonthlyRanking()
  const recentEvents = await getRecentEvents()

  return (
    <div className="px-4 pt-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black">🍽️ lunch event</h1>
        {user && (
          <p className="text-foreground/50 mt-1">
            안녕, <span className="text-foreground font-bold">{user.nickname}</span>! 👋
          </p>
        )}
      </div>

      {/* Quick Start CTA */}
      <Link
        href="/game"
        className="block bg-gradient-to-r from-primary to-secondary rounded-3xl p-6 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
      >
        <div className="text-3xl mb-2">🎲</div>
        <div className="text-xl font-black text-white">오늘 누가 쏠까?</div>
        <div className="text-white/70 text-sm mt-1">게임 시작하기 →</div>
      </Link>

      {/* Recent Games */}
      <section>
        <h2 className="text-lg font-bold mb-3">최근 게임</h2>
        {recentEvents.length === 0 ? (
          <div className="text-center py-8 text-foreground/30 bg-white rounded-3xl shadow-sm">
            <p>아직 게임 기록이 없습니다</p>
            <p className="text-sm mt-1">첫 게임을 시작해보세요!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentEvents.map((event) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const participants = event.event_participants as any[]
              const payers = participants
                ?.filter((p: any) => p.is_payer)
                .map((p: any) => p.users?.nickname ?? p.users?.[0]?.nickname)
                .filter(Boolean)
              const total = participants?.length ?? 0
              const mode = event.game_mode === 'card_flip' ? '🃏 카드플립' : '🪜 사다리'
              const date = new Date(event.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })

              return (
                <div key={event.id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm">
                  <span className="text-sm text-foreground/40">{date}</span>
                  <span className="text-sm">{mode}</span>
                  <span className="flex-1 text-sm text-foreground/60 truncate">
                    {total}명 → {payers.join(', ')}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Top 3 Monthly Ranking */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">🏆 이달의 한턱왕</h2>
          <Link href="/ranking" className="text-xs text-primary font-medium">
            전체보기 →
          </Link>
        </div>
        {monthlyRanking.length === 0 ? (
          <div className="text-center py-6 text-foreground/30 bg-white rounded-3xl shadow-sm text-sm">
            이번 달 기록이 없습니다
          </div>
        ) : (
          <div className="space-y-2">
            {monthlyRanking.slice(0, 3).map((entry, i) => {
              const medals = ['👑', '🥈', '🥉']
              return (
                <div key={entry.uid} className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm">
                  <span className="text-xl">{medals[i]}</span>
                  <span className="font-bold flex-1">{entry.nickname}</span>
                  <span className="text-primary font-bold">{entry.treat_count}회</span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
