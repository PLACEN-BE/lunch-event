import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MENU_CATEGORIES } from '@/types'
import { getCurrentUser } from '@/lib/actions/auth'
import { getRestaurant } from '@/lib/actions/restaurants'
import { listReviews } from '@/lib/actions/reviews'
import PlaceMap from '@/components/place/PlaceMap'
import ReviewForm from '@/components/place/ReviewForm'
import ReviewList from '@/components/place/ReviewList'
import DeleteRestaurantButton from '@/components/place/DeleteRestaurantButton'

const emojiByName = new Map<string, string>(
  MENU_CATEGORIES.map((c) => [c.name, c.emoji])
)

export default async function PlacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [restaurant, reviews, currentUser] = await Promise.all([
    getRestaurant(id),
    listReviews(id),
    getCurrentUser(),
  ])

  if (!restaurant) notFound()

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const emoji = restaurant.category ? emojiByName.get(restaurant.category) ?? '🍽️' : '🍽️'

  return (
    <div className="px-4 pt-6 pb-40 space-y-4">
      <Link href="/place" className="text-xs text-foreground/50 inline-flex items-center gap-1">
        ← 맛집 목록
      </Link>

      {/* 지도 + 식당 메타 카드 */}
      <div className="bg-card rounded-3xl shadow-sm overflow-hidden">
        <PlaceMap lat={restaurant.lat} lng={restaurant.lng} name={restaurant.name} />
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black truncate">{restaurant.name}</h1>
              <p className="text-xs text-foreground/50 mt-1">
                {restaurant.category ? `${restaurant.category} · ` : ''}
                {restaurant.address ?? '주소 정보 없음'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-gold text-lg">★</span>
            <span className="font-black text-lg">{avg.toFixed(1)}</span>
            <span className="text-xs text-foreground/40">리뷰 {reviews.length}</span>
            <a
              href="#review-form"
              className="ml-auto px-4 py-2 text-xs font-bold rounded-full bg-primary text-white"
            >
              ✍️ 리뷰 쓰기
            </a>
          </div>
        </div>
      </div>

      <ReviewForm
        restaurantId={restaurant.id}
        loggedIn={currentUser !== null}
      />

      <ReviewList
        reviews={reviews}
        currentUserId={currentUser?.id ?? null}
        restaurantId={restaurant.id}
      />

      {currentUser && (
        <div className="pt-2 flex justify-end">
          <DeleteRestaurantButton
            restaurantId={restaurant.id}
            reviewCount={reviews.length}
          />
        </div>
      )}
    </div>
  )
}
