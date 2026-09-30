# 출처와 사용자 결정

## 사용자 합의

2026-09-30 현재 대화에서 사용자는 다음을 요청했습니다.
- 90_Project 아래 과제 폴더를 만들고 작업한다.
- 디자인은 Claude Design에서 진행한다.
- 나머지 구현·준비를 수행하고 Claude에 줄 프롬프트를 제공한다.
- Claude 디자인 아티팩트 `8ENM2HMyuBCMpbKrF8b1J3`를 전달하고, 같은 대화에서 "끝까지 구현"을 요청했다.
- 이후 같은 날 "MySQL로 만들어놔"라고 요청했다. 이 직접 요청을 근거로 기본 실행 DB를 MySQL로 바꾼다. 앞선 H2 선택은 현재 기본 실행 방식이 아니다.

첨부 수업 자료 원본 ID: cc6542cc-c883-4eeb-be96-796e3c0bae00 / 붙여넣은 텍스트.txt.
이번에 읽은 버전: 2026-09-30 로컬 첨부본, 1227줄.
학습 자료 자체는 제출 저장소에 복제하지 않고 작업에 필요한 기준만 적용한다.
PokeAPI에만 적용되는 응답 URL 추종·종족값·타입 필터를 메뉴 서버에 혼용하지 않는다.

## 재사용한 코드

- backend: 06_fronted/99_vibe_design_practice/vibe-design-practice/chap06-spring-data-jpa.
  강의의 04_spring/original_lecture_source/03_spring_data_jpa/chap06-spring-data-jpa를 기반으로 Swagger가 보충된 예제.
  엔티티·DTO·Repository·Service·Controller·응답/오류 계약을 재사용했다.
  새 구성: 포트/CORS 환경설정, 기본 MySQL 프로필, 명시적 dev H2 파일 DB, 최초 데모 데이터, 독립 H2 테스트 DB, JPA CRUD 검사.
- MySQL 실행 준비: Windows에 설치된 MySQL 8.0을 이용해 과제 전용 127.0.0.1:3307 인스턴스, utf8mb4 DB vibe_menu_assignment와 앱 계정 vibe_menu를 준비하는 scripts/start-mysql.ps1을 작성했다.
  scripts/start-backend.ps1은 이 스크립트를 호출하고 서버 자식 프로세스에만 연결 환경변수를 전달한다.
  start-backend.ps1의 MySqlBin·Port 옵션은 start-mysql.ps1로 전달한다. scripts/stop-backend.ps1은 과제 프로세스의 소유를 확인하고 Spring Boot·MySQL을 중단하며 DB 파일을 보존한다.
  로컬 임의 비밀번호는 Git 제외 경로 backend/.runtime/mysql/connection.json에 저장하고 디렉터리 ACL을 설정한다. 기존 3306 수업 MySQL과 DB는 보존한다.
  기존 H2의 메뉴 16개·카테고리 8개를 MySQL에 이관했고 모든 필드·ID·참조 관계 일치를 확인했다. 원본 H2 파일도 보존했다.
  실제 MySQL 연결과 전체 10개 API 검사를 통과했다. 재시작 확인을 포함한 상세 범위는 [검증 기록](verification.md)에 기록한다. H2 단위 테스트 결과와 실제 MySQL 검사 결과는 구분한다.
- frontend/src/api/menu.js, category.js: 위 참고 완성본의 API 어댑터를 재사용했다.
- frontend/scripts/build-tokens.mjs: 참고 완성본의 변환 스크립트를 재사용하고 radius·opacity 출력을 보충했다.
- frontend/design/montage.tokens.json: 참고 완성본에서 추출해 둔 Montage 토큰을 재사용했다.
  기존 색·타입·간격 값은 유지하고 실제 컴포넌트 원본에서 radius 상수를 보충했다.
- REST/Swagger 작성 참고: 04_spring/original_lecture_source/02_spring_boot/chap09-rest-api-lecture-source.
- React 프로젝트 생성: npm create vite@latest frontend -- --template react --eslint --no-interactive --no-immediate.
- 새 구현: 요청 클라이언트·중단/재시도 훅·목록/상세/공용 폼·삭제 대화상자·각종 검사·Claude 전달 자료.
- 디자인 원본: [사용자가 전달한 Claude 디자인](https://claude.ai/artifact/8ENM2HMyuBCMpbKrF8b1J3), `design-handoff/claude-result/`의 HTML·CSS·명세. 2026-09-30 로컬 원본을 기준으로 React에 적용한다.
- Claude 캔버스의 `{{…}}`, `sc-for`, `sc-if`는 JSX의 값·map·조건부 렌더링으로 옮긴다. 보드 전용 CSS와 캔버스 런타임은 앱에 포함하지 않는다.
- `06-handoff-spec.dc.html`의 완전한 원본(260줄)을 구현 기준으로 삼는다. 앞선 미리보기 캡처의 명세 보드는 내용 일부가 잘려 있어 원본을 대체하지 않는다.
- 디자인의 견본 메뉴·개수는 서버 데이터와 구분하며, 실제 화면의 메뉴·가격·개수는 API 응답으로 계산한다. 주문·매출·방문자 등 API에 없는 통계는 구현 범위에 넣지 않는다.

## 디자인 토큰 출처와 검사

원본 저장소: [wanteddev/montage-web](https://github.com/wanteddev/montage-web).
로컬 수업 사본: 06_fronted/original-materials/99_vibe_design/vibe-design-test/montage-web-main.
기존 토큰의 $meta가 추출된 패키지·방식·기준 날짜를 담고 있다.
radius의 각 sources에는 실제 style.ts 파일과 줄 번호를 기록했다.
원본 전체를 새 React 프로젝트 안에 복사하지 않는다.

scripts/augment-radius.mjs는 상수인 단일 border-radius/corner radius만 모으며 동적 식과 inherit는 제외한다.
radius 상수 16종을 보충했다. CSS에서는 값의 단위에 맞는 --radius-* 이름을 사용한다.
원본 blue.50 = #0066FF, typography title1 및 버튼/카드 radius를 실제 소스와 대조했다.
토큰의 실제 이름·수는 첨부 수업 자료의 예시 숫자로 강제하지 않는다.
원본 샘플에는 radius가 누락되어 있었으므로 그 상태를 그대로 완료로 취급하지 않았다.

참고 과제 저장소: [vibe-design-practice](https://github.com/20260728-saltlux-llm-agent-service-1st/vibe-design-practice).
강의 원본과 참고 완성본은 수정하지 않았다.
