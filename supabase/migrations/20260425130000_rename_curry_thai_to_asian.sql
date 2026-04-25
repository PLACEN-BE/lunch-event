-- 카테고리 명칭 통일: '카레/태국' → '아시안'
-- 순서: 제약 drop → 데이터 변경 → 제약 추가 (역순이면 CHECK 위반).

ALTER TABLE menu_votes DROP CONSTRAINT IF EXISTS menu_votes_menu_category_check;

UPDATE menu_votes SET menu_category = '아시안' WHERE menu_category = '카레/태국';

ALTER TABLE menu_votes
  ADD CONSTRAINT menu_votes_menu_category_check
  CHECK (
    menu_category IN ('한식','중식','양식','일식','패스트푸드','샐러드','아시안','샌드위치','도시락','기타')
  );
