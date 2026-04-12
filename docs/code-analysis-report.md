# lunch-event 프로젝트 코드 품질 분석 보고서

> 분석일: 2026-04-12
> 분석 대상: lunch-event (사내 점심 복불복 게임)
> 관점: 15년차 Next.js / React 시니어 엔지니어의 프로덕션 레디니스 리뷰

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프레임워크** | Next.js 16 (App Router) + React 19 |
| **언어** | TypeScript 6 (strict mode) |
| **스타일** | Tailwind CSS 4 + CSS Variables |
| **상태관리** | Zustand 5 |
| **백엔드** | Supabase (PostgreSQL + Storage) |
| **애니메이션** | Framer Motion 12 + Canvas API |
| **인증** | 커스텀 쿠키 세션 (비밀번호 없음) |
| **소스 규모** | ~37개 파일, ~2,000 LOC |

---

## 2. 종합 평가

### 점수표

| 영역 | 점수 | 등급 |
|------|:----:|:----:|
| 아키텍처 설계 | 55/100 | D+ |
| 인증/보안 | 25/100 | F |
| 타입 안전성 | 60/100 | C- |
| 코드 품질 | 65/100 | C |
| 테스트 | 0/100 | F |
| 에러 처리 | 35/100 | F |
| 성능 | 70/100 | B- |
| UX/접근성 | 65/100 | C |
| 유지보수성 | 55/100 | D+ |
| DevOps/인프라 | 30/100 | F |
| **종합** | **46/100** | **F** |

**한 줄 요약: MVP 프로토타입으로는 괜찮지만, 프로덕션이라 부르기엔 심각한 구조적 결함이 있다.**

---

## 3. CRITICAL — 즉시 수정 필요

### 3.1 인증 시스템의 근본적 모순 (SEVERITY: CRITICAL)

**파일:** `src/lib/actions/game.ts:12-13` vs `src/lib/actions/auth.ts`

```typescript
// game.ts — Supabase Auth를 사용
const { data: { user } } = await supabase.auth.getUser()

// auth.ts — 커스텀 쿠키를 사용
const SESSION_COOKIE = 'lunch_user_id'
cookieStore.set(SESSION_COOKIE, newUser.id, { ... })
```

**두 개의 인증 시스템이 공존하고 있다.** 앱의 나머지 전체는 `lunch_user_id` 쿠키 기반 커스텀 세션을 사용하지만, `saveGameResult`만 `supabase.auth.getUser()`를 호출한다. Supabase Auth로 로그인한 적이 없으므로 이 호출은 **항상 null을 반환**하고, 게임 결과 저장이 영원히 실패할 가능성이 높다.

> 실제로 동작하고 있다면 RLS가 사실상 꺼져 있거나, anon key의 권한이 과도하게 열려 있을 것이다.

**수정 방향:** `game.ts`에서도 동일하게 쿠키 기반 세션을 사용해야 한다.

---

### 3.2 RLS 정책과 인증의 불일치 (SEVERITY: CRITICAL)

**파일:** `supabase/schema.sql:88-94`

```sql
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (created_by = auth.uid());
```

RLS 정책은 `auth.uid()`를 참조하지만, 앱은 Supabase Auth를 사용하지 않는다. 따라서:

- `auth.uid()`는 항상 `null`이다
- UPDATE 정책 `id = auth.uid()` → 항상 false → **프로필 업데이트가 RLS에 의해 차단**될 수 있다
- INSERT 정책 `created_by = auth.uid()` → 항상 false → **이벤트 생성이 차단**될 수 있다

현재 동작하고 있다면 두 가지 가능성:
1. Service Role Key로 우회하고 있거나
2. RLS가 실제로는 적용되지 않고 있거나

**어느 쪽이든 보안 체계가 유명무실하다는 뜻이다.**

---

### 3.3 비밀번호 없는 인증 = 누구나 사칭 가능 (SEVERITY: CRITICAL)

**파일:** `src/lib/actions/auth.ts:57-84`

```typescript
export async function signIn(formData: FormData) {
  const userId = (formData.get('userId') as string)?.trim().toLowerCase()
  // ...
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('user_id', userId)
    .single()
  // user_id만 알면 바로 로그인 성공
  cookieStore.set(SESSION_COOKIE, user.id, { ... })
}
```

비밀번호, OTP, 소셜 로그인 어떤 것도 없다. 사내 서비스라 "괜찮다"고 생각할 수 있지만:
- 누군가의 ID를 알면 바로 그 사람으로 로그인
- 게임 결과 조작 가능
- 프로필 변경 가능

**최소한 Supabase Auth (Magic Link 또는 OAuth)를 사용하거나, 사내 SSO 연동이 필요하다.**

---

### 3.4 게임 결과 저장의 위험한 폴백 (SEVERITY: HIGH)

**파일:** `src/lib/actions/game.ts:34-37`

```typescript
const participants = participantNames.map((name) => ({
  event_id: event.id,
  user_id: userMap.get(name) ?? user.id,  // 없는 닉네임 → 현재 유저로 대체
  is_payer: winnerNames.includes(name),
}))
```

닉네임이 DB에 없는 참가자를 현재 로그인 사용자의 ID로 대체한다. 이는:
- **허위 결제 기록 생성** — 존재하지 않는 사람이 "쏜 것"으로 기록됨
- **랭킹 오염** — 실제로 쏘지 않은 사람의 treat_count 증가
- **데이터 무결성 파괴** — 한 이벤트에 동일 user_id가 중복 삽입 가능 (unique constraint 없음)

---

### 3.5 전체 사용자 테이블 풀스캔 (SEVERITY: HIGH)

**파일:** `src/lib/actions/game.ts:27-29`

```typescript
const { data: users } = await supabase
  .from('users')
  .select('id, nickname')
// WHERE 절 없음 — 전체 사용자 로딩
```

참가자 매칭을 위해 **users 테이블 전체**를 메모리에 올린다. 사용자가 100명이면 괜찮겠지만, 이건 설계 자체가 잘못되었다. 닉네임 배열을 `IN` 절로 조회해야 한다:

```typescript
const { data: users } = await supabase
  .from('users')
  .select('id, nickname')
  .in('nickname', participantNames)
```

---

## 4. HIGH — 프로덕션 전 반드시 수정

### 4.1 미들웨어 파일 위치 의심

**파일:** `src/proxy.ts`

Next.js의 미들웨어는 `src/middleware.ts` 또는 프로젝트 루트의 `middleware.ts`에 위치해야 한다. `proxy.ts`라는 이름은 Next.js가 자동으로 인식하지 않는다. 별도의 설정 없이는 **미들웨어가 실행되지 않을 수 있다.**

실제로 동작하고 있다면 `next.config.ts`에서 별도 설정이 있을 텐데, 현재 config에는 해당 설정이 없다.

---

### 4.2 닉네임 중복 미방지 (SEVERITY: HIGH)

**파일:** `supabase/schema.sql:5-6`

```sql
user_id VARCHAR(20) UNIQUE NOT NULL,  -- UNIQUE 있음
nickname VARCHAR(10) NOT NULL,         -- UNIQUE 없음
```

닉네임에 UNIQUE constraint가 없다. 게임 결과 저장 시 닉네임으로 사용자를 매칭하므로(`game.ts:31`), 동명이인이 있으면 **먼저 등록된 사용자만 매칭되고 나머지는 current user로 폴백**된다.

---

### 4.3 에러 핸들링의 일관성 부재 (SEVERITY: HIGH)

| 파일 | 에러 처리 방식 |
|------|--------------|
| `auth.ts` | `console.error` + 한국어 에러 메시지 반환 |
| `game.ts` | 에러 로깅 없음, 메시지만 반환 |
| `ranking.ts` | 에러 시 빈 배열 반환 (무음 실패) |
| `profile.ts` | 한국어 에러 메시지 반환, 로깅 없음 |

무음 실패(silent failure)는 디버깅을 불가능하게 만든다. `ranking.ts`에서 DB 연결이 끊어져도 사용자에게는 "기록이 없습니다"만 보인다.

---

### 4.4 테스트 코드 전무 (SEVERITY: HIGH)

테스트 파일이 단 하나도 없다.

- Jest, Vitest, Playwright, Cypress — 아무것도 설치되지 않음
- game-engine의 Fisher-Yates shuffle이 공정한지 검증 불가
- 사다리 bridge 알고리즘의 엣지 케이스 검증 불가
- 인증 플로우 리그레션 방지 불가

최소한 `game-engine.ts`의 핵심 알고리즘에 대한 유닛 테스트는 있어야 한다.

---

### 4.5 Error Boundary / loading.tsx / not-found.tsx 부재 (SEVERITY: HIGH)

```
src/app/
├── layout.tsx     ✓
├── page.tsx       ✓
├── loading.tsx    ✗ 없음
├── error.tsx      ✗ 없음
├── not-found.tsx  ✗ 없음
├── game/
│   ├── loading.tsx  ✗ 없음
│   ├── error.tsx    ✗ 없음
│   ...
```

- **`loading.tsx` 없음**: 서버 컴포넌트의 데이터 페칭 중 빈 화면
- **`error.tsx` 없음**: 런타임 에러 시 앱 전체 크래시
- **`not-found.tsx` 없음**: 잘못된 URL 접근 시 Next.js 기본 404 페이지

---

## 5. MEDIUM — 코드 품질 개선

### 5.1 타입 안전성 구멍

**파일:** `src/app/page.tsx:45-49`

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const participants = event.event_participants as any[]
const payers = participants
  ?.filter((p: any) => p.is_payer)
  .map((p: any) => p.users?.nickname ?? p.users?.[0]?.nickname)
```

`as any`가 4번 등장한다. Supabase의 relation join 결과에 대한 타입을 정의하지 않아서 발생한 문제. `supabase gen types`로 타입을 자동 생성하거나, 최소한 수동으로 join 결과 타입을 정의해야 한다.

---

### 5.2 매직 넘버/상수 산재

```typescript
// LadderGame.tsx
const ROWS = 8
const TOTAL_DURATION = 6000

// auth.ts
userId.length > 20    // 매직넘버
nickname.length > 10  // 매직넘버

// profile.ts
nickname.length > 10  // 동일 매직넘버 중복

// schema.sql
VARCHAR(20)  // userId 길이
VARCHAR(10)  // nickname 길이
```

같은 제약 조건(닉네임 2~10자, ID 2~20자)이 **3곳 이상에서 하드코딩**되어 있다. 하나를 바꾸면 나머지를 잊는다.

---

### 5.3 SESSION_COOKIE 상수 3중 정의

```typescript
// middleware.ts
const SESSION_COOKIE = 'lunch_user_id'

// auth.ts
const SESSION_COOKIE = 'lunch_user_id'

// profile.ts
const SESSION_COOKIE = 'lunch_user_id'
```

DRY 원칙 위반. 쿠키 이름이 바뀌면 3곳을 동시에 바꿔야 한다.

---

### 5.4 사다리 게임 당첨자 보장 문제

**파일:** `src/components/game/LadderGame.tsx:45-57`

```typescript
let attempts = 0
do {
  b = generateBridges(count, ROWS)
  // ... path tracing ...
  attempts++
} while (w.length !== pickCount && attempts < 100)
```

- Bridge를 랜덤 생성 후, 원하는 당첨자 수가 나올 때까지 최대 100번 반복
- 참가자가 많고 pickCount가 까다로우면 100번 안에 실패할 수 있음
- 실패 시 **당첨자 수가 pickCount와 다른 채로 게임 진행** — 무결성 파괴
- 이 로직은 `useState` 초기화 함수 안에 있어서, 실패를 사용자에게 알릴 방법도 없음

---

### 5.5 `getRecentEvents` 반환 타입 미정의

**파일:** `src/lib/actions/ranking.ts:28-46`

```typescript
export async function getRecentEvents() {
  // 반환 타입 선언 없음
  const { data } = await supabase.from('events').select(`
    id, game_mode, created_at,
    event_participants (user_id, is_payer, users ( nickname ))
  `)
  return data ?? []
}
```

Join 포함 복잡 쿼리의 반환 타입이 `any`로 추론된다. 이것이 `page.tsx`에서 `as any` 캐스팅이 필요한 근본 원인.

---

### 5.6 쿠키 검증 없는 미들웨어

**파일:** `src/lib/supabase/middleware.ts:5-17`

```typescript
export async function updateSession(request: NextRequest) {
  const userId = request.cookies.get(SESSION_COOKIE)?.value
  if (!userId && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(url)
  }
  return NextResponse.next({ request })
}
```

쿠키의 **존재 여부만** 확인하고, 값이 유효한 UUID인지, 실제 DB에 존재하는 사용자인지 검증하지 않는다. 임의의 문자열을 쿠키에 넣어도 인증을 통과한다.

---

## 6. LOW — 개선 권장

### 6.1 `secureRandomIndex`의 모듈로 편향(Modulo Bias)

**파일:** `src/lib/game-engine.ts:4-8`

```typescript
function secureRandomIndex(max: number): number {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] % max  // modulo bias
}
```

`Uint32Array`의 최대값은 2^32 = 4,294,967,296이다. `max`가 이 값의 약수가 아니면 일부 값이 미세하게 더 자주 나온다. 점심 복불복에서는 무시할 수준이지만, "공정한 랜덤"을 표방하면서 modulo bias가 있다는 건 아이러니하다.

---

### 6.2 BottomNav의 불필요한 리렌더링

**파일:** `src/components/ui/BottomNav.tsx`

`BottomNav`는 `usePathname()`을 사용하므로 클라이언트 컴포넌트다. 하지만 `layout.tsx`의 `<body>` 안에서 직접 렌더링되므로, 모든 페이지 전환 시 리렌더링된다. 네비게이션 아이템이 4개뿐이라 실질적인 성능 문제는 아니지만, `React.memo`로 감싸는 게 좋은 습관이다.

---

### 6.3 접근성(Accessibility) 부재

- `<button>` 요소에 `aria-label` 없음 (특히 `+` 버튼, `✕` 버튼)
- `<canvas>` 요소에 대체 텍스트 없음 (사다리 게임)
- 색상만으로 당첨/비당첨 구분 — 색맹 사용자 고려 없음
- 키보드 네비게이션 미지원

---

### 6.4 ESLint / Prettier 미설정

- `.eslintrc.*` 커스텀 설정 없음 (Next.js 기본만 사용)
- Prettier 미설치
- import 순서 규칙 없음
- `@typescript-eslint` 커스텀 규칙 없음
- 코드 포매팅 일관성은 현재 우연히 유지되고 있을 뿐

---

### 6.5 환경변수 검증 없음

```typescript
// client.ts, server.ts
process.env.NEXT_PUBLIC_SUPABASE_URL!    // non-null assertion
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// profile.ts
process.env.NEXT_PUBLIC_SUPABASE_URL!
process.env.SUPABASE_SERVICE_ROLE_KEY!
```

`!` (non-null assertion)으로 환경변수 존재를 "믿고" 있다. 빌드 타임이나 런타임에 환경변수가 없으면 cryptic한 에러가 발생한다. `@t3-oss/env-nextjs` 같은 라이브러리로 빌드 시점에 검증해야 한다.

---

## 7. 아키텍처 분석

### 7.1 디렉토리 구조 (양호)

```
src/
├── app/            # Route segments (App Router)
├── components/     # Feature-based 분리
│   ├── ui/         # Atomic UI
│   ├── auth/       # 인증
│   ├── game/       # 게임
│   ├── ranking/    # 랭킹
│   └── profile/    # 프로필
├── lib/
│   ├── supabase/   # DB 클라이언트
│   └── actions/    # Server Actions
├── stores/         # Zustand
└── types/          # 타입 정의
```

Feature-based 분리는 적절하다. 다만 앱이 성장하면 `lib/actions/`가 비대해질 수 있으므로 feature별로 묶는 것을 고려할 시점이 온다.

---

### 7.2 Server / Client 경계 (양호)

- **Server Components**: `page.tsx` 파일들 (데이터 페칭)
- **Client Components**: 인터랙티브 컴포넌트 (`'use client'`)
- **Server Actions**: 데이터 변이 (`'use server'`)

경계가 비교적 명확하게 나뉘어 있다. `Promise.all`로 병렬 데이터 페칭도 하고 있어서 기본적인 패턴은 이해하고 있다.

---

### 7.3 상태 관리 (적절)

Zustand를 게임 상태에만 한정적으로 사용하는 것은 올바른 판단이다. 서버 상태(랭킹, 사용자 정보)를 Zustand에 넣지 않은 것도 좋다. 다만 `GameState` 인터페이스에 setter 함수를 직접 포함한 것은 Zustand의 anti-pattern에 가깝다.

---

## 8. 잘한 점

솔직하게 말하면, 이 프로젝트에서 잘 된 부분도 분명히 있다:

1. **`game-engine.ts`의 알고리즘 설계** — `crypto.getRandomValues()` 기반 CSPRNG, Fisher-Yates shuffle, 사다리 bridge 충돌 방지 로직 등 핵심 알고리즘이 정교하다.

2. **Canvas 기반 사다리 애니메이션** — `requestAnimationFrame` 기반 프레임 렌더링, DPR 대응, lerp 보간 등이 잘 구현되어 있다.

3. **아바타 업로드 플로우** — Signed URL 생성 → 클라이언트 리사이즈 → XHR 업로드 → 기존 파일 삭제 → Public URL 저장. 이 흐름은 프로덕션 수준에 가깝다.

4. **Server Actions의 적절한 사용** — Next.js App Router의 Server Actions 패턴을 잘 이해하고, 민감한 작업은 서버에서 처리하려는 의도가 보인다.

5. **한글 IME 처리** — `ParticipantInput.tsx`에서 `isComposing` ref를 통한 한글 조합 중 Enter 방지. 많은 개발자가 놓치는 부분이다.

6. **Promise.all 병렬 데이터 페칭** — 홈 페이지에서 3개의 독립적인 데이터 페칭을 병렬로 처리.

---

## 9. 개선 로드맵 (우선순위 기반)

### Phase 1: 보안 기초 (1-2일)

| # | 작업 | 파일 |
|---|------|------|
| 1 | 인증 시스템 통일 (쿠키 또는 Supabase Auth 중 하나 선택) | `auth.ts`, `game.ts`, `schema.sql` |
| 2 | RLS 정책을 실제 인증 방식에 맞게 수정 | `schema.sql` |
| 3 | `game.ts`의 위험한 user.id 폴백 제거 | `game.ts` |
| 4 | 미들웨어 파일 위치 및 쿠키 검증 추가 | `middleware.ts` |
| 5 | 닉네임 UNIQUE constraint 추가 | `schema.sql` |

### Phase 2: 안정성 (2-3일)

| # | 작업 | 파일 |
|---|------|------|
| 6 | `error.tsx`, `loading.tsx`, `not-found.tsx` 추가 | `app/` 각 세그먼트 |
| 7 | 에러 로깅 시스템 통일 (서버 사이드) | `lib/actions/*.ts` |
| 8 | Supabase 타입 자동 생성 (`supabase gen types`) | `types/` |
| 9 | `as any` 제거, 조인 결과 타입 정의 | `page.tsx`, `ranking.ts` |
| 10 | 공유 상수 파일 추출 | 신규: `lib/constants.ts` |

### Phase 3: 테스트/품질 (3-5일)

| # | 작업 | 파일 |
|---|------|------|
| 11 | Vitest 설정 + game-engine 유닛 테스트 | 신규 |
| 12 | ESLint 커스텀 규칙 + Prettier 설정 | 프로젝트 루트 |
| 13 | 환경변수 검증 (`@t3-oss/env-nextjs`) | 신규: `lib/env.ts` |
| 14 | Playwright E2E (인증 플로우, 게임 플로우) | 신규 |

### Phase 4: UX 완성도 (선택)

| # | 작업 | 파일 |
|---|------|------|
| 15 | 접근성 개선 (aria-label, 키보드 네비게이션) | 컴포넌트 전반 |
| 16 | 사다리 당첨자 수 보장 알고리즘 개선 | `LadderGame.tsx` |
| 17 | 랭킹 페이지네이션 | `ranking.ts`, `RankingBoard.tsx` |

---

## 10. 결론

이 프로젝트는 **"빠르게 만든 MVP"의 전형적인 모습**이다. UI/UX 감각이 좋고, Next.js App Router의 패턴을 어느 정도 이해하고 있으며, 게임 엔진의 알고리즘은 예상 이상으로 탄탄하다.

그러나 **인증/보안이라는 기초 체력이 심각하게 부실**하다. 두 개의 인증 시스템이 혼재하고, RLS가 사실상 무의미하며, 비밀번호 없이 누구나 아무나 될 수 있는 구조는 사내 서비스라 하더라도 용납하기 어렵다. 테스트 코드가 전무하고, 에러 핸들링이 곳곳에서 무음 실패하는 것도 프로덕션을 자처하기엔 부족하다.

**Phase 1만 완수하면 "쓸 수 있는" 수준이 되고, Phase 2까지 가면 "안심하고 쓸 수 있는" 수준이 된다.**

현재 상태로 프로덕션에 나가면 안 된다.

---

*이 보고서는 코드 리뷰 자동화 도구가 아닌, 전체 소스 코드를 직접 정독한 결과를 기반으로 작성되었습니다.*
