/**
 * crypto.getRandomValues 기반 공정한 랜덤 뽑기 엔진
 */
function secureRandomIndex(max: number): number {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] % max
}

/**
 * Fisher-Yates shuffle with CSPRNG
 */
function secureShuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * N명 중 M명을 공정하게 뽑기
 */
export function pickWinners(participants: string[], pickCount: number): string[] {
  if (pickCount >= participants.length) return [...participants]
  if (pickCount <= 0) return []
  const shuffled = secureShuffle(participants)
  return shuffled.slice(0, pickCount)
}

/**
 * 사다리 경로 생성 — 각 참여자에게 랜덤 목적지 할당
 */
export function generateLadderPaths(count: number): number[] {
  const destinations = Array.from({ length: count }, (_, i) => i)
  return secureShuffle(destinations)
}
