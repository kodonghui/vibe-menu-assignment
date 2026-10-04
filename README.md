# 메뉴 관리 · 바이브 디자인 & 바이브 코딩 과제

## 앱과 디자인

- 메뉴 목록·검색·필터·페이징, 상세 조회, 등록·수정·삭제를 실제 서버와 연결합니다.
- 공통 Montage 토큰과 CSS Module을 사용하며 라이트/다크 테마와 모바일 레이아웃을 제공합니다.
- 입력 오류, 로딩, 빈 결과, 404, 통신 실패와 재시도, 삭제 확인을 처리합니다.
- 디자인 원본: [Claude 아티팩트](https://claude.ai/artifact/8ENM2HMyuBCMpbKrF8b1J3) / [인계 원본](design-handoff/claude-result/README.md).
- 실제 구현·검사·게시 상태는 [검증 기록](docs/verification.md)을 기준으로 확인합니다.

![실제 React 메뉴 목록](docs/screenshots/menu-list-desktop.png)

## 처음 공부할 때

처음 공부할 때는 [학습 백과사전](docs/encyclopedia.html)을 브라우저에서 여세요.
컴퓨터 밖에서도 읽을 수 있는 [Sites 백과사전](https://menu-app-fullstack-encyclopedia.elddlwkd.chatgpt.site)도 등록했습니다. 기본 접근은 본인 계정 전용입니다.
15개 장·94개 용어·15개 도해를 실제 과제 코드와 연결했습니다.
백과사전은 처음 준비한 H2 구성의 학습 기록입니다. 현재 앱의 MySQL 실행 방법과 검증 결과는 이 README와 docs/verification.md를 기준으로 확인하세요.
첫 화면의 **세 질문부터 읽기 → 등록 흐름 따라가기 → 02 메뉴 하나의 여행** 순서로 시작하세요.
단계별 등록 예시는 학습용이며 API 요청이나 DB 변경을 하지 않습니다.
클릭 가능한 코드·공식 자료 출처는 [Markdown 원고](docs/encyclopedia.md)에 있습니다.

[Claude Design 전달 안내](design-handoff/README.md)에는 처음 사용한 프롬프트와 네 첨부 파일, 수신한 시안이 보존되어 있습니다.

## 구성

~~~
08_vibe-menu-assignment/
  backend/             강의 chap06 기반 JPA REST 서버 + Swagger
  frontend/            Vite + React JS/JSX, API 계층과 Claude 디자인 화면
  api-docs.json        실제 실행 서버에서 추출한 OpenAPI
  design-handoff/      Claude Design 프롬프트·화면 범위·토큰·명세 사본
  docs/                API 계약·출처·실제 검사 결과
  scripts/             MySQL·서버 실행, API 검사·명세 추출·토큰 검사
~~~

[과제 현황판](https://app.notion.com/p/3ebbf16cc3ec817f9f9cc0456adf2b18) /
[현재 작업 기록](https://app.notion.com/p/3ebbf16cc3ec81f3bd96f0656b028432)

## 백과사전 읽기와 보충

HTML 파일 하나로 오프라인에서 읽을 수 있습니다. 검색·목차·용어 카드·등록 흐름 6단계·테마 전환을 제공합니다.
내용 원본은 학습 저장소의 `private-notes/data/vibe-menu-encyclopedia.jsonl`이며 HTML과 Markdown은 생성 결과입니다.
다른 학습 노트나 전체 학습 색인을 다시 만들지 않고 이 과제 자료만 갱신합니다.

`scripts/build-encyclopedia.py`는 부모 학습 저장소의 JSONL·`scripts/study_note.py`·`scripts/lib/diagram.py`를 사용합니다.
이 과제만 복제한 저장소에서는 생성 결과인 HTML/Markdown을 읽으세요. 앱 실행에는 이 생성 과정이 필요하지 않습니다.

현재 열람 주소는 http://localhost:5190/encyclopedia.html 입니다.
열람 서버가 꺼졌으면 HTML 파일을 직접 열거나 아래 명령으로 다시 실행합니다.
이미 5190에서 실행 중이면 두 번째 서버를 띄우지 않습니다.

~~~powershell
python -m http.server 5190 --bind 127.0.0.1 --directory docs
~~~

[학습 자료 작업 기록](https://app.notion.com/p/3ebbf16cc3ec811594e1e629fbee05d1)과
[검증 결과](docs/verification.md)를 함께 확인할 수 있습니다.

## 로컬 Windows 실행

아래 명령의 시작 위치는 이 README가 있는 폴더입니다. 각 터미널에서 같은 과제 폴더를 먼저 여세요.

새 위치에서 처음 받을 때:
~~~powershell
git clone https://github.com/kodonghui/vibe-menu-assignment.git
Set-Location vibe-menu-assignment
~~~

필요한 환경: Java 17, Node.js 20.19+ 또는 22.12+, Windows에 설치된 MySQL 8.0.
Gradle은 포함된 wrapper를 사용합니다. MySQL 설치의 기본 경로는 `C:\Program Files\MySQL\MySQL Server 8.0\bin`입니다.
현재 검사 환경의 정확한 버전은 docs/verification.md에 기록합니다.
React 생성은 공식 Vite 템플릿의 react + eslint 옵션을 사용했습니다.
[Vite 공식 시작 안내](https://vite.dev/guide/).

터미널 1 — 서버:
~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/start-backend.ps1
~~~

이 스크립트는 `start-mysql.ps1`로 과제 전용 MySQL을 준비하고 Spring Boot를 백그라운드에서 실행합니다.
백엔드 JAR이 없으면 Gradle wrapper로 빌드하며, 준비가 완료되면 터미널로 돌아옵니다.
MySQL이 다른 경로에 설치되어 있으면 아래처럼 서버 실행 스크립트에 경로를 지정합니다.
`start-backend.ps1`은 `-MySqlBin`과 `-Port`를 DB 준비 스크립트에 전달합니다. 기본 DB 포트는 3307입니다.

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/start-backend.ps1 -MySqlBin 'D:\MySQL\MySQL Server 8.0\bin'
~~~

터미널 2 — React:
~~~powershell
Set-Location frontend
npm.cmd ci
npm.cmd run dev
~~~

- 앱: http://localhost:5175
- Swagger: http://localhost:8090/swagger-ui.html
- 서버 상태: http://localhost:8090/actuator/health
- API 명세: http://localhost:8090/v3/api-docs

기존 8080 서버와 충돌하지 않게 8090/5175를 사용합니다.
React는 strictPort로 고정되어 포트가 사용 중이면 오류를 알립니다. 기존 앱을 임의 종료하지 않습니다.
이미 실행 중이면 위 명령으로 두 번째 서버를 띄우지 말고 현재 주소를 사용하세요.
React는 실행한 터미널에서 Ctrl+C로 종료합니다. 보조 스크립트가 실행한 MySQL·Spring Boot는 백그라운드 프로세스입니다.
실행 로그와 PID는 `backend/.runtime/`에 있으며, 문제 발생 시 `api.out.log`·`api.err.log`와 `mysql/mysql-error.log`를 확인하세요.

과제의 Spring Boot와 MySQL을 중단하려면 과제 폴더에서 다음 명령을 실행합니다.
이 스크립트는 실행 파일·과제 경로·프로필로 서버 소유를 확인하며, MySQL은 정상 종료하고 DB 파일을 보존합니다.

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/stop-backend.ps1
~~~

다시 실행하려면 같은 폴더에서 `scripts/start-backend.ps1`을 실행합니다.
다른 MySQL 설치 경로로 실행했다면 중단·재실행할 때도 같은 `-MySqlBin` 값을 지정하세요.
백엔드 코드를 수정했다면 중단 후 JAR을 다시 빌드하고 시작합니다.

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/stop-backend.ps1
Set-Location backend
.\gradlew.bat bootJar --console=plain
Set-Location '..'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/start-backend.ps1
~~~

## 과제 전용 MySQL과 데이터

기본 Spring 프로필은 `mysql`입니다. Windows 실행 스크립트는 설치된 MySQL 8.0 바이너리로
**127.0.0.1:3307**에 별도 인스턴스를 실행하고 `vibe_menu_assignment` DB와 `vibe_menu` 앱 계정을 준비합니다.
데이터 디렉터리는 `backend/.runtime/mysql/data`이며 DB·테이블은 `utf8mb4`를 사용합니다.
기존 3306 MySQL 서버와 수업용 DB는 변경하지 않습니다.

로컬 계정의 임의 비밀번호와 연결 설정은 Git에서 제외되는 `backend/.runtime/mysql/connection.json`에 저장합니다.
해당 디렉터리는 현재 Windows 사용자·SYSTEM·관리자만 접근하도록 ACL을 설정합니다.
`start-backend.ps1`은 연결값을 서버 자식 프로세스의 `DB_URL`·`DB_USERNAME`·`DB_PASSWORD`로 전달하고
자신이 실행되는 프로세스의 기존 환경변수는 복원합니다. 연결 파일·비밀번호·DB 파일을 Git이나 스크린샷에 넣지 마세요.

두 테이블이 모두 빈 과제 DB를 처음 실행할 때만 8개 카테고리와 16개 예시 메뉴를 생성합니다.
카테고리 또는 메뉴가 이미 있으면 예시 초기화를 건너뜁니다. 재실행해도 기존 메뉴를 덮어쓰거나 자동 복원하지 않습니다.
이 데이터는 과제 데모용입니다. 이번 전환에서는 기존 H2의 메뉴 16개·카테고리 8개를 MySQL에 이관하고
이름·가격·주문 상태·ID·참조 관계의 모든 필드 일치를 확인했습니다. 원본 H2 파일도 보존했습니다.
실제 연결·검사·재시작 확인 범위는 [검증 기록](docs/verification.md)을 확인하세요.

H2는 단위 테스트와 명시적으로 선택한 `dev` 프로필에서만 사용합니다.
MySQL 대신 기존 H2 파일 DB로 실행할 필요가 있을 때는 아래처럼 프로필을 지정합니다.

~~~powershell
Set-Location backend
.\gradlew.bat bootRun --args='--spring.profiles.active=dev' --console=plain
~~~
H2 파일은 `backend/.runtime/data/vibe-menu.mv.db`에 있습니다. 이 대체 실행 결과를 MySQL 검증으로 보고하지 않습니다.

## 기능과 디자인 적용 지점

- 목록·서버 페이징·이름 검색·카테고리·가격 초과 필터.
- 상세·등록·수정·삭제 확인/취소·저장 후 이동.
- 입력 검증·로딩·빈 결과·서버 오류·재시도.
- 검색 조건은 URL에 저장되어 새로고침/뒤로가기에 유지됩니다.
- 요청은 src/api/*.js에, 화면은 src/pages에, 공통 조각은 src/components에 있습니다.
- 공통 스타일은 src/components/MenuUi.module.css, 테마·레이아웃은 Layout.jsx에 있습니다.
- 시안의 템플릿 문법은 React로 옮겼으며 Claude 캔버스 런타임이나 보드 전용 스타일을 앱에서 실행하지 않습니다.
- 토큰 원본은 frontend/design/montage.tokens.json입니다. tokens.css를 직접 고치지 않습니다.
- [API 계약](docs/api-contract.md)에서 응답 키·가격 초과 조건·페이지 1 시작·삭제 상태를 확인하세요.

## 검사와 명세 갱신

~~~powershell
Set-Location backend
.\gradlew.bat test bootJar --console=plain

Set-Location '..\frontend'
npm.cmd run lint
npm.cmd run build

Set-Location '..'
node scripts/check-tokens.mjs
node scripts/verify-api.mjs
node scripts/export-api.mjs
~~~

API 검사·명세 추출은 서버가 실행 중일 때 사용합니다.
API 검사는 자신이 만든 검사 메뉴만 정리하며 기존 예시 메뉴를 변경하지 않습니다.
Gradle 단위 테스트는 격리된 H2 메모리 DB를 사용합니다. MySQL 연결·영속화 검증은 실행 서버의 API·브라우저 검사로 별도 확인합니다.
[검증 결과](docs/verification.md)는 실제 실행 범위와 아직 남은 일을 구분합니다.

## 출처와 제출

[출처 기록](docs/sources.md)에 재사용한 강의 서버·API 어댑터·토큰과 새 구현을 구분합니다.
백엔드와 디자인 토큰은 강의가 허용한 자료를 재사용하며, 참고 완성본의 화면 디자인을 그대로 복제하지 않았습니다.
디자인은 사용자가 전달한 Claude Design 결과를 기준으로 합니다. 실제 데이터·집계는 메뉴 API 응답을 사용합니다.

과제 앱의 backend·frontend는 학습 저장소의 일반 폴더로 관리합니다.
학습 백과사전 Sites와 디자인 Sites 초안은 별도 관리되며 제출용 Git에서 제외합니다.
학습 저장소의 이 폴더만 subtree로 분리해 backend·frontend·실행 안내를 함께 제출합니다.
DB 파일·실제 환경변수·node_modules·빌드 결과·학습 저장소의 다른 폴더는 포함하지 않습니다.
배포 URL은 공지의 명시된 제출 항목이 아닙니다. GitHub URL을 개인별 Discord 제출 스레드에 남겨야 실제 제출이 끝납니다.
