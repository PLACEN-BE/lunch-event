import Link from 'next/link'
import { getCurrentUser } from '@/lib/actions/auth'
import { getTopFortuneMenus } from '@/lib/actions/fortune'
import { getTodayVote } from '@/lib/actions/vote'
import { MenuGrid } from '@/components/vote/MenuGrid'

export default async function HomePage() {
  const [user, topFortuneMenus, todayVote] = await Promise.all([
    getCurrentUser().catch(() => null),
    getTopFortuneMenus(3).catch(() => []),
    getTodayVote().catch(() => null),
  ])

  return (
    <div className="px-4 pt-8 pb-40 space-y-6">
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

      {/* Today Lunch Vote */}
      {user && (
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold">오늘 점심 뭐 먹었어? 🍽️</h2>
            <p className="text-xs text-foreground/40 mt-1">
              {todayVote ? '오늘의 먹픽 완료! 🎉' : '탭해서 먹픽하세요'}
            </p>
          </div>
          <MenuGrid todayVote={todayVote} />
        </section>
      )}

      {/* Top 3 Most Drawn Fortune Menus */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">🔮 인기 운세 메뉴</h2>
          <Link href="/fortune" className="text-xs text-primary font-medium">
            운세 보기 →
          </Link>
        </div>
        {topFortuneMenus.length === 0 ? (
          <div className="text-center py-6 text-foreground/30 bg-white rounded-3xl shadow-sm text-sm">
            아직 운세 기록이 없습니다
          </div>
        ) : (
          <div className="space-y-2">
            {topFortuneMenus.map((item, i) => {
              const medals = ['👑', '🥈', '🥉']
              return (
                <div key={item.menu.name} className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm">
                  <span className="text-xl">{medals[i]}</span>
                  <span className="text-xl">{item.menu.emoji}</span>
                  <span className="font-bold flex-1 truncate">{item.menu.name}</span>
                  <span className="text-primary font-bold">{item.count}회</span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
