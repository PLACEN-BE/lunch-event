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
 * 사다리 경로 생성 — 각 참여자에게 랜덤 목적지 할당 (레거시, 카드플립 호환용)
 */
export function generateLadderPaths(count: number): number[] {
  const destinations = Array.from({ length: count }, (_, i) => i)
  return secureShuffle(destinations)
}

/**
 * 사다리 Bridge / Point 타입
 */
export interface Bridge { col: number; row: number }
export interface Point { x: number; y: number }

/**
 * 사다리 가로 다리(Bridge) 랜덤 생성
 * 동일 row에서 인접 bridge 겹침 방지 (col과 col+1이 동시에 bridge이면 경로 교차)
 */
export function generateBridges(count: number, rows: number): Bridge[] {
  const bridges: Bridge[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < count - 1; col++) {
      // 이전 col에 이미 bridge가 있으면 스킵 (인접 겹침 방지)
      if (bridges.length > 0) {
        const last = bridges[bridges.length - 1]
        if (last.row === row && last.col === col - 1) continue
      }
      if (secureRandomIndex(100) < 50) {
        bridges.push({ col, row })
      }
    }
  }
  return bridges
}

/**
 * 사다리 경로 추적 — Bridge 기반 결정적 알고리즘
 * startCol에서 출발하여 bridge를 만나면 좌/우 이동, 최종 도착 col 반환
 * 반환: Point[] (캔버스 좌표 변환 전의 논리 좌표)
 */
export function traceLadderPath(
  startCol: number,
  bridges: Bridge[],
  rows: number,
): Point[] {
  const bridgeSet = new Set<string>()
  bridges.forEach((b) => bridgeSet.add(`${b.col},${b.row}`))

  const points: Point[] = []
  let col = startCol

  // 시작점
  points.push({ x: col, y: -1 })

  for (let row = 0; row < rows; row++) {
    // 세로 이동
    points.push({ x: col, y: row })

    // 오른쪽 bridge
    if (bridgeSet.has(`${col},${row}`)) {
      col += 1
      points.push({ x: col, y: row })
    }
    // 왼쪽 bridge
    else if (col > 0 && bridgeSet.has(`${col - 1},${row}`)) {
      col -= 1
      points.push({ x: col, y: row })
    }
  }

  // 도착점
  points.push({ x: col, y: rows })
  return points
}
