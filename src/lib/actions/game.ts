'use server'

import { createClient } from '@/lib/supabase/server'
import type { GameMode } from '@/types'

export async function saveGameResult(
  gameMode: GameMode,
  participantNames: string[],
  winnerNames: string[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  // Create event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({ game_mode: gameMode, created_by: user.id })
    .select('id')
    .single()

  if (eventError || !event) {
    return { error: '게임 결과 저장에 실패했습니다.' }
  }

  // Get user records for participants (match by nickname)
  const { data: users } = await supabase
    .from('users')
    .select('id, nickname')

  const userMap = new Map(users?.map((u) => [u.nickname, u.id]) ?? [])

  // Create participant records
  const participants = participantNames.map((name) => ({
    event_id: event.id,
    user_id: userMap.get(name) ?? user.id,
    is_payer: winnerNames.includes(name),
  }))

  const { error: partError } = await supabase
    .from('event_participants')
    .insert(participants)

  if (partError) {
    return { error: '참여자 저장에 실패했습니다.' }
  }

  return { success: true, eventId: event.id }
}
