# ladder-animation Design Document

> **Summary**: 사다리타기 경로 추적 애니메이션 — Option C (Pragmatic Balance) 설계
>
> **Project**: lunch-event
> **Version**: 1.0.0
> **Author**: joohui.lee
> **Date**: 2026-04-11
> **Status**: Draft
> **Planning Doc**: [ladder-animation.plan.md](../../01-plan/features/ladder-animation.plan.md)

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 사다리타기에 "타는" 시각적 경험 부재 + Bridge가 결과에 무관 (공정성 의문) |
| **WHO** | 점심 시간 3~8명 팀원 (모바일 중심) |
| **RISK** | 8명 Canvas 동시 애니메이션 성능 + 좁은 화면 경로 가시성 |
| **SUCCESS** | 재사용률 증가, 애니메이션 완주율 90%+, 경로=결과 인식 |
| **SCOPE** | LadderGame 리팩터링 + game-engine 경로 추적 + page.tsx 연동 |

---

## 1. Overview

### 1.1 Design Goals

- Bridge 기반 경로 추적으로 사다리 결과를 결정 (shuffle 제거)
- requestAnimationFrame 기반 60fps 마커 애니메이션 (5~8초)
- 참가자별 고유 색상 마커 + trail 잔상
- 기존 게임 플로우 (설정 → 애니메이션 → GameResult → 저장) 유지

### 1.2 Design Principles

- 순수 함수 (경로 계산)와 UI (Canvas 렌더링) 분리
- 기존 파일만 수정 — 새 파일 없음
- Canvas 성능 최적화 — 더블 버퍼링 불필요 (단일 Canvas + rAF 충분)

---

## 2. Architecture

### 2.0 Selected: Option C — Pragmatic Balance

| 기준 | 값 |
|------|---|
| 새 파일 | 0 |
| 수정 파일 | 3 |
| LadderGame 크기 | ~200줄 |
| 순수 함수 테스트 | game-engine.ts에서 가능 |

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ src/app/game/ladder/page.tsx                                │
│   ├─ useGameStore() → participants, pickCount               │
│   ├─ <LadderGame                                            │
│   │     participants={...}                                  │
│   │     pickCount={...}                                     │
│   │     onComplete={(winners) => {                          │
│   │       setWinners(winners)                               │
│   │       setIsRevealed(true)                               │
│   │     }}                                                  │
│   │   />                                                    │
│   └─ isRevealed ? <GameResult .../> : <LadderGame .../>     │
│                                                             │
│   ※ pickWinners() 호출 제거                                 │
│   ※ winners는 LadderGame이 bridge 경로로 계산하여 전달       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ src/components/game/LadderGame.tsx (Full Rewrite ~200 lines)│
│                                                             │
│   [State]                                                   │
│   - bridges: Bridge[] (랜덤 생성, 게임당 고정)               │
│   - phase: 'ready' | 'running' | 'done'                    │
│   - progress: number (0~1, 애니메이션 진행도)                │
│                                                             │
│   [Init]                                                    │
│   1. generateBridges(count, ROWS) → Bridge[]                │
│   2. traceLadderPath(col, bridges, ROWS) × count → paths    │
│   3. paths 결과로 winners 계산 (당첨 slot 도착자)             │
│   4. drawStaticLadder(ctx, bridges) — 사다리 구조 그리기      │
│                                                             │
│   [Animation Loop (rAF)]                                    │
│   5. GO! 클릭 → phase = 'running', startTime 기록           │
│   6. 매 프레임:                                              │
│      - elapsed = now - startTime                            │
│      - progress = min(elapsed / TOTAL_DURATION, 1)          │
│      - 각 마커: pathIndex = progress × path.length          │
│      - lerp로 현재 좌표 계산                                 │
│      - Canvas: 사다리 재그리기 + trail + 마커                │
│   7. progress >= 1 → phase = 'done'                        │
│      - 500ms 대기 → 당첨 하이라이트 → confetti              │
│      - onComplete(winners) 호출                              │
│                                                             │
│   [Render]                                                  │
│   - 상단: 참가자 이름 (색상 매칭)                             │
│   - 중앙: <canvas> (사다리 + 마커 + trail)                   │
│   - 하단: 도착 slot (당첨/일반 구분)                          │
│   - GO! 버튼 (phase === 'ready')                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ src/lib/game-engine.ts (기존 + 추가 함수)                    │
│                                                             │
│   [기존 유지]                                                │
│   - secureRandomIndex(), secureShuffle(), pickWinners()     │
│     (카드플립에서 계속 사용)                                  │
│                                                             │
│   [추가]                                                     │
│   - generateBridges(count, rows) → Bridge[]                 │
│     랜덤 bridge 생성 (동일 row에서 인접 bridge 겹침 방지)      │
│                                                             │
│   - traceLadderPath(startCol, bridges, rows) → Point[]      │
│     시작 col에서 아래로 이동, bridge 만나면 좌/우 이동          │
│     반환: [{x, y}, ...] 경로 좌표 배열                       │
│                                                             │
│   [제거 또는 유지]                                            │
│   - generateLadderPaths() — 더 이상 사다리에서 안 쓰지만      │
│     다른 곳에서 import 없으면 제거 가능                        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 경로 추적 알고리즘 상세

```typescript
interface Bridge { col: number; row: number }
interface Point { x: number; y: number }

function traceLadderPath(
  startCol: number,
  bridges: Bridge[],
  rows: number
): Point[] {
  // Bridge를 row별로 인덱싱 (빠른 조회)
  const bridgeMap = new Map<string, boolean>()
  bridges.forEach(b => bridgeMap.set(`${b.col},${b.row}`, true))

  const points: Point[] = []
  let col = startCol

  // 시작점
  points.push({ x: col, y: -1 })  // 이름 아래

  for (let row = 0; row < rows; row++) {
    // 세로 이동 (현재 col에서 row 위치까지)
    points.push({ x: col, y: row })

    // Bridge 체크 — 오른쪽 bridge가 있으면 오른쪽으로
    if (bridgeMap.has(`${col},${row}`)) {
      col += 1
      points.push({ x: col, y: row })  // 수평 이동
    }
    // 왼쪽 bridge가 있으면 왼쪽으로
    else if (col > 0 && bridgeMap.has(`${col - 1},${row}`)) {
      col -= 1
      points.push({ x: col, y: row })  // 수평 이동
    }
  }

  // 도착점
  points.push({ x: col, y: rows })

  return points
}
```

### 2.3 애니메이션 데이터 플로우

```
[GO! Click]
  ↓
[1. paths 이미 계산됨 (Init 단계에서)]
  paths[0] = [{x:0,y:-1}, {x:0,y:0}, {x:1,y:0}, {x:1,y:1}, ...]
  paths[1] = [{x:1,y:-1}, {x:1,y:0}, {x:1,y:1}, {x:0,y:1}, ...]
  ...
  ↓
[2. rAF 루프 시작]
  TOTAL_DURATION = 6000ms (6초)
  매 프레임:
    progress = elapsed / TOTAL_DURATION  (0 ~ 1)
    각 참가자 i:
      segmentIndex = floor(progress × (paths[i].length - 1))
      segmentProgress = frac(progress × (paths[i].length - 1))
      currentX = lerp(paths[i][segmentIndex].x, paths[i][segmentIndex+1].x, segmentProgress)
      currentY = lerp(paths[i][segmentIndex].y, paths[i][segmentIndex+1].y, segmentProgress)
  ↓
[3. Canvas 렌더링 (매 프레임)]
  a. clearRect
  b. drawStaticLadder (세로줄 + bridge)
  c. drawTrails (각 마커의 지나간 경로)
  d. drawMarkers (각 마커 현재 위치의 원형 도트)
  ↓
[4. progress >= 1 → 완료]
  500ms delay → 당첨 slot 하이라이트 → confetti
  → onComplete(winners) 호출
```

### 2.4 색상 팔레트

```typescript
const MARKER_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]
// 3~8명에서 충분한 색상 구분
```

### 2.5 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| LadderGame | game-engine (traceLadderPath, generateBridges) | 경로 계산 |
| LadderGame | canvas-confetti | 결과 confetti 효과 |
| LadderGame | framer-motion | GO! 버튼, 결과 텍스트 애니메이션 |
| page.tsx | LadderGame (onComplete) | 승자 결과 수신 |
| page.tsx | game-store (setWinners) | 상태 업데이트 |

---

## 3. Data Model

타입 변경 없음. 기존 Bridge 인터페이스는 LadderGame 내부에서만 사용.

```typescript
// LadderGame 내부 타입 (기존과 동일)
interface Bridge { col: number; row: number }

// game-engine.ts에서 export
interface Point { x: number; y: number }
```

---

## 4. API Specification

Server Action 변경 없음. 프론트엔드 전용 리팩터링.

### 4.1 game-engine.ts 새 함수 시그니처

| Function | Parameters | Returns | Purpose |
|----------|-----------|---------|---------|
| `generateBridges` | `(count: number, rows: number)` | `Bridge[]` | 랜덤 bridge 생성, 인접 겹침 방지 |
| `traceLadderPath` | `(startCol: number, bridges: Bridge[], rows: number)` | `Point[]` | 시작 col에서 도착까지 경로 좌표 |

### 4.2 LadderGame Props 변경

```typescript
// Before
interface LadderGameProps {
  participants: string[]
  winners: string[]       // ← 외부에서 전달 (제거)
  pickCount: number
  onComplete: () => void  // ← 인자 없음 (변경)
}

// After
interface LadderGameProps {
  participants: string[]
  pickCount: number
  onComplete: (winners: string[]) => void  // ← 승자 배열 전달
}
```

---

## 5. UI/UX Design

### 5.1 사다리 레이아웃

```
┌─────────────────────────────┐
│  🪜 사다리타기               │
├─────────────────────────────┤
│  김대리  박과장  이사원  정팀장│  ← 참가자 이름 (고유 색상)
│  ●       ●       ●       ●  │  ← 마커 시작 위치
│  │       │       │       │  │
│  │───────│       │       │  │  ← bridge (가로줄)
│  │       │       │───────│  │
│  │       │───────│       │  │
│  ●       │       │       │  │  ← 마커 현재 위치 (trail 표시)
│  │       │       │       │  │
│  │───────│       │       │  │
│  │       │       │───────│  │
│  │       │       │       │  │
│  ↓       ↓       ↓       ↓  │  ← 도착 slot
│  💰      ✓       💰      ✓  │  ← 당첨/일반
├─────────────────────────────┤
│       [ 🎲 GO! ]            │  ← 시작 버튼
└─────────────────────────────┘
```

### 5.2 애니메이션 단계

```
Phase 1: ready
  - 사다리 구조 표시 (정적)
  - 참가자 이름 + 마커 시작 위치
  - GO! 버튼 활성

Phase 2: running (5~8초)
  - 모든 마커 동시 출발
  - 세로줄 따라 천천히 내려감
  - Bridge 만나면 수평 이동 (좌/우)
  - 지나간 경로에 색상 trail 잔상
  - GO! 버튼 숨김

Phase 3: done
  - 500ms 대기
  - 당첨 slot 하이라이트 (scale + glow)
  - confetti 효과
  - 당첨자 이름 표시
  - → onComplete(winners) → GameResult 전환
```

---

## 6. Error Handling

| Scenario | Handling |
|----------|---------|
| 참가자 1명 | 사다리 불필요 — page.tsx에서 game 페이지로 리디렉트 (기존) |
| Bridge가 모든 사람을 같은 slot에 보냄 | generateBridges에서 결과 분포 확인, 당첨자 수 != pickCount면 재생성 |
| Canvas 미지원 브라우저 | 극히 드묾 (target 브라우저 모두 지원) — fallback 불필요 |
| 애니메이션 중 페이지 이탈 | rAF 자동 중지 (cleanup in useEffect) |

---

## 7. Security Considerations

- 프론트엔드 전용 변경이므로 보안 이슈 없음
- Bridge 생성은 `crypto.getRandomValues` 기반 (기존 CSPRNG 유지)

---

## 8. Test Plan

| ID | Scenario | Expected | Priority |
|----|---------|----------|:--------:|
| T-01 | 3명 GO! 클릭 | 3개 마커 동시 출발, 5~8초 후 도착, trail 표시 | P0 |
| T-02 | 8명 GO! 클릭 | 8개 마커 색상 구분, 60fps 유지 | P0 |
| T-03 | Bridge에서 마커 수평 이동 | 수평 다리 따라 이동 명확히 보임 | P0 |
| T-04 | 도착 후 결과 | 당첨 slot 하이라이트 + confetti + GameResult 전환 | P0 |
| T-05 | 경로=결과 일치 | 화면 경로 도착점 = 실제 당첨자 | P0 |
| T-06 | 동일 bridge에서 재실행 | 같은 시작점 → 같은 결과 (결정적) | P0 |
| T-07 | 결과 저장 | saveGameResult 정상 동작 | P0 |
| T-08 | 카드플립 게임 | 영향 없음, 기존대로 동작 | P0 |

---

## 9. Coding Convention

| Item | Convention |
|------|-----------|
| game-engine 함수 | camelCase, 순수 함수, export |
| Canvas 관련 | 상수 UPPER_SNAKE (ROWS, COL_WIDTH 등) |
| 애니메이션 | requestAnimationFrame + useEffect cleanup |
| 색상 | MARKER_COLORS 상수 배열 |

---

## 10. Implementation Guide

### 10.1 Implementation Order

1. [ ] `game-engine.ts` — `generateBridges()`, `traceLadderPath()` 추가
2. [ ] `LadderGame.tsx` — 전면 리팩터링 (Canvas 드로잉 + rAF 애니메이션 + trail + 결과 연출)
3. [ ] `ladder/page.tsx` — `pickWinners()` 제거, `onComplete(winners)` 연동
4. [ ] 빌드 확인 + 브라우저 테스트 (3명/8명)

### 10.2 Key Constants

```typescript
const ROWS = 8
const TOTAL_DURATION = 6000  // 6초
const MARKER_RADIUS = 6
const TRAIL_WIDTH = 3
const BRIDGE_PROBABILITY = 0.5
```

### 10.3 Session Guide

#### Module Map

| Module | Scope Key | Description | Files |
|--------|-----------|-------------|-------|
| Engine | `module-1` | 경로 추적 알고리즘 (순수 함수) | game-engine.ts |
| Animation | `module-2` | LadderGame 전면 리팩터링 (Canvas + rAF) | LadderGame.tsx |
| Integration | `module-3` | page.tsx 연동 + 테스트 | ladder/page.tsx |

#### Recommended: 단일 세션 구현

이 기능은 3개 파일 수정만으로 완결되므로 단일 세션에서 전체 구현 권장.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-11 | Initial draft — Option C, Canvas rAF 애니메이션 | joohui.lee |
