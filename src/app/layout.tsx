import type { Metadata } from 'next'
import Script from 'next/script'
import { BottomNav } from '@/components/ui/BottomNav'
import './globals.css'

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? ''

export const metadata: Metadata = {
  title: 'lunch event - 오늘 누가 쏠까?',
  description: '사내 점심 복불복 게임 + 한턱 히스토리 명예의 전당',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {KAKAO_JS_KEY && (
          <Script
            id="kakao-maps-sdk"
            strategy="afterInteractive"
            src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services`}
          />
        )}
        <main className="max-w-md mx-auto min-h-dvh pb-20">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
