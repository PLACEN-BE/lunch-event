-- 전체 기간 메뉴 누적 집계 뷰
-- daily_fortune_stats 와 대칭 구조, 홈 화면 Top N 용
CREATE OR REPLACE VIEW alltime_fortune_stats AS
SELECT
  menu_name,
  menu_emoji,
  menu_category,
  COUNT(*)::INT AS draw_count
FROM fortune_draws
GROUP BY menu_name, menu_emoji, menu_category;
