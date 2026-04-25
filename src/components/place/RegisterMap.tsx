'use client'

import dynamic from 'next/dynamic'

const RegisterMapClient = dynamic(() => import('./RegisterMap.client'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-56 bg-gray-100 animate-pulse flex items-center justify-center text-xs text-gray-400">
      지도 불러오는 중...
    </div>
  ),
})

interface RegisterMapProps {
  lat: number | null
  lng: number | null
  onChange?: (lat: number, lng: number) => void
}

export default function RegisterMap(props: RegisterMapProps) {
  return <RegisterMapClient {...props} />
}
