import Link from 'next/link'
import { getCurrentUser } from '@/lib/actions/auth'
import RestaurantForm from '@/components/place/RestaurantForm'

export default async function PlaceNewPage() {
  const user = await getCurrentUser()

  return (
    <div className="px-4 pt-6 pb-40 space-y-4">
      <Link href="/place" className="text-xs text-foreground/50 inline-flex items-center gap-1">
        ← 맛집 목록
      </Link>

      <div>
        <h1 className="text-2xl font-black">🍱 맛집 등록</h1>
        <p className="text-foreground/50 text-sm mt-1">
          상호명을 검색해 지도에 위치를 표시하고 등록해주세요
        </p>
      </div>

      {!user ? (
        <div className="bg-card rounded-3xl shadow-sm p-6 text-center space-y-3">
          <p className="text-3xl">🔒</p>
          <p className="text-sm text-foreground/60">맛집 등록은 로그인이 필요해요</p>
          <Link
            href="/login"
            className="block w-full py-3 text-sm font-black rounded-2xl bg-primary text-white active:scale-[0.99] transition-transform"
          >
            로그인하러 가기
          </Link>
        </div>
      ) : (
        <RestaurantForm />
      )}
    </div>
  )
}
