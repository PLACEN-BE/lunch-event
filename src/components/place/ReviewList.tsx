'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteReview, updateReview } from '@/lib/actions/reviews'
import type { Review } from '@/types'
import StarRating from './StarRating'
import TagPicker from './TagPicker'

interface ReviewListProps {
  reviews: Review[]
  currentUserId: string | null
  restaurantId: string
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}일 전`
  return new Date(iso).toLocaleDateString('ko-KR')
}

export default function ReviewList({ reviews, currentUserId, restaurantId }: ReviewListProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editBody, setEditBody] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [editError, setEditError] = useState<string | null>(null)

  function startEdit(r: Review) {
    setEditingId(r.id)
    setEditRating(r.rating)
    setEditBody(r.body)
    setEditTags([...r.tags])
    setEditError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError(null)
  }

  function saveEdit(reviewId: string) {
    setEditError(null)
    if (editRating < 1) {
      setEditError('별점을 선택해주세요.')
      return
    }
    if (editBody.trim().length < 1) {
      setEditError('리뷰 내용을 입력해주세요.')
      return
    }
    startTransition(async () => {
      const res = await updateReview(reviewId, restaurantId, {
        rating: editRating,
        body: editBody,
        tags: editTags,
      })
      if (res?.error) {
        setEditError(res.error)
        return
      }
      setEditingId(null)
      router.refresh()
    })
  }

  function onDelete(reviewId: string) {
    if (!confirm('이 리뷰를 삭제할까요?')) return
    startTransition(async () => {
      const res = await deleteReview(reviewId, restaurantId)
      if (res?.error) {
        alert(res.error)
        return
      }
      router.refresh()
    })
  }

  if (reviews.length === 0) {
    return (
      <section className="bg-card rounded-3xl shadow-sm p-8 text-center text-sm text-foreground/40">
        아직 리뷰가 없어요. 첫 리뷰를 남겨보세요!
      </section>
    )
  }

  return (
    <section className="space-y-2">
      <h2 className="px-1 text-sm font-bold text-foreground/60">
        리뷰 {reviews.length}
      </h2>
      {reviews.map((r) => {
        const isMine = currentUserId !== null && r.user_id === currentUserId
        const initial = r.user?.nickname?.[0] ?? '?'
        const isEditing = editingId === r.id

        return (
          <article key={r.id} className="bg-card rounded-2xl shadow-sm p-4">
            <header className="flex items-center gap-2 mb-2">
              {r.user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.user.avatar_url}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black">
                  {initial}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{r.user?.nickname ?? '익명'}</p>
                <p className="text-[11px] text-foreground/40">{formatRelative(r.created_at)}</p>
              </div>
              <StarRating
                value={isEditing ? editRating : r.rating}
                onChange={isEditing ? setEditRating : undefined}
                readonly={!isEditing}
                size={isEditing ? 24 : 16}
              />
            </header>

            {isEditing ? (
              <div className="space-y-3 mt-3">
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="w-full text-sm bg-background rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-[11px] text-foreground/30 text-right -mt-2">
                  {editBody.length}/1000
                </p>
                <TagPicker selected={editTags} onChange={setEditTags} />
                {editError && (
                  <p className="text-xs text-warning text-center">{editError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={pending}
                    className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-background text-foreground/60"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => saveEdit(r.id)}
                    disabled={pending}
                    className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-primary text-white disabled:opacity-50"
                  >
                    {pending ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm whitespace-pre-wrap">{r.body}</p>

                {r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {r.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {isMine && (
                  <div className="mt-3 flex gap-3 text-[11px]">
                    <button
                      type="button"
                      onClick={() => startEdit(r)}
                      className="text-foreground/50 hover:text-primary"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(r.id)}
                      disabled={pending}
                      className="text-foreground/50 hover:text-warning disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </>
            )}
          </article>
        )
      })}
    </section>
  )
}
