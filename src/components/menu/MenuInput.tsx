'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMenuStore } from '@/stores/menu-store'
import { Input } from '@/components/ui/Input'

const MAX_MENUS = 12

export function MenuInput() {
  const [name, setName] = useState('')
  const isComposing = useRef(false)
  const { menus, addMenu, removeMenu, updateWeight } = useMenuStore()

  function handleAdd() {
    const trimmed = name.trim()
    if (!trimmed || menus.some((m) => m.name === trimmed)) return
    if (menus.length >= MAX_MENUS) return
    addMenu(trimmed)
    setName('')
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onCompositionStart={() => (isComposing.current = true)}
          onCompositionEnd={() => (isComposing.current = false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isComposing.current) {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder="메뉴 이름 입력"
          maxLength={10}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={menus.length >= MAX_MENUS}
          className="shrink-0 w-12 h-12 bg-secondary rounded-2xl text-white text-2xl font-bold hover:bg-secondary/80 transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      <AnimatePresence>
        {menus.map((menu) => (
          <motion.div
            key={menu.id}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm"
          >
            <span className="font-bold text-sm truncate min-w-0 flex-1">
              {menu.name}
            </span>

            {/* 연동 슬라이더 — step="any"로 부드러운 조절 */}
            <input
              type="range"
              min={1}
              max={99}
              step="any"
              value={menu.weight}
              onChange={(e) =>
                updateWeight(menu.id, Number(e.target.value))
              }
              className="w-24 shrink-0 accent-secondary cursor-pointer"
              aria-label={`${menu.name} 확률 조절`}
            />

            <span className="text-xs font-bold text-secondary w-9 text-right tabular-nums shrink-0">
              {Math.round(menu.weight)}%
            </span>

            <button
              type="button"
              onClick={() => removeMenu(menu.id)}
              className="flex items-center justify-center w-9 h-9 text-foreground/25 hover:text-red-500 transition-colors text-sm shrink-0"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {menus.length > 0 && (
        <p className="text-foreground/35 text-xs px-1">
          💡 슬라이더를 움직이면 다른 메뉴가 자동 조절됩니다
        </p>
      )}

      {menus.length >= MAX_MENUS && (
        <p className="text-warning text-xs px-1 font-medium">
          최대 {MAX_MENUS}개까지 추가할 수 있습니다
        </p>
      )}
    </div>
  )
}
