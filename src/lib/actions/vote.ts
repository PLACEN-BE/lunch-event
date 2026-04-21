'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/actions/auth'
import { revalidatePath } from 'next/cache'
import { MENU_CATEGORIES } from '@/types'

const validCategories: string[] = MENU_CATEGORIES.map(m => m.name)

export async function submitMenuVote(menuCategory: string) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  if (!validCategories.includes(menuCategory)) {
    return { error: '유효하지 않은 메뉴입니다.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('menu_votes')
    .insert({ user_id: user.id, menu_category: menuCategory })

  if (error) {
    if (error.code === '23505') {
      return { error: '오늘은 이미 먹픽했어요.' }
    }
    if (error.code === '23503') {
      return { error: '세션 정보가 유효하지 않습니다. 다시 로그인해주세요.' }
    }
    console.error('submitMenuVote error:', error.code, error.message, error.details)
    return { error: `먹픽 중 오류가 발생했어요. (${error.code ?? 'unknown'})` }
  }

  revalidatePath('/ranking')
  return { success: true }
}

export async function getTodayVote() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('menu_votes')
    .select('menu_category')
    .eq('user_id', user.id)
    .eq('voted_at', today)
    .single()

  return data?.menu_category ?? null
}
