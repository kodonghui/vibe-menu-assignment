# Claude Design 전달

1. claude-design-prompt.md의 구분선 이후 내용을 Claude Design에 붙여넣는다.
2. 프롬프트에 네 파일의 절대 경로가 포함되어 있다. Claude가 로컬 파일에 접근할 수 없으면 이 폴더의 montage.tokens.json, tokens.css, screen-brief.md, api-docs.json을 첨부한다.
3. 사용자 마음에 들 때까지 디자인을 조정한다. 기준 토큰의 기존 값을 임의로 바꾸지 않는다.
4. 나온 아트보드/HTML·CSS/디자인 명세를 이 과제의 design-handoff/claude-result/에 저장하거나 Codex에 전달한다.
5. Codex가 React의 CSS Module과 화면 구조에 적용하고 실제 서버 연동을 다시 확인한다.

2026-09-30에 [Claude 디자인](https://claude.ai/artifact/8ENM2HMyuBCMpbKrF8b1J3)을 전달받았습니다.
편집 가능한 원본은 `claude-result/`에 보존했습니다. 디자인 시스템부터 구현 명세까지 7개 보드가 있으며,
보드 수는 실제 앱의 URL 수를 뜻하지 않습니다. 같은 날 사용자의 "끝까지 구현" 요청에 따라 React 적용을 진행합니다.
적용 및 실제 검사 결과는 [과제 README](../README.md)와 [검증 기록](../docs/verification.md)을 기준으로 확인합니다.

`.dc.html`은 Claude 캔버스 템플릿입니다. 실제 앱은 이 템플릿을 실행하지 않고 JSX와 CSS Module로 구현합니다.
완전한 인계 명세는 `claude-result/06-handoff-spec.dc.html`입니다.

원본:
- 토큰: ../frontend/design/montage.tokens.json
- 생성 CSS: ../frontend/src/tokens.css
- API: ../api-docs.json (scripts/export-api.mjs가 실행 서버에서 저장)
이 폴더의 JSON·CSS는 전달용 사본이다. 원본을 갱신한 뒤 export-api.mjs로 함께 갱신한다.
