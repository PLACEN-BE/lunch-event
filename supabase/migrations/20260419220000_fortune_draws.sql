-- 운세 뽑기 기록 (일일 3회 제한)
CREATE TABLE fortune_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  menu_name VARCHAR(30) NOT NULL,
  menu_emoji VARCHAR(10) NOT NULL,
  menu_category VARCHAR(20) NOT NULL,
  fortune_message TEXT NOT NULL,
  score SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  draw_date DATE GENERATED ALWAYS AS
    ((created_at AT TIME ZONE 'Asia/Seoul')::date) STORED
);

CREATE INDEX idx_fortune_draws_user_date ON fortune_draws(user_id, draw_date);
CREATE INDEX idx_fortune_draws_date ON fortune_draws(draw_date);

-- 일일 3회 제한을 DB 레벨에서 강제 (race condition 방어)
CREATE OR REPLACE FUNCTION enforce_fortune_daily_limit()
RETURNS TRIGGER AS $$
DECLARE
  today_count INT;
BEGIN
  SELECT COUNT(*) INTO today_count
  FROM fortune_draws
  WHERE user_id = NEW.user_id
    AND draw_date = (NEW.created_at AT TIME ZONE 'Asia/Seoul')::date;

  IF today_count >= 3 THEN
    RAISE EXCEPTION 'FORTUNE_DAILY_LIMIT_EXCEEDED'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fortune_daily_limit
  BEFORE INSERT ON fortune_draws
  FOR EACH ROW EXECUTE FUNCTION enforce_fortune_daily_limit();

-- 오늘의 메뉴 통계 집계 뷰 (모든 유저 합산)
CREATE OR REPLACE VIEW daily_fortune_stats AS
SELECT
  draw_date,
  menu_name,
  menu_emoji,
  menu_category,
  COUNT(*)::INT AS draw_count,
  COUNT(DISTINCT user_id)::INT AS unique_users
FROM fortune_draws
GROUP BY draw_date, menu_name, menu_emoji, menu_category;

-- RLS
ALTER TABLE fortune_draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fortune draws are viewable by everyone" ON fortune_draws
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert fortune draws" ON fortune_draws
  FOR INSERT WITH CHECK (true);
