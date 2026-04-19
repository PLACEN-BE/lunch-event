'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { drawFortune, type LunchMenu } from '@/lib/fortune-data'

const SESSION_COOKIE = 'lunch_user_id'
const MAX_DRAWS_PER_DAY = 3

export interface FortuneDrawRecord {
  menu: LunchMenu
  message: string
  score: number
  createdAt: string
  drawIndex: number
}

export interface FortuneState {
  isAuthenticated: boolean
  remainingDraws: number
  draws: FortuneDrawRecord[]
}

export interface DailyFortuneStat {
  menu: LunchMenu
  count: number
  pct: number
}

export interface DailyFortuneStatsResult {
  stats: DailyFortuneStat[]
  total: number
}

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value ?? null
}

async function getKstToday(): Promise<string | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc('kst_today')
  if (error || !data) {
    console.error('kst_today error:', error?.message)
    return null
  }
  return data as string
}

function mapRow(row: {
  menu_name: string
  menu_emoji: string
  menu_category: string
  fortune_message: string
  score: number
  created_at: string
  draw_index: number
}): FortuneDrawRecord {
  return {
    menu: { name: row.menu_name, emoji: row.menu_emoji, category: row.menu_category },
    message: row.fortune_message,
    score: row.score,
    createdAt: row.created_at,
    drawIndex: row.draw_index,
  }
}

export async function getTodayFortuneState(): Promise<FortuneState> {
  const uid = await getUserId()
  if (!uid) {
    return { isAuthenticated: false, remainingDraws: MAX_DRAWS_PER_DAY, draws: [] }
  }

  const today = await getKstToday()
  if (!today) {
    return { isAuthenticated: true, remainingDraws: MAX_DRAWS_PER_DAY, draws: [] }
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('fortune_draws')
    .select('menu_name, menu_emoji, menu_category, fortune_message, score, created_at, draw_index')
    .eq('user_id', uid)
    .eq('draw_date', today)
    .order('draw_index', { ascending: true })

  if (error) {
    console.error('getTodayFortuneState error:', error.message)
    return { isAuthenticated: true, remainingDraws: MAX_DRAWS_PER_DAY, draws: [] }
  }

  const draws = (data ?? []).map(mapRow)

  return {
    isAuthenticated: true,
    remainingDraws: Math.max(0, MAX_DRAWS_PER_DAY - draws.length),
    draws,
  }
}

export type DrawResult =
  | { ok: true; record: FortuneDrawRecord; remainingDraws: number }
  | { ok: false; reason: 'UNAUTHENTICATED' | 'LIMIT_EXCEEDED' | 'SERVER_ERROR'; message: string }

export async function drawFortuneAction(): Promise<DrawResult> {
  const uid = await getUserId()
  if (!uid) {
    return { ok: false, reason: 'UNAUTHENTICATED', message: '로그인 후 이용해 주세요.' }
  }

  const result = drawFortune()

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('fortune_draws')
    .insert({
      user_id: uid,
      menu_name: result.menu.name,
      menu_emoji: result.menu.emoji,
      menu_category: result.menu.category,
      fortune_message: result.message,
      score: result.score,
    })
    .select('menu_name, menu_emoji, menu_category, fortune_message, score, created_at, draw_index')
    .single()

  if (error) {
    const code = (error as { code?: string }).code
    if (code === '45001' || error.message?.includes('FORTUNE_DAILY_LIMIT_EXCEEDED')) {
      return { ok: false, reason: 'LIMIT_EXCEEDED', message: '오늘의 뽑기 횟수를 모두 사용했어요.' }
    }
    console.error('drawFortuneAction insert error:', error.message)
    return { ok: false, reason: 'SERVER_ERROR', message: '운세 저장 중 오류가 발생했습니다.' }
  }

  const record = mapRow(data)

  return {
    ok: true,
    record,
    remainingDraws: Math.max(0, MAX_DRAWS_PER_DAY - record.drawIndex),
  }
}

export async function getTodayFortuneStats(): Promise<DailyFortuneStatsResult> {
  const today = await getKstToday()
  if (!today) return { stats: [], total: 0 }

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('daily_fortune_stats')
    .select('menu_name, menu_emoji, menu_category, draw_count')
    .eq('draw_date', today)

  if (error) {
    console.error('getTodayFortuneStats error:', error.message)
    return { stats: [], total: 0 }
  }

  const rows = data ?? []
  if (rows.length === 0) return { stats: [], total: 0 }

  const total = rows.reduce((s, r) => s + r.draw_count, 0)

  const stats = rows
    .map((row) => ({
      menu: { name: row.menu_name, emoji: row.menu_emoji, category: row.menu_category },
      count: row.draw_count,
      pct: total > 0 ? Math.round((row.draw_count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  return { stats, total }
}
