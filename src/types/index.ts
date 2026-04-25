export interface User {
  id: string
  user_id: string
  nickname: string
  avatar_url?: string | null
  created_at: string
}

export interface LunchEvent {
  id: string
  game_mode: 'card_flip' | 'ladder'
  created_by: string
  created_at: string
}

export interface EventParticipant {
  id: string
  event_id: string
  user_id: string
  is_payer: boolean
  created_at: string
}

export interface RankingEntry {
  nickname: string
  login_id: string
  uid: string
  treat_count: number
  avatar_url?: string | null
}

export type GameMode = 'card_flip' | 'ladder'

export interface MenuItem {
  id: string
  name: string
  weight: number
}

export type MenuGameMode = 'roulette' | 'slot'

export interface MenuVoteEntry {
  menu_category: string
  vote_count: number
}

export interface MenuMvpEntry {
  nickname: string
  login_id: string
  uid: string
  avatar_url?: string | null
  menu_category: string
  pick_count: number
}

export const MENU_CATEGORIES = [
  { emoji: '🍚', name: '한식' },
  { emoji: '🍜', name: '중식' },
  { emoji: '🍝', name: '양식' },
  { emoji: '🍣', name: '일식' },
  { emoji: '🍔', name: '패스트푸드' },
  { emoji: '🥗', name: '샐러드' },
  { emoji: '🍛', name: '아시안' },
  { emoji: '🥪', name: '샌드위치' },
  { emoji: '🍱', name: '도시락' },
  { emoji: '🤷', name: '기타' },
] as const

export interface Restaurant {
  id: string
  name: string
  address: string | null
  category: string | null
  lat: number
  lng: number
  created_at: string
}

export interface Review {
  id: string
  restaurant_id: string
  user_id: string
  rating: number
  body: string
  tags: string[]
  created_at: string
  user?: Pick<User, 'nickname' | 'avatar_url'> | null
}

// 카카오 category_name 토큰 → 우리 MENU_CATEGORIES 이름 매핑
export const KAKAO_CATEGORY_MAP: Record<string, string> = {
  한식: '한식',
  분식: '한식',
  중식: '중식',
  중국집: '중식',
  양식: '양식',
  피자: '양식',
  파스타: '양식',
  스테이크: '양식',
  일식: '일식',
  초밥: '일식',
  라멘: '일식',
  돈까스: '일식',
  패스트푸드: '패스트푸드',
  치킨: '패스트푸드',
  버거: '패스트푸드',
  샐러드: '샐러드',
  샌드위치: '샌드위치',
  도시락: '도시락',
  아시아음식: '아시안',
  태국음식: '아시안',
  베트남음식: '아시안',
  인도음식: '아시안',
}

export function inferCategoryFromKakao(categoryName?: string | null): string | null {
  if (!categoryName) return null
  const tokens = categoryName.split('>').map((s) => s.trim()).filter(Boolean)
  for (const t of tokens.slice(1)) {
    if (KAKAO_CATEGORY_MAP[t]) return KAKAO_CATEGORY_MAP[t]
  }
  return null
}

export const REVIEW_TAGS = [
  '찐맛집',         // (진짜 맛집)
  '혜자각',         // (가성비)
  '사장님갑',       // (사장님 인성/친절)
  '위생ㅇㅈ',       // (깔끔)
  '또간집',         // (재방문 의향)
  '양심맛집',       // (양 많음)
  '감성지존',       // (분위기)
  '혼밥성지',       // (혼밥 OK)
] as const

export interface GameState {
  participants: string[]
  pickCount: number
  gameMode: GameMode
  winners: string[]
  isPlaying: boolean
  isRevealed: boolean
  setParticipants: (p: string[]) => void
  setPickCount: (n: number) => void
  setGameMode: (m: GameMode) => void
  setWinners: (w: string[]) => void
  setIsPlaying: (b: boolean) => void
  setIsRevealed: (b: boolean) => void
  reset: () => void
}
