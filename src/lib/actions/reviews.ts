'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import { REVIEW_TAGS, type Review } from '@/types'

export async function listReviews(restaurantId: string): Promise<Review[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:users(nickname, avatar_url)')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('listReviews error:', error.message)
    return []
  }
  return (data as Review[]) ?? []
}

export async function createReview(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const restaurantId = String(formData.get('restaurantId') ?? '')
  const rating = Number(formData.get('rating'))
  const body = String(formData.get('body') ?? '').trim()
  const tags = formData
    .getAll('tags')
    .map(String)
    .filter((t) => (REVIEW_TAGS as readonly string[]).includes(t))
    .slice(0, 5)

  if (!restaurantId) return { error: '식당 정보가 없습니다.' }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: '별점을 선택해주세요.' }
  }
  if (body.length < 1 || body.length > 1000) {
    return { error: '리뷰는 1~1000자입니다.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('reviews').insert({
    restaurant_id: restaurantId,
    user_id: user.id,
    rating,
    body,
    tags,
  })

  if (error) {
    console.error('createReview error:', error.message)
    return { error: '저장 실패: ' + error.message }
  }

  revalidatePath(`/place/${restaurantId}`)
  return { success: true }
}

export async function updateReview(
  reviewId: string,
  restaurantId: string,
  input: { rating: number; body: string; tags: string[] }
) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const rating = Number(input.rating)
  const body = (input.body ?? '').trim()
  const tags = (input.tags ?? [])
    .map(String)
    .filter((t) => (REVIEW_TAGS as readonly string[]).includes(t))
    .slice(0, 5)

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: '별점을 선택해주세요.' }
  }
  if (body.length < 1 || body.length > 1000) {
    return { error: '리뷰는 1~1000자입니다.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('reviews')
    .update({ rating, body, tags })
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    console.error('updateReview error:', error.message)
    return { error: '수정 실패: ' + error.message }
  }

  revalidatePath(`/place/${restaurantId}`)
  return { success: true }
}

export async function deleteReview(reviewId: string, restaurantId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    console.error('deleteReview error:', error.message)
    return { error: error.message }
  }

  revalidatePath(`/place/${restaurantId}`)
  return { success: true }
}
