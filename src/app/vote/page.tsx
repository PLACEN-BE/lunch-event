import { getTodayVote } from '@/lib/actions/vote'
import { MenuGrid } from '@/components/vote/MenuGrid'

export default async function VotePage() {
  const todayVote = await getTodayVote()

  const now = new Date()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`

  return (
    <div className="px-4 pt-6 pb-24 space-y-4">
      <div>
        <h1 className="text-2xl font-black">
          오늘 점심<br /><span className="text-primary">뭐 먹었어?</span> 🍽️
        </h1>
        <p className="text-sm text-foreground/40 mt-1">
          {dateStr} · {todayVote ? '오늘의 먹픽 완료! 🎉' : '탭해서 먹픽하세요'}
        </p>
      </div>
      <MenuGrid todayVote={todayVote} />
    </div>
  )
}
