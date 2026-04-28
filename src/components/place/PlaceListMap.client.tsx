'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Map,
  MapMarker,
  CustomOverlayMap,
  useKakaoLoader,
} from 'react-kakao-maps-sdk'

export interface MapItem {
  id: string
  name: string
  lat: number
  lng: number
  category?: string | null
  emoji?: string
}

interface Props {
  items: MapItem[]
}

import { OFFICE_CENTER, OFFICE_LABEL } from '@/lib/constants/office'

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY

export default function PlaceListMapClient({ items }: Props) {
  const router = useRouter()
  const [loading, error] = useKakaoLoader({
    appkey: KAKAO_KEY ?? '',
    libraries: ['services'],
  })
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const mapRef = useRef<kakao.maps.Map | null>(null)

  // 항상 회사 좌표가 중심에 보이도록 setCenter + 적당한 줌
  const applyView = useCallback((map: kakao.maps.Map) => {
    if (typeof window === 'undefined' || !window.kakao?.maps) return
    map.setCenter(
      new window.kakao.maps.LatLng(OFFICE_CENTER.lat, OFFICE_CENTER.lng),
    )
    map.setLevel(4)
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    applyView(mapRef.current)
  }, [applyView, loading, items])

  if (!KAKAO_KEY) {
    return (
      <div className="w-full h-72 bg-amber-50 border-y border-amber-200 flex items-center justify-center text-xs text-amber-700 px-4 text-center">
        지도를 보려면 NEXT_PUBLIC_KAKAO_JS_KEY를 .env.local에 설정해주세요
      </div>
    )
  }

  if (!mounted || loading) {
    return (
      <div className="w-full h-72 bg-gray-100 animate-pulse flex items-center justify-center text-xs text-gray-400">
        지도 불러오는 중...
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-72 bg-red-50 flex items-center justify-center text-xs text-red-500 px-4 text-center">
        지도 로딩 실패: 카카오 키 또는 도메인 설정을 확인해주세요
      </div>
    )
  }

  return (
    <div className="w-full h-72 rounded-3xl overflow-hidden shadow-sm">
      <Map
        center={OFFICE_CENTER}
        level={4}
        style={{ width: '100%', height: '100%' }}
        onCreate={(map) => {
          mapRef.current = map
          applyView(map)
        }}
      >
        {/* 회사 위치 표시 */}
        <CustomOverlayMap position={OFFICE_CENTER} yAnchor={1.1} xAnchor={0.5}>
          <div className="text-[10px] font-black bg-primary text-white px-2.5 py-1 rounded-full shadow whitespace-nowrap">
            🏢 {OFFICE_LABEL}
          </div>
        </CustomOverlayMap>
        {items.map((r) => (
          <MapMarker
            key={r.id}
            position={{ lat: r.lat, lng: r.lng }}
            title={r.name}
            onClick={() => router.push(`/place/${r.id}`)}
          />
        ))}
        {items.map((r) => (
          <CustomOverlayMap
            key={`label-${r.id}`}
            position={{ lat: r.lat, lng: r.lng }}
            yAnchor={2.4}
            xAnchor={0.5}
          >
            <button
              type="button"
              onClick={() => router.push(`/place/${r.id}`)}
              className="text-[10px] font-bold bg-white/95 text-foreground px-2 py-0.5 rounded-full shadow whitespace-nowrap border border-foreground/10 active:scale-95 transition-transform"
            >
              {r.emoji ? `${r.emoji} ` : ''}
              {r.name}
            </button>
          </CustomOverlayMap>
        ))}
      </Map>
    </div>
  )
}
