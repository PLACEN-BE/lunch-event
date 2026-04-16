-- 메뉴 투표 테이블
CREATE TABLE menu_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  menu_category VARCHAR(20) NOT NULL CHECK (
    menu_category IN ('한식','중식','양식','일식','패스트푸드','샐러드','카레/태국','샌드위치','도시락','기타')
  ),
  voted_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, voted_at)
);

CREATE INDEX idx_menu_votes_date ON menu_votes(voted_at DESC);
CREATE INDEX idx_menu_votes_category ON menu_votes(menu_category, voted_at);

-- 주간 메뉴 집계 뷰
CREATE OR REPLACE VIEW weekly_menu_rankings AS
SELECT
  menu_category,
  COUNT(*) AS vote_count
FROM menu_votes
WHERE voted_at >= date_trunc('week', CURRENT_DATE)::date
GROUP BY menu_category
ORDER BY vote_count DESC, menu_category ASC;

-- 월간 메뉴 집계 뷰
CREATE OR REPLACE VIEW monthly_menu_rankings AS
SELECT
  menu_category,
  COUNT(*) AS vote_count
FROM menu_votes
WHERE voted_at >= date_trunc('month', CURRENT_DATE)::date
GROUP BY menu_category
ORDER BY vote_count DESC, menu_category ASC;

-- MVP 뷰: Best 메뉴(이번 주 1위)를 가장 많이 선택한 사용자
-- 동점 시 menu_category 알파벳순으로 결정적 타이브레이킹
CREATE OR REPLACE VIEW weekly_menu_mvp AS
SELECT
  u.nickname,
  u.user_id AS login_id,
  u.id AS uid,
  u.avatar_url,
  mv.menu_category,
  COUNT(*) AS pick_count
FROM menu_votes mv
JOIN users u ON mv.user_id = u.id
WHERE mv.voted_at >= date_trunc('week', CURRENT_DATE)::date
  AND mv.menu_category = (
    SELECT menu_category FROM menu_votes
    WHERE voted_at >= date_trunc('week', CURRENT_DATE)::date
    GROUP BY menu_category ORDER BY COUNT(*) DESC, menu_category ASC LIMIT 1
  )
GROUP BY u.id, u.nickname, u.user_id, u.avatar_url, mv.menu_category
ORDER BY pick_count DESC, u.nickname ASC
LIMIT 1;

-- RLS
ALTER TABLE menu_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Menu votes are viewable by all" ON menu_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON menu_votes
  FOR INSERT WITH CHECK (true);
