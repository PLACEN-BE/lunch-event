'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { OFFICE_CENTER } from '@/lib/constants/office'
import { distanceMeters, formatDistance } from '@/lib/utils/distance'

export interface PanelItem {
  id: string
  name: string
  address: string | null
  category: string | null
  emoji: string
  lat: number
  lng: number
  created_at: string
}

interface Props {
  items: PanelItem[]
  /** 카테고리 필터 chip 후보 (전역 카테고리 정의 그대로 전달) */
  categories: { name: string; emoji: string }[]
}

type SortKey = 'distance' | 'recent' | 'name'

export default function PlaceListPanel({ items, categories }: Props) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('distance')

  const enriched = useMemo(
    () =>
      items.map((r) => ({
        ...r,
        distanceM: distanceMeters(OFFICE_CENTER, { lat: r.lat, lng: r.lng }),
      })),
    [items],
  )

  // 카테고리별 카운트
  const categoryCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of items) {
      if (!r.category) continue
      m.set(r.category, (m.get(r.category) ?? 0) + 1)
    }
    return m
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let out = enriched.filter((r) => {
      if (activeCategory && r.category !== activeCategory) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        (r.address ?? '').toLowerCase().includes(q)
      )
    })
    if (sortKey === 'distance') {
      out = [...out].sort((a, b) => a.distanceM - b.distanceM)
    } else if (sortKey === 'name') {
      out = [...out].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    } else {
      out = [...out].sort((a, b) => b.created_at.localeCompare(a.created_at))
    }
    return out
  }, [enriched, query, activeCategory, sortKey])

  const visibleCategories = categories.filter(
    (c) => (categoryCount.get(c.name) ?? 0) > 0,
  )

  return (
    <section className="space-y-3">
      {/* 검색 + 정렬 */}
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름·주소 검색"
          className="flex-1 text-sm bg-card rounded-2xl px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="text-xs font-bold bg-card rounded-2xl px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="distance">거리순</option>
          <option value="recent">최신순</option>
          <option value="name">이름순</option>
        </select>
      </div>

      {/* 카테고리 필터 chip — 가로 스크롤 */}
      {visibleCategories.length > 0 && (
        <div className="-mx-4 px-4 overflow-x-auto">
          <div className="flex gap-1.5 w-max">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === null
                  ? 'bg-primary text-white'
                  : 'bg-card text-foreground/60 shadow-sm'
              }`}
            >
              전체 {items.length}
            </button>
            {visibleCategories.map((c) => {
              const active = activeCategory === c.name
              const cnt = categoryCount.get(c.name) ?? 0
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setActiveCategory(active ? null : c.name)}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-primary text-white'
                      : 'bg-card text-foreground/60 shadow-sm'
                  }`}
                >
                  {c.emoji} {c.name} {cnt}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 결과 개수 */}
      <p className="text-[11px] text-foreground/40 px-1">
        {filtered.length === items.length
          ? `총 ${items.length}곳`
          : `${filtered.length} / ${items.length}곳`}
      </p>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-3xl shadow-sm p-8 text-center text-sm text-foreground/40">
          조건에 맞는 맛집이 없어요
        </div>
      ) : (
        <ul className="bg-card rounded-3xl shadow-sm divide-y divide-foreground/5 overflow-hidden">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link
                href={`/place/${r.id}`}
                className="flex items-center gap-3 px-4 py-3 active:bg-foreground/5 transition-colors"
              >
                <div className="w-10 h-10 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-xl">
                  {r.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm truncate">{r.name}</p>
                  <p className="text-[11px] text-foreground/50 truncate mt-0.5">
                    {r.category ? `${r.category} · ` : ''}
                    {r.address ?? '주소 정보 없음'}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    🏢 {formatDistance(r.distanceM)}
                  </span>
                  <span className="text-foreground/30 text-xs">→</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
