import { create } from 'zustand'
import type { MenuItem, MenuGameMode } from '@/types'

interface MenuState {
  menus: MenuItem[]
  gameMode: MenuGameMode
  result: string | null
  isPlaying: boolean
  addMenu: (name: string) => void
  removeMenu: (id: string) => void
  updateWeight: (id: string, pct: number) => void
  setGameMode: (mode: MenuGameMode) => void
  setResult: (result: string | null) => void
  setIsPlaying: (playing: boolean) => void
  reset: () => void
  resetAll: () => void
}

export const useMenuStore = create<MenuState>((set) => ({
  menus: [],
  gameMode: 'roulette',
  result: null,
  isPlaying: false,

  /** 새 메뉴 추가 — 기존 비율을 유지하면서 새 항목에 균등 지분 배분 */
  addMenu: (name) =>
    set((state) => {
      const newCount = state.menus.length + 1
      const newPct = 100 / newCount
      const scale = state.menus.length > 0 ? (100 - newPct) / 100 : 1

      return {
        menus: [
          ...state.menus.map((m) => ({ ...m, weight: m.weight * scale })),
          { id: crypto.randomUUID(), name, weight: newPct },
        ],
      }
    }),

  /** 메뉴 제거 — 남은 항목에 비례 재분배하여 100% 유지 */
  removeMenu: (id) =>
    set((state) => {
      const remaining = state.menus.filter((m) => m.id !== id)
      if (remaining.length === 0) return { menus: [] }
      const total = remaining.reduce((s, m) => s + m.weight, 0)
      return {
        menus: remaining.map((m) => ({
          ...m,
          weight: total > 0 ? (m.weight / total) * 100 : 100 / remaining.length,
        })),
      }
    }),

  /**
   * 가중치 연동 업데이트 — 하나를 조절하면 나머지가 비례 재분배
   * 합계는 항상 정확히 100%
   */
  updateWeight: (id, rawPct) =>
    set((state) => {
      const val = Math.max(1, Math.min(99, rawPct))
      const others = state.menus.filter((m) => m.id !== id)
      const othersSum = others.reduce((s, m) => s + m.weight, 0)
      const remaining = 100 - val

      return {
        menus: state.menus.map((m) => {
          if (m.id === id) return { ...m, weight: val }
          return {
            ...m,
            weight:
              othersSum > 0
                ? (m.weight / othersSum) * remaining
                : remaining / others.length,
          }
        }),
      }
    }),

  setGameMode: (gameMode) => set({ gameMode }),
  setResult: (result) => set({ result }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  reset: () => set({ result: null, isPlaying: false }),
  resetAll: () =>
    set({
      menus: [],
      gameMode: 'roulette',
      result: null,
      isPlaying: false,
    }),
}))
