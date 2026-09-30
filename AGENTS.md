# 메뉴 관리 · 바이브 디자인 & 코딩 과제

사용자 결정(2026-09-30): 이 폴더에서 과제를 진행하고 디자인은 사용자가 Claude Design에서 만든다.
2026-09-30 같은 대화에서 Claude 아티팩트 `8ENM2HMyuBCMpbKrF8b1J3`를 전달하고 "끝까지 구현"을 요청했다.
`design-handoff/claude-result/`의 원본을 기준으로 React에 적용한다. 새로운 디자인 방향을 임의로 확정하지 않는다.
2026-09-30 사용자가 "MySQL로 만들어놔"라고 요청했다. 기본 실행 DB는 MySQL이며 H2는 단위 테스트와 명시적 dev 대체 실행에만 사용한다.

- 강의 원본과 참고 완성본은 읽기만 한다. 이 폴더 안의 코드만 수정한다.
- backend는 chap06 JPA 서버와 참고 완성본의 OpenAPI 어노테이션을 재사용한다.
- frontend 런타임 라이브러리는 react, react-dom, react-router, axios만 사용한다. JS/JSX와 CSS Module을 사용한다.
- src/api/*.js에 요청을 모으고 .jsx에서 axios/fetch를 직접 호출하지 않는다.
- 검색어·가격·카테고리·페이지는 URL에 저장한다. 목록 데이터는 해당 화면이 소유한다.
- 색과 간격·모서리는 토큰, 글자 크기는 생성된 타입 스타일 클래스를 사용한다.
- frontend/design/montage.tokens.json이 토큰 원본이다. src/tokens.css는 npm run tokens로 생성하며 직접 편집하지 않는다.
- 서버 8090, React 5175. Vite strictPort를 유지한다. 기본 프로필은 mysql이다.
- Windows의 scripts/start-backend.ps1은 start-mysql.ps1로 별도 MySQL 8.0 인스턴스 127.0.0.1:3307과 과제 DB vibe_menu_assignment, 앱 계정 vibe_menu를 준비한다. 기존 3306 수업 서버·DB는 변경하지 않는다.
- MySQL 데이터와 로컬 연결 정보는 backend/.runtime/mysql/에 둔다. 임의 비밀번호가 있는 connection.json은 Git에서 제외하고 디렉터리 ACL을 유지한다. 자격증명은 출력하지 않는다.
- 기존 H2 파일은 삭제하거나 덮어쓰지 않는다. DB 전환 시 실제 메뉴·카테고리 PK와 참조를 보존하고, MySQL 실행 검사와 H2 단위 테스트 결과를 구분한다.
- API 계약은 docs/api-contract.md와 api-docs.json을 함께 읽는다. 페이지는 1부터, 가격 조회는 초과 조건이다.
- 삭제는 실제 HTTP 200 + JSON 내부 httpStatus 204라는 강의 계약을 유지한다.
- 검사: backend Gradle test, frontend tokens/lint/build, scripts/verify-api.mjs, 실제 브라우저 CRUD.
- .env·자격증명·.runtime·DB 파일·node_modules·빌드 결과를 Git에 넣지 않는다.
- 새 .git을 내부에 만들지 않는다. 제출 저장소는 디자인 적용 후 이 폴더만 분리해 게시한다.
