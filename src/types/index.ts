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
