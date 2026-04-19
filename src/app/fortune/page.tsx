import { FortuneCard } from '@/components/fortune/FortuneCard'
import { DailyStats } from '@/components/fortune/DailyStats'
import { getTodayFortuneState, getTodayFortuneStats } from '@/lib/actions/fortune'

export default async function FortunePage() {
  const [state, statsResult] = await Promise.all([
    getTodayFortuneState(),
    getTodayFortuneStats(),
  ])

  return (
    <div className="px-4 pt-6 pb-4 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-black">🔮 오늘의 메뉴 운명</h1>
        <p className="text-foreground/40 text-sm mt-1">
          오늘 점심, 운명에 맡겨보세요
        </p>
      </div>

      <FortuneCard initialState={state} />

      <DailyStats stats={statsResult.stats} total={statsResult.total} />
    </div>
  )
}
