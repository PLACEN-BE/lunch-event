import { create } from 'zustand'
import type { GameState } from '@/types'

export const useGameStore = create<GameState>((set) => ({
  participants: [],
  pickCount: 1,
  gameMode: 'card_flip',
  winners: [],
  isPlaying: false,
  isRevealed: false,
  setParticipants: (participants) => set({ participants }),
  setPickCount: (pickCount) => set({ pickCount }),
  setGameMode: (gameMode) => set({ gameMode }),
  setWinners: (winners) => set({ winners }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsRevealed: (isRevealed) => set({ isRevealed }),
  reset: () =>
    set({
      participants: [],
      pickCount: 1,
      gameMode: 'card_flip',
      winners: [],
      isPlaying: false,
      isRevealed: false,
    }),
}))
