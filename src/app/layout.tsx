import type { Metadata } from 'next'
import { BottomNav } from '@/components/ui/BottomNav'
import './globals.css'

export const metadata: Metadata = {
  title: 'lunch event - 오늘 누가 쏠까?',
  description: '사내 점심 복불복 게임 + 한턱 히스토리 명예의 전당',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <main className="max-w-md mx-auto min-h-dvh pb-20">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
