import { getWeeklyMenuRanking, getWeeklyMenuMvp } from '@/lib/actions/ranking'
import { MenuHallOfFame } from '@/components/ranking/MenuHallOfFame'
import { MenuRankingBoard } from '@/components/ranking/MenuRankingBoard'

export default async function RankingPage() {
  const [menuRankings, menuMvp] = await Promise.all([
    getWeeklyMenuRanking(),
    getWeeklyMenuMvp(),
  ])

  return (
    <div className="px-4 pt-6 pb-24 space-y-6">
      <h1 className="text-2xl font-black">🏆 명예의 전당</h1>
      <MenuHallOfFame rankings={menuRankings} mvp={menuMvp} />
      <MenuRankingBoard rankings={menuRankings} />
    </div>
  )
}
