'use client'

import dynamic from 'next/dynamic'

const PlaceMapClient = dynamic(() => import('./PlaceMap.client'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-56 bg-gray-100 animate-pulse flex items-center justify-center text-xs text-gray-400">
      지도 불러오는 중...
    </div>
  ),
})

interface PlaceMapProps {
  lat: number
  lng: number
  name: string
}

export default function PlaceMap(props: PlaceMapProps) {
  return <PlaceMapClient {...props} />
}
