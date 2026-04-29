'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createRestaurant,
  searchPlaces,
  type PlaceSearchResult,
} from '@/lib/actions/restaurants'
import { MENU_CATEGORIES, inferCategoryFromKakao } from '@/types'
import { OFFICE_CENTER } from '@/lib/constants/office'
import { distanceMeters, formatDistance } from '@/lib/utils/distance'
import RegisterMap from './RegisterMap'
import ProofGateModal from './ProofGateModal'

const CATEGORIES = MENU_CATEGORIES
const GATE_AGREED_KEY = 'lunch_event:place_proof_gate_agreed_v1'

function hasAgreedBefore() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(GATE_AGREED_KEY) === '1'
  } catch {
    return false
  }
}

function markAgreed() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(GATE_AGREED_KEY, '1')
  } catch {
    /* noop */
  }
}

export default function RestaurantForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<string>('')
  const [address, setAddress] = useState('')
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceSearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [usingKakao, setUsingKakao] = useState<boolean | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [searching, startSearch] = useTransition()
  const [submitting, startSubmit] = useTransition()
  const [gateOpen, setGateOpen] = useState(false)

  function onSearch() {
    setError(null)
    setInfo(null)
    if (query.trim().length < 2) {
      setError('상호명 또는 주소를 2자 이상 입력해주세요.')
      return
    }
    startSearch(async () => {
      const arr = await searchPlaces(query)
      setResults(arr)
      setSearched(true)
      if (arr.length === 0) {
        setUsingKakao(null)
        setError('검색 결과가 없습니다. 다른 키워드로 시도해보세요.')
        return
      }
      setUsingKakao(arr[0].source === 'kakao')
      setInfo('아래 결과에서 등록할 장소를 선택하세요')
    })
  }

  const sortedResults = useMemo(() => {
    return results
      .map((r) => ({
        ...r,
        distanceM: distanceMeters(OFFICE_CENTER, { lat: r.lat, lng: r.lng }),
      }))
      .sort((a, b) => a.distanceM - b.distanceM)
  }, [results])

  function pickResult(r: PlaceSearchResult) {
    setName(r.name)
    setAddress(r.address)
    setPin({ lat: r.lat, lng: r.lng })
    const inferred = inferCategoryFromKakao(r.categoryName)
    if (inferred) setCategory(inferred)
    setInfo('지도에서 핀을 드래그해 위치를 미세 조정할 수 있어요')
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (name.trim().length < 1) {
      setError('식당 이름을 입력해주세요.')
      return
    }
    if (!pin) {
      setError('검색 결과를 선택해 위치를 먼저 확인해주세요.')
      return
    }
    if (hasAgreedBefore()) {
      runCreate()
      return
    }
    setGateOpen(true)
  }

  function runCreate() {
    if (!pin) return
    startSubmit(async () => {
      const res = await createRestaurant({
        name,
        address,
        category: category || null,
        lat: pin.lat,
        lng: pin.lng,
      })
      if ('error' in res) {
        setError(res.error)
        return
      }
      if (res.duplicate) {
        setInfo('이미 등록된 맛집이에요. 기존 매장으로 이동합니다.')
      }
      router.push(`/place/${res.id}`)
    })
  }

  function onGatePass() {
    markAgreed()
    setGateOpen(false)
    runCreate()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* 1. 검색 카드 */}
      <div className="bg-card rounded-3xl shadow-sm p-5 space-y-3">
        <div>
          <p className="text-xs font-bold text-foreground/50 mb-2">1️⃣ 장소 검색</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onSearch()
                }
              }}
              placeholder="상호명 또는 주소 (예: 판교 김밥천국)"
              className="flex-1 text-sm bg-background rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={onSearch}
              disabled={searching}
              className="shrink-0 px-4 text-xs font-bold rounded-2xl bg-foreground text-card disabled:opacity-50"
            >
              {searching ? '...' : '검색'}
            </button>
          </div>
          {usingKakao === false && searched && (
            <p className="text-[11px] text-warning mt-2">
              ⚠️ Kakao 키 미설정 — OSM 폴백 사용 중. 한국 상호명은 결과가 적을 수 있어요.
            </p>
          )}
        </div>

        {sortedResults.length > 0 && (
          <>
            <p className="text-[10px] text-foreground/40">
              🏢 플레이스앤 기준 가까운 순
            </p>
            <ul className="space-y-1 max-h-72 overflow-auto">
              {sortedResults.map((r, i) => {
                const selected = pin?.lat === r.lat && pin?.lng === r.lng
                return (
                  <li key={`${r.lat}-${r.lng}-${i}`}>
                    <button
                      type="button"
                      onClick={() => pickResult(r)}
                      className={`w-full text-left px-3 py-2.5 rounded-2xl transition-colors ${
                        selected ? 'bg-primary/10 ring-1 ring-primary/40' : 'hover:bg-background'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{r.name}</p>
                          <p className="text-[11px] text-foreground/50 truncate mt-0.5">
                            {r.address}
                          </p>
                          {r.categoryGroup && (
                            <p className="text-[10px] text-foreground/30 mt-0.5">
                              {r.categoryGroup}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          🏢 {formatDistance(r.distanceM)}
                        </span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>

      {/* 2. 식당 정보 카드 */}
      <div className="bg-card rounded-3xl shadow-sm p-5 space-y-4">
        <div>
          <p className="text-xs font-bold text-foreground/50 mb-2">2️⃣ 식당 이름</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="검색 결과 선택 시 자동 입력"
            className="w-full text-sm bg-background rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <p className="text-xs font-bold text-foreground/50 mb-2">3️⃣ 주소</p>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="검색 결과 선택 시 자동 입력"
            className="w-full text-sm bg-background rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <p className="text-xs font-bold text-foreground/50 mb-2">
            4️⃣ 카테고리 {category && <span className="text-primary ml-1">· 자동 선택됨</span>}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => {
              const active = category === c.name
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setCategory(active ? '' : c.name)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                    active
                      ? 'bg-primary text-white'
                      : 'bg-background text-foreground/60'
                  }`}
                >
                  {c.emoji} {c.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 3. 위치 미리보기 카드 */}
      <div className="bg-card rounded-3xl shadow-sm p-5 space-y-3">
        <p className="text-xs font-bold text-foreground/50">📍 위치 미리보기</p>
        <RegisterMap
          lat={pin?.lat ?? null}
          lng={pin?.lng ?? null}
          onChange={(lat, lng) => setPin({ lat, lng })}
        />
        {pin && (
          <p className="text-[11px] text-foreground/40">
            좌표 {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
          </p>
        )}
      </div>

      {info && <p className="text-xs text-foreground/50 text-center">{info}</p>}
      {error && <p className="text-xs text-warning text-center">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 text-sm font-black rounded-3xl bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 active:scale-[0.99] transition-transform disabled:opacity-50"
      >
        {submitting ? '등록 중...' : '🍱 맛집 등록하기'}
      </button>

      <ProofGateModal
        open={gateOpen}
        onCancel={() => setGateOpen(false)}
        onPass={onGatePass}
      />
    </form>
  )
}
