'use client'

import { useEffect, useState } from 'react'
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk'

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 } // 서울시청

interface Props {
  lat: number | null
  lng: number | null
  onChange?: (lat: number, lng: number) => void
}

export default function RegisterMapClient({ lat, lng, onChange }: Props) {
  const [loading, error] = useKakaoLoader({
    appkey: KAKAO_KEY ?? '',
    libraries: ['services'],
  })
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!KAKAO_KEY) {
    return (
      <div className="w-full h-56 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-xs text-amber-700 px-4 text-center">
        지도를 보려면 NEXT_PUBLIC_KAKAO_JS_KEY를 .env.local에 설정해주세요
      </div>
    )
  }

  if (!mounted || loading) {
    return (
      <div className="w-full h-56 bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-xs text-gray-400">
        지도 불러오는 중...
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-56 bg-red-50 rounded-2xl flex items-center justify-center text-xs text-red-500 px-4 text-center">
        지도 로딩 실패: 카카오 키 또는 도메인 설정을 확인해주세요
      </div>
    )
  }

  const hasPin = lat !== null && lng !== null
  const center = hasPin ? { lat, lng } : DEFAULT_CENTER

  return (
    <div className="w-full h-56 rounded-2xl overflow-hidden border border-gray-200">
      <Map
        center={center}
        level={hasPin ? 3 : 8}
        style={{ width: '100%', height: '100%' }}
        isPanto
      >
        {hasPin && (
          <MapMarker
            position={{ lat, lng }}
            draggable={!!onChange}
            onDragEnd={(marker) => {
              if (!onChange) return
              const p = marker.getPosition()
              onChange(p.getLat(), p.getLng())
            }}
          />
        )}
      </Map>
    </div>
  )
}
