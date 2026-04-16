import { getMonthlyRanking, getAllTimeRanking, getWeeklyMenuRanking, getWeeklyMenuMvp } from '@/lib/actions/ranking'
import { RankingBoard } from '@/components/ranking/RankingBoard'
import { HallOfFame } from '@/components/ranking/HallOfFame'
import { MenuHallOfFame } from '@/components/ranking/MenuHallOfFame'
import { MenuRankingBoard } from '@/components/ranking/MenuRankingBoard'
import { RankingTabs } from './RankingTabs'
import { RankingModeToggle } from './RankingModeToggle'

export default async function RankingPage() {
  const [monthly, allTime, menuRankings, menuMvp] = await Promise.all([
    getMonthlyRanking(),
    getAllTimeRanking(),
    getWeeklyMenuRanking(),
    getWeeklyMenuMvp(),
  ])

  return (
    <div className="px-4 pt-6 pb-24 space-y-6">
      <h1 className="text-2xl font-black">🏆 명예의 전당</h1>
      <RankingModeToggle
        menuContent={
          <div className="space-y-6">
            <MenuHallOfFame rankings={menuRankings} mvp={menuMvp} />
            <MenuRankingBoard rankings={menuRankings} />
          </div>
        }
        treatContent={
          <div className="space-y-6">
            <HallOfFame rankings={monthly} />
            <RankingTabs
              monthly={<RankingBoard rankings={monthly} title="이달의 한턱왕" emptyMessage="이번 달 기록이 없습니다" />}
              allTime={<RankingBoard rankings={allTime} title="역대 한턱왕" emptyMessage="아직 기록이 없습니다" />}
            />
          </div>
        }
      />
    </div>
  )
}
