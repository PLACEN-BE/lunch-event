'use client'

import { useEffect, useState } from 'react'
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk'

interface Props {
  lat: number
  lng: number
  name: string
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY

export default function PlaceMapClient({ lat, lng, name }: Props) {
  const [loading, error] = useKakaoLoader({
    appkey: KAKAO_KEY ?? '',
    libraries: ['services'],
  })
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!KAKAO_KEY) {
    return (
      <div className="w-full h-56 bg-amber-50 border-y border-amber-200 flex items-center justify-center text-xs text-amber-700 px-4 text-center">
        지도를 보려면 NEXT_PUBLIC_KAKAO_JS_KEY를 .env.local에 설정해주세요
      </div>
    )
  }

  if (!mounted || loading) {
    return (
      <div className="w-full h-56 bg-gray-100 animate-pulse flex items-center justify-center text-xs text-gray-400">
        지도 불러오는 중...
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-56 bg-red-50 flex items-center justify-center text-xs text-red-500 px-4 text-center">
        지도 로딩 실패: 카카오 키 또는 도메인 설정을 확인해주세요
      </div>
    )
  }

  return (
    <div className="w-full h-56">
      <Map
        center={{ lat, lng }}
        level={3}
        style={{ width: '100%', height: '100%' }}
      >
        <MapMarker position={{ lat, lng }} title={name} />
      </Map>
    </div>
  )
}
