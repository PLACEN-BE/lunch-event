/**
 * Web Audio API 기반 게임 사운드 유틸리티
 * - 외부 파일 없이 프로그래밍 방식으로 사운드 생성
 * - AudioContext는 사용자 제스처(클릭) 시점에 초기화
 */

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

/** 룰렛 포인터가 섹션을 지날 때 짧은 틱 사운드 */
export function playTick(volume = 0.2) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.frequency.value = 800 + Math.random() * 300
  osc.type = 'sine'
  gain.gain.setValueAtTime(volume, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04)
  osc.start(c.currentTime)
  osc.stop(c.currentTime + 0.05)
}

/** 슬롯머신 릴이 멈출 때 기계적 클릭 */
export function playReelStop() {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.frequency.value = 160
  osc.type = 'square'
  gain.gain.setValueAtTime(0.12, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1)
  osc.start(c.currentTime)
  osc.stop(c.currentTime + 0.12)
}

/** 슬롯머신 회전 중 저주파 윙윙 사운드. 반환된 함수를 호출하면 페이드아웃 */
export function startSpinSound(): () => void {
  const c = getCtx()
  if (!c) return () => {}

  const osc = c.createOscillator()
  const gain = c.createGain()
  const filter = c.createBiquadFilter()

  osc.type = 'sawtooth'
  osc.frequency.value = 120
  filter.type = 'lowpass'
  filter.frequency.value = 350
  filter.Q.value = 2
  gain.gain.value = 0.06

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(c.destination)
  osc.start()

  return () => {
    gain.gain.setValueAtTime(gain.gain.value, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3)
    setTimeout(() => {
      try { osc.stop() } catch { /* already stopped */ }
    }, 400)
  }
}

/** 당첨 축하 사운드 (상승 4음 시퀀스) */
export function playWin() {
  const c = getCtx()
  if (!c) return
  const notes = [523, 659, 784, 1047] // C5 → E5 → G5 → C6
  notes.forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.frequency.value = freq
    osc.type = 'sine'
    gain.gain.setValueAtTime(0, c.currentTime + i * 0.12)
    gain.gain.linearRampToValueAtTime(0.15, c.currentTime + i * 0.12 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.12 + 0.28)
    osc.start(c.currentTime + i * 0.12)
    osc.stop(c.currentTime + i * 0.12 + 0.3)
  })
}

/**
 * 룰렛 스핀 동안 감속하는 틱 스케줄러
 * 처음엔 빠르고 점점 느려져 CSS 이징과 시각적으로 동기화
 * 반환된 함수를 호출하면 즉시 중단
 */
export function scheduleRouletteTicks(durationMs: number): () => void {
  let cancelled = false
  let elapsed = 0

  function tick() {
    if (cancelled || elapsed >= durationMs) return
    const progress = elapsed / durationMs
    playTick(Math.max(0.03, 0.22 * (1 - progress)))
    const interval = 50 + 550 * Math.pow(progress, 1.5)
    elapsed += interval
    setTimeout(tick, interval)
  }

  tick()
  return () => { cancelled = true }
}
