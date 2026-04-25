'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createReview } from '@/lib/actions/reviews'
import StarRating from './StarRating'
import TagPicker from './TagPicker'

interface ReviewFormProps {
  restaurantId: string
  loggedIn: boolean
}

export default function ReviewForm({ restaurantId, loggedIn }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!loggedIn) {
    return (
      <section
        id="review-form"
        className="bg-card rounded-3xl shadow-sm p-6 text-center space-y-3"
      >
        <p className="text-3xl">🔒</p>
        <p className="text-sm text-foreground/60">리뷰를 작성하려면 로그인이 필요해요</p>
        <a
          href="/login"
          className="block w-full py-3 text-sm font-black rounded-2xl bg-primary text-white active:scale-[0.99] transition-transform"
        >
          로그인하고 리뷰 쓰기
        </a>
      </section>
    )
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (rating < 1) {
      setError('별점을 선택해주세요.')
      return
    }
    if (body.trim().length < 1) {
      setError('리뷰 내용을 입력해주세요.')
      return
    }

    const fd = new FormData()
    fd.set('restaurantId', restaurantId)
    fd.set('rating', String(rating))
    fd.set('body', body)
    tags.forEach((t) => fd.append('tags', t))

    startTransition(async () => {
      const res = await createReview(fd)
      if (res?.error) {
        setError(res.error)
        return
      }
      setBody('')
      setTags([])
      setRating(0)
      router.refresh()
    })
  }

  return (
    <form
      id="review-form"
      onSubmit={onSubmit}
      className="bg-card rounded-3xl shadow-sm p-5 space-y-4 scroll-mt-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black">✍️ 리뷰 쓰기</h2>
        <StarRating value={rating} onChange={setRating} size={28} />
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={1000}
        placeholder="이 식당은 어땠나요?"
        className="w-full text-sm bg-background rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <p className="text-[11px] text-foreground/30 text-right -mt-2">{body.length}/1000</p>

      <TagPicker selected={tags} onChange={setTags} />

      {error && <p className="text-xs text-warning text-center">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 text-sm font-black rounded-2xl bg-primary text-white active:scale-[0.99] transition-transform disabled:opacity-50"
      >
        {pending ? '저장 중...' : '리뷰 등록'}
      </button>
    </form>
  )
}
