# lunch-event PRD (Product Requirements Document)

> PM Agent Team 분석 결과 종합 | 생성일: 2026-04-10
> Attribution: Frameworks from [pm-skills](https://github.com/phuryn/pm-skills) by Pawel Huryn (MIT License)

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 직장인 점심 식사 시 "누가 쏠 것인가"를 정하는 과정이 매번 어색하고 시간이 걸리며, 한턱 이력 관리가 되지 않아 불공정 인식이 발생한다 |
| **Solution** | 카드 플립/사다리타기 등 시각적으로 임팩트 있는 복불복 게임 + 한턱 히스토리 명예의 전당을 결합한 사내 전용 웹앱 |
| **Target User** | 같은 회사에서 함께 점심을 먹는 3~15명 규모의 팀/그룹 |
| **Core Value** | 공정하고 재미있는 결정 과정 + 투명한 이력 관리로 팀 유대감 강화 |

---

## 1. Discovery Analysis (Opportunity Solution Tree)

### 1.1 5-Step Discovery Chain

#### Step 1: Brainstorm (기회 탐색)

**핵심 질문**: 사내 점심 이벤트에서 해결해야 할 문제는 무엇인가?

| # | 기회 (Opportunity) | 설명 |
|---|-------------------|------|
| O1 | 점심값 결정의 어색함 해소 | "누가 쏠까" 대화가 매번 반복되고 눈치 게임이 발생 |
| O2 | 한턱 이력의 비가시성 | 누가 얼마나 쐈는지 기억에 의존, 불공정 인식 발생 |
| O3 | 팀 유대감 형성 도구 부재 | 점심 시간의 사교적 요소를 극대화할 도구가 없음 |
| O4 | 기존 복불복 앱의 한계 | 범용 앱은 히스토리 관리, 팀 관리 기능이 없음 |
| O5 | 점심 문화의 디지털화 | MZ세대 직장인의 디지털 문화 선호 트렌드 |

#### Step 2: Assumptions (가정 식별)

| # | 가정 (Assumption) | 유형 |
|---|-------------------|------|
| A1 | 직장인들은 점심값 결정에 복불복 게임을 사용하고 싶어한다 | Desirability |
| A2 | 한턱 히스토리 추적이 공정성 인식을 높인다 | Value |
| A3 | 화려한 애니메이션이 게임 경험의 핵심이다 | Usability |
| A4 | 사내 전용 앱이 범용 앱보다 선호된다 | Feasibility |
| A5 | 닉네임 기반 간편 로그인이면 충분하다 | Feasibility |
| A6 | 웹앱이 네이티브 앱보다 접근성이 좋다 | Feasibility |

#### Step 3: Prioritize (우선순위 - Impact x Risk Matrix)

| 가정 | Impact (1-5) | Risk (1-5) | Score | 우선순위 |
|------|:------------:|:----------:|:-----:|:--------:|
| A1 | 5 | 2 | 10 | 1 |
| A3 | 4 | 3 | 12 | 2 |
| A2 | 4 | 2 | 8 | 3 |
| A6 | 3 | 1 | 3 | 4 |
| A5 | 3 | 2 | 6 | 5 |
| A4 | 2 | 2 | 4 | 6 |

#### Step 4: Experiments (검증 방법)

| 가정 | 실험 방법 | 성공 기준 |
|------|----------|----------|
| A1 | 팀 내 10명에게 프로토타입 시연 후 사용 의향 설문 | 80% 이상 "사용하겠다" |
| A3 | A/B 테스트: 애니메이션 有 vs 無 | 애니메이션 有 버전의 재사용률 2배 이상 |
| A2 | 2주간 히스토리 기능 사용 후 만족도 조사 | NPS 40+ |

#### Step 5: Opportunity Solution Tree (OST)

```
[Outcome] 팀 점심 시간의 즐거움과 공정성 극대화
├── [O1] 점심값 결정의 어색함 해소
│   ├── [Solution] 카드 플립 복불복 게임
│   │   └── [Experiment] 프로토타입 사용 테스트
│   ├── [Solution] 사다리타기 게임
│   │   └── [Experiment] UI 임팩트 A/B 테스트
│   └── [Solution] 룰렛 스핀 게임
│       └── [Experiment] 게임 모드 선호도 조사
├── [O2] 한턱 이력의 비가시성
│   ├── [Solution] 명예의 전당 랭킹 보드
│   │   └── [Experiment] 2주 사용 후 만족도
│   └── [Solution] 월별/연별 통계 대시보드
│       └── [Experiment] 데이터 시각화 선호도
├── [O3] 팀 유대감 형성 도구
│   ├── [Solution] 팀/그룹 관리 기능
│   └── [Solution] 재미 요소 (사운드, 이펙트)
└── [O4] 기존 앱의 한계 극복
    ├── [Solution] 사내 전용 멤버 관리
    └── [Solution] 히스토리 + 게임 통합
```

---

## 2. Strategy Analysis (Value Proposition + Lean Canvas)

### 2.1 JTBD (Jobs-To-Be-Done) 6-Part Value Proposition

| 파트 | 내용 |
|------|------|
| **1. Customer** | 같은 회사에서 함께 점심을 먹는 직장인 그룹 (3~15명) |
| **2. Job** | 점심 식사 시 누가 한턱 낼지를 빠르고 공정하며 재미있게 결정하고 싶다 |
| **3. Context** | 점심 식사 전 5분 이내, 모바일 환경, 다수가 함께 보는 상황 |
| **4. Pain** | (1) 매번 반복되는 눈치 게임, (2) "저번에 내가 쐈는데..." 분쟁, (3) 기존 앱은 히스토리 없음 |
| **5. Gain** | (1) 웃음과 긴장감이 있는 결정 과정, (2) 투명한 한턱 이력, (3) 팀 내 공정성 확보 |
| **6. Unique Differentiator** | 시각적으로 인상적인 게임 UI + 한턱 히스토리 명예의 전당이 결합된 유일한 사내 전용 앱 |

### 2.2 Lean Canvas

| 섹션 | 내용 |
|------|------|
| **1. Problem** | (1) 점심값 결정 시 눈치 게임/어색함 (2) 한턱 이력 추적 불가 (3) 기존 복불복 앱에 팀 관리/히스토리 기능 없음 |
| **2. Customer Segments** | Primary: 한국 기업 팀 단위 점심 그룹 (3~15명) / Secondary: 회식/모임 결제자 선정 필요 그룹 |
| **3. Unique Value Proposition** | "점심 한턱, 더 재미있고 더 공정하게" -- 임팩트 있는 복불복 게임과 투명한 이력 관리의 결합 |
| **4. Solution** | 카드 플립/사다리타기 복불복 게임 + 한턱 히스토리 명예의 전당 + 간편 회원 관리 |
| **5. Channels** | 사내 슬랙/팀즈 공유, 구전 (바이럴), QR코드 포스터 |
| **6. Revenue Streams** | 사내 도구 (무료) -- 향후 확장 시 프리미엄 게임 모드, 기업 라이선스 가능 |
| **7. Cost Structure** | Supabase Free Tier, Vercel Free Tier (사내 규모에서 비용 최소) |
| **8. Key Metrics** | DAU, 게임 실행 횟수/일, 히스토리 기록 수, 재방문율 |
| **9. Unfair Advantage** | 사내 컨텍스트(멤버 관리, 히스토리)가 내장된 전용 도구 -- 범용 앱으로는 대체 불가 |

### 2.3 SWOT Analysis

| | 긍정적 | 부정적 |
|---|--------|--------|
| **내부** | **Strengths**: (1) 사내 맞춤 UX (2) 히스토리 통합 (3) 웹앱으로 설치 불필요 (4) 모던 기술 스택 | **Weaknesses**: (1) 초기 사용자 기반 부재 (2) 단일 기업 의존 (3) 네이티브 앱 대비 제한된 푸시 알림 |
| **외부** | **Opportunities**: (1) MZ세대 재미 문화 트렌드 (2) 점심 회식 증가 트렌드 (3) 다른 팀/기업 확산 가능 (4) PWA로 네이티브 경험 제공 가능 | **Threats**: (1) 기존 무료 복불복 앱 다수 (2) 사용자 이탈 (3) 점심 문화 변화 |

**SO 전략** (Strengths + Opportunities): 임팩트 있는 UI로 MZ세대 취향 저격 + 바이럴 확산
**WT 전략** (Weaknesses + Threats): 히스토리/멤버 관리로 범용 앱과 명확히 차별화, 전환 비용 생성

### 2.4 Porter's Five Forces (간략)

| Force | 수준 | 분석 |
|-------|------|------|
| 신규 진입자 위협 | 높음 | 복불복 앱 진입 장벽 낮음 |
| 대체재 위협 | 높음 | 가위바위보, 눈치 게임, 기존 앱 등 |
| 구매자 교섭력 | 높음 | 무료 대안 많음, 전환 비용 낮음 |
| 공급자 교섭력 | 낮음 | Supabase/Vercel Free Tier 활용 |
| 기존 경쟁 강도 | 중간 | 범용 앱은 많지만, 사내 전용 + 히스토리 결합 제품은 부재 |

**전략적 시사점**: 네트워크 효과(같은 팀이 모두 사용해야 가치 발생)와 데이터 축적(히스토리)으로 전환 비용을 높여 경쟁 우위 확보

---

## 3. Research Analysis (Personas + Competitors + Market Sizing)

### 3.1 User Personas

#### Persona 1: "분위기 메이커" 김대리 (Primary)

| 항목 | 내용 |
|------|------|
| **이름** | 김민수 (30세, 남성) |
| **직급/역할** | 대리 / 개발팀 |
| **특성** | 팀 점심 모임의 주도자, 매번 "오늘 누가 쏠까" 제안, 재미 추구형 |
| **JTBD** | "점심 시간에 팀원들과 웃으면서 누가 쏠지 정하고 싶다" |
| **Pain Points** | (1) 매번 같은 방식(가위바위보)에 질림 (2) 본인이 자주 쏘는 것 같은 느낌 (3) 기존 앱은 밋밋함 |
| **Goals** | 화려하고 재미있는 복불복 + 이력 확인으로 공정성 확보 |
| **기술 수준** | 높음 (개발자) |
| **디바이스** | iPhone 15, Galaxy S24 |

#### Persona 2: "공정성 중시" 박과장 (Secondary)

| 항목 | 내용 |
|------|------|
| **이름** | 박지영 (35세, 여성) |
| **직급/역할** | 과장 / 마케팅팀 |
| **특성** | 합리적, 데이터 기반 의사결정, 공정성에 민감 |
| **JTBD** | "누가 얼마나 쐈는지 투명하게 관리되어 불필요한 분쟁을 없애고 싶다" |
| **Pain Points** | (1) "저번에 내가 쐈는데" 논쟁 (2) 기억에 의존하는 불투명한 이력 (3) 특정인만 계속 걸리는 것 같은 불만 |
| **Goals** | 객관적 이력 관리 + 랭킹으로 동기부여 |
| **기술 수준** | 중간 |
| **디바이스** | iPhone 14 |

#### Persona 3: "신입사원" 이주임 (Tertiary)

| 항목 | 내용 |
|------|------|
| **이름** | 이서연 (26세, 여성) |
| **직급/역할** | 주임 / 인사팀 |
| **특성** | 입사 1년차, 팀 적응 중, 점심 문화에 끼고 싶지만 주도하기 어려움 |
| **JTBD** | "자연스럽게 팀 점심 모임에 참여하고 팀원들과 친해지고 싶다" |
| **Pain Points** | (1) 점심 그룹에 낄 타이밍을 모름 (2) 선배에게 쏘라고 하기 어려움 (3) 앱이 있으면 자연스럽게 참여 가능 |
| **Goals** | 부담 없는 참여 + 재미있는 아이스브레이킹 |
| **기술 수준** | 높음 (디지털 네이티브) |
| **디바이스** | iPhone 16 |

### 3.2 Competitive Analysis (5 Competitors)

| # | 경쟁 제품 | 유형 | 강점 | 약점 | 차별점 (우리) |
|---|----------|------|------|------|--------------|
| 1 | **행운 사다리타기** (App) | 네이티브 앱 | 직관적 사다리 UI, 높은 리뷰 평점 | 히스토리 없음, 팀 관리 없음, 광고 다수 | 히스토리 통합 + 광고 없음 |
| 2 | **Random GO** (App) | 네이티브 앱 | 룰렛/사다리/뽑기 다양한 모드 | 범용 목적, 팀 관리 없음, UI 평범 | 사내 전용 + 임팩트 UI |
| 3 | **모두의 뽑기대장** (Web) | 웹 도구 | 설치 불필요, 다양한 뽑기 모드 | 히스토리/로그인 없음, UI 구식 | 모던 UI + 영구 히스토리 |
| 4 | **Picker (Slack Bot)** | Slack 통합 | Slack 내 즉시 사용, 팀 채널 연동 | 시각적 재미 없음, 히스토리 제한적 | 풍부한 비주얼 경험 |
| 5 | **PICKBOX** (App) | 네이티브 앱 | 다양한 결정 도구, 깔끔한 UI | 팀/그룹 개념 없음, 히스토리 없음 | 팀 관리 + 한턱 이력 |

**경쟁 우위 매트릭스**:

| 기능 | 행운사다리 | Random GO | 뽑기대장 | Picker | PICKBOX | **lunch-event** |
|------|:---------:|:---------:|:--------:|:------:|:-------:|:--------------:|
| 복불복 게임 | O | O | O | O | O | **O** |
| 임팩트 있는 UI | - | - | - | X | - | **O** |
| 한턱 히스토리 | X | X | X | - | X | **O** |
| 팀/멤버 관리 | X | X | X | O | X | **O** |
| 명예의 전당 | X | X | X | X | X | **O** |
| 웹앱 (설치 불필요) | X | X | O | O | X | **O** |
| 광고 없음 | X | X | - | O | X | **O** |

### 3.3 Market Sizing (TAM/SAM/SOM)

**Method 1: Top-Down Approach**

| 단계 | 산출 | 수치 |
|------|------|------|
| **TAM** (Total Addressable Market) | 한국 직장인 수 (2024) x 점심 외식 비율 | ~2,100만 직장인 x 85% 외식 = ~1,785만 명 |
| **SAM** (Serviceable Available Market) | 3인 이상 팀 점심 그룹 x 복불복 문화 채택 가능성 | ~1,785만 x 60% (팀 점심) x 30% (관심) = ~321만 명 |
| **SOM** (Serviceable Obtainable Market) | 1개 기업 내 초기 도입 (6개월) | 1개 기업, 50~200명 활성 사용자 |

**Method 2: Bottom-Up Approach**

| 단계 | 산출 | 수치 |
|------|------|------|
| **초기 (1개월)** | 1개 팀, 5~10명 | 10 users |
| **성장 (3개월)** | 사내 3~5개 팀, 바이럴 확산 | 50 users |
| **안정 (6개월)** | 사내 전체 확산 | 100~200 users |
| **확장 (12개월)** | 타 기업 확산 (오픈소스/공유) | 500~1,000 users |

**결론**: 사내 도구 특성상 SOM이 작지만, 바이럴 계수가 높고(팀 전체가 함께 사용), 1인당 가치가 아닌 팀 단위 네트워크 효과가 핵심.

### 3.4 Customer Journey Map (Primary Persona: 김대리)

```
[인지]         [가입]         [첫 사용]       [반복 사용]      [옹호]
  |              |              |               |              |
  v              v              v               v              v
동료가 "이거    ID/닉네임     팀원 5명 입력   점심 때마다     "우리 팀도
써봐" 링크     입력으로       카드 플립       게임 실행,      써봐" 다른
공유           즉시 가입      실행 -- "대박!" 히스토리 확인   팀에 추천
  |              |              |               |              |
[감정] 호기심   [감정] 간편!   [감정] 재미!    [감정] 편리!   [감정] 자랑!
  |              |              |               |              |
[접점] 슬랙     [접점] 웹앱    [접점] 게임화면  [접점] 명예전당 [접점] 링크공유
  |              |              |               |              |
[Pain] 또       [Pain] 없음    [Pain] 처음이라  [Pain] 가끔    [Pain] 다른
뭐 설치해야돼?               조작 헷갈림     UI가 익숙해짐   팀은 관심없음
  |              |              |               |              |
[해결] 설치     [해결] 3초     [해결] 직관적   [해결] 다양한  [해결] QR코드
불필요 웹앱     가입 완료      온보딩 가이드   게임 모드 제공  포스터 제공
```

---

## 4. Go-To-Market Strategy

### 4.1 ICP (Ideal Customer Profile)

| 속성 | 정의 |
|------|------|
| **회사 규모** | 50~500명 (중소기업 ~ 중견기업) |
| **팀 규모** | 3~15명 점심 그룹 |
| **문화** | 팀 점심 외식 문화가 활발, MZ세대 비율 높음 |
| **기술 환경** | 슬랙/팀즈 사용, 모바일 브라우저 접근 가능 |
| **Pain Intensity** | "누가 쏠까" 결정이 매일 반복되는 팀 |

### 4.2 Beachhead Segment (Geoffrey Moore)

**선택: 자사 개발팀 (우리 회사, 우리 팀)**

| 평가 기준 | 점수 (1-5) | 근거 |
|-----------|:----------:|------|
| Pain 강도 | 5 | 매일 점심마다 결정 필요 |
| 접근성 | 5 | 자사 팀, 즉시 도입 가능 |
| 확산 가능성 | 4 | 사내 다른 팀으로 자연 확산 |
| 피드백 속도 | 5 | 직접 관찰 및 즉시 피드백 |
| **총점** | **19/20** | |

**Beachhead 전략**: 자사 팀에서 1~2주 사용 → 사내 전체 확산 → 외부 공유

### 4.3 GTM (Go-To-Market) Strategy

| 단계 | 기간 | 활동 | 목표 |
|------|------|------|------|
| **Alpha** | Week 1-2 | 자기 팀 5~10명 사용 | 핵심 기능 검증, 버그 수정 |
| **Beta** | Week 3-4 | 사내 3~5개 팀 확산 | 50 users, 피드백 수집 |
| **Launch** | Week 5-8 | 사내 전체 오픈, 슬랙 공지 | 100+ users |
| **Growth** | Month 3+ | 외부 공개 (오픈소스 또는 공유 링크) | 500+ users |

**채널 전략**:
- Primary: 슬랙/팀즈 채널 공유 (사내)
- Secondary: 점심 시간 직접 시연 (바이럴)
- Tertiary: 사내 게시판/위키 등록

**핵심 메트릭**:
| 메트릭 | Alpha 목표 | Launch 목표 |
|--------|-----------|------------|
| DAU | 5+ | 50+ |
| 게임 실행/일 | 1+ | 10+ |
| 히스토리 기록 수/주 | 5+ | 50+ |
| 재방문율 (Week 2) | 80%+ | 70%+ |

### 4.4 Battlecards (주요 경쟁 대응)

#### vs. 행운 사다리타기 (네이티브 앱)

| 우리 | 그들 |
|------|------|
| 설치 불필요 (웹앱) | 앱스토어 설치 필요 |
| 한턱 히스토리 내장 | 히스토리 없음 |
| 광고 없음 | 광고 다수 |
| 팀 멤버 관리 | 매번 수동 입력 |

#### vs. Picker (Slack Bot)

| 우리 | 그들 |
|------|------|
| 카드 플립/사다리 등 시각적 재미 | 텍스트 기반, 재미 없음 |
| 명예의 전당 | 기본적 히스토리만 |
| 독립적 웹앱 | Slack 의존 |

### 4.5 Growth Loops

```
[핵심 루프: 팀 바이럴]

점심 시간 게임 실행
       ↓
여러 명이 함께 화면 봄 (Social Proof)
       ↓
"이거 뭐야? 재밌다!" (관심)
       ↓
다른 팀원/팀에 공유 (Viral)
       ↓
새 사용자 가입
       ↓
새 팀에서 게임 실행 → 반복
```

```
[보조 루프: 명예의 전당 자극]

한턱 히스토리 누적
       ↓
"올해 가장 많이 쏜 사람" 랭킹 확인
       ↓
"나는 몇 번째지?" 호기심
       ↓
앱 재방문 + 게임 참여 동기
       ↓
게임 실행 → 히스토리 축적 → 반복
```

---

## 5. Product Requirements (8-Section PRD)

### 5.1 제품 개요 (Product Overview)

**제품명**: lunch-event (사내 점심 이벤트 앱)
**한줄 설명**: "오늘 누가 쏠까?" -- 재미있는 복불복 게임과 한턱 히스토리로 팀 점심을 더 즐겁게
**기술 스택**: TypeScript, Next.js (App Router), Supabase (Auth + Database)
**배포**: Vercel
**타겟 플랫폼**: 모바일 웹 (반응형, 모바일 우선)

### 5.2 사용자 스토리 및 요구사항 (User Stories & Requirements)

#### Epic 1: 복불복 게임 ("오늘 누가 쏠까")

| ID | User Story | Priority | INVEST |
|----|-----------|:--------:|:------:|
| US-01 | 사용자로서, 참여할 사람들의 이름을 입력할 수 있다 | Must | Pass |
| US-02 | 사용자로서, 전체 인원 중 몇 명을 뽑을지 설정할 수 있다 | Must | Pass |
| US-03 | 사용자로서, 카드 플립 애니메이션으로 당첨자를 확인할 수 있다 | Must | Pass |
| US-04 | 사용자로서, 사다리타기 게임으로 당첨자를 확인할 수 있다 | Must | Pass |
| US-05 | 사용자로서, 게임 결과를 히스토리에 자동 저장할 수 있다 | Must | Pass |
| US-06 | 사용자로서, 게임 모드(카드/사다리)를 선택할 수 있다 | Should | Pass |
| US-07 | 사용자로서, 이전에 함께한 멤버 목록을 불러올 수 있다 | Should | Pass |
| US-08 | 사용자로서, 게임 결과 화면에서 축하/위로 이펙트를 볼 수 있다 | Could | Pass |

#### Epic 2: 한턱 히스토리 (명예의 전당)

| ID | User Story | Priority | INVEST |
|----|-----------|:--------:|:------:|
| US-09 | 사용자로서, 올해 가장 많이 쏜 사람 랭킹을 볼 수 있다 | Must | Pass |
| US-10 | 사용자로서, 개인별 한턱 횟수를 확인할 수 있다 | Must | Pass |
| US-11 | 사용자로서, 월별/연별 통계를 볼 수 있다 | Should | Pass |
| US-12 | 사용자로서, 명예의 전당에서 역대 1위를 볼 수 있다 | Should | Pass |
| US-13 | 사용자로서, 한턱 이력의 날짜/참여자를 상세히 볼 수 있다 | Could | Pass |

#### Epic 3: 회원 관리

| ID | User Story | Priority | INVEST |
|----|-----------|:--------:|:------:|
| US-14 | 사용자로서, 고유한 ID로 가입할 수 있다 | Must | Pass |
| US-15 | 사용자로서, 닉네임을 설정할 수 있다 | Must | Pass |
| US-16 | 사용자로서, ID와 닉네임으로 로그인할 수 있다 | Must | Pass |
| US-17 | 사용자로서, 닉네임을 변경할 수 있다 | Could | Pass |
| US-18 | 사용자로서, 프로필에서 나의 한턱 통계를 볼 수 있다 | Could | Pass |

### 5.3 기능 요구사항 (Functional Requirements)

#### FR-01: 복불복 게임 엔진

```
입력: 참여자 목록 (2~20명), 당첨자 수 (1~N-1명)
출력: 랜덤 선정된 당첨자

게임 모드:
  1. 카드 플립: 카드가 뒤집히며 당첨자 공개
  2. 사다리타기: 사다리 애니메이션으로 결과 도달

요구사항:
  - 공정한 랜덤 (crypto.getRandomValues 사용)
  - 결과 재현 불가 (서버사이드 시드 없음, 클라이언트 랜덤)
  - 애니메이션 완료까지 결과 비공개
  - 게임 완료 후 자동 히스토리 저장
```

#### FR-02: 한턱 히스토리 시스템

```
데이터 모델:
  - event: { id, date, payer_id, participants[], game_mode, created_at }
  - 랭킹 쿼리: GROUP BY payer_id, COUNT(*), ORDER BY count DESC

기능:
  - 올해 랭킹 (1~10위)
  - 개인별 한턱 횟수/비율
  - 월별 트렌드
  - 명예의 전당 (역대 연간 1위)
```

#### FR-03: 회원 관리 시스템

```
가입/로그인:
  - ID: 영문/숫자 조합, 4~20자, 고유
  - 닉네임: 한글/영문, 2~10자
  - 첫 로그인 시 닉네임 설정 필수
  - 비밀번호: 선택적 (사내 도구 특성상 간편 인증 우선)

인증 방식:
  - Supabase Auth (이메일 없이 ID/Password 또는 매직 링크)
  - 세션 관리: Supabase Session
```

### 5.4 비기능 요구사항 (Non-Functional Requirements)

| 항목 | 요구사항 |
|------|---------|
| **성능** | 게임 애니메이션 60fps, 페이지 로드 < 2초 (LCP) |
| **반응형** | 모바일 우선 (360px~), 태블릿/데스크탑 지원 |
| **접근성** | 기본 WCAG 2.1 AA (색상 대비, 키보드 내비게이션) |
| **보안** | Supabase RLS (Row Level Security) 적용, XSS 방지 |
| **가용성** | Vercel Free Tier (99.9% SLA) |
| **브라우저** | Chrome 90+, Safari 15+, Samsung Internet 18+ |
| **데이터** | Supabase Free Tier (500MB DB, 1GB Storage) |

### 5.5 데이터 모델 (Data Model)

```sql
-- 사용자
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(20) UNIQUE NOT NULL,  -- 로그인 ID
  nickname VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 점심 이벤트 (게임 결과)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_mode VARCHAR(20) NOT NULL,  -- 'card_flip' | 'ladder'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 이벤트 참여자
CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  is_payer BOOLEAN DEFAULT FALSE,  -- 당첨(한턱 내는 사람) 여부
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 한턱 히스토리 뷰 (랭킹 조회용)
CREATE VIEW payer_rankings AS
SELECT 
  u.nickname,
  u.user_id,
  COUNT(ep.id) as treat_count,
  EXTRACT(YEAR FROM e.created_at) as year
FROM event_participants ep
JOIN events e ON ep.event_id = e.id
JOIN users u ON ep.user_id = u.id
WHERE ep.is_payer = TRUE
GROUP BY u.nickname, u.user_id, EXTRACT(YEAR FROM e.created_at)
ORDER BY treat_count DESC;
```

### 5.6 UI/UX 요구사항

#### 화면 구성

| 화면 | 설명 | 주요 요소 |
|------|------|----------|
| **홈** | 메인 대시보드 | 빠른 게임 시작 CTA, 최근 게임, 오늘의 랭킹 |
| **게임 설정** | 참여자/모드 선택 | 인원 입력, 당첨자 수 설정, 게임 모드 선택 |
| **카드 플립** | 카드 복불복 | 카드 뒤집기 애니메이션, 결과 공개, 축하 이펙트 |
| **사다리타기** | 사다리 게임 | 사다리 생성/진행 애니메이션, 결과 도달 |
| **명예의 전당** | 랭킹/히스토리 | 연간 랭킹, 월별 통계, 개인 상세 |
| **프로필** | 내 정보 | 닉네임 수정, 내 한턱 통계, 참여 이력 |
| **로그인/가입** | 인증 | ID 입력, 닉네임 설정, 로그인 |

#### UI 디자인 원칙

1. **"개쩔게" = 인상적인 애니메이션**: 카드 플립 3D 트랜지션, 사다리 진행 경로 하이라이트, 결과 공개 시 confetti/파티클 이펙트
2. **모바일 퍼스트**: 엄지 영역 기반 터치 타겟, 큰 카드/버튼
3. **재미 요소**: 결과 화면 meme/이모지, 랭킹 왕관/메달 아이콘
4. **다크모드 우선**: 점심 시간 밝은 환경에서도 가독성 확보를 위해 라이트모드도 지원

### 5.7 기술 아키텍처

```
┌─────────────────────────────────────────┐
│              Frontend (Next.js)          │
│  ┌──────────┬───────────┬──────────┐    │
│  │  Game    │  History  │  Auth    │    │
│  │  Engine  │  Module   │  Module  │    │
│  │ (Client) │ (Server)  │ (Server) │    │
│  └──────────┴───────────┴──────────┘    │
│         App Router + Server Components   │
├─────────────────────────────────────────┤
│              Supabase (BaaS)             │
│  ┌──────────┬───────────┬──────────┐    │
│  │  Auth    │ PostgreSQL│  Storage │    │
│  │          │  + RLS    │  (옵션)  │    │
│  └──────────┴───────────┴──────────┘    │
└─────────────────────────────────────────┘
│              Vercel (Deploy)             │
└─────────────────────────────────────────┘
```

**기술 선택 근거**:
- **Next.js App Router**: 서버 컴포넌트로 히스토리/랭킹 데이터 서버 렌더링, 클라이언트 컴포넌트로 게임 애니메이션
- **Supabase**: Auth + DB + RLS를 하나의 서비스로, Free Tier로 사내 규모 충분
- **Vercel**: Next.js 최적화 배포, Free Tier 지원
- **Framer Motion 또는 CSS Animation**: 카드 플립/사다리 애니메이션 구현

### 5.8 릴리즈 계획 (Release Plan)

| Phase | 기간 | 범위 | 마일스톤 |
|-------|------|------|---------|
| **MVP (v0.1)** | Week 1-2 | 카드 플립 게임 + 간편 로그인 + 기본 히스토리 | 자기 팀 사용 시작 |
| **v0.2** | Week 3-4 | 사다리타기 추가 + 명예의 전당 + UI 폴리싱 | 사내 Beta 공개 |
| **v1.0** | Week 5-6 | 반응형 완성 + 성능 최적화 + 버그 수정 | 사내 공식 Launch |
| **v1.1+** | Month 2+ | 추가 게임 모드, PWA, 통계 강화 | Growth Phase |

---

## 6. Pre-mortem Analysis

### 6.1 Top 3 Risks

| # | 리스크 | 확률 | 영향 | 완화 전략 |
|---|--------|:----:|:----:|----------|
| 1 | **초기 사용자 확보 실패** -- 팀원들이 귀찮아서 안 씀 | 중 | 고 | (1) 본인 팀에서 먼저 사용하며 시연 (2) 점심 시간에 직접 화면 보여주기 (3) 3초 가입으로 진입 장벽 최소화 |
| 2 | **애니메이션 성능 이슈** -- 모바일에서 버벅임 | 중 | 고 | (1) CSS 기반 애니메이션 우선 (GPU 가속) (2) 저사양 디바이스 테스트 (3) 점진적 향상 (Progressive Enhancement) |
| 3 | **지속 사용 동기 부족** -- 처음엔 신기해도 금방 질림 | 중 | 중 | (1) 명예의 전당으로 경쟁 심리 자극 (2) 다양한 게임 모드 추가 계획 (3) 월간 리셋/시즌제 도입 |

### 6.2 추가 리스크

| 리스크 | 완화 전략 |
|--------|----------|
| Supabase Free Tier 한도 초과 | 사내 규모(~200명)에서는 여유, 모니터링 설정 |
| 랜덤 공정성 논란 | crypto.getRandomValues 사용, 알고리즘 투명하게 공개 |
| 개인정보 이슈 | 최소 정보 수집 (ID, 닉네임만), 사내 도구 특성상 낮은 리스크 |

---

## 7. Test Scenarios

### 7.1 기능 테스트

| ID | 시나리오 | 기대 결과 | User Story |
|----|---------|----------|------------|
| TS-01 | 5명 입력, 1명 뽑기로 카드 플립 실행 | 1명만 당첨, 애니메이션 정상, 히스토리 저장 | US-01,02,03,05 |
| TS-02 | 10명 입력, 3명 뽑기로 사다리 실행 | 3명 당첨, 사다리 경로 표시, 히스토리 저장 | US-01,02,04,05 |
| TS-03 | 올해 랭킹 조회 | 한턱 횟수 내림차순, 상위 10명 표시 | US-09 |
| TS-04 | 중복 ID로 가입 시도 | 에러 메시지 표시, 가입 실패 | US-14 |
| TS-05 | 닉네임 없이 로그인 시도 (첫 로그인) | 닉네임 설정 화면으로 리다이렉트 | US-15 |
| TS-06 | 게임 모드 전환 (카드 <-> 사다리) | 정상 전환, 참여자 목록 유지 | US-06 |

### 7.2 비기능 테스트

| ID | 시나리오 | 기대 결과 |
|----|---------|----------|
| TS-07 | 모바일(iPhone SE)에서 카드 플립 | 60fps 애니메이션, 레이아웃 정상 |
| TS-08 | 20명 동시 접속 시 게임 실행 | 응답 시간 < 1초 |
| TS-09 | 히스토리 100건 이상 시 랭킹 조회 | 로딩 < 2초 |
| TS-10 | Supabase RLS 우회 시도 | 차단됨, 본인 데이터만 수정 가능 |

---

## 8. Stakeholder Map

| 역할 | 이해관계 | 영향력 | 참여 수준 |
|------|---------|:------:|----------|
| **개발자 (본인)** | 직접 개발 및 사용 | 높음 | Owner |
| **팀원 (같은 팀)** | 일차 사용자, 피드백 제공 | 높음 | Active User / Tester |
| **다른 팀 리드** | 팀 도입 결정권자 | 중간 | Evaluator |
| **일반 직원** | 최종 사용자 | 낮음 | End User |
| **IT/보안팀** | 사내 도구 보안 검토 | 중간 | Reviewer (필요 시) |

---

## Attribution

This PRD was generated by the PM Agent Team integrating frameworks from:

- **Discovery**: Teresa Torres' Opportunity Solution Tree (Continuous Discovery Habits)
- **Strategy**: Strategyzer Value Proposition Canvas + Ash Maurya Lean Canvas + JTBD 6-Part VP
- **Research**: Alan Cooper Personas + Competitive Analysis + TAM/SAM/SOM Dual-Method
- **GTM**: Geoffrey Moore Beachhead Segment (Crossing the Chasm) + Growth Loops
- **Execution**: Pre-mortem Analysis + INVEST User Stories

Frameworks sourced from [pm-skills](https://github.com/phuryn/pm-skills) by Pawel Huryn (MIT License).
