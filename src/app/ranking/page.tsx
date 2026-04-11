import { getMonthlyRanking, getAllTimeRanking } from '@/lib/actions/ranking'
import { RankingBoard } from '@/components/ranking/RankingBoard'
import { RankingTabs } from './RankingTabs'

export default async function RankingPage() {
  const [monthly, allTime] = await Promise.all([
    getMonthlyRanking(),
    getAllTimeRanking(),
  ])

  return (
    <div className="px-4 pt-6 space-y-6">
      <h1 className="text-2xl font-black">🏆 명예의 전당</h1>
      <RankingTabs
        monthly={<RankingBoard rankings={monthly} title="이달의 한턱왕" emptyMessage="이번 달 기록이 없습니다" />}
        allTime={<RankingBoard rankings={allTime} title="역대 한턱왕" emptyMessage="아직 기록이 없습니다" />}
      />
    </div>
  )
}
