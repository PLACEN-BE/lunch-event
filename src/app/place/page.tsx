import Link from 'next/link'
import { listRestaurants } from '@/lib/actions/restaurants'
import { MENU_CATEGORIES } from '@/types'
import PlaceListMap from '@/components/place/PlaceListMap'
import PlaceListPanel from '@/components/place/PlaceListPanel'

const emojiByName = new Map<string, string>(
  MENU_CATEGORIES.map((c) => [c.name, c.emoji])
)

export default async function PlaceListPage() {
  const restaurants = await listRestaurants()
  const mapItems = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    lat: r.lat,
    lng: r.lng,
    category: r.category,
    emoji: r.category ? emojiByName.get(r.category) ?? '🍽️' : '🍽️',
  }))
  const panelItems = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    address: r.address,
    category: r.category,
    emoji: r.category ? emojiByName.get(r.category) ?? '🍽️' : '🍽️',
    lat: r.lat,
    lng: r.lng,
    created_at: r.created_at,
  }))

  return (
    <div className="px-4 pt-6 pb-40 space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black">🍱 맛집 리뷰</h1>
          <p className="text-foreground/50 text-sm mt-1">
            지도에서 마커를 눌러 후기를 확인해보세요
          </p>
        </div>
        <Link
          href="/place/new"
          className="px-4 py-2 text-xs font-black rounded-full bg-primary text-white shadow-sm shadow-primary/20"
        >
          ➕ 등록
        </Link>
      </div>

      {restaurants.length > 0 && <PlaceListMap items={mapItems} />}

      {restaurants.length === 0 ? (
        <div className="bg-card rounded-3xl shadow-sm p-8 text-center text-sm text-foreground/40">
          아직 등록된 맛집이 없어요. 첫 맛집을 등록해보세요!
        </div>
      ) : (
        <PlaceListPanel
          items={panelItems}
          categories={MENU_CATEGORIES.map((c) => ({ name: c.name, emoji: c.emoji }))}
        />
      )}
    </div>
  )
}
