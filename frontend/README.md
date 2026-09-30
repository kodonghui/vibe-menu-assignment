# 메뉴 관리 React 앱

실행·검사·디자인 인계는 [과제 README](../README.md)를 기준으로 합니다.

- 실행: `npm.cmd ci` 후 `npm.cmd run dev`. 주소는 `http://localhost:5175`입니다.
- 서버: `http://localhost:8090`. 변경할 때 `.env.example`을 참고하세요.
- 형식: JavaScript/JSX, React, React Router, Axios, CSS Module.
- 토큰 원본: `design/montage.tokens.json`. `npm run tokens`로 `src/tokens.css`를 생성합니다.
- 디자인 원본: `../design-handoff/claude-result/`. 실제 앱은 JSX와 `src/components/MenuUi.module.css`로 구현합니다.
- 공통 헤더·내비게이션·테마는 `Layout.jsx`, 카드·상세·등록/수정 폼은 `src/pages`에 있습니다.
- 실제 메뉴·가격·개수는 API 응답을 사용합니다. 검색 조건과 페이지는 URL에 유지합니다.
- 검사: `npm.cmd run lint`, `npm.cmd run build`.

라이트/다크 테마와 반응형 화면을 제공합니다. 실제 검사 범위와 제출 상태는 [검증 기록](../docs/verification.md)을 확인하세요.
