import { getMonthlyRanking, getWeeklyMenuRanking, getWeeklyMenuMvp } from '@/lib/actions/ranking'
import { HallOfFame } from '@/components/ranking/HallOfFame'
import { MenuHallOfFame } from '@/components/ranking/MenuHallOfFame'
import { MenuRankingBoard } from '@/components/ranking/MenuRankingBoard'
import { RankingModeToggle } from './RankingModeToggle'

export default async function RankingPage() {
  const [monthly, menuRankings, menuMvp] = await Promise.all([
    getMonthlyRanking(),
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
        treatContent={<HallOfFame rankings={monthly} />}
      />
    </div>
  )
}
