-- 식당(restaurants)과 리뷰(reviews) 테이블.
-- 커스텀 쿠키 세션 패턴을 따라 RLS는 비활성화하고, 모든 쓰기는
-- server action에서 getCurrentUser()로 세션 검증 후 수행한다.

CREATE TABLE IF NOT EXISTS restaurants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT,
  category    TEXT,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body          TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  tags          TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant
  ON reviews(restaurant_id, created_at DESC);

ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews     DISABLE ROW LEVEL SECURITY;

INSERT INTO restaurants (id, name, address, category, lat, lng) VALUES
  ('11111111-1111-1111-1111-111111111111', '판교 김밥천국', '경기 성남시 분당구 판교역로 235', '한식', 37.39458, 127.11103),
  ('22222222-2222-2222-2222-222222222222', '판교 라멘집', '경기 성남시 분당구 판교로 256', '일식', 37.39572, 127.11052)
ON CONFLICT DO NOTHING;
