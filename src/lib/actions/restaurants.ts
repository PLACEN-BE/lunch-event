'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import type { Restaurant } from '@/types'

// 이름·주소 비교용 정규화: 모든 공백 제거 + 소문자.
// "판교 김밥천국" === "판교김밥천국", "경기 성남시" === "경기성남시" 로 취급.
function normalizeKey(s: string | null | undefined): string {
  return (s ?? '').replace(/\s+/g, '').toLowerCase()
}

export interface GeocodeResult {
  lat: number
  lng: number
  displayName: string
}

export interface PlaceSearchResult {
  name: string         // 상호명 (Nominatim은 주소에서 추출)
  address: string      // 도로명/지번 주소 (있으면 도로명 우선)
  lat: number
  lng: number
  source: 'kakao' | 'nominatim'
  categoryGroup?: string | null  // 음식점/카페 등 (broad)
  categoryName?: string | null   // "음식점 > 한식 > 김밥" (세분)
}

/**
 * 상호명/주소 통합 검색.
 * - KAKAO_REST_API_KEY 환경변수가 있으면 카카오 로컬(키워드) 검색을 사용 — 한국 POI에 강함
 * - 없으면 Nominatim(OSM)으로 fallback — 주소만 잘 됨, 상호명은 약함
 */
export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const q = query.trim()
  if (!q) return []

  const kakaoKey = process.env.KAKAO_REST_API_KEY
  if (kakaoKey) {
    try {
      const url =
        'https://dapi.kakao.com/v2/local/search/keyword.json' +
        `?query=${encodeURIComponent(q)}&size=10`
      const res = await fetch(url, {
        headers: { Authorization: `KakaoAK ${kakaoKey}` },
        cache: 'no-store',
      })
      if (res.ok) {
        const json = (await res.json()) as {
          documents: Array<{
            place_name: string
            road_address_name?: string
            address_name?: string
            x: string
            y: string
            category_group_name?: string
            category_name?: string
          }>
        }
        return (json.documents ?? []).map((d) => ({
          name: d.place_name,
          address: d.road_address_name?.trim() || d.address_name || '',
          lat: parseFloat(d.y),
          lng: parseFloat(d.x),
          categoryGroup: d.category_group_name ?? null,
          categoryName: d.category_name ?? null,
          source: 'kakao' as const,
        }))
      }
      console.error('kakao search failed:', res.status)
    } catch (e) {
      console.error('kakao search error:', e)
    }
  }

  // Fallback: Nominatim (한국 상호 검색은 약함, 주소는 잘 됨)
  try {
    const url =
      'https://nominatim.openstreetmap.org/search' +
      `?q=${encodeURIComponent(q)}` +
      '&format=json&limit=5&accept-language=ko&countrycodes=kr'
    const res = await fetch(url, {
      headers: { 'User-Agent': 'lunch-event/1.0 (internal lunch review app)' },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const arr = (await res.json()) as Array<{
      lat: string
      lon: string
      display_name: string
      name?: string
    }>
    return arr.map((r) => ({
      name: r.name?.trim() || r.display_name.split(',')[0]?.trim() || q,
      address: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      source: 'nominatim' as const,
    }))
  } catch (e) {
    console.error('nominatim search error:', e)
    return []
  }
}

/**
 * 단순 주소→좌표 변환 (호환용). searchPlaces의 첫 결과를 반환.
 */
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const results = await searchPlaces(query)
  if (results.length === 0) return null
  const r = results[0]
  return { lat: r.lat, lng: r.lng, displayName: r.address || r.name }
}

export async function createRestaurant(input: {
  name: string
  address: string
  category: string | null
  lat: number
  lng: number
}): Promise<
  | { success: true; id: string; duplicate?: boolean }
  | { error: string }
> {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const name = input.name?.trim() ?? ''
  const address = input.address?.trim() ?? ''
  const category = input.category?.trim() || null

  if (name.length < 1 || name.length > 60) return { error: '식당 이름은 1~60자입니다.' }
  if (address.length < 1) return { error: '주소를 입력해주세요.' }
  if (!Number.isFinite(input.lat) || !Number.isFinite(input.lng)) {
    return { error: '주소 검색으로 위치를 먼저 확인해주세요.' }
  }

  const supabase = await createClient()

  // 중복 체크: 모든 후보를 가져와 JS에서 공백 무시 + 소문자 비교.
  // 이름·주소 모두 일치하면 동일 매장으로 판단해 기존 id 반환.
  const { data: candidates } = await supabase
    .from('restaurants')
    .select('id, name, address')

  const targetName = normalizeKey(name)
  const targetAddr = normalizeKey(address)

  const existing = (candidates ?? []).find(
    (r) => normalizeKey(r.name) === targetName && normalizeKey(r.address) === targetAddr,
  )
  if (existing) {
    return { success: true, id: existing.id as string, duplicate: true }
  }

  const { data, error } = await supabase
    .from('restaurants')
    .insert({ name, address, category, lat: input.lat, lng: input.lng })
    .select('id')
    .single()

  if (error) {
    console.error('createRestaurant error:', error.message)
    return { error: '등록 실패: ' + error.message }
  }

  revalidatePath('/place')
  return { success: true, id: data.id as string }
}

export async function deleteRestaurant(
  id: string,
): Promise<{ success: true } | { error: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const supabase = await createClient()
  const { error } = await supabase.from('restaurants').delete().eq('id', id)

  if (error) {
    console.error('deleteRestaurant error:', error.message)
    return { error: '삭제 실패: ' + error.message }
  }

  revalidatePath('/place')
  revalidatePath(`/place/${id}`)
  return { success: true }
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('getRestaurant error:', error.message)
    return null
  }
  return (data as Restaurant) ?? null
}

export async function listRestaurants(): Promise<Restaurant[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('listRestaurants error:', error.message)
    return []
  }
  return (data as Restaurant[]) ?? []
}
