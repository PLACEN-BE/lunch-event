# ladder-animation Planning Document

> **Summary**: 사다리타기 경로 추적 애니메이션 — Bridge 기반 실제 경로 결정 + 느린 마커 이동 + trail 효과
>
> **Project**: lunch-event
> **Version**: 1.0.0
> **Author**: joohui.lee
> **Date**: 2026-04-11
> **Status**: Draft
> **PRD Reference**: `docs/00-pm/ladder-animation.prd.md`

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 사다리타기가 이름 순환 후 즉시 결과 표시. Bridge는 장식이고 Fisher-Yates shuffle이 결과 결정 — "사다리를 타는" 경험이 전혀 없음 |
| **Solution** | Bridge 기반 경로 추적 알고리즘 + Canvas 마커 애니메이션(5~8초, 참가자별 고유 색상) + trail 잔상 + 도착 후 하이라이트/confetti |
| **Function/UX Effect** | GO! 클릭 → 마커가 천천히 사다리를 타고 내려가며 bridge에서 좌우 이동 → 도착 시 당첨 slot 하이라이트 + confetti → GameResult 전환 |
| **Core Value** | 사다리를 "타는" 과정 자체가 엔터테인먼트 — 느린 속도로 함께 지켜보는 공유 서스펜스 + 경로 기반 공정한 결과 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 사다리타기에 "타는" 시각적 경험이 없어 기대감/몰입도 부재 + Bridge가 결과에 영향 없어 공정성 의문 |
| **WHO** | 점심 시간 "누가 쏠까" 정하는 3~8명 팀원 (모바일 중심) |
| **RISK** | 모바일 Canvas 성능(8명 동시 애니메이션 시 프레임 드랍) + 좁은 화면에서 8명 경로 가시성 |
| **SUCCESS** | 사다리 모드 재사용률 증가, 애니메이션 완주율 90%+, "경로에 의해 결과 결정" 인식 |
| **SCOPE** | LadderGame 리팩터링(경로 추적 알고리즘 + Canvas 애니메이션 + trail) + page.tsx 승자 결정 변경 |

---

## 1. Overview

### 1.1 Purpose

사다리타기 게임에 실제 경로를 추적하는 느린 애니메이션을 추가하여, 마커가 bridge를 따라 이동하며 결과를 결정하는 시각적 서스펜스를 제공한다. 사다리 경로가 실제 결과를 결정하도록 알고리즘을 교체하여 공정성을 확보한다.

### 1.2 Background

- 현재 `pickWinners()` Fisher-Yates shuffle이 결과를 결정하고, bridge는 시각적 장식에 불과
- 이름만 400ms 간격으로 순환하다 즉시 결과 표시 — 전체 약 2초로 끝남
- 경쟁사(행운 사다리타기, OJJ 등) 모두 경로 추적 애니메이션 보유 — lunch-event만 미구현
- 사용자 요구: "사다리가 타지면서 내려가는 애니메이션, 속도는 천천히"

### 1.3 Related Documents

- PRD: `docs/00-pm/ladder-animation.prd.md`
- 기존 Plan: `docs/01-plan/features/lunch-event.plan.md`

---

## 2. Scope

### 2.1 In Scope

- [ ] Bridge 기반 경로 추적 알고리즘 (`traceLadderPath()`)
- [ ] Canvas requestAnimationFrame 기반 마커 애니메이션 (느린 속도 5~8초)
- [ ] 참가자별 고유 색상 마커 + 지나간 경로 trail
- [ ] 모든 참가자 동시 출발 / 동시 애니메이션
- [ ] 도착 후 당첨 slot 하이라이트 + confetti 연출
- [ ] 사다리 경로 기반 승자 결정 (shuffle 제거)
- [ ] 사다리 비주얼 개선 (더 선명한 선, 시작/도착 라벨)
- [ ] 기존 게임 플로우 유지 (설정 → 애니메이션 → GameResult → 저장)

### 2.2 Out of Scope

- 속도 단계 선택 UI (v1은 느림 고정)
- 사운드 효과
- 사다리 직접 그리기 (터치)
- 가로 모드 지원
- 결과 이미지 저장/공유

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `traceLadderPath(startCol, bridges, rows)` — bridge 기반 경로 좌표 배열 반환 | High | Pending |
| FR-02 | Canvas 마커 애니메이션 — requestAnimationFrame 기반, 60fps, lerp 보간 | High | Pending |
| FR-03 | 느린 속도 — 전체 5~8초 (row 이동 ~500ms, bridge 수평 ~300ms) | High | Pending |
| FR-04 | 참가자별 고유 색상 마커 (3~8명 구분 가능한 팔레트) | High | Pending |
| FR-05 | 경로 trail — 마커가 지나간 경로에 색상 선 잔상 | Medium | Pending |
| FR-06 | 모든 참가자 동시 출발/동시 애니메이션 | High | Pending |
| FR-07 | 도착 후 당첨 slot 하이라이트 (scale + glow) + confetti | High | Pending |
| FR-08 | 사다리 경로 기반 승자 결정 — `pickWinners()` 제거, bridge 경로로 교체 | High | Pending |
| FR-09 | 사다리 비주얼 개선 — 진한 선, 참가자 이름/도착 라벨 명확화 | Medium | Pending |
| FR-10 | `onComplete(winners)` 콜백으로 page.tsx에 실제 승자 전달 | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement |
|----------|----------|-------------|
| Performance | 60fps 애니메이션 (저사양 30fps+) | Chrome DevTools FPS meter |
| Compatibility | iOS Safari 16+, Chrome 100+ | 실기기 테스트 |
| Responsive | max-w-md(448px)에서 3~8명 모두 가시적 | 스크린샷 리뷰 |
| Accessibility | 색상 외 마커 형태로도 구분 가능 | 색맹 시뮬레이션 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] Bridge 기반 경로 추적으로 결과 결정 (shuffle 제거)
- [ ] 마커 애니메이션이 5~8초간 천천히 사다리를 타고 내려감
- [ ] 화면에 보이는 경로와 실제 결과가 100% 일치
- [ ] 참가자별 색상 구분 + trail 잔상
- [ ] 도착 후 하이라이트 + confetti → GameResult 전환
- [ ] 3~8명 모두 정상 동작
- [ ] 빌드 에러 없음

### 4.2 Quality Criteria

- [ ] 60fps 유지 (8명 시나리오)
- [ ] 동일 bridge 배열에서 동일 결과 (결정적 알고리즘)
- [ ] 기존 게임 저장 플로우 정상 동작

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 8명 동시 Canvas 애니메이션 프레임 드랍 | High | Medium | requestAnimationFrame + 프레임 스킵, trail 단순화 |
| 8명 좁은 화면에서 경로 가시성 부족 | Medium | High | 색상 팔레트 최적화 + 마커 크기 적응 + COL_WIDTH 최소 40px 보장 |
| LadderGame → page.tsx 승자 전달 구조 변경 | High | Low | `onComplete(winners: string[])` 콜백 패턴으로 깔끔 연동 |
| Bridge 배열이 모든 참가자를 같은 곳으로 보내는 엣지케이스 | Medium | Low | Bridge 생성 시 결과 분포 검증, 필요 시 재생성 |

---

## 6. Impact Analysis

### 6.1 Changed Resources

| Resource | Type | Change Description |
|----------|------|--------------------|
| `LadderGame.tsx` | Component | 전면 리팩터링 — Canvas 애니메이션 + 경로 추적 |
| `game-engine.ts` | Library | `traceLadderPath()` 추가, `generateLadderPaths()` 제거 또는 변경 |
| `ladder/page.tsx` | Page | `pickWinners()` 제거, LadderGame이 결과 전달 |

### 6.2 Current Consumers

| Resource | Operation | Code Path | Impact |
|----------|-----------|-----------|--------|
| `LadderGame` | RENDER | `app/game/ladder/page.tsx` | Breaking — props 변경 (onComplete에 winners 전달) |
| `pickWinners()` | CALL | `app/game/ladder/page.tsx:23` | Removed — LadderGame 내부에서 경로 기반 결정 |
| `generateLadderPaths()` | CALL | `LadderGame.tsx:21` | Removed — Bridge 기반 경로로 대체 |
| `game-store` | UPDATE | `page.tsx:23 (setWinners)` | Changed — LadderGame onComplete에서 setWinners 호출 |

### 6.3 Verification

- [ ] `ladder/page.tsx`에서 `pickWinners()` 호출 제거 확인
- [ ] LadderGame `onComplete` 콜백이 실제 winners 배열 전달 확인
- [ ] 기존 카드 플립 게임 (`card-flip/page.tsx`)은 영향 없음 확인 (별도 pickWinners 사용)
- [ ] 게임 결과 저장 (`saveGameResult`) 정상 동작 확인

---

## 7. Architecture Considerations

### 7.1 Project Level

Dynamic (기존 유지)

### 7.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 경로 추적 방식 | SVG path / Canvas / CSS animation | **Canvas** | 기존 Canvas 인프라 활용, requestAnimationFrame으로 세밀한 제어 |
| 결과 결정 | Fisher-Yates shuffle / Bridge 경로 추적 | **Bridge 경로 추적** | 사다리 경로와 결과 일치 = 공정성 핵심 |
| 마커 동작 | 순차 1명씩 / 동시 전체 | **동시 전체** | 8명 순차 시 40~64초 소요, 동시가 UX 적절 |
| 속도 | 고정 느림 / 사용자 선택 | **고정 느림 (5~8초)** | v1 단순화, 사용자 요구 "천천히" |

### 7.3 Animation Architecture

```
[GO! Click]
  ↓
[1. Bridge 기반 경로 계산]
  traceLadderPath(startCol, bridges, ROWS) → Point[] (좌표 배열)
  × 참가자 수만큼 반복 → paths: Point[][]
  ↓
[2. 당첨자 결정]
  각 path의 최종 column → 당첨 slot에 도착한 참가자 = winners
  ↓
[3. requestAnimationFrame 루프]
  매 프레임:
    - 경과 시간 기반 progress 계산 (0~1)
    - 각 마커의 현재 좌표 = lerp(path, progress)
    - Canvas clear → 사다리 재그리기 → trail 그리기 → 마커 그리기
  ↓
[4. 모든 마커 도착 (progress >= 1)]
  500ms 대기 → 당첨 slot 하이라이트 → confetti → onComplete(winners)
```

---

## 8. File Plan

### 8.1 Modified Files

| File | Change |
|------|--------|
| `src/components/game/LadderGame.tsx` | 전면 리팩터링 — Canvas 경로 애니메이션 + trail + 결과 연출 |
| `src/lib/game-engine.ts` | `traceLadderPath()` 추가, `generateLadderPaths()` 수정 또는 제거 |
| `src/app/game/ladder/page.tsx` | `pickWinners()` 제거, LadderGame `onComplete(winners)` 연동 |

### 8.2 No New Files

기존 파일 리팩터링만으로 구현 가능.

---

## 9. Next Steps

1. [ ] Design 문서 작성 (`/pdca design ladder-animation`)
2. [ ] LadderGame.tsx 전면 리팩터링
3. [ ] 3명/5명/8명 시나리오 테스트
4. [ ] 모바일 실기기 성능 확인

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-11 | Initial draft — PRD 기반, 동시 출발 + confetti 연출 확정 | joohui.lee |
