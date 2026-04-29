'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRestaurant } from '@/lib/actions/restaurants'

interface Props {
  restaurantId: string
  reviewCount: number
}

export default function DeleteRestaurantButton({ restaurantId, reviewCount }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function onDelete() {
    const msg =
      reviewCount > 0
        ? `이 맛집을 삭제할까요?\n등록된 리뷰 ${reviewCount}개도 함께 삭제됩니다.`
        : '이 맛집을 삭제할까요?'
    if (!confirm(msg)) return

    startTransition(async () => {
      const res = await deleteRestaurant(restaurantId)
      if ('error' in res) {
        alert(res.error)
        return
      }
      router.push('/place')
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="text-[11px] text-foreground/40 hover:text-warning disabled:opacity-50"
    >
      {pending ? '삭제 중...' : '🗑️ 맛집 삭제'}
    </button>
  )
}
