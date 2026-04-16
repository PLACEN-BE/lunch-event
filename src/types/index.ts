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
  { emoji: '🍛', name: '카레/태국' },
  { emoji: '🥪', name: '샌드위치' },
  { emoji: '🍱', name: '도시락' },
  { emoji: '🤷', name: '기타' },
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
