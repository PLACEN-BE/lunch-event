'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import './event.css'

const weeklyData = {
  weekOf: '2026-04-06 ~ 2026-04-10',
  menuVotes: [
    { menu: '한식', emoji: '🍚', count: 35 },
    { menu: '일식', emoji: '🍣', count: 28 },
    { menu: '중식', emoji: '🍜', count: 21 },
    { menu: '양식', emoji: '🍝', count: 15 },
    { menu: '패스트푸드', emoji: '🍔', count: 12 },
    { menu: '샐러드', emoji: '🥗', count: 2 },
  ],
  bestMenu: {
    menu: '한식', emoji: '🍚', count: 35,
    comment: '한식 GOAT 등극 🐐 이왜진 ㅋㅋ 진짜 넘사벽',
  },
  worstMenu: {
    menu: '샐러드', emoji: '🥗', count: 2,
    comment: '장항준적 사고 필요… 스트롱 스트롱 💪',
  },
  mvp: {
    nickname: '치킨 GOAT 🐐', realName: '홍길동',
    topMenu: '치킨', topMenuEmoji: '🍗', count: 5,
    comment: '매일 치킨 알잘딱깔쎈으로 골라먹는 그 분… GOAT 인정 🐐🫡',
  },
}

const menus = [
  { emoji: '🍚', name: '한식' }, { emoji: '🍜', name: '중식' },
  { emoji: '🍝', name: '양식' }, { emoji: '🍣', name: '일식' },
  { emoji: '🍔', name: '패스트푸드' }, { emoji: '🥗', name: '샐러드' },
  { emoji: '🍛', name: '카레/태국' }, { emoji: '🥪', name: '샌드위치' },
  { emoji: '🍱', name: '도시락' }, { emoji: '🤷', name: '기타' },
]

const rainDrops = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  duration: `${0.8 + Math.random() * 0.8}s`,
  delay: `${Math.random()}s`,
}))

const sparkleChars = ['✦', '⭐', '✧', '💛', '🌟', '✨']
const sparkles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  char: sparkleChars[Math.floor(Math.random() * sparkleChars.length)],
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${Math.random() * 2}s`,
}))

const confettiColors = ['#2EBE94', '#4B8BF5', '#f5a623', '#5dd4ac', '#7baaf7', '#f7c948']
const confettiPieces = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
  duration: `${2.5 + Math.random() * 3}s`,
  delay: `${Math.random() * 2}s`,
}))

export default function EventPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [bouncing, setBouncing] = useState<string | null>(null)
  const [view, setView] = useState<'menu' | 'hall'>('menu')
  const [activeTab, setActiveTab] = useState<'best' | 'worst' | 'mvp'>('best')
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [rankShown, setRankShown] = useState([false, false, false])
  const [hpWidths, setHpWidths] = useState([0, 0, 0])
  const [comforted, setComforted] = useState(false)
  const [hearts, setHearts] = useState<{ id: number; left: string; delay: string }[]>([])
  const [mvpActive, setMvpActive] = useState(false)
  const [mvpPhase, setMvpPhase] = useState<'countdown' | 'reveal'>('countdown')
  const [cdVis, setCdVis] = useState({ pre1: false, title: false, pre2: false, count: false })
  const [countNum, setCountNum] = useState(3)
  const [mvpTypedText, setMvpTypedText] = useState('')
  const [mvpTabsVisible, setMvpTabsVisible] = useState(false)
  const [clapEmojis, setClapEmojis] = useState<{ id: number; emoji: string; left: string; top: string; delay: string }[]>([])

  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const todayStr = (() => {
    const now = new Date()
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일 · 탭해서 선택하세요`
  })()

  const showToast = useCallback((msg: string, duration = 1500) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastMsg(msg)
    setToastVisible(true)
    toastTimer.current = setTimeout(() => setToastVisible(false), duration)
  }, [])

  const handleMenuClick = (name: string) => {
    if (selected === name) {
      setSelected(null)
    } else {
      setSelected(name)
      setBouncing(name)
      setTimeout(() => setBouncing(null), 250)
      showToast('알잘딱깔쎈 선택 완료 🎉')
    }
  }

  const initBest = () => {
    const maxCount = weeklyData.menuVotes[0].count
    setRankShown([false, false, false])
    setHpWidths([0, 0, 0])
    weeklyData.menuVotes.slice(1, 4).forEach((v, i) => {
      setTimeout(() => {
        setRankShown(prev => { const n = [...prev]; n[i] = true; return n })
        setHpWidths(prev => { const n = [...prev]; n[i] = Math.round((v.count / maxCount) * 100); return n })
      }, (i + 1) * 200)
    })
  }

  const handleGoClick = () => {
    if (!selected) { showToast('밥은 먹고 다녀야지… 이왜진 🥺'); return }
    setView('hall')
    setTimeout(initBest, 50)
  }

  const handleTabClick = (tab: 'best' | 'worst' | 'mvp') => {
    setActiveTab(tab)
    if (tab === 'best') { setMvpActive(false); setTimeout(initBest, 50) }
    else if (tab === 'worst') { setMvpActive(false) }
    else { startMvp() }
  }

  const startMvp = () => {
    setMvpActive(true)
    setMvpPhase('countdown')
    setMvpTabsVisible(false)
    setCdVis({ pre1: false, title: false, pre2: false, count: false })
    setCountNum(3)
    setMvpTypedText('')

    setTimeout(() => setCdVis(p => ({ ...p, pre1: true })), 100)
    setTimeout(() => setCdVis(p => ({ ...p, title: true })), 500)
    setTimeout(() => setCdVis(p => ({ ...p, pre2: true })), 900)
    setTimeout(() => {
      setCdVis(p => ({ ...p, count: true }))
      setCountNum(3)
      setTimeout(() => setCountNum(2), 500)
      setTimeout(() => setCountNum(1), 1000)
      setTimeout(() => {
        setMvpPhase('reveal')
        setMvpTabsVisible(true)
      }, 1500)
    }, 1300)
  }

  useEffect(() => {
    if (mvpPhase !== 'reveal') return
    const text = weeklyData.mvp.comment
    let i = 0
    setMvpTypedText('')
    const interval = setInterval(() => {
      i++
      setMvpTypedText(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, 60)
    return () => clearInterval(interval)
  }, [mvpPhase])

  const handleComfort = () => {
    setComforted(true)
    const newHearts = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      left: `${30 + Math.random() * 40}%`,
      delay: `${i * 0.1}s`,
    }))
    setHearts(newHearts)
    setTimeout(() => setHearts([]), 1400)
    showToast('중꺽마! 꺾이지 않는 마음으로 다음 주 🌈')
  }

  const handleClap = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const emojis = ['👏', '🎉', '🥳', '🎊', '💐', '🙌', '❤️', '👏', '🎉', '✨', '💖', '🎶']
    const newClaps = emojis.map((emoji, i) => ({
      id: Date.now() + i,
      emoji,
      left: `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 100}px`,
      top: `${rect.top - 10}px`,
      delay: `${i * 0.05}s`,
    }))
    setClapEmojis(prev => [...prev, ...newClaps])
    setTimeout(() => setClapEmojis(prev => prev.filter(c => !newClaps.some(n => n.id === c.id))), 1100)
    showToast(`${weeklyData.mvp.realName}님 장항준적 감동 ㅠㅠ 스트롱💪🥹`)
  }

  const handleMvpTabClick = (target: string) => {
    if (target === 'mvp') return
    setMvpActive(false)
    setActiveTab(target as 'best' | 'worst')
    if (target === 'best') setTimeout(initBest, 50)
  }

  const best = weeklyData.bestMenu
  const worst = weeklyData.worstMenu
  const mvp = weeklyData.mvp
  const votes = weeklyData.menuVotes
  const medals = ['', '', '🥈', '🥉']
  const comments = ['', '', '킹받네 진심… 1위 바로 코앞인데 😤', '중꺽마 💪 다음 주 가보자고']

  return (
    <div className="event-page">
      {/* Header */}
      <div className="ev-header">
        <div className="ev-header-logo">
          <span>place</span><span className="ev-amp">&amp;</span>
        </div>
        <div className="ev-header-greeting">오늘 뭐 먹을까? 👋</div>
      </div>

      {/* Menu Select */}
      {view === 'menu' && (
        <div className="ev-menu-select">
          <div className="ev-section-title">
            오늘 점심<br /><span className="ev-highlight">뭐 먹었어?</span> 🍽️
          </div>
          <div className="ev-section-subtitle">{todayStr}</div>
          <div className="ev-menu-grid">
            {menus.map((m) => (
              <div
                key={m.name}
                className={`ev-menu-card${selected === m.name ? ' selected' : ''}${bouncing === m.name ? ' bounce' : ''}`}
                onClick={() => handleMenuClick(m.name)}
              >
                <span className="ev-emoji">{m.emoji}</span>
                <span className="ev-name">{m.name}</span>
              </div>
            ))}
          </div>
          <div className="ev-bottom-nav">
            <button className="ev-btn-go" onClick={handleGoClick}>
              명예의 전당 보기 🏆
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`ev-toast${toastVisible ? ' show' : ''}`}>{toastMsg}</div>

      {/* Hall of Fame */}
      {view === 'hall' && (
        <div className="ev-hall-of-fame">
          <div className="ev-hall-tabs">
            {(['best', 'worst', 'mvp'] as const).map((t) => (
              <div
                key={t}
                className={`ev-hall-tab${activeTab === t ? ' active' : ''}`}
                onClick={() => handleTabClick(t)}
              >
                {t === 'best' ? '🏆 Best' : t === 'worst' ? '😢 Worst' : '🎖️ MVP'}
              </div>
            ))}
          </div>

          {/* Best */}
          {activeTab === 'best' && (
            <div className="ev-best-section">
              <div className="ev-best-label">🏆 이번 주 HIGH SCORE</div>
              <div className="ev-best-card">
                <div className="ev-glow" />
                <div className="ev-crown">👑</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/event/lucky.png" alt="럭키 1등" className="ev-best-img" />
                <div className="ev-best-rank">🥇 1위: {best.menu} ({best.count}표)</div>
                <div className="ev-best-comment">&ldquo;{best.comment}&rdquo;</div>
              </div>
              <div className="ev-rank-list">
                {votes.slice(1, 4).map((v, i) => {
                  const barClass = i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze'
                  return (
                    <div key={v.menu} className={`ev-rank-item${rankShown[i] ? ' show' : ''}`}>
                      <span className="ev-medal">{medals[i + 2]}</span>
                      <div className="ev-info">
                        <div className="ev-menu-name">{v.emoji} {v.menu}</div>
                        <div className="ev-hp-bar">
                          <div className={`ev-hp-bar-fill ${barClass}`} style={{ width: `${hpWidths[i]}%` }} />
                        </div>
                        <div className="ev-menu-comment">{comments[i + 2] || ''}</div>
                      </div>
                      <span className="ev-count">{v.count}표</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Worst */}
          {activeTab === 'worst' && (
            <div className={`ev-worst-section${comforted ? ' comforted' : ''}`}>
              <div className="ev-worst-label">😢 이번 주 WORST</div>
              <div className="ev-worst-card">
                <div className="ev-rain-container">
                  {rainDrops.map((d) => (
                    <div
                      key={d.id}
                      className="ev-raindrop"
                      style={{ left: d.left, animationDuration: d.duration, animationDelay: d.delay }}
                    />
                  ))}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/event/sad.gif" alt="슬픈 짤" className="ev-worst-gif" />
                <div className="ev-worst-rank">📉 꼴찌: {worst.menu} ({worst.count}표)</div>
                <div className="ev-worst-comment">&ldquo;{worst.comment}&rdquo;</div>
                <div className="ev-rainbow">🌈✨💖</div>
                {hearts.map((h) => (
                  <div
                    key={h.id}
                    className="ev-heart-burst"
                    style={{ left: h.left, top: '40%', animationDelay: h.delay }}
                  >
                    💖
                  </div>
                ))}
              </div>
              <button
                className={`ev-btn-comfort${comforted ? ' comforted' : ''}`}
                onClick={handleComfort}
              >
                {comforted ? '스트롱 스트롱💪 고마워 🥹' : '간바레! 힘내 💌'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* MVP Overlay */}
      {mvpActive && (
        <div className="ev-mvp-section">
          {mvpTabsVisible && (
            <div className="ev-mvp-tabs">
              {(['best', 'worst', 'mvp'] as const).map((t) => (
                <div
                  key={t}
                  className={`ev-mvp-tab${t === 'mvp' ? ' active' : ''}`}
                  onClick={() => handleMvpTabClick(t)}
                >
                  {t === 'best' ? '🏆 Best' : t === 'worst' ? '😢 Worst' : '🎖️ MVP'}
                </div>
              ))}
            </div>
          )}

          {mvpPhase === 'countdown' && (
            <div className="ev-mvp-countdown">
              <div className="ev-pre" style={{ opacity: cdVis.pre1 ? 1 : 0 }}>이번 주의</div>
              <div className="ev-mvp-title" style={{ opacity: cdVis.title ? 1 : 0 }}>M V P</div>
              <div className="ev-pre" style={{ opacity: cdVis.pre2 ? 1 : 0 }}>발표합니다!</div>
              <div className="ev-count-num" style={{ opacity: cdVis.count ? 1 : 0 }}>{countNum}</div>
            </div>
          )}

          {mvpPhase === 'reveal' && (
            <div className="ev-mvp-reveal show">
              <div className="ev-sparkle-bg">
                {sparkles.map((s) => (
                  <div key={s.id} className="ev-sparkle" style={{ left: s.left, top: s.top, animationDelay: s.delay }}>
                    {s.char}
                  </div>
                ))}
              </div>
              <div className="ev-confetti-container">
                {confettiPieces.map((p) => (
                  <div
                    key={p.id}
                    className="ev-confetti-piece"
                    style={{ left: p.left, background: p.color, animationDuration: p.duration, animationDelay: p.delay }}
                  />
                ))}
              </div>
              <div className="ev-mvp-congrats">🎉 홀리몰리!! 이왜진!!</div>
              <div className="ev-mvp-profile">
                <span className="ev-crown-top">👑</span>
                👤
              </div>
              <div className="ev-mvp-badge">🎖️ 이번 주 MVP</div>
              <div className="ev-mvp-name-card">
                <div className="ev-mvp-title-text">&ldquo;{mvp.nickname}&rdquo;</div>
                <div className="ev-mvp-name">{mvp.realName} 님!!</div>
              </div>
              <div className="ev-mvp-stat">{mvp.topMenuEmoji} {mvp.topMenu} {mvp.count}회 선택 (압도적)</div>
              <div className="ev-mvp-comment">{mvpTypedText}</div>
              <div className="ev-mvp-actions">
                <button className="ev-btn-clap" onClick={handleClap}>GOAT 인정 🐐</button>
                <button className="ev-btn-capture" onClick={() => showToast('스크린샷을 찍어주세요! 📸')}>
                  캡처하기 📸
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clap emojis (portal-like, fixed position) */}
      {clapEmojis.map((c) => (
        <div
          key={c.id}
          className="ev-clap-emoji"
          style={{ left: c.left, top: c.top, animationDelay: c.delay }}
        >
          {c.emoji}
        </div>
      ))}
    </div>
  )
}
