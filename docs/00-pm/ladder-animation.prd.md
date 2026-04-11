# ladder-animation PRD (Product Requirements Document)

> PM Agent Team 분석 결과 종합 | 생성일: 2026-04-11
> Feature: 사다리타기 UI 개선 - 사다리 타는 애니메이션
> Attribution: Frameworks from [pm-skills](https://github.com/phuryn/pm-skills) by Pawel Huryn (MIT License)

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 현재 사다리타기 게임이 이름만 순환하다 결과를 즉시 보여주는 방식으로, 실제 "사다리를 타는" 시각적 경험이 전혀 없어 기대감과 몰입도가 부재하다 |
| **Solution** | 사다리 경로를 실제로 추적하는 느린 경로 애니메이션을 구현하여, 마커가 세로줄을 따라 내려가다 가로줄(bridge)을 만나면 이동하는 시각적 서스펜스를 제공한다 |
| **Target User** | 점심 시간에 "누가 쏠까"를 정하는 3~8명 팀원 (모바일 중심 사용) |
| **Core Value** | 사다리를 "타는" 과정 자체가 엔터테인먼트 -- 느린 속도로 경로를 추적하며 결과가 어디로 갈지 함께 지켜보는 공유 경험 |

---

## 1. Discovery Analysis (Opportunity Solution Tree)

### 1.1 5-Step Discovery Chain

#### Step 1: Brainstorm (기회 탐색)

**핵심 질문**: 사다리타기 게임에서 사용자 경험을 개선할 기회는 무엇인가?

| # | 기회 (Opportunity) | 설명 |
|---|-------------------|------|
| O1 | 시각적 서스펜스 부재 | 이름 순환 애니메이션만 있고, 사다리를 "타는" 경험이 없음 |
| O2 | 사다리 경로의 의미 상실 | Bridge가 실제 결과에 영향을 주지 않아 사다리 그림이 장식에 불과 |
| O3 | 속도 제어 불가 | 2초 만에 끝나는 애니메이션으로 기대감 형성 불가 |
| O4 | 공정성 인식 약화 | Fisher-Yates shuffle이 결과를 결정하므로 "사다리를 탔다"는 납득감 부족 |
| O5 | 그룹 관전 경험 부족 | 함께 보면서 응원/긴장하는 소셜 요소가 약함 |

#### Step 2: Assumptions (가정 식별)

| # | 가정 (Assumption) | 유형 |
|---|-------------------|------|
| A1 | 경로 추적 애니메이션이 사용자 만족도를 크게 높인다 | Desirability |
| A2 | 느린 속도가 서스펜스를 만들어 재미를 증가시킨다 | Desirability |
| A3 | 사다리 경로가 결과를 결정해야 공정하다고 인식한다 | Value |
| A4 | 모바일 Canvas 애니메이션이 충분히 부드럽게 동작한다 | Feasibility |
| A5 | 3~8명 참여자에서 경로가 시각적으로 구분 가능하다 | Usability |
| A6 | 전체 애니메이션 5~10초가 적절한 시간이다 | Usability |

#### Step 3: Prioritize (Impact x Risk Matrix)

| 가정 | Impact (1-5) | Risk (1-5) | Score | 우선순위 |
|------|:------------:|:----------:|:-----:|:--------:|
| A1 | 5 | 1 | 5 | 1 |
| A3 | 5 | 1 | 5 | 1 |
| A2 | 4 | 2 | 8 | 2 |
| A5 | 4 | 3 | 12 | 3 |
| A4 | 3 | 3 | 9 | 4 |
| A6 | 3 | 2 | 6 | 5 |

> Impact 높고 Risk 낮은 A1, A3이 최우선. A5(가시성)는 Risk가 높아 프로토타입 검증 필요.

#### Step 4: Experiments (검증 방법)

| 가정 | 실험 방법 | 성공 기준 |
|------|----------|----------|
| A1 | Before/After 사용자 테스트 (5명) | "더 재미있다" 응답 4/5 이상 |
| A2 | 속도 3단계(2초/5초/10초) A/B 비교 | 5~8초 구간 선호도 최대 |
| A3 | 사다리 경로 결정 vs 셔플 결정 비교 | "공정하다" 인식 80% 이상 |
| A5 | 3명/5명/8명 화면 캡처 가독성 평가 | 모든 경로 색상 구분 가능 |

#### Step 5: Opportunity Solution Tree

```
[Outcome] 사다리타기 재미와 몰입도 향상
├── [Opportunity] O1: 시각적 서스펜스 부재
│   ├── [Solution] S1: Canvas 경로 추적 애니메이션 (마커가 사다리를 타고 내려감)
│   └── [Solution] S2: SVG path + Framer Motion animate
├── [Opportunity] O2: 사다리 경로의 의미 상실
│   ├── [Solution] S3: Bridge 기반 실제 경로 계산 알고리즘
│   └── [Solution] S4: 경로 결과 = 게임 결과 일치
├── [Opportunity] O3: 속도 제어 불가
│   ├── [Solution] S5: requestAnimationFrame 기반 느린 이동
│   └── [Solution] S6: 속도 프리셋 (느림/보통/빠름)
├── [Opportunity] O4: 공정성 인식 약화
│   └── [Solution] S7: 사다리 경로로 승자 결정 (shuffle 제거)
└── [Opportunity] O5: 그룹 관전 경험
    ├── [Solution] S8: 모든 참여자 동시 경로 추적
    └── [Solution] S9: 순차 1명씩 경로 추적 (서스펜스 극대화)
```

### 1.2 Top Assumptions Summary

1. **A1 + A3 (최우선)**: 경로 추적 애니메이션 + 경로 기반 결과 결정이 핵심 가치
2. **A2 (높은 Impact)**: 느린 속도가 서스펜스의 핵심 -- 사용자 요구사항에도 명시
3. **A5 (높은 Risk)**: 모바일 좁은 화면에서 다수 경로 가시성 검증 필요

---

## 2. Strategy Analysis (Value Proposition + Lean Canvas)

### 2.1 JTBD 6-Part Value Proposition

| Part | 내용 |
|------|------|
| **1. Customer** | 점심 식사 후 "누가 쏠까"를 결정하는 3~8명 팀 그룹 |
| **2. Job** | 사다리타기 게임을 할 때, 사다리를 실제로 "타는" 시각적 경험을 통해 결과에 대한 기대감과 납득감을 느끼고 싶다 |
| **3. Pain** | 현재: 이름만 깜빡이다 결과 표시 -- 사다리 그림은 장식이고, 결과는 랜덤 셔플이라 "사다리를 탄" 느낌이 전혀 없음 |
| **4. Gain** | 마커가 천천히 사다리를 타고 내려가며 bridge를 따라 이동하는 것을 보면서, 결과가 어디로 갈지 함께 긴장하는 경험 |
| **5. Current Alternative** | 외부 사다리타기 앱(행운 사다리타기, 사다리타기 어플 등) 사용, 또는 종이에 직접 그리기 |
| **6. Differentiator** | 사내 점심 이벤트 앱 내에서 바로 실행 -- 참가자 설정부터 결과 저장까지 원스톱, 별도 앱 설치 불필요 |

### 2.2 Lean Canvas

| 섹션 | 내용 |
|------|------|
| **Problem** | 1) 사다리타기에 "타는" 애니메이션 없음 2) 결과가 사다리 경로와 무관 3) 너무 빠르게 끝남 |
| **Customer Segments** | 사내 팀원 3~8명, 모바일 웹 사용자, 점심 시간 1~2분 여유 |
| **Unique Value Proposition** | "사다리를 진짜 타는" 느린 경로 추적 -- 결과가 경로에 의해 결정되는 공정한 서스펜스 |
| **Solution** | Canvas 기반 마커 이동 애니메이션 + Bridge 경로 추적 알고리즘 + 느린 속도 |
| **Channels** | 기존 lunch-event 앱 내 게임 모드 업데이트 (추가 배포 불필요) |
| **Revenue Streams** | N/A (사내 도구) -- 가치: 팀 유대감, 공정한 결정, 사용 지속성 |
| **Cost Structure** | 프론트엔드 개발 공수 (Canvas 애니메이션 + 알고리즘 리팩터링) |
| **Key Metrics** | 게임 완료율, 재사용률, 애니메이션 중 이탈률, 사용자 만족도 |
| **Unfair Advantage** | 사내 전용 앱의 참가자 자동 설정 + 히스토리 관리 통합 |

### 2.3 SWOT Analysis

| | Helpful | Harmful |
|---|---------|---------|
| **Internal** | **Strengths**: Canvas 이미 구현, Framer Motion 의존성 존재, 모바일 최적화 완료 | **Weaknesses**: Canvas 애니메이션 경험 부족 가능, 사다리 알고리즘 전면 리팩터링 필요 |
| **External** | **Opportunities**: 경쟁 앱 대비 히스토리 통합 차별화, 사내 바이럴 효과 | **Threats**: 외부 사다리타기 앱의 세련된 UX, 모바일 기기 성능 차이 |

**SO Strategy**: Canvas + Framer Motion 조합으로 경쟁 앱 수준의 애니메이션 + 사내 통합 히스토리로 차별화

**WT Strategy**: 성능 이슈 대비 requestAnimationFrame 최적화, 낮은 사양 기기 fallback 고려

### 2.4 Additional Strategic Analysis: Kano Model

| 카테고리 | 기능 | 현재 상태 |
|----------|------|----------|
| **Must-be** | 사다리 그림이 화면에 보임 | 구현됨 |
| **Must-be** | 결과가 나옴 | 구현됨 |
| **One-dimensional** | 경로 추적 애니메이션 | **미구현 (핵심 개선 대상)** |
| **One-dimensional** | 느린 속도로 서스펜스 제공 | **미구현 (핵심 개선 대상)** |
| **Attractive** | 경로 색상 커스터마이징 | 미구현 |
| **Attractive** | 사운드 효과 | 미구현 |
| **Indifferent** | 속도 단계 선택 UI | 불필요 (느림 고정) |

---

## 3. Research Analysis (Personas + Competitors + Market Sizing)

### 3.1 User Personas

#### Persona 1: "팀장 민수" (Primary - 게임 시작자)

| 항목 | 내용 |
|------|------|
| **Demographics** | 35세, 개발팀장, 6명 팀 리드 |
| **Context** | 점심 식사 후 커피 내기에 사다리타기 사용 |
| **JTBD** | 팀원들이 다 같이 화면을 보면서 웃고 긴장하는 경험을 만들고 싶다 |
| **Pain** | "사다리타기 눌렀는데 이름만 깜빡이다 끝나서 김빠짐" |
| **Goal** | 한 명씩 경로가 내려가면서 결과가 밝혀지는 드라마틱한 연출 |
| **Tech Savviness** | 높음 -- 개발자라 부드러운 애니메이션에 기대치 높음 |

#### Persona 2: "신입 지은" (Secondary - 참여자)

| 항목 | 내용 |
|------|------|
| **Demographics** | 26세, 마케팅팀 신입, MZ세대 |
| **Context** | 팀 점심에서 복불복 게임 참여, 본인 폰으로 같이 보기도 함 |
| **JTBD** | 게임 과정 자체가 재미있어서 점심 분위기가 좋아졌으면 한다 |
| **Pain** | "외부 사다리타기 앱은 애니메이션 있는데 이건 너무 밋밋" |
| **Goal** | 인스타에 올릴 만한 비주얼 -- 느린 사다리 애니메이션으로 스릴 |
| **Tech Savviness** | 중간 -- 앱이 직관적이면 OK |

#### Persona 3: "중재자 현우" (Tertiary - 공정성 중시)

| 항목 | 내용 |
|------|------|
| **Demographics** | 30세, 기획팀, 팀 내 분쟁 중재 역할 |
| **Context** | 점심 한턱 결정 시 공정성 이슈로 불만 나올 때 사용 |
| **JTBD** | 결과가 투명하고 납득 가능한 방식으로 결정되길 원한다 |
| **Pain** | "셔플로 결정되면 '조작 아니야?'라는 농담이 나옴" |
| **Goal** | 사다리 경로가 눈에 보이면서 결과가 정해지면 아무도 불만 없음 |
| **Tech Savviness** | 낮음 -- 버튼 하나로 동작해야 함 |

### 3.2 Competitor Analysis (5 Competitors)

| # | 경쟁사 | 플랫폼 | 경로 애니메이션 | 속도 제어 | 경로 기반 결과 | 히스토리 | 차별점 |
|---|--------|--------|:-------------:|:--------:|:------------:|:-------:|--------|
| 1 | **행운 사다리타기** | iOS/Android | O (경로 추적) | O (속도 조절) | O | X | 터치로 사다리 직접 그리기 |
| 2 | **사다리타기 어플** | Android | O (기본 경로) | X | O | X | 심플, 광고 많음 |
| 3 | **OJJ 사다리게임** | Web | O (클릭 시 경로) | X | O | X | PC/모바일 겸용, 깔끔 UI |
| 4 | **일심초대장 사다리** | Web | O (순차 공개) | X | O | X | 초대장 서비스 내 기능 |
| 5 | **Ghost Leg Pro** | Android | O (전체 경로) | O | O | X | 프로 버전 유료 |

**경쟁 Gap 분석**:
- 모든 경쟁사가 경로 추적 애니메이션 보유 -- **현재 lunch-event만 미구현**
- 속도 제어는 일부만 제공 -- 느린 속도 기본 제공으로 차별화 가능
- **히스토리 관리는 어떤 경쟁사도 없음** -- lunch-event의 핵심 차별점

### 3.3 Market Sizing (TAM/SAM/SOM)

> 사내 도구이므로 전통적 시장 규모보다는 사용자 풀 관점에서 산정

**Method 1: Top-Down**

| 단계 | 산정 |
|------|------|
| **TAM** | 한국 직장인 중 팀 점심 문화 보유 (~500만 명) |
| **SAM** | 복불복/사다리타기 앱을 점심에 사용하는 직장인 (~50만 명, 10%) |
| **SOM** | lunch-event 앱의 현실적 도달 범위: 사내 직원 (~100~500명) |

**Method 2: Bottom-Up**

| 단계 | 산정 |
|------|------|
| **현재 사용자** | 사내 활성 사용자 추정 20~50명 |
| **애니메이션 개선 후 목표** | 기존 사용자 유지 + 사다리 모드 사용률 50% 증가 |
| **6개월 목표** | 사내 전체 팀(10~20개 팀)이 최소 1회 이상 사용 |

### 3.4 Customer Journey Map (Primary Persona: 팀장 민수)

```
[Phase]      인지          설정         게임 시작        애니메이션 관전      결과 확인       후속
[Action]     "오늘 누가    참가자 입력   GO! 버튼        사다리 경로 추적     당첨자 공개     결과 저장
              쏠까?"       + 인원 설정   터치             지켜보기                            히스토리
[Thinking]   "사다리로     "빨리        "어디로          "내 쪽으로          "ㅋㅋㅋ         "다음엔
              하자!"        하자"        갈까?"           오지마!"             역시!"          내가?"
[Feeling]    기대          약간 귀찮     흥분             ★ 최고 긴장감 ★     웃음/아쉬움     만족
[Pain Point] -             -            현재: 이름만     현재: 없음          현재: 갑자기    -
                                        깜빡임           (핵심 개선점)        결과만 표시
[Opportunity] -            -            GO! 누르면       S1: 마커 경로       결과 표시에     히스토리
                                        바로 경로        추적 느리게         잔여 효과       명예의전당
                                        추적 시작                            (confetti)      연동
```

> **Moment of Truth**: "애니메이션 관전" 단계가 이 게임의 핵심 경험이며, 현재 완전히 비어있음

---

## 4. ICP & Go-To-Market Strategy

### 4.1 ICP (Ideal Customer Profile)

| 항목 | 정의 |
|------|------|
| **Who** | 사내 3~8명 팀, 점심 식사 문화 활발, 모바일 웹 사용 |
| **Behavior** | 주 2~3회 이상 팀 점심, 결정 과정에 게임 사용 의향 |
| **Need** | 빠르게 시작 가능하면서도 재미있는 결정 방법 |
| **Value Driver** | 시각적 재미 + 공정성 + 편리함 (별도 앱 설치 불필요) |

### 4.2 Beachhead Segment (4-Criteria Scoring)

| 세그먼트 | Urgency (1-5) | Reach (1-5) | Payoff (1-5) | Feasibility (1-5) | Total |
|----------|:-------------:|:-----------:|:------------:|:-----------------:|:-----:|
| **개발팀** (UX 기대치 높음) | 5 | 5 | 4 | 5 | 19 |
| 마케팅팀 (비주얼 중시) | 4 | 3 | 4 | 5 | 16 |
| 경영지원팀 (관습적) | 2 | 3 | 3 | 5 | 13 |

> **Beachhead**: 개발팀 -- 기술 이해도 높고 피드백 적극적, 같은 층 바이럴

### 4.3 GTM Strategy

| 항목 | 전략 |
|------|------|
| **Launch** | 사내 슬랙/팀즈 공지 + "사다리타기 리뉴얼" 데모 영상 (10초 GIF) |
| **Adoption** | 개발팀 먼저 사용 -> 타 팀에 바이럴 ("우리 팀 사다리 이거 씀") |
| **Retention** | 히스토리 명예의 전당과 연동 -- 계속 사용할 이유 제공 |
| **Metrics** | 사다리 모드 선택 비율, 애니메이션 완주율 (중간 이탈 없이 끝까지 봄), 재사용률 |

### 4.4 Competitive Battlecard

| vs 경쟁사 | 우리의 강점 | 그들의 강점 | 대응 |
|-----------|------------|------------|------|
| 행운 사다리타기 | 히스토리 통합, 설치 불필요 | 터치 사다리 그리기, 속도 조절 | 느린 기본 속도로 서스펜스 강화 |
| OJJ 사다리게임 | 사내 전용 + 히스토리 | 깔끔 UI, PC 겸용 | 모바일 UX 특화 |
| 일반 사다리앱 | 참가자 자동 관리, 저장 | 다양한 옵션 | 핵심 경험(느린 경로 추적)에 집중 |

### 4.5 Growth Loops

```
[User runs ladder game] 
  -> [Slow path animation creates excitement]
    -> [Team members gather around to watch]
      -> [Fun moment shared ("OMG look at the path!")]
        -> [Other teams ask "what app is that?"]
          -> [New team adopts lunch-event]
            -> [More users -> more history -> more value]
```

---

## 5. PRD: Functional Requirements

### 5.1 Feature Overview

**Feature Name**: ladder-animation (사다리 경로 추적 애니메이션)
**Priority**: P0 (핵심 게임 경험의 근본적 결함 수정)
**Estimated Effort**: M (Medium) -- 3~5일

### 5.2 Requirements

#### FR-01: 사다리 경로 추적 알고리즘

| 항목 | 내용 |
|------|------|
| **설명** | Bridge 데이터를 기반으로 각 참가자의 실제 사다리 경로를 계산 |
| **현재** | `pickWinners()` Fisher-Yates shuffle로 결과 결정 (사다리와 무관) |
| **변경** | Bridge 배열을 입력받아 시작 column에서 아래로 이동하며 bridge를 만나면 좌/우 이동 -> 최종 도착 column이 결과 |
| **수용 기준** | 동일한 bridge 배열에서 동일한 시작점은 항상 같은 결과 반환 |

**알고리즘 개요**:
```
function tracePath(startCol, bridges, rows):
  currentCol = startCol
  for each row (0 to rows-1):
    if bridge exists at (currentCol, row):     // 오른쪽 bridge
      currentCol += 1
    elif bridge exists at (currentCol-1, row): // 왼쪽 bridge
      currentCol -= 1
  return currentCol  // 최종 도착 column
```

#### FR-02: Canvas 경로 애니메이션

| 항목 | 내용 |
|------|------|
| **설명** | 마커(원형 도트)가 사다리를 따라 천천히 내려가는 애니메이션 |
| **시각 요소** | 색상이 있는 원형 마커(참가자별 고유 색상) + 지나간 경로에 색상 선(trail) |
| **이동 패턴** | 세로줄 따라 아래로 이동 -> bridge 만나면 수평 이동 -> 다시 아래로 이동 |
| **렌더링** | `requestAnimationFrame` 기반, 매 프레임 마커 위치 업데이트 |
| **수용 기준** | 60fps로 부드러운 이동, 경로가 화면에 잔상(trail)으로 남음 |

#### FR-03: 느린 속도 (Slow Speed)

| 항목 | 내용 |
|------|------|
| **설명** | 사용자 요구: "속도는 천천히" -- 서스펜스를 위한 느린 이동 |
| **속도 규격** | 전체 경로 추적 시간: **5~8초** (현재 ~2초에서 3~4배 느리게) |
| **세로 이동** | 1 row 이동에 ~500ms |
| **가로 이동** | bridge 수평 이동에 ~300ms |
| **수용 기준** | 사용자가 경로를 눈으로 충분히 따라갈 수 있는 속도 |

#### FR-04: 모든 참가자 동시 경로 추적

| 항목 | 내용 |
|------|------|
| **설명** | GO! 버튼 클릭 시 모든 참가자의 마커가 동시에 출발하여 각자 경로를 타고 내려감 |
| **시각 구분** | 참가자별 고유 색상 (palette: 4~8가지 구분 가능 색상) |
| **병렬 처리** | 모든 마커가 같은 속도로 동시 이동 |
| **대안** | 순차 1명씩도 고려했으나, 8명이면 40~64초로 너무 길어 동시 진행 채택 |
| **수용 기준** | 모든 마커가 동시에 출발하고 각각 다른 경로를 따라 도착 |

#### FR-05: 결과 연출

| 항목 | 내용 |
|------|------|
| **설명** | 모든 마커 도착 후 당첨 slot에 도착한 참가자 하이라이트 |
| **연출 순서** | 1) 모든 마커 도착 (0.5초 대기) 2) 당첨 slot 강조 (scale + glow) 3) 당첨자 이름 표시 4) confetti 효과 |
| **기존 연동** | `onComplete()` 콜백으로 GameResult 컴포넌트 전환 유지 |
| **수용 기준** | 결과가 사다리 경로에 의해 결정되었음이 시각적으로 명확 |

#### FR-06: 사다리 경로 기반 승자 결정

| 항목 | 내용 |
|------|------|
| **설명** | 기존 `pickWinners()` 대신 사다리 경로 추적 결과로 승자 결정 |
| **변경 범위** | `page.tsx`에서 `pickWinners()` 호출 제거, LadderGame 내부에서 bridge 경로로 결과 계산 |
| **공정성** | Bridge는 게임 시작 시 랜덤 생성 -> 경로 결과는 bridge에 의해 결정적 |
| **수용 기준** | 화면에 보이는 경로와 실제 결과가 100% 일치 |

#### FR-07: Canvas 사다리 비주얼 개선

| 항목 | 내용 |
|------|------|
| **설명** | 기존 연한 회색 사다리를 더 선명하고 읽기 쉽게 개선 |
| **세로줄** | 더 진한 색상, 시작점에 참가자 색상 도트 |
| **가로줄 (bridge)** | 점선 또는 약간 다른 스타일로 구분 |
| **당첨 slot** | 하단에 명확한 라벨 (현재: 아이콘만) |
| **수용 기준** | 사다리 구조가 한눈에 파악 가능 |

### 5.3 Non-Functional Requirements

| # | 항목 | 기준 |
|---|------|------|
| NFR-01 | 성능 | 60fps 애니메이션, 100ms 이하 초기 렌더링 |
| NFR-02 | 호환성 | iOS Safari 16+, Chrome 100+, Samsung Internet 20+ |
| NFR-03 | 반응형 | max-w-md (448px) 내에서 3~8명 모두 가시적 |
| NFR-04 | 접근성 | 색상 외에 마커 형태로도 구분 가능 |
| NFR-05 | 기기 성능 | 저사양 모바일에서도 30fps 이상 유지 |

### 5.4 Out of Scope (v1)

- 속도 단계 선택 UI (v1은 느림 고정)
- 사운드 효과
- 사다리 직접 그리기 (터치)
- 가로 모드 지원
- 사다리 결과 공유 (이미지 저장)

---

## 6. Pre-mortem Analysis

### Top 3 Risks

| # | 위험 | 발생 확률 | 영향도 | 대응 |
|---|------|:---------:|:------:|------|
| 1 | **모바일 Canvas 성능** -- 8명 동시 애니메이션 시 저사양 기기에서 프레임 드랍 | 중 | 높 | requestAnimationFrame + 프레임 스킵 로직, 마커 수가 많으면 trail 단순화 |
| 2 | **좁은 화면에서 경로 가시성** -- 8명일 때 COL_WIDTH가 40px까지 줄어 경로 구분 어려움 | 높 | 중 | 색상 팔레트 최적화, 마커 크기 적응, 8명 이상일 때 좌우 스크롤 또는 사다리 높이 증가 |
| 3 | **게임 흐름 호환성** -- LadderGame이 bridge 기반 결과를 반환해야 하므로 page.tsx의 승자 결정 로직 변경 필요 | 낮 | 높 | LadderGame에서 onComplete(winners) 콜백으로 결과 전달, game-store 업데이트 |

### Mitigation Plan

1. **성능**: 프로토타입 단계에서 iPhone SE(저사양 기준)와 Galaxy A 시리즈에서 테스트
2. **가시성**: 4명/6명/8명 시나리오 별 스크린샷 비교 리뷰
3. **호환성**: `LadderGame` props에 `onResult: (winners: string[]) => void` 추가, page.tsx에서 `setWinners` 연동

---

## 7. User Stories & Test Scenarios

### 7.1 User Stories

| # | Story | Priority | INVEST Check |
|---|-------|:--------:|:------------:|
| US-01 | 팀장으로서 GO! 버튼을 누르면, 모든 참가자의 마커가 사다리 꼭대기에서 동시에 출발하여 천천히 내려가는 것을 보고 싶다 | P0 | I-N-V-E-S-T |
| US-02 | 참여자로서 마커가 bridge를 만나면 옆으로 이동하는 것을 눈으로 확인하여, 경로가 결과를 결정한다는 것을 납득하고 싶다 | P0 | I-N-V-E-S-T |
| US-03 | 참여자로서 애니메이션이 충분히 느려서 내 경로가 어디로 가는지 따라갈 수 있기를 원한다 | P0 | I-N-V-E-S-T |
| US-04 | 팀장으로서 모든 마커가 도착한 후 당첨 slot에 도착한 사람이 하이라이트 되면서 결과가 자연스럽게 공개되기를 원한다 | P1 | I-N-V-E-S-T |
| US-05 | 참여자로서 지나간 경로에 색상 trail이 남아서 최종 결과를 경로로 역추적할 수 있기를 원한다 | P1 | I-N-V-E-S-T |
| US-06 | 중재자로서 사다리 경로에 의해 결과가 결정되어 (셔플이 아닌) 공정하다는 확신을 팀원들에게 줄 수 있기를 원한다 | P0 | I-N-V-E-S-T |

### 7.2 Test Scenarios

| # | 시나리오 | 기대 결과 | 관련 Story |
|---|---------|----------|:----------:|
| TS-01 | 3명 참가자로 GO! 클릭 | 3개 마커가 동시에 출발, 각각 다른 경로로 이동, 5~8초 후 도착 | US-01, US-03 |
| TS-02 | 8명 참가자로 GO! 클릭 (최대) | 8개 마커가 모바일 화면에서 구분 가능한 색상으로 이동 | US-01, NFR-03 |
| TS-03 | 마커가 bridge 위치에서 수평 이동 | 마커가 수평 다리를 따라 옆 column으로 이동하는 것이 명확히 보임 | US-02 |
| TS-04 | 모든 마커 도착 후 결과 | 당첨 slot에 도착한 참가자가 하이라이트, confetti 효과 | US-04 |
| TS-05 | 경로 trail 확인 | 마커가 지나간 경로에 색상 선이 남아있음 | US-05 |
| TS-06 | 동일 bridge 배열 재실행 | 같은 시작점에서 항상 같은 결과 (결정적 알고리즘) | US-06 |
| TS-07 | 저사양 기기 (iPhone SE) | 30fps 이상 유지, 끊김 없음 | NFR-01, NFR-05 |
| TS-08 | 결과가 사다리 경로와 일치 | 화면에 보이는 경로의 도착점 = 실제 결정된 당첨자 | US-06, FR-06 |
| TS-09 | 기존 게임 플로우 유지 | 설정 -> 애니메이션 -> 결과 -> 저장 플로우 정상 동작 | FR-05 |
| TS-10 | pickCount=2 (당첨자 2명) | 2개의 당첨 slot에 도착한 2명이 정확히 당첨자로 선정 | FR-06 |

---

## 8. Stakeholder Map

| Stakeholder | 관심사 | 영향력 | 참여 수준 |
|-------------|--------|:------:|:---------:|
| 사용자 (팀원들) | 재미, 공정성, 속도 | 높 | 최종 사용자 피드백 |
| 개발자 (구현) | 기술 실현성, Canvas 성능, 코드 품질 | 높 | 직접 구현 |
| PO/요청자 | 사용자 만족도, 기존 플로우 유지 | 중 | 요구사항 확인 |

---

## Technical Architecture Recommendation

### 접근 방식: Canvas 기반 경로 추적

**선택 근거**: 이미 Canvas가 구현되어 있으므로 Canvas 위에 애니메이션 레이어를 추가하는 것이 가장 효율적

**핵심 구현 모듈**:

1. **`traceLadderPath(startCol, bridges, rows)`** -- 순수 함수, 경로 좌표 배열 반환
2. **`animatePaths(ctx, paths, speed)`** -- requestAnimationFrame 기반 마커 이동
3. **`LadderGame` 리팩터링** -- Bridge가 결과를 결정, onComplete에 실제 winners 전달

**애니메이션 구현 전략**:
```
1. 사다리 그리기 (기존 유지 + 비주얼 개선)
2. GO! 클릭 시:
   a. 모든 참가자에 대해 traceLadderPath() 실행 -> 경로 좌표 배열
   b. requestAnimationFrame 루프 시작
   c. 매 프레임: 각 마커의 현재 위치 계산 (lerp로 보간)
   d. 마커 원형 그리기 + trail 선 그리기
   e. 모든 마커 도착 시 결과 공개
3. 결과: 도착 column의 slot이 당첨 여부 결정
```

---

> **Attribution**: PM Agent Team analysis powered by frameworks from [pm-skills](https://github.com/phuryn/pm-skills) by Pawel Huryn (MIT License).
> - Discovery: Teresa Torres' Opportunity Solution Tree
> - Strategy: JTBD 6-Part Value Proposition + Ash Maurya's Lean Canvas + Kano Model
> - Research: Persona JTBD + Competitive Analysis + TAM/SAM/SOM
> - GTM: Geoffrey Moore's Beachhead Strategy + Growth Loops
> - Execution: Pre-mortem + User Stories (INVEST) + Test Scenarios
