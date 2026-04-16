'use server'

import { createClient } from '@/lib/supabase/server'
import type { RankingEntry, MenuVoteEntry, MenuMvpEntry } from '@/types'

export async function getMonthlyRanking(): Promise<RankingEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('monthly_rankings')
    .select('*')
    .limit(10)

  if (error) return []
  return data ?? []
}

export async function getAllTimeRanking(): Promise<RankingEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('alltime_rankings')
    .select('*')
    .limit(10)

  if (error) return []
  return data ?? []
}

export async function getRecentEvents() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('events')
    .select(`
      id,
      game_mode,
      created_at,
      event_participants (
        user_id,
        is_payer,
        users ( nickname )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return data ?? []
}

export async function getWeeklyMenuRanking(): Promise<MenuVoteEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_menu_rankings')
    .select('*')

  if (error) return []
  return data ?? []
}

export async function getMonthlyMenuRanking(): Promise<MenuVoteEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('monthly_menu_rankings')
    .select('*')

  if (error) return []
  return data ?? []
}

export async function getWeeklyMenuMvp(): Promise<MenuMvpEntry | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_menu_mvp')
    .select('*')
    .limit(1)
    .single()

  if (error) return null
  return data ?? null
}
