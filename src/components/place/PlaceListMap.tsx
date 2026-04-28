'use client'

import dynamic from 'next/dynamic'
import type { MapItem } from './PlaceListMap.client'

const PlaceListMapClient = dynamic(() => import('./PlaceListMap.client'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 bg-gray-100 animate-pulse flex items-center justify-center text-xs text-gray-400">
      지도 불러오는 중...
    </div>
  ),
})

interface Props {
  items: MapItem[]
}

export default function PlaceListMap({ items }: Props) {
  return <PlaceListMapClient items={items} />
}
