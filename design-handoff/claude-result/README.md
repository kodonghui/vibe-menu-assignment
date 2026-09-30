# Claude Design 결과 — 메뉴 관리

2026-09-30에 Claude Design(캔버스 아티팩트)에서 만든 시안의 편집 가능한 원본입니다.
아티팩트: https://claude.ai/artifact/8ENM2HMyuBCMpbKrF8b1J3 (작성자만 열 수 있음, 공유는 Share 메뉴)

## 파일

| 파일 | 내용 | 앱에 가져가나 |
|---|---|---|
| `tokens.css` | `../tokens.css`와 바이트 단위로 같은 사본 (변경 없음) | 예 (앱의 `src/tokens.css`가 원본) |
| `menu-ui.css` | 앱 컴포넌트 스타일. 값은 모두 `var(--…)` 토큰. 클래스는 CSS Module로 나눌 수 있게 카멜케이스 | **예** — 6번 명세 9장 대응표대로 나눠 옮김 |
| `board.css` | 시안 보드(견본·표) 전용 스타일 | 아니오 |
| `Main.dc.html` | 0 · 디자인 시스템(사용한 토큰만 모아 시각화) | 아니오 (참고) |
| `01-layout-components.dc.html` | 1 · 공통 레이아웃과 컴포넌트 | 참고 |
| `02-menu-list.dc.html` | 2 · 메뉴 목록 | 참고 |
| `03-menu-detail.dc.html` | 3 · 메뉴 상세 | 참고 |
| `04-menu-form.dc.html` | 4 · 등록·수정 공용 폼 | 참고 |
| `05-states.dc.html` | 5 · 상태 12가지 | 참고 |
| `06-handoff-spec.dc.html` | 6 · 구현 명세(경로·API·레이아웃·토큰·상태·접근성·CSS Module 대응) | 읽고 구현 |
| `canvas.json` | 캔버스에서 보드 위치·크기 | 아니오 |

## 열어 보는 법

- `.dc.html`은 Claude Design 캔버스 런타임(`support.js`)이 필요한 템플릿이라 브라우저에 바로 열면 비어 보입니다. 이 폴더에는 런타임이 없습니다. 화면으로 볼 때는 위 아티팩트 링크를 쓰세요.
- 그대로 가져갈 수 있는 것은 `menu-ui.css`와 마크업 구조입니다. 각 `.dc.html`의 HTML 뼈대(클래스 이름, aria 속성, 아이콘 SVG)를 JSX로 옮기면 됩니다. `{{…}}`와 `sc-for`·`sc-if`는 캔버스 템플릿 문법이라 React에서는 `map`과 조건부 렌더링으로 바꿉니다.
- 반응형은 시안에서 `@container app (max-width: 767px)`로 그렸습니다. 실제 앱에서는 같은 값의 `@media (max-width: 767px)`로 바꿉니다.

## 주의

- 시안의 메뉴 이름·가격·개수는 디자인 샘플이며 서버 연동 결과가 아닙니다.
- 아티팩트 화면은 이 세션에서 렌더링해 확인하지 않았습니다(보드 높이는 내용량 추정값). 열어 보고 잘림이나 어긋남이 있으면 알려 주세요.
- 글꼴은 tokens.css에 없어 Pretendard → Noto Sans KR 순서의 임시 지정입니다.
- 수용 여부는 아직 결정되지 않았습니다. 제출과 디자인 수용은 `../README.md` 기준으로 완료 전 상태입니다.
