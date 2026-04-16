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
      return { error: '오늘은 이미 투표했습니다.' }
    }
    return { error: '투표 중 오류가 발생했습니다.' }
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
