import Link from 'next/link'
import { listRestaurants } from '@/lib/actions/restaurants'
import { MENU_CATEGORIES } from '@/types'

const emojiByName = new Map<string, string>(
  MENU_CATEGORIES.map((c) => [c.name, c.emoji])
)

export default async function PlaceListPage() {
  const restaurants = await listRestaurants()

  return (
    <div className="px-4 pt-6 pb-40 space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black">🍱 맛집 리뷰</h1>
          <p className="text-foreground/50 text-sm mt-1">
            점심 먹은 곳을 골라 별점·후기를 남겨보세요
          </p>
        </div>
        <Link
          href="/place/new"
          className="px-4 py-2 text-xs font-black rounded-full bg-primary text-white shadow-sm shadow-primary/20"
        >
          ➕ 등록
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <div className="bg-card rounded-3xl shadow-sm p-8 text-center text-sm text-foreground/40">
          아직 등록된 맛집이 없어요. 첫 맛집을 등록해보세요!
        </div>
      ) : (
        <ul className="space-y-2">
          {restaurants.map((r) => {
            const emoji = r.category ? emojiByName.get(r.category) ?? '🍽️' : '🍽️'
            return (
              <li key={r.id}>
                <Link
                  href={`/place/${r.id}`}
                  className="block bg-card rounded-2xl shadow-sm p-4 active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black truncate">{r.name}</p>
                      <p className="text-[11px] text-foreground/50 truncate mt-0.5">
                        {r.category ? `${r.category} · ` : ''}
                        {r.address ?? '주소 정보 없음'}
                      </p>
                    </div>
                    <span className="text-foreground/30">→</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
