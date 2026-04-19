/**
 * 오늘의 메뉴 운명 — 정적 데이터 + 순수 생성기
 * 뽑기 기록/통계는 src/lib/actions/fortune.ts 에서 DB로 관리
 */

/* ── 운세 문구 (바나프레소 스타일, 짧고 긍정적) ────────── */
export const FORTUNE_MESSAGES: string[] = [
  // 행운
  '오늘 하루 작은 행운이 당신을 따라다녀요',
  '예상치 못한 기쁜 소식이 찾아올 거예요',
  '오늘은 뭘 해도 잘 풀리는 날이에요',
  '행운의 기운이 당신 곁에 머물고 있어요',
  '오늘 당신의 선택은 전부 정답이에요',
  '우연처럼 보이지만, 다 이유가 있는 행운이에요',
  '오늘은 평소보다 운이 두 배로 따르는 날이에요',
  '작은 행운이 쌓여 큰 기쁨이 될 거예요',
  // 음식
  '이 메뉴를 먹으면 오후가 활기차질 거예요',
  '오늘의 행운 메뉴! 맛있게 드세요',
  '이 음식이 당신의 에너지를 가득 채워줄 거예요',
  '맛있는 점심이 오후 컨디션을 좌우해요',
  '오늘은 이 메뉴가 당신을 부르고 있어요',
  '이 메뉴와 함께라면 오후도 거뜬해요',
  '오늘의 행운은 맛있는 한 끼에서 시작돼요',
  '배부른 행복이 당신의 오후를 책임져요',
  // 인간관계
  '오늘 점심 자리에서 좋은 대화가 오갈 거예요',
  '함께 밥 먹는 사람에게 감사를 전해보세요',
  '따뜻한 한마디가 주변을 환하게 만들어요',
  '점심 시간에 뜻밖의 좋은 만남이 기다려요',
  '좋은 사람과 맛있는 음식, 이보다 완벽할 수 없어요',
  '오늘 만나는 사람이 좋은 인연이 될 수 있어요',
  // 일/커리어
  '오후에 번뜩이는 아이디어가 떠오를 거예요',
  '당신의 노력이 곧 빛을 발할 거예요',
  '점심 후 집중력이 최고조에 달할 거예요',
  '오늘 시작하는 일은 좋은 결과를 가져와요',
  '오늘 하루 당신의 능력을 인정받게 될 거예요',
  '점심 먹고 돌아가면 좋은 메일이 와 있을 거예요',
  // 건강/에너지
  '따뜻한 음식이 몸과 마음을 치유해줄 거예요',
  '오늘은 충전의 날! 맛있게 먹고 힘내세요',
  '건강한 한 끼가 하루를 바꿔요',
  '맛있는 음식으로 스트레스를 날려보세요',
  '오늘의 점심은 당신의 활력소가 될 거예요',
  // 재물
  '오늘 예상치 못한 작은 횡재가 있을 수 있어요',
  '점심값이 아깝지 않은 행운이 따라와요',
  '금전적으로 안정적인 하루가 될 거예요',
  // 격려/긍정
  '오늘의 선택을 믿으세요, 좋은 결과가 기다려요',
  '점심 후 산책하면 더 큰 행운이 찾아와요',
  '오늘 당신의 미소가 주변에 행복을 전해요',
  '새로운 도전이 성공으로 이어질 거예요',
  '오늘은 감사한 마음이 행운을 불러와요',
  '맛있는 음식 앞에서 모든 걱정이 사라져요',
  '오늘의 점심이 이번 주 최고의 식사가 될 거예요',
  '오늘은 당신이 주인공인 날이에요',
  '점심 메뉴 고민은 이제 끝! 운명이 정해줬어요',
  '직감을 따르세요, 오늘은 다 맞는 날이에요',
  '이 메뉴는 오늘 당신만을 위해 준비된 거예요',
  '따뜻한 밥 한 끼의 힘은 생각보다 대단해요',
  '행운은 준비된 자에게 오지만, 오늘은 그냥 와요',
  '맛있게 먹는 당신의 모습이 가장 빛나요',
  '오늘 점심에 숨겨진 행운의 메시지를 찾아보세요',
]

/* ── 점심 메뉴 목록 ──────────────────────────────── */
export interface LunchMenu {
  name: string
  emoji: string
  category: string
}

export const LUNCH_MENUS: LunchMenu[] = [
  { name: '김치찌개', emoji: '🍲', category: '한식' },
  { name: '된장찌개', emoji: '🫕', category: '한식' },
  { name: '부대찌개', emoji: '🍲', category: '한식' },
  { name: '순두부찌개', emoji: '🫕', category: '한식' },
  { name: '비빔밥', emoji: '🍚', category: '한식' },
  { name: '불고기', emoji: '🥩', category: '한식' },
  { name: '제육볶음', emoji: '🍖', category: '한식' },
  { name: '닭갈비', emoji: '🍗', category: '한식' },
  { name: '삼겹살', emoji: '🥓', category: '한식' },
  { name: '짜장면', emoji: '🍜', category: '중식' },
  { name: '짬뽕', emoji: '🌶️', category: '중식' },
  { name: '탕수육', emoji: '🍗', category: '중식' },
  { name: '볶음밥', emoji: '🍳', category: '중식' },
  { name: '초밥', emoji: '🍣', category: '일식' },
  { name: '라멘', emoji: '🍜', category: '일식' },
  { name: '돈까스', emoji: '🥩', category: '일식' },
  { name: '우동', emoji: '🍜', category: '일식' },
  { name: '피자', emoji: '🍕', category: '양식' },
  { name: '파스타', emoji: '🍝', category: '양식' },
  { name: '햄버거', emoji: '🍔', category: '양식' },
  { name: '샐러드', emoji: '🥗', category: '양식' },
  { name: '떡볶이', emoji: '🍢', category: '분식' },
  { name: '김밥', emoji: '🍙', category: '분식' },
  { name: '쌀국수', emoji: '🍜', category: '아시안' },
  { name: '카레', emoji: '🍛', category: '아시안' },
]

/* ── 운세 결과 타입 ──────────────────────────────── */
export interface FortuneResult {
  menu: LunchMenu
  message: string
  score: number
}

/**
 * 운세 생성 — 서버 전용. 서버 액션에서만 호출하세요.
 */
export function drawFortune(): FortuneResult {
  const menu = LUNCH_MENUS[Math.floor(Math.random() * LUNCH_MENUS.length)]
  const message = FORTUNE_MESSAGES[Math.floor(Math.random() * FORTUNE_MESSAGES.length)]
  const score = Math.floor(Math.random() * 21) + 80 // 80 ~ 100

  return { menu, message, score }
}
