# 메뉴 관리 과제로 배우는 웹 개발 백과사전

2026년 9월 30일 · 실제 과제 코드와 공식 자료를 연결한 학습 자료입니다. 오프라인 HTML에는 검색·등록 흐름 실습이 있습니다.


## 01. 처음 세 질문

H2 선택·명세 생성 방향·Swagger 역할을 먼저 구분합니다.

도해: 시퀀스 · 위에서 아래로 읽습니다. 조건 줄은 성공과 실패 경로를 구분합니다.. 오프라인 HTML에서 그림으로 확인합니다.

### 처음 물어보신 세 질문

### H2는 MySQL 같은 것인가요? 누가 정했나요?

H2와 MySQL은 모두 관계형 DBMS입니다. DBMS는 데이터를 저장·조회·변경하는 소프트웨어이고, 이 두 관계형 DBMS는 테이블과 SQL을 사용합니다. 스택은 여러 기술의 조합을 가리킵니다. 우리 스택에서 DBMS 자리에 H2 또는 MySQL이 들어갑니다.

현재 과제의 기본 H2는 Codex가 빠른 실행과 기존 수업 DB의 분리를 위해 선택한 구현 설정입니다. 사용자께서 H2 전환을 지시한 것은 아닙니다. 수업은 MySQL을 사용했습니다. 실제 과제 검증은 H2에서 수행했고 MySQL 프로필은 설정만 준비했습니다.

H2의 장점은 현재 서버 안에서 함께 실행하고 파일에 저장할 수 있다는 점입니다. 반론은 MySQL 수업과 실행 방식이 달라지고 MySQL만의 동작을 검증하지 못한다는 점입니다. 앞으로 MySQL 연결을 공부하려면 과제 전용 MySQL DB를 준비해 mysql 프로필로 검증하면 됩니다. 이 백과사전을 만드는 작업에서는 DB를 자동 전환하지 않습니다.

### servers·tags·paths는 누가 정한 이름인가요?

OpenAPI 표준이 정한 필드 이름입니다. 필드 안에 들어가는 실제 서버 주소·분류 이름·API 경로는 개발자의 설정과 코드에서 정합니다.

현재 흐름은 Java 컨트롤러와 어노테이션 → springdoc의 명세 생성 → /v3/api-docs → Swagger UI 및 api-docs.json 저장입니다. Java 프로그램이 이 저장된 JSON을 읽어 메뉴 기능을 실행하는 구조가 아닙니다. React도 api-docs.json을 실행하지 않고 src/api/*.js에 작성된 Axios 요청을 실행합니다.

다른 프로젝트에서는 명세부터 작성하고 서버 코드를 생성하기도 합니다. 이것을 명세 먼저 설계하는 방식으로 구분합니다. 현재 과제는 코드에서 명세를 생성하는 방식입니다.

### Swagger UI는 누가 준비했고, 실무에서 언제 쓰나요?

참고 샘플에는 이미 springdoc 의존성·SwaggerConfig·API 설명 어노테이션이 있었습니다. Codex는 이 구성을 재사용하고 과제 포트·설정을 조정한 뒤 실제 명세를 추출했습니다. Swagger UI 자체를 새로 만든 것은 아닙니다.

Swagger UI는 OpenAPI 문서를 화면으로 보여주고 요청을 시험하는 도구입니다. API 주소·입력·응답을 확인할 때, 프론트엔드와 백엔드가 계약을 맞출 때, 구현한 API를 손으로 점검할 때 씁니다. 사용량의 조사 범위와 날짜가 명확한 비교 자료 없이 실무 1위라고 단정할 수 없습니다. 문서 도구·API 클라이언트·자동 테스트는 목적에 따라 함께 사용합니다.

Swagger의 Try it out과 Execute는 실제 서버에 요청합니다. GET으로 목록을 읽는 연습부터 시작하세요. POST·PUT·DELETE는 실제 데이터를 바꿉니다.

### 이어서 궁금할 만한 질문

**사용자가 H2를 지정했나요?**

아닙니다. dev 프로필의 H2는 Codex가 선택했고 mysql 프로필은 별도로 준비했습니다.

**프로그램이 JSON 문서를 읽어 메뉴를 저장하나요?**

현재 Java와 React는 api-docs.json을 메뉴 실행에 사용하지 않습니다. Java에서 springdoc가 문서를 생성합니다.

**Swagger의 실행 버튼은 실제 데이터를 바꾸나요?**

GET은 조회 연습이며 POST·PUT·DELETE는 8090 서버의 실제 DB를 변경합니다.


## 02. 메뉴 하나의 여행

입력값은 React·HTTP·Java 객체·DB 행으로 표현을 바꾸며 이동합니다.

도해: 시퀀스 · 위에서 아래로 읽습니다. 조건 줄은 성공과 실패 경로를 구분합니다.. 오프라인 HTML에서 그림으로 확인합니다.

### 전체 흐름을 먼저 보기

프론트엔드는 브라우저에서 화면과 사용자 입력을 처리합니다. 백엔드는 요청을 받아 저장·조회 같은 규칙을 처리합니다. DBMS는 데이터를 보관합니다. 같은 컴퓨터에서 실행해도 프로그램의 역할은 다릅니다.

| 역할 | 우리 과제 | 입력 | 결과 |
| --- | --- | --- | --- |
| 사용자 화면 | React, localhost:5175 | 클릭·입력 | 화면 표시와 API 요청 |
| API 서버 | Spring Boot, localhost:8090 | HTTP 요청 | 처리 결과 JSON |
| 데이터 보관 | H2 내장 파일 DB | SQL·저장할 값 | 저장된 행과 조회 결과 |
| API 문서 화면 | Swagger UI | OpenAPI 명세 | 설명과 요청 실행 도구 |
| 디자인 작업 | 사용자와 Claude Design | 토큰·화면 설명 | 시안·컴포넌트 명세 |

메뉴 등록은 다음 순서입니다. 사용자가 이름·가격·분류·상태를 입력합니다. React가 입력을 검사합니다. Axios가 POST /api/menus로 JSON을 보냅니다. 서버의 컨트롤러가 요청을 받고 서비스와 저장소가 메뉴를 저장합니다. DB가 메뉴 번호를 생성합니다. 서버가 201 응답과 result.menu를 보냅니다. React가 반환된 menuCode로 상세 화면으로 이동합니다.

입력이 잘못되면 React가 요청 전에 필드 오류를 표시합니다. 존재하지 않는 카테고리라면 서버가 400을 반환합니다. 연결에 실패하면 React가 실패 안내를 보여줍니다. 성공과 실패를 구별해 입력을 유지하고 다시 시도할 수 있게 만드는 것도 앱 구현입니다.

이 등록 과정에서 OpenAPI 문서는 설명 자료입니다. 문서를 읽는 단계와 실제 메뉴 요청이 움직이는 단계는 구별해야 합니다.

### 지금 만들어진 것과 앞으로 할 것

| 항목 | 현재 상태 | 담당과 다음 행동 |
| --- | --- | --- |
| 수업 자료 참고와 과제 폴더 | 준비됨 | Codex, 강의 원본 보존 |
| Spring Boot·H2·Swagger | H2로 실행·검증함 | Codex, MySQL 연결 검증은 별도 |
| React 기능과 API 연동 | CRUD·검색·페이지·필수값 오류 확인함 | Codex, API의400/404·CORS도 검사함 |
| Montage 토큰·화면 설명·명세 | 전달 자료 준비됨 | Codex |
| Claude Design 요청 | 프롬프트만 준비됨 | 사용자가 전달할 예정 |
| 최종 디자인 | 받지 않음 | 사용자와 Claude Design |
| 디자인의 React 적용 | 남아 있음 | 결과 수신 후 Codex |
| GitHub 게시·과제 제출 | 남아 있음 | 최종 검사 후 저장소 URL 제출 |

React 앱을 만든다는 것은 컴포넌트·입력 상태·클릭 처리·페이지 이동·API 요청·오류 표시를 구현한다는 뜻입니다. 디자인 시안은 어떻게 보일지 정하는 결과물이고 React 코드는 그 화면의 실제 동작을 구현하는 결과물입니다.

GitHub 저장소는 코드를 공유하는 장소입니다. 로컬 실행 성공, GitHub 게시, 인터넷 배포, Discord 제출은 각각 다른 상태입니다. 공지의 제출물은 Spring Boot와 React가 함께 들어 있는 GitHub 저장소 URL입니다. 마감은 2026년 10월 13일 23시 59분입니다.

### 이어서 궁금할 만한 질문

**두 프로그램이 같은 컴퓨터면 하나인가요?**

같은 localhost라도 5175와8090은 별도 실행 프로그램이며 서로 HTTP로 통신합니다.

**저장 성공과 화면 이동 중 무엇이 먼저인가요?**

createMenu의 응답에서 saved.menuCode를 얻은 뒤 상세 화면으로 이동합니다.

**이 자료가 완성되면 과제도 제출됐나요?**

아닙니다. HTML 학습 자료 생성과 GitHub 게시·Discord 제출은 별개의 완료 상태입니다.


## 03. H2와 MySQL

H2와 MySQL은 다른 관계형 DBMS이며, 현재 기본 실행은 H2 내장 파일 DB입니다.

도해: H2와 MySQL · 성공 경로 또는 표시된 조건에서의 흐름. 오프라인 HTML에서 그림으로 확인합니다.

### 2. DB와 DBMS는 같은 말인가요?

**Database, DB → 구조를 정해 보관한 데이터의 모음입니다.** 메뉴의 이름·가격·카테고리 같은 실제 기록이 여기에 있습니다.

**Database Management System, DBMS → 그 데이터를 저장·조회·수정·삭제하는 소프트웨어입니다.** H2와 MySQL은 DBMS 제품 이름입니다.

**Relational DBMS, RDBMS → 테이블과 테이블 사이의 관계를 관리하는 DBMS입니다.** 관계형이라는 말은 메뉴와 카테고리를 하나의 긴 문자열에 섞어 보관하는 대신, 테이블로 구분하고 키로 연결한다는 뜻입니다.

개발자 대화에서는 “H2 DB를 쓴다”, “MySQL DB를 설치한다”처럼 DB와 DBMS를 편하게 묶어 말하기도 합니다. 지금 공부할 때는 제품과 데이터를 구분하면 덜 헷갈립니다. MySQL 공식 설명도 database를 구조화된 데이터 모음, MySQL을 그 모음을 관리하는 프로그램으로 구분합니다. MySQL: What is MySQL?

우리 코드에서는 `tbl_menu`와 `tbl_category`라는 테이블 이름을 사용합니다. 다음은 구조를 설명하기 위한 예시이며, 지금 DB를 다시 조회해 얻은 전체 결과는 아닙니다.

| `tbl_menu`의 열 | 값의 예 | 의미 |
| --- | --- | --- |
| `menu_code` | DB가 생성한 정수 | 메뉴 한 건의 식별자 |
| `menu_name` | 아메리카노 | 메뉴 이름 |
| `menu_price` | 4500 | 가격 |
| `category_code` | 커피 카테고리의 코드 | 카테고리와 연결하는 값 |
| `orderable_status` | Y | 주문 가능 여부 |

**Table → 같은 구조의 기록을 모은 표입니다.** `tbl_menu`가 실물입니다. **Row → 기록 한 건입니다.** 아메리카노 한 메뉴가 실물입니다. **Column → 기록에 반복되는 항목입니다.** `menu_price`가 실물입니다.

**Primary key, PK → 행 한 건을 구별하는 키입니다.** `menu_code`입니다. 이름이 같은 메뉴가 있어도 코드가 다르면 다른 기록입니다. **Foreign key, FK → 다른 테이블의 행과 연결하는 키입니다.** `category_code`가 카테고리와 메뉴를 잇습니다.

**SQL, Structured Query Language → 관계형 DB에 조회나 변경을 요청하는 언어입니다.** 아래 SQL은 현재 Java 코드의 뜻을 설명한 학습용 표현입니다. Hibernate가 실제 보내는 별칭·열 순서·SQL 문자열과 같다고 보장하지 않습니다.

```sql
SELECT menu_name, menu_price
FROM tbl_menu
WHERE menu_price > 4500;
```

이 조건에서는 가격이 정확히 `4500`인 아메리카노가 제외됩니다. `>`는 초과이고 `>=`는 이상입니다.

**흔한 오해:** “관계형”이라고 해서 모든 관련 정보를 같은 행에 복사해놓는 것은 아닙니다. 메뉴 객체가 카테고리를 참조하더라도 DB에는 다른 테이블로 연결하는 코드가 저장될 수 있습니다.

**읽기 실습:** [Menu.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/entity/Menu.java:5)에서 `tbl_menu`, `menu_price`, `category_code`를 찾고, [Category.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/entity/Category.java:7)에서 `tbl_category`를 찾으세요. SQL은 지금 실행할 필요가 없습니다.

### 3. H2는 MySQL 같은 건가요? 누가 정했나요?

**H2 → Java로 구현된 SQL 관계형 DBMS입니다.** MySQL처럼 데이터를 테이블에 저장하고 SQL로 다룰 수 있지만, 제품과 DB 파일 형식은 다릅니다. H2는 내장 실행과 서버 실행, 디스크 저장과 메모리 저장을 지원합니다. H2 공식 소개

“데이터베이스 스택인가요?”라는 질문에는, **H2는 스택 전체가 아니라 DBMS 한 제품**이라고 답할 수 있습니다. 우리 백엔드의 여러 기술을 함께 부르면 `Java + Spring Boot + Spring Data JPA + Hibernate + H2`라는 기술 스택이라고 할 수 있습니다. 여기서 Java는 언어·실행 환경, H2는 데이터 저장을 맡는 소프트웨어입니다.

**이번 기본 H2 선택은 에이전트가 했습니다. 동희님이 MySQL을 바꾸라고 지시하신 것은 아닙니다.** 과제 전용 데이터를 수업 DB와 분리하고, 별도 DB 계정·스키마 준비 없이 먼저 전체 기능을 실행할 수 있도록 선택했습니다. H2가 과제 공지의 필수 조건이거나 MySQL보다 무조건 좋은 제품이라는 뜻은 아닙니다.

| 비교 기준 | 현재 과제의 H2 방식 | 수업에서 익숙한 MySQL 방식 |
| --- | --- | --- |
| DBMS 실행 | 앱과 같은 Java 프로세스에서 내장 실행 | 보통 별도 MySQL 서버 프로세스에 접속 |
| 준비 | H2 라이브러리와 파일 경로 설정 | 서버·계정·권한·과제용 스키마 준비 |
| 데이터 보관 | 이 과제의 `.mv.db` 파일 | MySQL 서버가 관리하는 데이터 저장소 |
| 수업과 연결 | JPA 흐름을 그대로 읽을 수 있음 | 배운 DB 도구와 SQL 환경을 계속 사용 |
| 실제 확인 범위 | 현재 CRUD·API·브라우저 검증 완료 | 연결 프로필만 제공, 이번 실행은 미검증 |

여기서 “MySQL은 서버 방식”은 이번 수업과 일반적인 MySQL Server 사용을 비교하는 표현입니다. 제품의 모든 배포 가능성을 단정하는 분류는 아닙니다. MySQL 공식 제품 설명

**학습 선택의 장단점:** H2를 유지하면 연결 준비 부담이 작아 화면→서버→DB 흐름부터 배울 수 있습니다. MySQL을 사용하면 수업과 같은 DB 환경에서 결과를 관찰하고 실제 DB 차이도 확인할 수 있습니다. 이 과제를 MySQL 학습까지 이어가려면 전용 스키마로 연결해서 검사하는 선택이 자연스럽습니다. 현재 H2 검사 통과를 MySQL 검사 통과로 바꿔 말하면 안 됩니다. 이 문서는 설명만 하며 DB를 전환하지 않습니다.

**흔한 오해:** H2가 MySQL의 간단 모드라는 생각입니다. 둘은 별도 DBMS이고, H2 파일을 MySQL에 연결해서 바로 쓰는 것도 아닙니다.

**읽기 실습:** [build.gradle](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/build.gradle:47)에 `mysql-connector-j`와 `h2`가 둘 다 있는 것을 확인하세요. 라이브러리가 둘 다 있다고 해서 현재 데이터가 두 DB에 동시에 저장되는 것은 아닙니다. 다음 설정에서 어느 연결이 선택되는지 봐야 합니다.

### 4. 파일 DB·메모리 DB와 내장·서버 실행은 다른 기준입니다

**파일형·메모리형은 데이터를 어디에 두는지에 관한 구분입니다.** **내장·서버 모드는 다른 프로그램이 DB와 어떻게 연결되는지에 관한 구분입니다.** 이 두 기준을 한 가지로 합치면 “내장 DB는 종료하면 무조건 사라진다”라는 잘못된 결론이 나옵니다.

| 기준 | 선택 | 우리 과제에서의 실물 |
| --- | --- | --- |
| 저장 위치 | 파일 저장 | 일반 실행의 `jdbc:h2:file:...` |
| 저장 위치 | 메모리 저장 | 테스트의 `jdbc:h2:mem:vibe-test...` |
| 연결 방식 | 내장 모드 | Spring Boot와 같은 JVM에서 H2 실행 |
| 연결 방식 | 서버 모드 | H2 TCP 서버에 연결하는 별도 방식, 현재 미사용 |

**JVM, Java Virtual Machine → Java 바이트코드를 실행하는 런타임입니다.** 현재 서버의 Java 프로세스 안에서 Spring Boot 코드와 H2 라이브러리가 함께 실행됩니다. H2 파일 저장은 서버를 정상 종료한 뒤에도 파일을 남기므로, 같은 DB 경로로 다시 연결하면 데이터를 다시 읽을 수 있습니다.

H2 메모리 DB는 해당 Java 런타임의 메모리에 존재합니다. 테스트 URL에 있는 `DB_CLOSE_DELAY=-1`은 연결이 잠깐 끊겨도 JVM이 살아 있는 동안 DB를 유지하는 설정입니다. 컴퓨터를 껐다 켜도 그 메모리 데이터를 남기는 설정은 아닙니다. 내장·파일 경로·메모리 연결의 구체적 의미는 H2 연결 모드 및 URL 설명에 있습니다.

현재 테스트는 [테스트 클래스](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/test/java/com/ohgiraffers/springdatajpa/Chap06SpringDataJpaApplicationTests.java:13)에서 다음처럼 별도 연결을 지정합니다.

```java
@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:vibe-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
```

테스트는 일반 앱의 파일 DB와 다른 DB에서 수행했습니다. “테스트로 메뉴를 삭제했으니 앱의 메뉴도 사라진다”는 해석은 맞지 않습니다. 다만 아무 프로젝트의 모든 테스트가 자동으로 격리된다는 뜻은 아닙니다. 지금은 이 클래스의 연결 URL과 설정을 확인해서 구분하는 것입니다.

**읽기 실습:** `application-dev.yaml`의 `file`과 테스트 클래스의 `mem`을 비교하세요. 파일을 삭제하거나 `create-drop`을 일반 실행 설정에 옮기지 않고, 어느 쪽이 데이터를 보존하려는 설정인지 말로 설명해보세요.

### 5. “DB를 준비했다”는 구체적으로 무엇을 했나요?

이 과제에서는 세 가지 준비를 했습니다. **H2 라이브러리 추가, 연결·테이블 설정, 빈 DB에 예시 데이터 입력**입니다. 데이터 파일 자체를 소스 코드처럼 사람이 작성한 것은 아닙니다.

첫째, [build.gradle](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/build.gradle:48)의 의존성 목록에 H2를 추가했습니다.

```groovy
runtimeOnly 'com.h2database:h2'
```

`runtimeOnly`는 프로그램 실행 시 필요한 라이브러리라는 뜻입니다. Gradle이 해당 라이브러리를 준비해서 앱 실행 구성에 포함합니다.

둘째, [application-dev.yaml](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/resources/application-dev.yaml:2)에 연결 정보를 적었습니다.

```yaml
spring:
  datasource:
    url: jdbc:h2:file:./.runtime/data/vibe-menu;MODE=MySQL;DB_CLOSE_ON_EXIT=FALSE
    username: sa
    password: ""
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: update
```

`datasource`는 DB 연결 설정입니다. URL의 `jdbc:h2`는 H2 JDBC 연결을 뜻하고, `file` 뒤는 파일 저장 위치입니다. `./`는 Java 프로그램을 실행한 **현재 작업 디렉터리**를 기준으로 합니다. README처럼 `backend`에서 실행했을 때 `.runtime/data/vibe-menu.mv.db`가 그 폴더 아래에 생깁니다. 설정 파일이 들어 있는 `resources` 폴더를 기준으로 하는 상대 경로가 아닙니다.

H2는 내장 연결에서 DB가 없으면 새 DB를 만들 수 있습니다. 여기서는 Java 엔티티에 적힌 매핑과 `ddl-auto: update` 설정을 통해 Hibernate가 테이블 구조도 준비했습니다. H2 내장 시작 방법, Spring Boot DB 초기화

**DDL, Data Definition Language → 테이블 같은 구조를 정의하는 SQL입니다.** `CREATE TABLE`이 실물입니다. `update`는 “기존 메뉴 값을 자동으로 수정한다”가 아니라 엔티티 매핑에 맞춰 DB 구조 갱신을 시도하라는 설정입니다. 구조 변경의 완전한 이력이나 안전한 모든 변경을 보장하지 않습니다. 지금 개발 설정을 그대로 실제 운영 DB의 변경 정책으로 생각하지 마세요. 운영에서는 검토한 구조 변경을 기록하고 적용하는 별도 방식도 사용합니다.

`MODE=MySQL`은 **H2의 일부 문법·동작을 MySQL과 비슷하게 맞추는 호환 모드**입니다. 실제 접속 대상은 여전히 H2입니다. 문자열 비교·SQL 기능·타입·실행 계획 등 차이가 남으므로 H2 검사로 MySQL 호환성 전체를 증명할 수 없습니다. H2 공식 문서는 호환 모드가 차이의 일부만 구현한다고 명시합니다. H2 MySQL 호환 모드

`DB_CLOSE_ON_EXIT=FALSE`는 JVM 종료 시 H2 자체의 자동 종료 처리를 끄는 설정입니다. Spring Boot가 연결 종료 시점을 관리하도록 사용한 것입니다. “DB를 영원히 켜둔다”거나 “프로세스가 종료되어도 메모리를 유지한다”라는 뜻은 아닙니다. Spring Boot SQL DB 연결 안내

셋째, [DemoDataConfig.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/config/DemoDataConfig.java:27)에서 처음 빈 DB에 예시 데이터를 넣었습니다.

```java
if (categories.count() != 0 || menus.count() != 0) return;
```

카테고리나 메뉴 중 어느 쪽이라도 이미 있으면 메서드를 끝냅니다. **두 테이블이 모두 비었을 때만** 카테고리 8개와 메뉴 16개를 추가합니다. 실행할 때마다 중복으로 넣는 코드는 아닙니다. 메뉴만 전부 지웠는데 카테고리가 남았다면, 이 조건 때문에 메뉴를 자동 복원하지도 않습니다.

이 클래스는 `ApplicationRunner`를 구현해 시작 시 작업을 수행하고, `@Profile({"dev", "mysql"})` 때문에 해당 프로필에서만 준비됩니다. 지금은 코드를 읽는 단계이므로 DB를 비우거나 예시 데이터를 재입력하지 않습니다.

**읽기 실습:** 연결 URL을 `접속 종류 / 데이터 저장 위치 / 추가 옵션`으로 나눠 적어보세요. 이후 `count` 조건의 `||`가 “둘 중 하나라도 참”인지, 둘 다 참이어야 하는지 확인하세요. 이 조건의 반환 타입 `void`는 예시 데이터 작업이 호출자에게 값을 반환하지 않는다는 뜻입니다.

### 6. MySQL 프로필과 YAML은 무엇인가요?

**YAML → 들여쓰기로 키와 값을 표현하는 텍스트 형식입니다.** `application.yaml`은 Java 소스가 아니라 설정 파일입니다. 예를 들어 아래 표현은 `spring.profiles.default`라는 설정값을 `dev`로 지정합니다.

```yaml
spring:
  profiles:
    default: dev
```

**Profile → 환경에 따라 적용할 설정이나 객체를 선택하는 이름입니다.** 현재 공통 파일에서 기본 프로필을 `dev`로 지정했고, `application-dev.yaml`은 H2 설정, `application-mysql.yaml`은 MySQL 설정을 담습니다. 명시한 활성 프로필이 없을 때 기본 프로필이 쓰이는 원리입니다. Spring Boot 프로필

**Environment variable → 실행 환경에서 전달하는 이름 붙은 값입니다.** [MySQL 설정](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/resources/application-mysql.yaml:3)의 `${DB_USERNAME}`과 `${DB_PASSWORD}`는 사용자명·비밀번호 자체가 아니라 실행 환경에서 값을 찾으라는 자리입니다.

`${DB_URL:...}`처럼 콜론이 있으면 `DB_URL` 값이 없을 때 뒤의 기본값을 사용합니다. 현재 기본 MySQL URL은 별도 스키마 `vibe_menu_assignment`를 가리킵니다. 설정 파일이 존재한다고 그 스키마와 계정·권한이 생성된 것은 아닙니다. H2 데이터가 MySQL에 복사된 것도 아닙니다. 환경변수와 설정 파일은 Spring Boot의 외부 설정 방식으로 읽힙니다. Spring Boot 외부 설정

**현재 상태:** MySQL 드라이버와 프로필, README의 연결 방법을 준비했습니다. 실제 메뉴 CRUD·브라우저 검증은 H2에서 했습니다. MySQL로 바꾸려면 독립 스키마·권한을 확인하고 그 환경에서 다시 동작을 검증해야 합니다. 이 백과사전 작성 과정에서는 실행 프로필을 바꾸지 않았습니다.

**흔한 오해:** 프로필은 브랜치나 별도 소스 코드 복사본이 아닙니다. 같은 프로그램에서 적용할 구성을 선택하는 기능입니다. 설정 파일을 고쳐도 이미 떠 있는 JAR의 내용이 즉시 바뀌는 것은 아닙니다. 어떤 설정을 외부에서 읽는지와 재시작·재빌드가 필요한지를 구분해야 합니다.

**읽기 실습:** 공통 설정에서 `default`를 찾고, 두 프로필 파일의 `url`과 `driver-class-name`만 비교하세요. 비밀번호 환경변수를 출력하는 명령은 쓰지 않아도 됩니다.

### 공식 자료와 전체 주소

- [MySQL: What is MySQL?](https://dev.mysql.com/doc/refman/8.4/en/what-is-mysql.html)
- [H2 공식 소개](https://h2database.com/html/main.html)
- [MySQL 공식 제품 설명](https://dev.mysql.com/doc/refman/8.4/en/what-is-mysql.html)
- [H2 연결 모드 및 URL 설명](https://h2database.com/html/features.html#connection_modes)
- [H2 내장 시작 방법](https://h2database.com/html/quickstart.html#embedding)
- [Spring Boot DB 초기화](https://docs.spring.io/spring-boot/how-to/data-initialization.html)
- [H2 MySQL 호환 모드](https://h2database.com/html/features.html#compatibility)
- [Spring Boot SQL DB 연결 안내](https://docs.spring.io/spring-boot/reference/data/sql.html#data.sql.datasource.embedded)
- [Spring Boot 프로필](https://docs.spring.io/spring-boot/reference/features/profiles.html)
- [Spring Boot 외부 설정](https://docs.spring.io/spring-boot/reference/features/external-config.html)

### 이어서 궁금할 만한 질문

**H2 데이터는 재실행하면 없어지나요?**

현재 jdbc:h2:file 설정은 vibe-menu.mv.db에 저장합니다. jdbc:h2:mem 테스트와 다릅니다.

**수업 MySQL로 바꾸면 기존 H2 데이터도 따라가나요?**

mysql 프로필은 다른 DB에 접속합니다. H2 데이터가 자동으로 MySQL에 이전되는 것은 아닙니다.

**MODE=MySQL이면 MySQL 검사가 끝난 건가요?**

아닙니다. MODE=MySQL은 일부 호환 설정이며 실제 MySQL 드라이버·서버에서 별도 검증해야 합니다.


## 04. Java 서버 실행

Java 소스의 빌드 결과인 JAR를 JVM에서 실행하면 API 서버가 요청을 받습니다.

도해: Java 서버 실행 · 성공 경로 또는 표시된 조건에서의 흐름. 오프라인 HTML에서 그림으로 확인합니다.

### 1. 서버는 파일 종류인가요?

**서버 → 요청을 받고 응답하는 역할의 프로그램입니다.** “서버 컴퓨터”라고 하면 그 프로그램을 실행하는 장비를 가리키지만, 지금은 동희님 컴퓨터에서 실행되는 프로그램을 말합니다.

우리 서버는 `localhost:8090/api/menus`로 들어온 요청을 받아 메뉴 정보를 응답합니다. `localhost`는 요청을 보내는 컴퓨터 자신을 가리키고, `8090`은 프로그램이 요청을 받는 포트 번호입니다. Java의 확장자도 DB 이름도 아닙니다.

서버 프로그램이 실행되려면, 코드를 써놓은 파일만 있어서는 부족합니다. Java 실행 환경이 코드를 실행하고, Spring Boot가 필요한 객체와 웹 요청 처리 기능을 준비해야 합니다. 실행 중인 프로그램이 종료되면 같은 주소로 요청을 보내도 처리할 서버가 없습니다.

현재 출발점은 [Chap06SpringDataJpaApplication.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/Chap06SpringDataJpaApplication.java:9)입니다.

```java
public static void main(String[] args) {
    SpringApplication.run(Chap06SpringDataJpaApplication.class, args);
}
```

`main`은 프로그램의 진입점이고, `SpringApplication.run(...)`은 Spring Boot 앱을 시작하는 호출입니다. `args`는 시작할 때 받은 문자열 인자 목록입니다. 메서드 안에 메뉴 저장 코드가 직접 보이지 않는 이유는 시작과 개별 요청 처리가 다른 단계이기 때문입니다.

**흔한 오해:** `.java` 파일 하나가 켜져서 요청을 받는다고 생각하기 쉽습니다. 실제로는 여러 클래스·설정·라이브러리를 함께 실행하는 Java 프로세스가 요청을 받습니다.

**읽기 실습:** 출발점 파일을 열고 `main`과 `SpringApplication.run` 두 곳만 찾으세요. 다음으로 [공통 설정](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/resources/application.yaml:16)에서 `server.port`가 어디에 있는지 확인하세요. 지금은 새 서버를 실행하지 않아도 됩니다.

### 7. Java·Gradle·JAR를 구분하기

**Java → 이 서버의 동작을 작성한 프로그래밍 언어입니다.** `.java`는 사람이 읽고 고치는 소스 파일입니다. **Compile → 소스를 실행 환경이 처리할 코드로 변환하는 작업입니다.** Java 컴파일 결과에는 `.class` 파일이 생깁니다.

**Gradle → 의존성을 준비하고 컴파일·검사·패키징 작업을 실행하는 빌드 도구입니다.** `build.gradle`은 이 도구에게 필요한 라이브러리와 작업 구성을 알려줍니다. **Gradle Wrapper → 프로젝트가 정한 Gradle을 사용하도록 실행하는 파일들입니다.** Windows에서는 `gradlew.bat`가 실물입니다.

**JAR, Java Archive → Java 클래스와 자원을 묶은 파일 형식입니다.** 우리 프로젝트의 `bootJar` 작업은 실행에 필요한 의존성도 포함하는 Spring Boot 실행용 JAR을 만듭니다. 모든 `.jar`가 단독 실행되는 서버는 아닙니다. 라이브러리 JAR도 있습니다. Spring Boot 실행용 패키징

현재 역할은 이렇게 나뉩니다.

| 실물 | 하는 일 | 하지 않는 일 |
| --- | --- | --- |
| `MenuService.java` | 메뉴 처리 소스 | 소스 파일 자체가 요청을 받지는 않음 |
| `build.gradle` | 빌드와 의존성 설정 | 메뉴 데이터를 보관하지 않음 |
| `gradlew.bat` | Gradle 작업 실행 | DBMS가 아님 |
| `vibe-menu-api-0.0.1-SNAPSHOT.jar` | 서버 실행용 묶음 | DB 데이터 파일이 아님 |
| `vibe-menu.mv.db` | H2 메뉴·카테고리 데이터 | 서버 Java 소스가 아님 |

`java -jar ...`는 이미 만든 JAR을 실행합니다. `gradlew.bat bootJar`는 JAR을 만듭니다. **만드는 작업과 켜는 작업이 다릅니다.** 소스를 수정하고 예전 JAR을 실행하면 예전 코드가 실행됩니다. 이것은 Spring Boot 고유 현상이 아니라 소스와 빌드 결과가 다른 실물이기 때문입니다.

현재 [build.gradle](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/build.gradle:21)은 Java 17을 지정합니다. 같은 파일의 시작 부분에는 Spring Boot 플러그인 4.1.1이 적혀 있습니다. 참고 코드의 주석에 적힌 라이브러리 버전 전체를 실제 해결된 의존성 목록으로 취급하지는 않습니다.

**읽기 실습:** 파일 탐색기에서 `backend/src/main/java`, `backend/src/main/resources`, `backend/build/libs`, `backend/.runtime/data` 네 위치를 비교하세요. 읽기만 하면서 소스·설정·빌드 결과·데이터를 각각 어느 곳에 두었는지 확인하면 됩니다.

### 파일과 실행을 구별하기

| 이름·확장자 | 의미 | 실제 사용 |
| --- | --- | --- |
| .java | Java 소스 코드 | 서버 동작을 작성 |
| .class | 컴파일된 Java 바이트코드 | JVM이 실행 |
| .jar | 클래스와 자원을 묶은 파일 | bootJar 결과를 java -jar로 실행 |
| .yaml | 구조화한 설정 텍스트 | 포트·프로필·DB 연결 설정 |
| .js | JavaScript 코드 | API 함수·브라우저 로직 |
| .jsx | JSX를 포함하는 JavaScript 소스 | React 컴포넌트 |
| .module.css | CSS Module 소스 | 컴포넌트 스타일 범위 구분 |
| .json | 구조화한 데이터 텍스트 | 토큰·API 명세·package.json |
| .mv.db | 현재 H2 파일 DB | 메뉴·분류 데이터 보관 |
| node_modules | 설치된 npm 패키지 폴더 | 개발·빌드 의존성 |
| dist | 프론트 빌드 결과 폴더 | 배포할 정적 파일 |

파일을 복사하는 것, 빌드하는 것, 프로그램을 실행하는 것은 각각 다른 동작입니다. 서버는 확장자 이름이 아니라 요청을 받으며 실행 중인 프로그램의 역할을 뜻합니다.

### 공식 자료와 전체 주소

- [주소](http://localhost:8090/api/menus)
- [Spring Boot 실행용 패키징](https://docs.spring.io/spring-boot/gradle-plugin/packaging.html)

### 이어서 궁금할 만한 질문

**폴더를 복사하면 서버가 켜지나요?**

backend 폴더 복사와 java -jar 실행은 다른 동작입니다. 실행된 프로그램이 요청을 받습니다.

**8090 번호는 누가 정하나요?**

application.yaml의 server.port 기본값8090을 사용합니다. 환경변수 SERVER_PORT로 바꿀 수 있습니다.

**React build도 JAR를 만들나요?**

아닙니다. bootJar는 서버 JAR, Vite build는 브라우저 정적 파일 dist를 만듭니다.


## 05. JPA와 Java 계층

Controller·Service·Repository가 요청을 처리하고 Hibernate·JDBC가 DB 저장을 연결합니다.

도해: JPA와 Java 계층 · 성공 경로 또는 표시된 조건에서의 흐름. 오프라인 HTML에서 그림으로 확인합니다.

### 8. JDBC·JPA·Hibernate는 왜 세 개나 나오나요?

이름 세 개는 같은 프로그램의 별명이 아니라 서로 다른 층의 역할입니다.

| 용어 | 쉬운 뜻 | 정확한 역할 | 현재 과제의 연결 |
| --- | --- | --- | --- |
| JDBC, Java Database Connectivity | Java의 DB 연결 API | 연결·SQL 실행·결과 처리에 쓰는 표준 인터페이스 | H2 또는 MySQL 드라이버 |
| ORM, Object Relational Mapping | 객체와 테이블의 매핑 | Java 객체와 관계형 데이터를 연결하는 방식 | `Menu`와 `tbl_menu` 연결 |
| JPA, Jakarta Persistence | Java 영속성 표준 | 엔티티 매핑·조회·저장 등의 규칙과 API | `jakarta.persistence` 어노테이션 |
| Hibernate ORM | JPA를 실제 수행하는 라이브러리 | 매핑 정보를 사용해 SQL·객체 상태를 처리 | JPA 스타터가 가져오는 구현 |
| Spring Data JPA | Repository 작성 지원 | 인터페이스와 규칙을 이용해 데이터 접근 구현 지원 | `MenuRepository` |

JPA라는 약어는 예전 명칭 Java Persistence API로도 알려져 있습니다. 현재 코드의 import는 `jakarta.persistence.*`입니다. Hibernate 공식 설명은 Hibernate가 ORM 라이브러리이며 JPA 구현을 제공한다고 구분합니다. Spring Data JPA는 별도로 Repository 구현을 지원합니다. Hibernate ORM API 소개, Spring Data JPA 소개

**왜 필요한가요?** 순수 JDBC로도 같은 앱을 만들 수 있습니다. 그 경우 연결을 얻고 SQL을 작성하고 결과 행의 값을 Java 객체로 옮기는 코드가 많이 필요합니다. 이 과제는 JPA 매핑과 Spring Data Repository로 그 반복을 줄이고, 메뉴 처리의 의미를 Java 코드에서 읽도록 구성되어 있습니다. Spring Boot SQL 접근 방식

현재 `menuRepository.findById(menuCode)`라는 호출 아래에는 실제 DB 질의가 있습니다. 함수 이름이 SQL을 대체해 DB를 없애는 것이 아니라, 라이브러리들이 SQL 실행과 객체 변환을 담당합니다. `EntityManager`는 JPA가 엔티티의 저장·조회·상태를 관리하는 핵심 API이지만, 이 앱에서는 Repository가 그 사용을 감싸므로 서비스 코드에 직접 보이지 않습니다.

**흔한 오해:** “JPA를 쓰면 SQL을 공부하지 않아도 된다”는 해석입니다. 실제 SQL·테이블·키·조건·트랜잭션의 의미는 남습니다. 성능이나 DB 차이를 확인하려면 생성된 SQL과 테이블 구조도 이해해야 합니다. “Hibernate가 DBMS”라는 해석도 틀립니다. 실제 저장소는 H2 또는 MySQL입니다.

**읽기 실습:** `Menu.java`의 import가 `jakarta.persistence`인지, `MenuRepository.java`의 import가 `org.springframework.data.jpa.repository`인지 확인하세요. 두 파일은 같은 이름의 도구를 쓰는 것이 아닙니다.

### 9. Entity는 DB 한 행을 Java에서 다루는 구조입니다

**Entity → JPA가 영속성 대상으로 관리하는 객체 종류입니다.** `Menu` 클래스에 매핑 규칙을 적어, 메뉴 행의 값을 Java 필드로 다루게 합니다. **Persistence, 영속성 → 프로그램 안의 값이 실행 이후에도 저장소에 남도록 다루는 성질입니다.** 지금은 메뉴가 DB에 저장되는 경우입니다.

[Menu.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/entity/Menu.java:5)의 핵심은 아래와 같습니다. 실제 파일에서 읽을 부분을 줄인 발췌입니다.

```java
@Entity
@Table(name="tbl_menu")
public class Menu {
    @Id
    @Column(name="menu_code")
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int menuCode;

    @Column(name="menu_price")
    private int menuPrice;
}
```

`@Entity`는 JPA 관리 대상임을 나타내고, `@Table`은 연결할 테이블 이름, `@Column`은 연결할 열 이름, `@Id`는 식별자입니다. `IDENTITY`는 DB가 식별자를 생성하는 전략입니다. 메뉴 등록 때 화면에서 임의의 `menuCode`를 정해 보낼 필요가 없는 이유가 여기에 있습니다.

**Class → 객체의 구조와 동작을 정의한 코드입니다.** `Menu`가 클래스 이름입니다. **Object → 그 클래스를 바탕으로 만들어진 실제 인스턴스입니다.** `new Menu()`가 새 객체를 만듭니다. **Field → 객체가 보관하는 값의 자리입니다.** `menuPrice`가 필드입니다.

`int menuPrice`에서 `int`는 타입, `menuPrice`는 이름, `4500`은 그 자리에 저장할 수 있는 값입니다. 이 세 개를 섞어서 “4500이라는 객체”라고 부르지 않습니다. `Menu menu = new Menu();`에서는 `menu`가 객체를 참조하는 변수이고, 오른쪽에서 객체를 생성합니다.

카테고리 관계는 [Menu.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/entity/Menu.java:34)에 있습니다.

```java
@ManyToOne
@JoinColumn(name = "category_code")
private Category category;
```

여러 메뉴가 하나의 카테고리를 참조할 수 있으므로 Many-to-One입니다. Java 필드는 정수 코드가 아닌 `Category` 객체 참조를 보관합니다. Hibernate가 DB에서는 `category_code` 열로 이 관계를 표현합니다. 메뉴 객체 안에 카테고리 테이블 전체가 복사되는 것은 아닙니다.

**읽기 실습:** `menuPrice` 필드, `getMenuPrice()`, `setMenuPrice(int menuPrice)` 세 부분을 찾아보세요. getter는 값을 읽어 반환하고, setter는 인자로 받은 값을 필드에 저장합니다. `new Menu()`만 호출하고 아직 저장하지 않은 객체는 자동으로 DB 한 행이 된 것이 아닙니다.

### 10. Repository·Service·Controller·DTO가 맡는 일

### Repository: 저장소에 접근하는 호출

**Repository → 데이터 조회·저장에 사용하는 인터페이스입니다.** 현재 [MenuRepository.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/repository/MenuRepository.java:11)에 있습니다.

```java
public interface MenuRepository extends JpaRepository<Menu, Integer> {
    List<Menu> findByMenuPriceGreaterThan(Integer menuPrice);
}
```

`JpaRepository<Menu, Integer>`는 관리할 엔티티가 `Menu`이고 식별자 타입이 `Integer`라는 뜻입니다. `findById`, `findAll`, `save`, `delete` 같은 기본 동작을 상속받습니다. `findByMenuPriceGreaterThan`은 Spring Data가 메서드 이름의 규칙을 읽어 가격 초과 조건의 질의를 준비합니다. 임의의 영어 이름을 적으면 언제나 원하는 SQL이 만들어지는 것은 아닙니다. Spring Data JPA 질의 메서드

**읽기 실습:** `GreaterThan`을 검색한 다음 [MenuService.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/service/MenuService.java:176)에서 누가 그 메서드를 호출하는지 찾으세요. `4500`을 조건으로 전달하면 `4500` 메뉴가 제외된다는 점만 확인합니다.

### Service: 요청을 수행하는 처리 순서

**Service → 업무 규칙과 처리 순서를 담은 객체입니다.** 메뉴 등록에서는 카테고리 유효성 확인, DTO→엔티티 변환, 저장, 응답용 DTO 변환을 묶습니다. `@Service`는 Spring이 이 클래스를 구성 요소로 발견할 수 있게 하는 표시입니다. 기능 자체는 메서드의 Java 코드가 수행합니다. Spring의 Service 어노테이션

[MenuService.saveMenu](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/service/MenuService.java:195)의 실제 코드는 다음과 같습니다.

```java
@Transactional
public MenuDTO saveMenu(MenuDTO menuDTO) {
    Category category = findCategoryOrThrow(menuDTO.getCategoryCode());
    Menu savedMenu = menuRepository.save(convertToEntity(menuDTO, category));
    return convertToDTO(savedMenu);
}
```

카테고리 코드가 존재하지 않으면 `findCategoryOrThrow`가 예외를 던져 저장 단계로 가지 않습니다. 이것은 `@Service`의 자동 유효성 기능이 아니라 실제로 작성된 코드의 효과입니다.

### Controller: HTTP 요청의 입구와 응답의 출구

**Controller → 요청 주소·메서드를 Java 처리 메서드와 연결하는 객체입니다.** [MenuController.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/controller/MenuController.java:37)에는 클래스 수준의 `/api/menus` 경로가 있고, 등록 메서드에는 `@PostMapping`이 있습니다. 합치면 `POST /api/menus`를 등록 메서드가 받습니다.

```java
@PostMapping
public ResponseEntity<ResponseMessage> saveMenu(@RequestBody MenuDTO menuDTO) {
    MenuDTO savedMenu = menuService.saveMenu(menuDTO);
    // 실제 파일에는 응답 데이터 구성과 HTTP 201 반환 코드가 이어집니다.
}
```

이 발췌는 읽을 핵심만 남긴 부분 코드이며, 그대로 복사해서 컴파일할 완성 메서드는 아닙니다. `@RequestBody`는 HTTP 본문을 객체로 읽어들이도록 연결합니다. 현재 JSON은 메시지 변환기를 통해 `MenuDTO`로 바뀝니다. 서버가 JPA 엔티티를 직접 받는 것이 아닙니다. Spring RequestBody

`@RestController`의 반환값은 응답 본문으로 변환되도록 처리됩니다. `ResponseEntity`는 실제 HTTP 상태와 본문을 지정하는 데 사용합니다. 현재 저장 성공 메서드는 201을 돌려줍니다. Spring ResponseBody

### DTO: 화면과 주고받는 데이터의 구조

**DTO, Data Transfer Object → 계층이나 프로그램 사이에 전달할 값을 담는 객체입니다.** 현재 [MenuDTO.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/dto/MenuDTO.java:12)에는 이름·가격·코드·카테고리명·주문 가능 여부가 있습니다.

| 비교 | Entity `Menu` | DTO `MenuDTO` |
| --- | --- | --- |
| 목적 | DB와 매핑되는 상태·관계 | 요청·응답으로 전달하는 데이터 |
| 카테고리 표현 | `Category category` | `categoryCode`, `categoryName` |
| JPA 표시 | `@Entity`, `@ManyToOne` 등 | 현재 없음 |
| 저장 호출 | Repository가 관리 | 먼저 엔티티로 변환 |

DTO는 JSON과 같은 것이라는 말도 정확하지 않습니다. DTO는 Java 객체이고, JSON은 통신 본문에 사용하는 텍스트 표현입니다. JSON→DTO, DTO→JSON 변환이 일어납니다. 엔티티를 그대로 응답하면 DB 관계와 화면 데이터 구조가 함께 묶이므로, 현재 강의 코드는 DTO를 별도로 둡니다.

**읽기 실습:** [convertToDTO](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/service/MenuService.java:40)에서 `menu.getMenuPrice()`가 DTO 생성자의 어느 자리에 전달되는지 찾으세요. 같은 가격이 다른 형식으로 전달되지만 DB 저장 코드가 다시 실행되는 것은 아닙니다.

### 11. DI는 객체 참조를 넣어주는 일입니다

**DI, Dependency Injection → 객체가 필요로 하는 다른 객체를 외부에서 제공하는 방식입니다.** 현재 Spring이 서비스에 Repository 객체를, Controller에 Service 객체를 생성자 인자로 전달합니다. Spring DI 설명

현재 서비스의 실제 코드는 [MenuService.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/service/MenuService.java:21)에 있습니다.

```java
private final MenuRepository menuRepository;

public MenuService(MenuRepository menuRepository, CategoryRepository categoryRepository) {
    this.menuRepository = menuRepository;
    this.categoryRepository = categoryRepository;
}
```

왼쪽 `this.menuRepository`는 지금 생성하는 `MenuService` 객체의 필드입니다. 오른쪽 `menuRepository`는 생성자의 매개변수입니다. 이 대입으로 필드가 전달받은 Repository 객체를 참조하게 됩니다. 이름이 같지만 위치와 역할이 다릅니다. 새 메뉴 가격을 주입하는 작업이 아니라 **메뉴 조회·저장에 사용할 협력 객체**를 준비하는 작업입니다.

**Constructor → 새 객체를 초기화할 때 사용하는 특별한 선언입니다.** 클래스 이름과 같고 반환 타입을 적지 않습니다. 일반 메서드의 `void`와 다릅니다. **Bean → Spring 컨테이너가 관리하는 객체입니다.** 클래스 파일 자체나 `this` 키워드의 다른 이름이 아닙니다.

이해를 돕는 일반 Java 표현으로 `new MenuService(준비된MenuRepository, 준비된CategoryRepository)`를 생각할 수 있습니다. 이것은 실제 Spring 내부 코드의 기계적인 치환이 아니라, 생성자에 객체가 전달된다는 부분만 보여주는 학습용 표현입니다. Spring은 구현 준비·프록시·생명주기 등의 일을 추가로 수행합니다.

**흔한 오해:** DI 때문에 모든 객체가 자동으로 만들어진다는 생각입니다. 현재 `new Menu()`나 `new MenuDTO(...)`는 애플리케이션 코드가 직접 만드는 값 객체입니다. Spring Bean으로 만든 Service와 같은 생성 흐름은 아닙니다.

**읽기 실습:** Controller의 생성자와 Service의 생성자를 비교하세요. 두 파일에서 `this.` 왼쪽 필드와 오른쪽 매개변수를 각각 가리켜보세요. 값을 반환하는 `saveMenu` 호출은 그 이후에 일어납니다.

### 12. 트랜잭션과 변경 감지

**Transaction → 여러 DB 작업을 하나의 완료·취소 단위로 다루는 범위입니다.** **Commit → 변경을 확정하는 처리입니다.** **Rollback → 그 트랜잭션의 변경을 취소하는 처리입니다.** 메뉴 등록·수정·삭제 메서드에는 `@Transactional`이 붙어 있습니다.

왜 필요한지는 수정 메서드에서 보입니다. 기존 메뉴를 읽고, 이름·가격·상태를 바꾸고, 카테고리까지 바꾸는 흐름을 한 작업으로 처리하고 싶습니다. 도중에 실패했는데 일부 변경만 남는 상황을 막기 위한 범위입니다. Spring Data 공식 설명도 여러 Repository를 묶는 서비스에서 트랜잭션 경계를 지정하는 방법을 보여줍니다. Spring Data 트랜잭션

[MenuService.updateMenu](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/service/MenuService.java:218)는 조회한 `foundMenu`에 setter를 호출하지만 `save`를 다시 호출하지 않습니다.

```java
foundMenu.setMenuName(menuDTO.getMenuName());
foundMenu.setMenuPrice(menuDTO.getMenuPrice());
foundMenu.setOrderableStatus(menuDTO.getOrderableStatus());
```

현재 트랜잭션 안에서 조회한 엔티티는 JPA가 관리하는 상태이므로, 변경을 추적하고 DB와 동기화하는 시점에 UPDATE가 수행됩니다. **Dirty checking, 변경 감지 → 관리 중인 엔티티의 달라진 값을 확인하는 기능입니다.** 어떤 Java 객체나 전역 변수든 바꾸면 DB에 저장된다는 기능이 아닙니다. Hibernate 객체 상태와 저장 설명

`@Transactional`은 모든 예외나 어떤 호출에서나 동일하게 적용되는 마법이 아닙니다. 기본 규칙에서는 `RuntimeException`과 `Error`가 롤백 대상으로 취급되고 checked exception은 별도 규칙이 필요할 수 있습니다. 기본 프록시 방식에서 같은 객체 내부의 자기 호출은 별도로 붙인 트랜잭션을 새로 적용하는 호출이 아닙니다. 지금은 Controller가 Spring이 관리하는 Service를 호출하는 흐름을 기준으로 읽으세요. Transactional API, Spring 트랜잭션 적용 방식

또한 `menuRepository.save(...)` 반환 순간과 모든 DB 변경 확정 순간이 항상 같지는 않습니다. 저장 SQL이 실행되는 시점, JPA flush, 트랜잭션 commit은 구별되는 처리입니다. 처음에는 “현재 서비스의 변경 작업이 트랜잭션 범위에서 완료된다”까지 이해하고, 더 공부할 때 정확한 실행 시점을 확인하면 됩니다.

**읽기 실습:** `saveMenu`, `updateMenu`, `deleteMenu` 위의 어노테이션을 찾으세요. 수정 메서드 끝의 반환값은 `MenuDTO`이고, 삭제 메서드 반환 타입은 `void`입니다. `void`가 데이터 삭제 실패라는 뜻은 아닙니다. 이 메서드가 호출자에게 값을 반환하지 않는다는 뜻입니다.

### 13. 아메리카노와 4500의 실제 이동

두 흐름을 나누어 봅니다. 첫 번째는 앱 시작 때 빈 DB를 채우는 흐름이고, 두 번째는 화면이 저장된 메뉴를 조회하는 흐름입니다. 같은 메뉴 이름을 쓰지만 시작 데이터 입력이 HTTP 등록 요청을 대신 호출하는 것은 아닙니다.

### 시작 데이터: 숫자를 엔티티에 저장하기

[DemoDataConfig.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/config/DemoDataConfig.java:44)의 호출입니다.

```java
add("아메리카노", 4500, coffee, "Y");
```

선택한 값은 `4500` 하나입니다. 이 값의 이동만 보면 다음과 같습니다.

- 호출문의 정수 값 `4500`이 `add`의 `int price` 매개변수로 전달됩니다.
- `Menu menu = new Menu();`에서 새 메뉴 객체를 만듭니다.
- `menu.setMenuPrice(price)`가 호출되어 `4500`이 `Menu`의 `menuPrice` 필드에 저장됩니다.
- `menus.save(menu)`가 그 엔티티를 저장하도록 요청합니다.
- Hibernate가 엔티티 매핑을 사용하고 JDBC를 통해 H2에 SQL을 전달합니다.
- DB의 `tbl_menu.menu_price`에 해당 메뉴의 가격이 보관됩니다.

`coffee`는 가격 값이 아니라 앞서 생성·저장한 `Category` 객체의 참조입니다. `setCategory(category)`는 그 카테고리와의 관계를 설정합니다. `Y`는 문자열이고, `4500`은 정수입니다. DB가 생성하는 메뉴 코드를 예시 숫자로 고정하지 않습니다. DB 이력에 따라 달라질 수 있습니다.

### 조회: 저장된 숫자가 응답으로 돌아오기

표기: 아래 시퀀스의 `→`는 호출·요청, `←`는 반환·응답입니다. 시간은 위에서 아래로 흐릅니다. 참가자는 화면, Controller, Service, 저장소 계층입니다.

```text
React 화면        MenuController       MenuService           Repository/Hibernate/JDBC/H2
    |                   |                   |                         |
    | -- 목록 GET ----> |                   |                         |
    |                   | -- findAllMenus ->|                         |
    |                   |                   | -- findAll ------------>|
    |                   |                   |<-- Menu 객체 목록 ------|
    |                   |                   |                         |
    |                   |                   | convertToDTO            |
    |                   |                   | 가격 4500 전달           |
    |                   |<-- DTO 목록 ------|                         |
    |<-- JSON 응답 -----|                   |                         |
    |                   |                   |                         |
    | 가격을 원화로 표시|                   |                         |
```

저장소에서 돌아온 `Menu` 객체를 [convertToDTO](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/service/MenuService.java:44)가 `MenuDTO`로 옮깁니다. `menu.getMenuPrice()`가 반환한 `4500`이 DTO 생성자의 세 번째 인자로 들어갑니다. DTO 필드는 그 값을 보관합니다.

[Controller](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/controller/MenuController.java:62)는 DTO 목록을 `result.menus`에 넣고 `ResponseMessage`로 감쌉니다. Java 객체가 JSON으로 변환되면 `"menuPrice": 4500`이라는 항목으로 전달됩니다. 프론트엔드는 그 숫자를 받아 `4,500원` 같은 표시 형식으로 보여줄 수 있습니다. 쉼표와 원 단위를 붙이는 표시 작업이 DB의 숫자 값을 바꾸는 것은 아닙니다.

**읽기 실습:** 서버가 이미 켜져 있을 때만 브라우저에서 메뉴 조회를 열어 `아메리카노`를 찾으세요. 응답의 `menuPrice`를 확인하고 `MenuService.convertToDTO`의 해당 getter와 연결해보세요. 메뉴가 나중에 수정되었다면 현재 값이 원래 예시 값과 다를 수 있습니다. 조회 결과를 현재 사실로, `DemoDataConfig`의 값을 초기 예시로 구분하세요.

### 14. 저장 실패는 어디에서 응답으로 바뀌나요?

**Exception → 정상 처리 흐름을 중단하고 실패를 전달하는 Java 방식입니다.** 현재 존재하지 않는 카테고리를 저장 요청에 넣으면 [findCategoryOrThrow](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/service/MenuService.java:71)가 `IllegalArgumentException`을 던집니다. [ExceptionController](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/exception/ExceptionController.java:52)가 이를 HTTP 400 응답으로 바꿉니다.

없는 메뉴 코드를 조회했을 때는 `MenuNotFoundException`이 발생하고 해당 처리기가 HTTP 404를 돌려줍니다. Java 예외와 HTTP 상태 코드는 서로 다른 표현이므로 중간에서 연결하는 코드가 필요합니다.

현 앱은 프론트엔드의 필수값·가격·상태 검사를 구현했고, 백엔드에는 강의 코드의 카테고리 존재 확인 같은 처리가 있습니다. `@RequestBody`를 붙였다고 모든 업무 유효성 규칙이 자동 검증되는 것은 아닙니다. 현재 DTO에 모든 필드별 검증 어노테이션이 있는 것도 아닙니다. 화면 검사를 통과했다는 사실과 다른 API 클라이언트의 잘못된 입력까지 서버가 모두 막는다는 사실은 구별해야 합니다.

**읽기 실습:** 고의로 잘못된 등록 요청을 보내기보다 예외 처리 파일에서 `IllegalArgumentException`, `BAD_REQUEST`, `MenuNotFoundException`, `NOT_FOUND` 네 단어만 연결하세요. 기존 데이터를 바꾸지 않고도 실패 흐름을 읽을 수 있습니다.

### 15. 한 번에 기억할 대응표

| 동희님 표현 | 정확히 가리키는 것 | 바로 읽을 실물 |
| --- | --- | --- |
| 서버를 복사했다 | 서버를 만드는 프로젝트 소스·설정 복사 | `backend` 폴더 |
| 서버를 켰다 | Java 프로세스에서 Spring Boot 앱 실행 | `main`, 실행 로그, 8090 응답 |
| DB를 준비했다 | DBMS 의존성·연결·테이블·초기 데이터 구성 | H2 설정과 `DemoDataConfig` |
| 메뉴를 저장했다 | 엔티티 저장 요청과 DB 변경 완료 | `MenuService.saveMenu` |
| 서버와 DB를 연결했다 | JDBC 연결 구성으로 DB에 접근 가능하게 함 | `spring.datasource.*` |
| React와 서버를 연결했다 | 브라우저 코드가 HTTP API 요청·응답을 처리 | 프론트엔드 `src/api` |
| MySQL로 바꾼다 | 실행 DB 연결 대상을 별도 MySQL로 선택·준비 | `application-mysql.yaml`, 별도 검증 필요 |
| 빌드했다 | 코드를 검사·컴파일·패키징 | Gradle 결과와 JAR |

읽기를 마치면 먼저 한 문장으로 연결해보세요. **“React의 메뉴 조회 요청을 Controller가 받아 Service를 호출하고, Repository 아래의 Hibernate·JDBC가 DB에서 메뉴를 읽어 DTO·JSON으로 돌려준다.”** 각 이름을 실제 파일 한 곳과 연결할 수 있다면 서버 구조의 첫 목표를 달성한 것입니다.

### 공식 자료와 전체 주소

- [Hibernate ORM API 소개](https://docs.hibernate.org/orm/7.4/javadocs/)
- [Spring Data JPA 소개](https://spring.io/projects/spring-data-jpa/)
- [Spring Boot SQL 접근 방식](https://docs.spring.io/spring-boot/reference/data/sql.html)
- [Spring Data JPA 질의 메서드](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html)
- [Spring의 Service 어노테이션](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Service.html)
- [Spring RequestBody](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html)
- [Spring ResponseBody](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responsebody.html)
- [Spring DI 설명](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)
- [Spring Data 트랜잭션](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html)
- [Hibernate 객체 상태와 저장 설명](https://docs.hibernate.org/orm/7.4/introduction/html_single/)
- [Transactional API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/Transactional.html)
- [Spring 트랜잭션 적용 방식](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
- [메뉴 조회](http://localhost:8090/api/menus)

### 이어서 궁금할 만한 질문

**Repository 코드를 모두 직접 구현해야 하나요?**

Spring Data JPA의 JpaRepository가 기본 save·findById 기능을 제공합니다. 현재 인터페이스를 확인하세요.

**setter 호출만 하면 어떤 객체든 저장되나요?**

관리되는 엔티티·트랜잭션·변경 감지 조건이 필요합니다. 단순 객체의 setMenuPrice만으로 DB 반영을 보장하지 않습니다.

**DTO와 엔티티를 같은 구조로 보내면 안 되나요?**

현재 MenuDTO는 화면 계약, Menu는 Category 관계를 포함한 영속성 모델입니다. API와 저장 구조의 결합을 구분합니다.


## 06. HTTP와 실제 API

HTTP 요청의 주소·메서드·본문과 응답의 상태·데이터를 따로 읽습니다.

### 1. API는 무엇을 정하는 약속인가

API는 프로그램이 다른 프로그램의 기능을 사용할 수 있도록 공개한 접점입니다. 이번 과제에서는 브라우저에서 실행하는 React가 메뉴 서버의 기능을 사용합니다. 사람이 자바 메서드 이름을 화면에 입력하는 대신, React가 약속한 HTTP 메서드와 주소로 요청을 보냅니다.

이번에 알아야 할 API는 다음입니다.

```text
GET http://localhost:8090/api/menus
```

`GET`은 요청의 방식이고, 뒤의 URL은 요청할 대상입니다. 이 조합이 메뉴 목록 조회를 뜻합니다. 서버는 자신의 Java 코드로 메뉴를 조회한 후 JSON 응답을 돌려줍니다. React가 Java 파일을 다운로드해서 실행하는 구조가 아닙니다.

API 계약은 요청 주소만 적은 목록보다 넓습니다. 어떤 메서드를 쓸지, 입력 이름과 타입은 무엇인지, 어떤 응답 키가 돌아올지, 실패하면 무엇을 보여줄지까지 약속해야 서로 연결할 수 있습니다. 우리의 계약은 [api-contract.md](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/docs/api-contract.md)에 있습니다.

예를 들어 서버가 메뉴 배열을 `result.menus`에 담는데 React가 `result.items`를 읽으면 화면을 제대로 채울 수 없습니다. 둘 다 “목록을 조회했다”는 생각만 공유해서는 부족합니다. **정확한 이름과 구조가 맞아야 합니다.**

### 2. HTTP는 요청과 응답을 주고받는 규칙입니다

HTTP는 브라우저와 서버가 요청·응답을 교환하는 프로토콜입니다. 프로토콜은 서로 이해할 메시지 규칙입니다. 클라이언트가 요청하고 서버가 응답하는 구조를 사용합니다. 이 과제에서는 React와 Swagger UI가 둘 다 API 클라이언트가 될 수 있습니다. MDN HTTP 개요

도해: 시퀀스 · 위에서 아래로 읽습니다. 조건 줄은 성공과 실패 경로를 구분합니다.. 오프라인 HTML에서 그림으로 확인합니다.

같은 API를 요청해도 보여주는 방법은 다릅니다. React는 이름·가격·버튼이 있는 서비스 화면을 만들고, Swagger UI는 개발자가 확인하기 좋게 원본 응답과 상태를 보여줍니다. Swagger UI가 React의 UI 디자인을 만들어주지는 않습니다.

### 3. URL·localhost·포트·경로·쿼리를 읽는 법

다음 주소를 나누어 보겠습니다.

```text
http://localhost:8090/api/menus/pages?page=1&size=12
```

| 부분 | 뜻 | 우리 과제의 실제 값 |
| --- | --- | --- |
| `http` | 통신 방식 | 개발용 HTTP |
| `localhost` | 요청을 보내는 환경의 자기 컴퓨터 | 지금 서버가 켜진 동희님 PC |
| `8090` | 같은 컴퓨터에서 찾아갈 포트 | Spring Boot 서버의 포트 |
| `/api/menus/pages` | 서버 안의 요청 경로 | 메뉴 페이지 조회 |
| `?page=1&size=12` | 조회 조건을 붙인 쿼리 문자열 | 첫 페이지, 최대 12개 |

이 주소에서 `pages`는 파일 확장자가 아닙니다. 서버가 약속한 경로 이름입니다. 포트는 프로그램을 찾아가는 연결 번호입니다. React 개발 화면을 제공하는 Vite는 `5175`, 메뉴 API 서버는 `8090`을 사용합니다. 값은 [application.yaml](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/resources/application.yaml:16)과 [client.js](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/api/client.js:3)에 있습니다.

`localhost`는 인터넷에 게시된 고정 주소가 아닙니다. 친구의 컴퓨터에서 `localhost:8090`을 열면 친구 컴퓨터의 8090번을 찾습니다. GitHub에 코드를 올려도 이 주소로 우리 서버가 자동 공개되지는 않습니다.

**경로 변수와 쿼리 파라미터도 구분합니다.**

```text
/api/menus/1                  → 메뉴 코드 1 한 건
/api/menus/search?menuPrice=5000 → 5,000원보다 비싼 메뉴들
```

명세의 `/api/menus/{menuCode}`에서 중괄호는 값을 넣을 자리라는 뜻입니다. 실제 요청에서는 `{menuCode}`를 `1` 같은 코드로 바꿉니다. Java에서는 `@PathVariable`이 경로의 값을 받고, `@RequestParam`이 쿼리의 값을 받습니다. 이는 Spring MVC의 요청 매핑 규칙입니다. Spring 요청 매핑 공식 문서

### 4. 메서드는 같은 주소에서 무엇을 할지 구분합니다

| 메서드 | 일반적 의미 | 이 과제에서 사용 |
| --- | --- | --- |
| GET | 조회 | 목록·상세·가격 검색 |
| POST | 새 데이터 처리·생성 | 메뉴 등록 |
| PUT | 지정한 대상의 정보 교체·수정 | 메뉴 전체 입력값 수정 |
| DELETE | 대상 삭제 | 메뉴 삭제 |
| OPTIONS | 통신 옵션 확인 | 브라우저의 CORS 사전 확인 |

HTTP 메서드에는 안전성·멱등성 같은 의미도 있습니다. 여기서는 먼저 조회와 변경을 구분하시면 됩니다. GET은 데이터 변경을 의도하지 않는 조회 방식입니다. POST·PUT·DELETE는 이 과제에서 DB를 변경합니다. 같은 `/api/menus`라도 GET은 목록 조회이고 POST는 등록입니다. MDN HTTP 메서드

브라우저 주소창에 URL을 입력해 여는 것은 보통 GET 요청입니다. 주소창에 `/api/menus`를 열었다고 새 메뉴가 등록되지 않습니다. 등록은 POST와 등록 정보를 함께 보내야 합니다.

### 5. 헤더·본문·JSON은 서로 다른 층입니다

요청에는 메서드·대상 주소 외에 헤더와 필요할 경우 본문이 있습니다. 헤더는 메시지의 형식 같은 부가 정보를 전달하고, 본문은 실제 전달 내용입니다. 다음은 등록 요청을 학습용 HTTP/1.1 텍스트로 표시한 것입니다. 실제 브라우저 화면에는 다른 헤더가 더 보일 수 있습니다. MDN HTTP 메시지

```http
POST /api/menus HTTP/1.1
Host: localhost:8090
Content-Type: application/json

{
  "menuName": "학습용 라떼",
  "menuPrice": 5000,
  "categoryCode": 6,
  "orderableStatus": "Y"
}
```

`Content-Type: application/json`은 본문 형식을 설명합니다. `categoryCode: 6`은 학습용 예시이며 실제 존재하는 하위 카테고리 코드는 카테고리 조회에서 확인합니다. 이 예제를 읽기만 해도 됩니다. 요청을 실행하면 실제 등록이 일어납니다.

JSON은 데이터를 적는 텍스트 형식입니다. 객체는 `{}`, 배열은 `[]`, 문자열은 큰따옴표, 숫자는 따옴표 없는 값으로 적습니다. `null`은 값이 없음을 표현하는 별도 값입니다. JSON은 Java·JavaScript 코드 자체가 아닙니다. 여러 언어가 이 형식으로 데이터를 주고받을 수 있습니다. MDN JSON

`5000`과 `"5000"`은 형식상 다릅니다. 앞은 숫자, 뒤는 문자열입니다. 이 과제의 가격 계약은 정수입니다. `orderableStatus`는 `"Y"` 또는 `"N"` 문자열이며 불리언 `true`·`false`로 보내는 계약이 아닙니다.

### 6. 응답에서 상태와 데이터를 따로 읽습니다

목록 요청의 정상 응답은 다음 모양입니다. 메뉴 값·개수는 예시입니다.

```json
{
  "httpStatus": 200,
  "message": "메뉴 목록 조회 성공",
  "result": {
    "menus": [
      {
        "menuCode": 1,
        "menuName": "아메리카노",
        "menuPrice": 4500,
        "categoryCode": 6,
        "categoryName": "커피",
        "orderableStatus": "Y"
      }
    ]
  }
}
```

바깥의 JSON 객체 안에 `result`, 그 안에 `menus` 배열, 그 배열 안에 메뉴 객체가 있습니다. `menus`와 상세 조회의 `menu`를 혼동하지 않습니다. 실제 조립 코드는 [MenuController.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/controller/MenuController.java:59)에 있습니다.

**실제 HTTP 상태와 JSON의 `httpStatus`는 별개입니다.** HTTP 상태는 통신 응답의 메타데이터이고, JSON 키는 서버 개발자가 본문에 만든 항목입니다. 대부분 같은 숫자지만 이 강의 서버의 삭제는 서로 다릅니다.

| 실제 HTTP 상태 | 우리 과제에서의 뜻 |
| --- | --- |
| 200 | 조회·수정·삭제 성공 |
| 201 | 메뉴 생성 성공 |
| 400 | 잘못된 입력·잘못된 카테고리 등 |
| 404 | 해당 메뉴·카테고리가 없음 |
| 500 | 서버 내부 오류 |

삭제 메서드는 본문 `httpStatus`에 `204`를 넣지만 `.status(HttpStatus.OK)`로 실제 HTTP `200`을 보냅니다. 이 과제는 강의 계약을 유지하고 있습니다. 실제 HTTP `204 No Content`는 본문 없는 응답입니다. “200+본문 내부204”와 “실제204”를 같은 것으로 읽지 않습니다. [삭제 메서드](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/controller/MenuController.java:389), MDN 204

오류 본문은 정상의 `result` 포장과 다릅니다. `code`, `description`, `detail`을 확인합니다. HTTP 요청이 아예 연결되지 않으면 서버 오류 JSON조차 없을 수 있습니다. React의 [toMessage](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/api/client.js:19)는 서버가 준 오류 설명과 연결 실패를 구분합니다.

### 7. 이번 과제의 API 10개

다음은 현재 컨트롤러와 저장된 명세에 있는 10개의 HTTP 작업입니다. 경로 수는 7개지만 같은 경로의 GET·POST·PUT·DELETE를 따로 세어 10개입니다. API 개수라는 말은 어떤 기준으로 세었는지 함께 봅니다.

| 요청 | 입력 위치 | 성공 데이터 | 실제 성공 상태 |
| --- | --- | --- | --- |
| GET `/api/menus` | 없음 | `result.menus` | 200 |
| GET `/api/menus/pages` | 쿼리 `page`, `size` | `result.content`와 페이지 정보 | 200 |
| GET `/api/menus/pages/sort` | 쿼리 `page`, `size`, `sortBy`, `direction` | 페이지 정보와 정렬 정보 | 200 |
| GET `/api/menus/{menuCode}` | 경로 메뉴 코드 | `result.menu` | 200 |
| GET `/api/menus/search` | 쿼리 `menuPrice` | `result.menus`, `searchPrice` | 200 |
| POST `/api/menus` | JSON 본문 | `result.menu` | 201 |
| PUT `/api/menus/{menuCode}` | 경로 코드와 JSON 본문 | `result.menu` | 200 |
| DELETE `/api/menus/{menuCode}` | 경로 코드 | `result.deletedMenuCode` | 200 |
| GET `/api/categories` | 없음 | `result.categories` | 200 |
| GET `/api/categories/{categoryCode}` | 경로 카테고리 코드 | `result.category` | 200 |

계약 출처: [MenuController.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/controller/MenuController.java:37), [CategoryController.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/controller/CategoryController.java:21), [api-docs.json](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/api-docs.json:28).

가격 검색은 **기준값 초과**입니다. `menuPrice=5000`이면 5,000원 메뉴는 포함되지 않습니다. 페이지 요청은 **1부터**이며 응답 `number`도 1부터입니다. 내부 Spring `Page` 번호는 0부터여서 컨트롤러가 반환할 때 `+1`을 합니다. `size`의 최대치는 100입니다. [페이지 반환 코드](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/controller/MenuController.java:106), [페이지 설정](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/resources/application.yaml:9)

이름 검색과 카테고리 필터 전용 서버 API는 없습니다. 현재 React는 전체 메뉴를 받아 이 조건을 화면 쪽에서 적용합니다. API 명세에 없는 사진·평점·재고·매출·로그인을 디자인에 그려 넣으면 기능까지 저절로 생기는 것이 아닙니다. 별도 설계·구현이 필요합니다.

### 공식 자료와 전체 주소

- [MDN HTTP 개요](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
- [Spring 요청 매핑 공식 문서](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html)
- [MDN HTTP 메서드](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)
- [MDN HTTP 메시지](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages)
- [MDN JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)
- [MDN 204](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/204)

### 이어서 궁금할 만한 질문

**주소가 같으면 같은 작업인가요?**

GET /api/menus는 조회이고 POST /api/menus는 등록입니다. 주소와 메서드의 조합이 작업을 구분합니다.

**4500원 초과에4500원 메뉴가 포함되나요?**

menuPrice > 4500이므로 같은4500원 메뉴는 제외됩니다. >= 조건과 다릅니다.

**삭제 본문204면 HTTP204인가요?**

현재 DELETE 응답은 실제 HTTP200이고 JSON 내부 httpStatus204입니다. 진짜 HTTP204는 본문 없는 응답입니다.


## 07. OpenAPI와 Swagger

OpenAPI는 표준 문서 구조이고 springdoc가 Java에서 생성하며 Swagger UI가 보여줍니다.

### 8. OpenAPI 문서의 항목은 누가 정했나요

OpenAPI는 HTTP API를 설명하는 표준입니다. 표준은 문서 항목의 의미와 문법을 정하고, 프로젝트는 그 항목의 값을 채웁니다. 우리의 파일은 첫 부분에 `"openapi": "3.1.0"`이 있습니다. 이는 **이 파일이 따르는 명세 형식 버전**입니다. `info.version: "v1"`은 **우리 API의 문서상 버전**입니다. 서로 다른 버전이며 Java·Spring Boot·H2의 버전도 아닙니다. [실제 명세 시작](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/api-docs.json:1), Swagger의 API 버전 설명

| 표준 항목 | 설명 | 현재 파일의 예 |
| --- | --- | --- |
| `openapi` | 문서가 따르는 표준 버전 | `3.1.0` |
| `info` | 제목·설명·API 버전 | 메뉴 관리 API 명세서, `v1` |
| `servers` | 요청 대상 서버 주소 목록 | `localhost:8090` |
| `tags` | API를 묶는 이름·설명 | 메뉴, 카테고리 |
| `paths` | 경로별 작업 | `/api/menus` 아래 `get`, `post` |
| `parameters` | 경로·쿼리 등의 입력 설명 | `menuCode`, `in: path` |
| `requestBody` | 요청 본문 형식 | JSON 메뉴 정보 |
| `responses` | 상태별 응답 설명 | `201` 등록 성공 |
| `components.schemas` | 재사용하는 데이터 모양 | `MenuDTO`, `ResponseMessage` |
| `$ref` | 다른 정의를 참조 | `#/components/schemas/MenuDTO` |

항목 이름·의미의 근거: OpenAPI 3.1.0 문서 구조. 이 표에 있는 항목을 모두 항상 필수로 적어야 한다는 뜻은 아닙니다. 표준에는 필수와 선택 항목이 구분되어 있습니다.

다음은 **학습용으로 줄인 명세 일부**입니다. 전체 문서 복사본이 아닙니다.

```json
{
  "servers": [{ "url": "http://localhost:8090" }],
  "paths": {
    "/api/menus": {
      "get": {
        "tags": ["메뉴"],
        "summary": "전체 메뉴 조회",
        "responses": {
          "200": { "description": "조회 성공" }
        }
      }
    }
  }
}
```

`servers`를 `myServers`로 마음대로 바꾸면 OpenAPI 도구는 그것을 표준 서버 목록으로 읽지 않습니다. `url`의 값과 `/api/menus`의 값은 서버 구현에 맞게 정할 수 있습니다. 경로의 `get` 역시 문서에서 사용하는 HTTP 작업 키입니다. Swagger의 경로·작업 설명

`메뉴` 태그는 문서의 분류이며 DB 테이블이나 요청 주소를 자동 생성하지 않습니다. Swagger의 태그 설명

`$ref`는 “이 문서의 이 정의를 참고하세요”라는 참조입니다. `#/components/schemas/MenuDTO`는 서버에 새 HTTP 요청을 보내라는 뜻이 아닙니다. `menuCode`·`menuPrice` 등의 타입을 정의한 스키마 위치를 가리킵니다. Swagger의 참조 설명

### 9. Java가 명세를 읽는 게 아니라, 지금은 Java에서 명세가 나옵니다

현재 구현은 코드에서 명세를 만드는 방식입니다. 흔히 **code-first**라고 부릅니다.

도해: 관계도 · 각 줄은 왼쪽에서 오른쪽으로 연결됩니다. 줄의 위아래 순서는 실행 순서가 아닙니다.. 오프라인 HTML에서 그림으로 확인합니다.

springdoc는 실행 중인 앱의 설정·클래스·어노테이션을 분석해 API 문서를 생성하는 Java 라이브러리입니다. 우리의 [build.gradle](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/build.gradle:45)에 `springdoc-openapi-starter-webmvc-ui:3.1.0`이 있습니다. `3.1.0`이라는 숫자가 OpenAPI 버전과 같아 보이지만 여기서는 **라이브러리 버전**입니다. springdoc의 생성 방식

어노테이션도 두 역할을 나눠 읽습니다.

| Java 어노테이션 | 이번 코드에서의 역할 |
| --- | --- |
| `@RequestMapping`, `@GetMapping`, `@PostMapping` | 실제 요청을 어떤 메서드가 받을지 지정 |
| `@PathVariable`, `@RequestParam`, `@RequestBody` | 요청의 값을 Java 매개변수에 전달 |
| `@Tag`, `@Operation`, `@ApiResponse` | 명세에 이름·설명·응답 설명을 제공 |
| `@OpenAPIDefinition`, `@Info` | 명세 제목·설명·문서 버전 제공 |

예를 들어 실제 코드의 `@RequestMapping("/api/menus")`와 `@GetMapping`이 목록 요청을 `findAllMenus()`에 연결합니다. `@Operation(summary = "전체 메뉴 조회")`는 Swagger UI의 설명을 더합니다. 제목을 바꾸는 것과 실제 요청 경로를 바꾸는 것은 다른 변경입니다.

```java
// 실제 클래스에서 학습에 필요한 선언 부분만 발췌했습니다.
@Tag(name = "메뉴", description = "메뉴 조회와 등록·수정·삭제를 제공한다.")
@RestController
@RequestMapping("/api/menus")
public class MenuController {
    // 필드·생성자·각 메서드 구현은 원본 파일에 있습니다.
}
```

원본: [MenuController.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/controller/MenuController.java:37). 실행할 전체 코드는 위 조각이 아니라 링크의 실제 파일입니다.

명세 저장은 [export-api.mjs](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/scripts/export-api.mjs:5)가 `/v3/api-docs`에 GET 요청을 보내 JSON을 파일로 적는 작업입니다. 서버에서 내려주는 문서와 저장 파일은 구분해야 합니다. 코드를 나중에 바꾸면 서버의 문서는 바뀌어도 저장해둔 파일은 다시 추출하기 전까지 과거 문서일 수 있습니다.

React의 [createMenu](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/api/menu.js:41)는 JSON 명세를 실행하지 않고 `postResult('/api/menus', {...})`를 호출합니다. [client.js](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/api/client.js:10)의 Axios가 실제 서버에 POST 요청을 보냅니다. **명세를 참고해 요청 코드를 만들었지만 실행 시 요청하는 것은 API입니다.**

### 10. 명세부터 코드를 만드는 방식도 있습니다

모든 프로젝트가 지금 과제와 같은 순서를 쓰는 것은 아닙니다. API를 먼저 설계해서 OpenAPI 문서를 정하고 그 문서를 기준으로 구현하는 방식도 있습니다. 흔히 design-first 또는 contract-first라고 부릅니다. Swagger Editor는 명세를 작성·검토하는 도구이고, Swagger Codegen은 명세에서 서버 뼈대나 클라이언트 코드를 생성하는 도구입니다. Swagger Editor, Swagger Codegen

```text
현재 과제: Java 구현 → 명세 생성 → 사람이 참고 → React 요청 코드
다른 방식: 명세 설계 → 코드 생성 도구 → 구현을 채움 → 앱 실행
```

코드 생성도 별도 도구를 실행하는 단계입니다. `api-docs.json`을 폴더에 넣는 것만으로 메뉴 저장 로직이 만들어지지는 않습니다. 현재 과제에는 이 코드 생성 절차를 적용하지 않았습니다.

### 11. Swagger UI·OpenAPI·springdoc·Postman의 차이

| 이름 | 무엇인가 | 현재 과제에서 하는 일 |
| --- | --- | --- |
| OpenAPI | 명세를 적는 표준 | 문서 구조의 규칙 |
| `api-docs.json` | 그 표준으로 적은 파일 | 저장한 API 설명서 |
| springdoc-openapi | Spring 앱을 분석하는 라이브러리 | Java에서 명세 생성·UI 연결 |
| Swagger UI | 명세를 읽는 개발자용 웹 화면 | API 확인·직접 요청 |
| Swagger Editor | 명세 작성·검토 도구 | 현재 사용하지 않음 |
| Postman | API 요청·검사 도구 | 현재 과제 실행에 필수 아님 |

Postman은 API 요청을 만들고 테스트하는 기능을 제공하며, Swagger UI는 명세를 기반으로 작업별 설명과 입력을 보여줍니다. 역할이 일부 겹쳐도 같은 프로그램은 아닙니다. Postman 공식 소개

실무에서 Swagger UI를 사용할 수 있는 시점은 다음과 같습니다.

- 백엔드가 새 API를 추가했을 때 어떤 입력·응답인지 공유합니다.
- 프론트엔드 개발자가 화면 구현 전에 호출 방법을 확인합니다.
- 오류가 났을 때 화면을 거치지 않고 API를 직접 호출해 결과를 비교합니다.
- 새 팀원이 API 구조를 익힙니다.

이는 도구 기능을 우리 개발 흐름에 적용한 예이며 모든 회사의 필수 절차나 사용률 통계가 아닙니다. 회사는 접근 가능한 개발 문서, 별도 테스트 클라이언트, 자동화 검사 등을 조합할 수 있습니다. 현재 과제는 Swagger UI와 자체 검사 스크립트를 함께 사용합니다.

Swagger UI의 **Example Value**는 스키마로 만들어진 예시일 수 있습니다. 실제 DB에서 조회한 결과는 실행 후의 **Server response**와 **Response body**에서 확인합니다. 화면에 보이는 예시 숫자를 이미 DB에 저장된 메뉴 코드라고 단정하지 않습니다.

### 12. 자동 생성 문서도 실제 계약을 모두 표현하지는 못합니다

현재 명세에는 두 가지 구체적인 한계가 있습니다.

첫째, 정상 응답의 `result`는 Java의 `Map<String, Object>`라서 생성 스키마에는 자유로운 객체로 나타납니다. `menu`, `menus`, `content` 등 작업마다 다른 내부 키를 스키마만 보고 정확히 알기 어렵습니다. 컨트롤러의 설명과 `api-contract.md`가 이를 보완합니다. [Map 설명 주석](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/controller/MenuController.java:31), [실제 ResponseMessage 스키마](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/api-docs.json:407)

둘째, 저장된 명세의 페이지 파라미터는 `pageable` 객체이고 `Pageable.page.minimum`은 `0`입니다. 실제 과제 계약은 요청·응답 페이지 번호를 1부터 쓰며 설명에는 그 규칙을 적었습니다. 즉 자동 생성된 일반 타입 정보가 실제 웹 설정까지 완벽하게 표현하지는 못했습니다. **이 문서는 명세를 읽는 법을 설명하는 작업이므로 앱을 몰래 변경해서 이 차이를 지우지 않습니다.** [현재 Pageable 스키마](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/api-docs.json:423), [실제 1부터 받는 설정](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/resources/application.yaml:12)

이 차이 때문에 페이지 실습은 아래의 정확한 조회 URL을 사용합니다. 향후 명세 보완 시에는 파라미터를 명시적으로 문서화하고 생성 결과와 실제 호출을 함께 검사할 수 있습니다. springdoc 공식 문서에도 Pageable의 쿼리 파라미터 표현을 위한 안내가 있습니다. Pageable 문서화 안내

문서와 실행이 다르면 “JSON에 그렇게 써 있으니 서버가 그럴 것”이라고 넘기지 않습니다. 실제 코드·설정·응답을 확인하고 계약을 일치시키는 것이 개발 작업입니다.

### 근거와 다음에 읽을 실제 파일

이 문서의 구현 설명은 현재 과제 소스를 기준으로 합니다. 공식 웹 문서는 개념·도구 역할을 확인하는 데 사용했습니다. 검색 결과에서 제시된 특정 최신 버전이 현재 과제 설치 버전과 동일하다고 가정하지 않았고, 이 설명 작업에서는 라이브러리를 업그레이드하지 않았습니다.

- [API 계약](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/docs/api-contract.md): 요청과 응답을 한 번에 비교합니다.
- [메뉴 컨트롤러](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/controller/MenuController.java:59): GET 한 건이 들어온 뒤 서비스 호출과 result 작성 부분을 읽습니다.
- [SwaggerConfig](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/config/SwaggerConfig.java:24): 문서 제목·설명을 정하는 어노테이션을 읽습니다.
- [React 요청 함수](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/api/menu.js:26): 메뉴 코드가 URL에 들어가는 지점을 봅니다.
- [API 명세 내보내기](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/scripts/export-api.mjs:5): 실행 서버의 JSON을 저장 파일로 만드는 과정을 읽습니다.

### 공식 자료와 전체 주소

- [Swagger의 API 버전 설명](https://swagger.io/docs/specification/v3_0/api-general-info/)
- [주소](http://localhost:8090)
- [OpenAPI 3.1.0 문서 구조](https://spec.openapis.org/oas/v3.1.0.html)
- [Swagger의 경로·작업 설명](https://swagger.io/docs/specification/v3_0/paths-and-operations/)
- [Swagger의 태그 설명](https://swagger.io/docs/specification/v3_0/grouping-operations-with-tags/)
- [Swagger의 참조 설명](https://swagger.io/docs/specification/v3_0/using-ref/)
- [springdoc의 생성 방식](https://springdoc.org/)
- [Swagger Editor](https://swagger.io/open-source/swagger-editor/)
- [Swagger Codegen](https://swagger.io/docs/open-source-tools/swagger-codegen/codegen-v3/about/)
- [Postman 공식 소개](https://learning.postman.com/docs/getting-started/overview/)
- [Pageable 문서화 안내](https://springdoc.org/#how-can-i-map-pageable-spring-data-commons-object-to-correct-url-parameter-in-swagger-ui)

### 이어서 궁금할 만한 질문

**tags 안의 메뉴라는 값도 표준이 정했나요?**

tags라는 필드 이름은 표준입니다. 메뉴라는 분류 값은 SwaggerConfig와 @Tag의 프로젝트 선택입니다.

**명세의 page minimum0을 그대로 따라야 하나요?**

현재 실제 페이지 계약은1부터이며 자동 Pageable schema에는0이 나타납니다. docs/api-contract와 실행 결과를 대조합니다.

**실무에서 가장 많이 쓰는 도구인가요?**

Swagger UI 공식 기능과 springdoc 연결은 확인했습니다. 비교 조사 없는 전세계 사용량1위 주장은 하지 않습니다.


## 08. CORS와 조회 실습

브라우저의 출처 접근 규칙과 서버의 처리 결과를 분리해서 점검합니다.

### 13. CORS는 브라우저의 다른 출처 접근 규칙입니다

출처(origin)는 프로토콜·호스트·포트의 조합입니다. `localhost:5175`와 `localhost:8090`은 포트가 달라 서로 다른 출처입니다. 브라우저에서 앞의 출처로 열린 React가 뒤의 API 데이터를 사용하려면 서버의 CORS 허용 응답이 필요합니다. MDN Origin, MDN CORS

우리의 [CorsConfig.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/config/CorsConfig.java:17)는 `/api/**`에 대해 설정된 React 출처를 허용합니다. 허용 출처 값은 `application.yaml`의 `app.cors.allowed-origin`에서 옵니다.

브라우저는 메서드·헤더·본문 형식에 따라 실제 요청 전에 OPTIONS 사전 요청(preflight)을 보낼 수 있습니다. 예를 들어 다른 출처의 JSON POST나 PUT·DELETE에는 사전 확인이 발생할 수 있습니다. 모든 GET 앞에 무조건 OPTIONS가 붙는 것은 아닙니다. 브라우저가 사전 확인을 캐시하면 매번 보이지 않을 수도 있습니다. MDN Preflight

도해: 시퀀스 · 위에서 아래로 읽습니다. 조건 줄은 성공과 실패 경로를 구분합니다.. 오프라인 HTML에서 그림으로 확인합니다.

**CORS는 로그인·인증·권한 검사가 아닙니다.** 이 과제에는 로그인 인증이 없습니다. CORS는 브라우저에서 응답을 사용할 수 있는 출처를 제어하며, 모든 종류의 클라이언트가 API를 호출하지 못하게 막는 문지기가 아닙니다. 사전 요청 없는 요청은 서버가 처리했는데 브라우저가 응답을 차단할 수도 있으므로 “CORS 오류면 DB도 절대 안 바뀌었을 것”이라고 가정하지 않습니다.

현재 Swagger UI와 API는 둘 다 8090 출처를 사용합니다. 따라서 Swagger에서 호출이 성공했다고 5175의 React에서도 CORS가 맞는지까지 증명되는 것은 아닙니다. React 화면에서 실제 조회·저장을 따로 확인한 이유입니다.

### 14. 데이터를 바꾸지 않는 첫 실습

이번 실습은 읽기 요청만 사용합니다. 서버가 꺼져 있으면 루트 README의 서버 실행 방법을 사용합니다. 실행 상태와 URL은 시점에 따라 바뀔 수 있습니다.

- Swagger UI를 엽니다.
- **GET `/api/menus`**를 펼칩니다. 먼저 summary·description·responses 설명을 읽습니다.
- **Try it out → Execute**를 누릅니다. Request URL·응답 상태·Response body를 확인합니다.
- `result.menus`가 배열인지 보고, 그 안의 메뉴 하나에서 이름·가격·코드를 찾습니다.
- 원본 명세 응답을 열어 `paths` 안의 `/api/menus`와 `get`을 찾습니다.
- 카테고리 조회를 열어 최상위 카테고리의 `refCategoryCode: null`과 하위 분류의 참조 값을 비교합니다.
- 첫 페이지 3개 조회를 엽니다. `content`, `number`, `totalElements`를 찾습니다.
- 5,000원 초과 조회를 엽니다. 반환된 가격이 모두 5,000보다 큰지 확인합니다.

**Swagger UI의 POST·PUT·DELETE에서 Execute를 누르면 실제 DB가 변경됩니다.** 문서의 예시를 구경하는 버튼과 실행 버튼은 구분합니다. 쓰기 연습을 나중에 할 때는 기존 메뉴 대신 자신이 만든 학습용 메뉴의 반환 코드를 기록해 사용합니다. 삭제한 메뉴가 다시 살아나는 것으로 가정하지 않습니다.

첫 실습의 목표는 세 문장을 직접 설명하는 것입니다. “React도 Swagger도 같은 API를 호출할 수 있습니다.” “명세는 호출 방법을 설명하고 실제 기능은 Java 코드가 실행합니다.” “HTTP 상태·응답 JSON·문서의 예시는 서로 구분해서 읽습니다.”

### 15. 자주 생기는 오해를 바로잡는 표

| 오해 | 현재 과제의 실제 구조 |
| --- | --- |
| JSON 명세가 서버 코드를 실행한다 | Java에서 명세가 생성되고 요청은 컨트롤러가 처리합니다. |
| Swagger UI가 서버다 | UI는 API 클라이언트이고 메뉴 서버는 Spring Boot입니다. |
| Swagger UI에서 성공하면 앱은 완료다 | React의 입력·표시·오류·CORS·디자인도 검사해야 합니다. |
| `tags: 메뉴`가 메뉴 테이블을 만든다 | 문서에서 API를 묶는 이름입니다. |
| 모든 204는 JSON 본문을 가진다 | 실제 204는 본문이 없습니다. 현재 삭제는 실제200입니다. |
| 명세 예시 `0`·`string`이 DB 데이터다 | 실제 값은 요청 실행 뒤의 응답에서 봅니다. |
| localhost 링크를 보내면 친구도 우리 서버를 본다 | 친구 자신의 컴퓨터 주소로 해석합니다. |
| CORS를 허용하면 로그인까지 해결된다 | 로그인·권한은 별도 구현입니다. |
| API 문서만 첨부하면 화면이 완성된다 | 화면과 요청 코드를 구현하고 실제로 검사해야 합니다. |

### 공식 자료와 전체 주소

- [MDN Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- [주소](http://localhost:5175)
- [주소](http://localhost:8090)
- [MDN Preflight](https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request)
- [Swagger UI](http://localhost:8090/swagger-ui/index.html)
- [원본 명세 응답](http://localhost:8090/v3/api-docs)
- [카테고리 조회](http://localhost:8090/api/categories)
- [첫 페이지 3개 조회](http://localhost:8090/api/menus/pages?page=1&size=3)
- [5,000원 초과 조회](http://localhost:8090/api/menus/search?menuPrice=5000)

### 이어서 궁금할 만한 질문

**Swagger에서는 되는데 React에서는 막히나요?**

Swagger는8090과 같은 출처일 수 있지만 React는5175이므로 CORS를 함께 확인합니다.

**OPTIONS를 메뉴 등록으로 읽어도 되나요?**

OPTIONS는 preflight입니다. 실제 JSON 등록은 이후 POST /api/menus입니다.

**CORS를 허용하면 누구나 권한이 생기나요?**

CORS는 브라우저 응답 접근 규칙입니다. 인증·인가 기능은 별개이며 현재 과제에는 로그인 인증이 없습니다.


## 09. HTML CSS JavaScript

브라우저는 HTML 구조·CSS 표현·JavaScript 동작으로 화면을 처리합니다.

### FE-01. 먼저 전체에서 프론트엔드의 위치를 잡습니다

동희님이 사용하는 브라우저 안에서 메뉴 목록·입력창·버튼을 보여주고 사용자 행동을 처리하는 부분이 **프론트엔드**입니다. 우리 과제의 프론트엔드는 React로 만들었습니다. 데이터를 조회하고 저장하는 Java 프로그램은 Spring Boot **백엔드**, 그 데이터를 보관하는 프로그램은 **DB**입니다.

지금은 같은 컴퓨터 안에 있지만 역할과 실행 프로그램이 다릅니다. React 개발 화면은 `localhost:5175`, Spring Boot는 `localhost:8090`입니다. 5175와 8090은 두 프로그램이 요청을 받는 포트 번호입니다. React가 Java 코드를 직접 호출하거나 DB 파일을 직접 여는 구조가 아닙니다.

도해: 시퀀스 · 위에서 아래로 읽습니다. 조건 줄은 성공과 실패 경로를 구분합니다.. 오프라인 HTML에서 그림으로 확인합니다.

위 그림의 성공과 오류는 서로 다른 경로입니다. 연결 실패라면 서버의 오류 응답 자체가 없을 수도 있습니다. 프로그램의 파일들이 디스크에 존재하는 상태와 프로그램이 실행 중인 상태도 구분해야 합니다. `backend` 폴더가 있다고 서버가 켜져 있는 것은 아닙니다.

**읽기 실습:** [App.jsx](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/App.jsx:7)에서 페이지 이름을 읽고, [client.js](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/api/client.js:3)에서 서버 주소를 찾아보세요. 파일 이름을 외우기보다 “페이지를 선택하는 코드”와 “서버로 요청하는 코드”의 위치를 구분하는 것이 첫 목표입니다.

### FE-02. HTML·CSS·JavaScript는 각각 무엇을 합니까

| 이름 | 하는 일 | 메뉴 앱에서의 예 |
| --- | --- | --- |
| HTML | 내용과 의미 있는 문서 구조를 나타냅니다 | 제목, 입력창, 저장 버튼, 메뉴 목록 |
| CSS | 표시 방식과 배치를 정합니다 | 버튼 색, 카드 간격, 테두리, 모바일 배치 |
| JavaScript | 값과 조건을 처리하고 사용자 행동에 반응합니다 | 이름 검사, 저장 요청, 응답 후 화면 이동 |

HTML의 `<button>`은 버튼이라는 요소입니다. CSS는 그 버튼의 배경색이나 안쪽 여백을 바꿀 수 있습니다. JavaScript는 클릭이나 폼 제출을 받았을 때 서버에 요청할 수 있습니다. HTML은 문서의 구조를 표현하는 마크업 언어이며, JavaScript와 같은 역할의 프로그래밍 언어는 아닙니다. MDN HTML 소개

React를 사용해도 최종적으로 브라우저에 HTML 요소가 생기고 CSS가 적용되며 JavaScript가 실행됩니다. React가 HTML·CSS·JavaScript를 없애는 것은 아닙니다. 대신 화면을 데이터와 연결해서 구성하는 방식을 제공합니다.

**오해하기 쉬운 점:** “화면이 보인다”와 “데이터가 저장된다”는 별개입니다. 실제 DB 없이 HTML로 만든 메뉴 카드 16개도 화면에는 보일 수 있습니다. 과제에서는 입력한 메뉴가 서버를 거쳐 DB에 저장되고 다시 조회되는 것까지 확인해야 합니다.

### FE-03. Java와 JavaScript, 객체와 JSON부터 구분합니다

Spring Boot 코드의 `.java`와 React 코드의 `.js`·`.jsx`는 서로 다른 언어입니다. 이름이 비슷하다고 JavaScript가 Java의 줄임말인 것은 아닙니다. 같은 `menuName`이라는 필드 이름을 사용하더라도 Java 객체와 JavaScript 객체가 한 메모리 안에서 공유되는 구조는 아닙니다.

JavaScript **객체**는 관련 값을 이름과 함께 묶은 값입니다. `form`은 객체를 담는 변수이고, `menuName`은 그 객체의 프로퍼티 이름입니다. 문자열 `'카페라떼'`가 실제 값입니다. 객체를 다른 변수에 대입하면 기본적으로 같은 객체를 가리키는 참조가 복사됩니다. `const`는 변수에 다른 값을 다시 대입하지 못하게 하며 객체 내용을 자동으로 불변으로 만들지는 않습니다. MDN 객체

```js
const form = {
    menuName: '카페라떼',
    menuPrice: '5000',
};

const price = Number(form.menuPrice);
```

이 학습용 예시에서 `form.menuPrice`는 문자열 `'5000'`, `price`는 숫자 `5000`입니다. 실제 과제의 필드 이름은 `price`가 아니라 **`menuPrice`**입니다. DOM 입력 요소의 `value`는 이 코드에서 문자열로 다루고, 서버 요청을 만들 때 `Number(...)`로 숫자로 바꿉니다.

**JSON**은 객체 모양의 데이터를 텍스트로 교환하는 형식입니다. 다음 JSON은 문자열을 큰따옴표로 쓰고, 함수나 Java 메서드를 담지 않습니다. Axios가 실제 요청 본문을 JSON으로 보내고 서버가 JSON을 읽는 것은 별도의 직렬화·역직렬화 과정입니다. 데이터 구조가 닮았다고 JavaScript 객체 자체가 인터넷으로 이동하는 것은 아닙니다.

```json
{
  "menuName": "카페라떼",
  "menuPrice": 5000,
  "categoryCode": 4,
  "orderableStatus": "Y"
}
```

여기서 카테고리 번호 4는 읽기 설명용 예시입니다. 실제 등록에서는 서버가 반환한 카테고리 목록에서 선택한 번호를 보내야 합니다. 없는 번호를 추측해 보내면 요청이 실패할 수 있습니다.

### 공식 자료와 전체 주소

- [주소](http://localhost:5175)
- [주소](http://localhost:8090)
- [MDN HTML 소개](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Creating_the_content)
- [MDN 객체](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects)

### 이어서 궁금할 만한 질문

**JSX에 HTML처럼 쓰면 문자열인가요?**

JSX는 UI 표현을 작성하는 JavaScript 문법 확장입니다. Vite 등 도구가 브라우저 실행 형태로 처리합니다.

**menuPrice를 따옴표로 감싸면 같은 숫자인가요?**

JSON의4500은 숫자이고 문자열4500은 타입이 다릅니다. 현재 폼에서 Number로 숫자를 만듭니다.

**브라우저가 Java 파일을 실행하나요?**

현재 브라우저는 React의 JavaScript를 실행하고 Java 서버에는 HTTP를 보냅니다.


## 10. React 입력과 상태

컴포넌트의 props·state와 이벤트로 입력값과 화면을 연결합니다.

도해: React 입력과 상태 · 성공 경로 또는 표시된 조건에서의 흐름. 오프라인 HTML에서 그림으로 확인합니다.

### FE-04. React와 컴포넌트

React는 사용자 인터페이스를 만드는 라이브러리입니다. **컴포넌트**는 화면의 일부와 그 부분의 동작을 묶은 단위입니다. 우리 코드에서는 JavaScript 함수가 JSX를 반환하는 방식으로 컴포넌트를 작성했습니다. 버튼처럼 작은 단위부터 페이지 전체까지 컴포넌트가 될 수 있습니다. React 소개

실제 [MenuFormPage.jsx](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/pages/MenuFormPage.jsx:11)의 `MenuFormPage()`는 등록·수정 페이지를 구성하고, 같은 파일의 `MenuEditor()`는 입력 폼을 구성합니다. 부모 컴포넌트가 카테고리와 기존 메뉴를 준비한 뒤 자식에게 전달합니다.

```jsx
<MenuEditor
    menuCode={menuCode}
    initial={resource.data}
    categories={onlyChildren(categories.data)}
/>
```

위 코드는 실제 22~23줄에서 `key`를 생략하고 줄바꿈만 정리한 예시입니다. `<MenuEditor />`는 Java의 객체 생성 구문이 아닙니다. React가 이 컴포넌트를 화면 구성에 사용하라는 표현입니다. React는 렌더링 과정에서 함수를 실행하고 반환된 UI 설명을 바탕으로 브라우저의 화면을 갱신합니다.

### FE-05. JSX와 렌더링

**JSX**는 JavaScript 코드 안에서 UI를 HTML과 비슷한 모양으로 적는 문법입니다. `.jsx` 파일은 Vite의 변환 과정을 거칩니다. HTML 문서와 완전히 같은 문법은 아니므로 `className`, 닫힌 태그, 자바스크립트 표현식의 `{}`를 읽을 수 있어야 합니다. React JSX 문법

```jsx
<h1 className="title1 bold">
    {menuCode ? '메뉴 수정' : '메뉴 등록'}
</h1>
```

실제 코드의 `menuCode`가 있으면 문자열 `'메뉴 수정'`, 없으면 `'메뉴 등록'`을 선택합니다. `{}` 안의 내용은 JavaScript 표현식이고, 선택한 값이 제목에 들어갑니다. `'title1 bold'`는 CSS 클래스 두 개를 적용합니다. 컴포넌트 안의 일반 변수를 `{}`로 표시한다고 자동 저장 기능이 붙는 것은 아닙니다.

**렌더링**은 현재 데이터로 UI를 계산하는 과정입니다. React는 state가 바뀌면 컴포넌트를 다시 실행해 다음 UI를 계산합니다. “다시 렌더링한다”는 말이 “매번 전체 페이지를 새로고침한다”는 뜻은 아닙니다. 현재 렌더에서 읽는 state 값은 그 렌더의 값입니다. React state 스냅샷

**읽기 실습:** 제목 JSX에서 `?`의 앞·뒤 값을 하나씩 읽어 보세요. `menuCode`는 메뉴 이름이 아니라 URL에서 받은 메뉴 번호라는 점까지 연결하면 됩니다.

### FE-06. props와 state

**props**는 부모가 자식 컴포넌트에 전달하는 입력입니다. `initial={resource.data}`에서 `initial`은 전달하는 이름이고 `resource.data`는 전달되는 값입니다. 자식의 `function MenuEditor({ menuCode, initial, categories })`는 props 객체에서 그 세 프로퍼티를 꺼내는 구조 분해 문법입니다. props를 받은 자식이 부모 데이터를 직접 변경하는 방식은 피합니다. React props

**state**는 컴포넌트가 렌더 사이에 기억하고, 변경 시 화면 갱신에 사용하는 상태입니다. 현재 입력값 `form`, 필드별 오류 `errors`, 서버 오류 `error`, 저장 중 여부 `busy`가 state입니다. React useState

```js
const [busy, setBusy] = useState(false);
```

이 실제 코드는 `useState(false)`를 호출하고 반환된 배열의 첫 번째 값을 `busy`, 두 번째 값인 갱신 함수를 `setBusy`에 받습니다. `false`는 초기값입니다. `setBusy(true)`는 다음 렌더에서 `busy`가 `true`가 되도록 요청합니다. `setBusy`의 반환값에 새 상태가 담기는 구조는 아닙니다.

```jsx
<button disabled={busy} type="submit">
    {busy ? '저장 중…' : '저장'}
</button>
```

실제 82줄을 줄바꿈한 이 코드는 저장 중 버튼을 비활성화하고 문구를 바꿉니다. **React state와 DB 데이터는 다른 저장소**입니다. 페이지를 새로고침하면 이 컴포넌트의 상태가 다시 시작될 수 있지만, 서버 DB에 저장한 메뉴까지 지워지는 것은 아닙니다.

### FE-07. 이벤트와 제어 입력창

**이벤트**는 입력 변경, 클릭, 폼 제출 같은 사용자의 행동을 브라우저가 알리는 것입니다. **이벤트 핸들러**는 그때 실행할 함수입니다. `onChange={change}`는 함수 참조를 전달합니다. `onChange={change()}`처럼 작성하면 클릭 때 호출하라는 뜻과 달라집니다. React 이벤트

```jsx
<input
    name="menuName"
    value={form.menuName}
    onChange={change}
/>
```

위 코드는 실제 입력창에서 검증 속성만 생략한 것입니다. **제어 입력창**은 표시할 값을 React state에서 정하고 변경 이벤트로 state를 갱신하는 입력창입니다. `value`만 고정하고 `onChange`에서 새 값을 저장하지 않으면 정상 입력이 어려워집니다. React input

```js
function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
}
```

실제 `change` 함수에 이름 입력 이벤트가 들어왔다고 생각해 보세요. `event.target.name`은 `'menuName'`, `event.target.value`는 입력한 문자열입니다. `...form`은 기존 프로퍼티를 얕게 복사하고, `[event.target.name]`은 그 문자열을 프로퍼티 이름으로 사용하여 새 값을 넣습니다. `form.menuName = ...`처럼 기존 state 객체를 직접 고치는 코드가 아닙니다.

한 이벤트를 여러 필드에 재사용하려고 계산된 프로퍼티 이름을 썼습니다. 먼저 다음 학습용 근사 코드를 이해한 뒤 실제 한 줄을 읽어도 됩니다. 근사 코드는 이름 필드에만 대응하므로 실제 코드 전체와 동일한 변환은 아닙니다.

```js
const nextForm = {
    menuName: event.target.value,
    menuPrice: form.menuPrice,
    categoryCode: form.categoryCode,
    orderableStatus: form.orderableStatus,
};
setForm(nextForm);
```

### 공식 자료와 전체 주소

- [React 소개](https://react.dev/learn)
- [React JSX 문법](https://react.dev/learn/writing-markup-with-jsx)
- [React state 스냅샷](https://react.dev/learn/state-as-a-snapshot)
- [React props](https://react.dev/learn/passing-props-to-a-component)
- [React useState](https://react.dev/reference/react/useState)
- [React 이벤트](https://react.dev/learn/responding-to-events)
- [React input](https://react.dev/reference/react-dom/components/input)

### 이어서 궁금할 만한 질문

**변수만 바꾸면 React 화면도 바뀌나요?**

화면 갱신을 위한 값은 useState 등 React 상태로 관리합니다. 일반 지역 변수 변경과 구별합니다.

**수정 화면에는 왜 기존 값이 보이나요?**

MenuFormPage가 menuCode로 fetchMenu를 호출해 기존 값으로 입력 상태를 만듭니다.

**버튼 누르면 어느 함수가 실행되나요?**

등록 폼의 onSubmit 이벤트가 저장 핸들러를 호출하며 입력 검사 뒤 createMenu를 호출합니다.


## 11. 값 이동과 비동기

입력값에서 payload를 만들고 Axios 결과를 기다린 뒤 저장된 메뉴 화면으로 이동합니다.

도해: 값 이동과 비동기 · 성공 경로 또는 표시된 조건에서의 흐름. 오프라인 HTML에서 그림으로 확인합니다.

### FE-08. 저장 버튼에서 API 요청까지 실제 값 하나를 추적합니다

동희님이 이름 `'카페라떼'`, 가격 문자열 `'5000'`을 입력하고 실제 목록에 있는 카테고리를 선택했다고 가정하겠습니다. 이것은 코드를 읽는 예시이며 신규 실험 메뉴를 등록할 필요는 없습니다.

실제 [submit 함수](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/pages/MenuFormPage.jsx:41)는 다음 순서로 일합니다.

- `event.preventDefault()`로 HTML 폼의 기본 제출 동작을 막습니다. 이 코드의 API 요청 자체를 막는 것은 아닙니다.
- `busy`와 입력값을 검사합니다. 이름, 정수 가격, 실제 카테고리가 적절하지 않으면 오류를 보여주고 여기서 끝납니다.
- `setBusy(true)`로 저장 중 상태를 준비합니다.
- `payload`라는 새 객체에 서버가 기대하는 필드와 타입을 담습니다.
- 등록이면 `createMenu(payload)`, 수정이면 `updateMenu(menuCode, payload)`를 호출합니다.
- 성공한 메뉴 객체를 `saved`에 받고 `saved.menuCode`로 상세 URL을 만듭니다.
- 실패하면 `catch`에서 오류를 보여주며, `finally`에서 저장 중 상태를 해제합니다.

```js
const payload = {
    menuName: form.menuName.trim(),
    menuPrice: Number(form.menuPrice),
    categoryCode: Number(form.categoryCode),
    orderableStatus: form.orderableStatus,
};
```

실제 54~55줄을 줄바꿈한 코드입니다. `trim()`은 이름 양끝 공백을 제거합니다. `'5000'`은 `5000`으로 변환됩니다. `payload`를 만들었다고 서버 저장이 끝난 것은 아닙니다. 다음 함수 호출이 실제 요청을 시작합니다.

실제 [createMenu](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/api/menu.js:41)는 다음 구조입니다.

```js
export async function createMenu({ menuName, menuPrice, categoryCode, orderableStatus }) {
    const result = await postResult('/api/menus', {
        menuName,
        menuPrice,
        categoryCode,
        orderableStatus,
    });
    return result.menu;
}
```

매개변수의 `{...}`는 전달된 `payload` 객체를 분해하는 문법입니다. 요청 객체 안의 `menuName,`은 `menuName: menuName,`의 축약입니다. `return result.menu`는 서버에서 받은 결과 중 메뉴 객체를 반환합니다. 등록할 때 `menuCode`는 보내지 않으며 서버가 채웁니다.

실제 [postResult](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/api/client.js:10)는 `api.post(url, body)`를 호출합니다. 기본 서버 주소는 `localhost:8090`이므로 경로 `/api/menus`와 합쳐져 그 서버로 요청합니다. 응답의 `data.result`를 꺼내 `createMenu`로 돌려줍니다. 여기의 `.data.result`는 이번 서버의 응답 모양에 맞춘 코드입니다. 모든 API에 `result`가 있다는 규칙은 없습니다.

마지막 [navigate](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/pages/MenuFormPage.jsx:57)는 `'/menus/' + saved.menuCode`라는 React 상세 화면 주소로 이동합니다. 상세 화면은 그 번호를 사용해 다시 서버에서 메뉴를 조회합니다. 정상 응답을 받기 전에 임의로 “저장 완료”를 표시하는 구조가 아닙니다.

### FE-09. 비동기·Promise·async/await

**비동기 작업**은 네트워크 응답처럼 즉시 끝나지 않는 작업의 결과를 나중에 처리하는 것입니다. 요청하는 동안 브라우저가 화면 표시나 다른 이벤트 처리를 계속할 수 있게 해야 합니다.

**Promise**는 나중에 성공 값 또는 실패 이유가 정해질 작업을 나타내는 객체입니다. 상태는 대기, 이행, 거부로 설명할 수 있습니다. “Promise를 반환했다”가 “메뉴 데이터를 지금 반환했다”와 같지는 않습니다. MDN Promise

`async function`은 Promise를 반환합니다. `await`는 그 비동기 함수의 이어지는 처리를 해당 Promise의 결과가 정해질 때까지 기다리게 합니다. 브라우저 전체를 얼리는 명령이 아닙니다. 성공하면 값을 받아 계속 진행하고, 실패하면 오류가 던져져 `catch`로 처리할 수 있습니다. MDN async function

```js
const saved = await createMenu(payload);
navigate('/menus/' + saved.menuCode);
```

위 학습용 두 줄은 실제 등록 분기의 핵심만 뽑은 것입니다. `await`가 없으면 `saved`에 메뉴 객체 대신 Promise를 받게 되어 `saved.menuCode`를 바로 사용할 수 없습니다. `async`를 붙였다고 자동으로 HTTP 요청이나 병렬 작업이 생성되는 것은 아닙니다. 실제 요청을 하는 것은 여기서 호출한 Axios입니다.

### FE-10. fetch와 Axios, 오류를 다루는 이유

`fetch()`는 브라우저에서 HTTP 요청을 보낼 때 사용하는 Web API입니다. Axios는 HTTP 요청을 편하게 작성하는 별도 라이브러리이고, 이번 과제에서 선택한 요청 도구입니다. 둘 다 요청을 보내는 수단이며 별개의 백엔드나 DB가 아닙니다. MDN fetch, Axios 공식 소개

기본적인 차이 하나만 알아두셔도 좋습니다. `fetch()`는 HTTP 404나 500 응답을 받았다고 항상 Promise를 거부하지 않으므로 응답의 `ok` 등을 검사해야 합니다. Axios는 기본 성공 상태 판정에서 벗어난 응답을 오류 경로로 처리하며, 이 판정은 설정할 수 있습니다. 두 도구를 섞어 비교할 때 오류 처리 방식도 확인해야 합니다.

실제 [client.js](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/api/client.js:19)는 서버가 보낸 오류 설명이 있으면 표시하고, 응답이 아예 없으면 연결 실패 안내를 만듭니다. 사용자는 요청이 실패한 것과 검색 결과가 없는 것을 구분할 수 있어야 합니다. 요청 중 상태, 오류, 재시도, 빈 목록은 서로 다른 UI 상태입니다.

우리 프로젝트 규칙은 HTTP 요청을 `src/api/*.js`에 모으는 것입니다. 페이지가 필요한 함수를 호출하면 API 파일이 주소와 응답 구조를 처리합니다. 주소가 바뀌었을 때 화면마다 Axios 코드를 찾아 수정하지 않도록 책임을 나눕니다. 이것은 이번 프로젝트의 규칙이며 React 자체가 강제하는 파일 구조는 아닙니다.

### FE-11. Hook·useEffect·요청 취소는 보충 단계입니다

**Hook**은 React의 상태나 외부 시스템 연동 같은 기능을 컴포넌트에서 사용하는 함수입니다. `useState`, `useEffect`가 내장 Hook이고 `useResource`는 이 과제에서 만든 커스텀 Hook입니다. Hook은 조건문이나 반복문 안에 임의로 호출하지 않고 컴포넌트 또는 다른 Hook의 최상위에서 호출합니다. React useState

**useEffect**는 렌더링 후 외부 시스템과 동기화하는 데 사용하는 Hook입니다. 이번 `useResource`는 화면 URL에 해당하는 데이터를 서버에서 읽는 일을 맡깁니다. effect의 의존성이 달라지면 필요한 동기화를 다시 하고, 정리 함수를 통해 이전 일을 정리합니다. 모든 계산이나 저장 버튼 동작을 무조건 effect에 넣어야 하는 것은 아닙니다. 사용자 저장 요청은 앞서 본 `submit` 이벤트에서 시작합니다. React useEffect, React effect의 역할

실제 [useResource.js](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/hooks/useResource.js:9)는 `AbortController`를 만들고, 그 `signal`을 API 함수에 전달합니다. 다른 검색 요청으로 바뀌거나 화면이 사라지면 이전 요청을 중단하고, 중단된 응답은 state에 반영하지 않습니다. 늦게 도착한 이전 검색 결과가 현재 화면을 덮는 상황을 줄이기 위한 처리입니다. Axios도 `signal`을 통한 취소를 지원합니다. Axios 요청 취소

이 파일의 `requestKey`, `attempt`, Promise 연결 방식은 구현 보충입니다. 초보 학습의 선행 목표로 전부 외울 필요는 없습니다. 먼저 “상태를 기억한다 → 요청한다 → 성공/실패를 표시한다 → 필요 없어진 요청을 정리한다”를 이해하면 됩니다. 취소한다고 이미 서버에 저장된 데이터를 자동으로 되돌리는 것은 아닙니다.

### 공식 자료와 전체 주소

- [주소](http://localhost:8090)
- [MDN Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [Axios 공식 소개](https://axios-http.com/docs/intro)
- [React useState](https://react.dev/reference/react/useState)
- [React useEffect](https://react.dev/reference/react/useEffect)
- [React effect의 역할](https://react.dev/learn/synchronizing-with-effects)
- [Axios 요청 취소](https://axios-http.com/docs/cancellation)

### 이어서 궁금할 만한 질문

**await를 쓰면 브라우저 전체가 멈추나요?**

await는 해당 async 함수의 진행을 기다립니다. 다른 브라우저 이벤트 전체를 멈추는 방식은 아닙니다.

**서버 응답 전에 성공 화면을 띄워도 되나요?**

현재 코드는 await createMenu 후 saved.menuCode로 이동합니다. 실패하면 오류를 보여줍니다.

**요청 취소는 DB 작업을 되돌리나요?**

AbortSignal은 클라이언트 요청 관리를 위한 기능입니다. 이미 서버가 처리한 작업의 DB 롤백을 보장하지 않습니다.


## 12. 주소 개발도구 CSS

화면 주소·API 주소·개발 서버·빌드 결과·CSS 범위를 구분합니다.

도해: 주소 개발도구 CSS · 성공 경로 또는 표시된 조건에서의 흐름. 오프라인 HTML에서 그림으로 확인합니다.

### FE-12. React의 페이지 주소와 서버 API 주소

**라우팅**은 주소를 보고 어떤 화면 또는 처리로 연결할지 정하는 것입니다. 같은 `/menus`라는 문자열이 보이더라도 어느 프로그램의 주소인지 확인해야 합니다. React Router의 `BrowserRouter`는 브라우저 주소와 History API를 사용해 클라이언트 화면 이동을 관리합니다. React Router BrowserRouter

| 주소 예 | 담당 | 결과 |
| --- | --- | --- |
| `localhost:5175/menus/1` | React 라우터 | 1번 메뉴의 상세 화면을 표시합니다 |
| `localhost:5175/menus/new` | React 라우터 | 등록 화면을 표시합니다 |
| `localhost:8090/api/menus/1` | Spring Boot API | 1번 메뉴 데이터 JSON을 반환합니다 |

실제 [App.jsx](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/App.jsx:9)의 `path="/menus/:menuCode"`에서 `:menuCode`는 바뀌는 번호 자리입니다. `/menus/1`로 이동하면 `useParams()`가 읽는 `menuCode` 값은 문자열 `'1'`입니다. `Link`나 `navigate`는 앱 화면 이동에 사용하고 Axios는 서버 데이터 요청에 사용합니다. React Router 경로

개발 서버에서는 상세 화면 새로고침이 되지만, 나중에 배포하는 서버도 화면 경로로 들어오면 React 진입 HTML을 제공하도록 설정해야 합니다. 브라우저 라우팅을 등록했다고 Spring Boot에 같은 API가 자동 생성되는 것은 아닙니다.

### FE-13. 검색 조건·페이지를 URL에 넣는 이유

목록에서 검색어를 입력하면 `/?q=라떼&page=1`처럼 조건을 주소에 담습니다. 검색어 `q`, 카테고리 `category`, 기준 가격 `price`, 페이지 `page`를 사용합니다. 주소에서 조건을 복원하므로 새로고침 후에도 동일한 검색 조건을 사용할 수 있습니다.

실제 [MenuListPage.jsx](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/pages/MenuListPage.jsx:15)에서 `params.get('q')`는 검색어를 읽습니다. 검색 버튼은 34줄의 `filter`를 호출하고 조건을 바꿀 때 페이지를 1로 초기화합니다. 45줄의 `movePage`는 검색 조건을 유지하며 페이지 번호만 바꿉니다.

**현재 구현의 정확한 처리:** 아무 필터가 없으면 서버 페이징 API를 호출합니다. 이름·카테고리 필터는 전체 메뉴 데이터를 받은 뒤 브라우저에서 거릅니다. 가격이 있으면 서버의 “입력 가격 초과” API 결과를 받고 이름·카테고리를 추가로 거릅니다. 필터링 결과는 브라우저에서 12개씩 잘라 표시합니다. 이는 수업 API에 이름 검색·카테고리 검색 계약이 없기 때문이며 대규모 데이터 검색을 모두 브라우저에서 처리하는 방식을 권장한다는 뜻은 아닙니다.

**경계:** 기준 가격 5,000이면 정확히 5,000원인 메뉴는 제외됩니다. **초과(`>`)**이며 이상(`>=`)이 아닙니다. 페이지 요청은 이번 API에서 **1부터** 보냅니다. 다른 API의 0부터 세는 규칙과 혼용하지 않습니다. 서버가 돌려주는 `number` 필드를 모든 표시 번호와 무조건 같은 뜻으로 가정할 필요도 없습니다. 현재 목록의 페이지 표시는 URL의 `page` 값입니다.

메뉴 배열을 화면에 표시할 때 `map()`으로 각 항목의 JSX를 만들며, `key={menu.menuCode}`를 지정합니다. `key`는 형제 항목 사이에서 어떤 항목인지 구분하는 데 사용하는 식별자이며 브라우저에 보이는 메뉴 번호 라벨과는 다른 목적입니다. React 목록 렌더링

**안전한 읽기 실습:** 목록에서 검색하고 새로고침한 뒤 주소와 입력값이 유지되는지 봅니다. 서버 API URL에는 `q`가 자동 추가된다고 추측하지 말고 21~30줄을 읽어 어떤 API 함수를 호출하는지 확인합니다.

### FE-14. Node.js·npm·Vite는 React의 무엇입니까

**Node.js**는 브라우저 밖에서 JavaScript를 실행하는 환경입니다. 이번 프로젝트에서는 Vite 개발 서버와 토큰 생성 스크립트 등을 실행합니다. React 화면의 사용자 이벤트는 브라우저에서 실행되고, 메뉴 저장 업무는 Spring Boot에서 처리합니다. Node를 설치했다고 별도의 메뉴 저장 서버가 자동으로 생기는 것은 아닙니다. Node.js 공식 소개

**npm**은 패키지를 설치하고 프로젝트에 등록된 명령을 실행하는 도구입니다. `npm run dev`의 `dev`는 운영체제 명령 이름이 아니라 `package.json`의 `scripts`에 정의된 이름입니다. 우리 `dev`에는 `npm run tokens && vite`가 적혀 있으므로 토큰 CSS를 만든 다음 Vite를 실행합니다. npm package.json

**Vite**는 개발 중 파일을 변환하고 개발 서버를 제공하며 배포용 파일을 빌드하는 도구입니다. `.jsx`와 모듈 import를 개발·빌드 흐름에서 처리합니다. Vite 개발 서버는 Java API 서버와 역할이 다릅니다. Vite 소개

| 파일·폴더·명령 | 이번 과제에서의 뜻 |
| --- | --- |
| `package.json` | 프로젝트 이름, 의존성 요구 범위, 실행 명령 |
| `package-lock.json` | 실제 해결된 의존성 버전·구조를 기록해 설치 재현을 돕는 파일 |
| `node_modules/` | 설치된 패키지 파일들; 소스 파일처럼 직접 수정하지 않습니다 |
| `npm run dev` | 개발 화면을 제공하는 Vite 실행; 이번 포트는 5175 |
| `npm run lint` | 정해진 정적 코드 규칙 검사; 실제 서버 동작의 증명은 아닙니다 |
| `npm run build` | 배포에 사용할 HTML·JavaScript·CSS 묶음 생성 |
| `dist/` | Vite 빌드 결과의 기본 폴더; 서버 DB나 Java 실행 파일이 아닙니다 |

lock 파일은 `package.json`과 함께 관리하며, 설치된 정확한 버전을 요구 범위와 구분합니다. 현재 `package.json`의 React 요구 범위는 `^19.2.8`입니다. 공식 문서의 최신 표시가 바뀌어도 그것을 로컬 설치 버전으로 보고하면 안 됩니다. npm package-lock.json

Vite build 결과를 배포해도 Spring Boot·DB가 실행되거나 배포되는 것은 아닙니다. React에서 요청하는 서버 주소, 서버의 접근 허용, 페이지 진입 처리 등 배포 환경에 맞춘 연결 작업은 별도입니다. 현재는 로컬 과제이며 GitHub URL 준비와 제출이 남아 있습니다. Vite production build

### FE-15. CSS Module과 공통 컴포넌트

**CSS Module**은 컴포넌트에서 가져다 쓰는 CSS 클래스 이름을 모듈 단위로 다루는 방법입니다. Vite는 `.module.css` 이름의 파일을 CSS Module로 처리합니다. `import styles from './Scaffold.module.css'` 후 `className={styles.panel}`로 클래스명을 사용합니다. 서로 다른 파일에서 같은 클래스명 `panel`을 썼을 때 이름 충돌을 줄이는 데 도움이 됩니다. Vite CSS Modules

반면 `tokens.css`의 `.title1`, `.body1` 같은 공통 타입 클래스는 전역으로 가져오며 `className="title1 bold"`처럼 사용합니다. CSS Module을 쓴다고 모든 CSS가 자동으로 디자인 시스템을 따르는 것은 아닙니다.

**공통 컴포넌트**는 같은 구조·행동을 재사용하기 위한 화면 코드입니다. 우리 앱의 `Layout`은 공통 레이아웃, `Feedback`은 대기·오류 안내, `DeleteDialog`는 삭제 확인 동작입니다. 공통 코드와 디자인 토큰을 함께 사용해야 화면마다 버튼 모양과 상태 표현이 제각각인 상황을 줄일 수 있습니다. 공통 컴포넌트가 반드시 npm에 배포한 라이브러리일 필요는 없습니다.

### 공식 자료와 전체 주소

- [React Router BrowserRouter](https://reactrouter.com/api/declarative-routers/BrowserRouter)
- [주소](http://localhost:5175/menus/1)
- [주소](http://localhost:5175/menus/new)
- [주소](http://localhost:8090/api/menus/1)
- [React Router 경로](https://reactrouter.com/start/declarative/routing)
- [React 목록 렌더링](https://react.dev/learn/rendering-lists)
- [Node.js 공식 소개](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)
- [npm package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json)
- [Vite 소개](https://vite.dev/guide/)
- [npm package-lock.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json)
- [Vite production build](https://vite.dev/guide/build)
- [Vite CSS Modules](https://vite.dev/guide/features#css-modules)

### 이어서 궁금할 만한 질문

**/menus/8과/api/menus/8은 같은 주소인가요?**

5175의 /menus/8은 React 화면이고8090의 /api/menus/8은 JSON API입니다.

**npm install은 서버 실행인가요?**

npm install 또는 ci는 패키지 준비이며 npm run dev가 Vite 개발 서버를 시작합니다.

**GitHub에 dist를 올리면 API도 켜지나요?**

dist는 프론트 정적 결과입니다. Spring Boot와 DB 실행·접속 설정은 별도로 필요합니다.


## 13. 토큰과 디자인 인계

공통 토큰·컴포넌트 규칙으로 여러 화면을 통일하고 Claude 시안을 React 구현에 적용합니다.

### FE-16. 디자인 시스템·토큰·semantic 값

**디자인 시스템**은 색·타입·간격 같은 시각 규칙, 버튼·입력창 같은 공통 요소, 상태·접근성·사용 지침 등을 함께 정리한 기준입니다. **디자인 토큰**은 그중 여러 도구와 코드에서 일관되게 사용할 디자인 결정을 이름 있는 값으로 표현한 것입니다. 색상 표만 확보했다고 완성된 디자인 시스템 전체를 구현한 것은 아닙니다. 토큰 데이터 교환을 위한 DTCG 규격도 있습니다. Design Tokens Community Group 형식 규격

이번 과제는 공개 Montage 디자인 소스에서 추출한 JSON을 사용합니다. 파일이 JSON이라고 DTCG의 모든 규칙을 만족한다는 뜻은 아닙니다. 우리 토큰 파일에는 프로젝트의 추출 구조와 `$meta` 출처가 있으며, 그 구조를 이해하는 전용 생성 스크립트가 있습니다.

**atomic/원시 토큰**은 팔레트의 특정 색이나 수치 같은 기초값이고, **semantic/의미 토큰**은 “기본 본문 글자”, “주요 행동”, “오류”처럼 용도를 이름으로 나타내는 값입니다. 예를 들어 UI에서 파란색 번호를 직접 고르는 대신 `--primary-normal`이라는 역할을 사용하면 테마가 바뀔 때 역할을 유지하며 다른 색으로 대응할 수 있습니다. 이 설명은 이번 Montage 토큰 구조를 해석한 것입니다.

실제 [tokens.css](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/tokens.css:7)의 라이트 테마는 `--primary-normal: #0066FF`, 137줄의 다크 테마는 같은 이름에 `#3385FF`를 둡니다. 화면 코드에서는 `background: var(--primary-normal)`처럼 읽습니다. CSS custom property는 `--` 이름으로 선언하고 `var()`로 사용하는 CSS 기능입니다. MDN CSS 변수

토큰이 제공되어 있다고 앱에 테마 전환 버튼이 이미 만들어진 것은 아닙니다. 현재 생성 CSS에는 `[data-theme="dark"]` 대응이 있고, Claude에게 다크 대응을 요청했습니다. 최종 테마 UX는 디자인 결과를 적용할 때 정해야 합니다.

### FE-17. JSON에서 화면 색까지, 생성 파일을 직접 고치지 않는 이유

이번 과제의 기준 원본은 [montage.tokens.json](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/design/montage.tokens.json)입니다. 생성된 CSS는 [tokens.css](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/tokens.css)입니다. `design-handoff` 안의 두 파일은 Claude 전달용 사본입니다.

도해: 관계도 · 각 줄은 왼쪽에서 오른쪽으로 연결됩니다. 줄의 위아래 순서는 실행 순서가 아닙니다.. 오프라인 HTML에서 그림으로 확인합니다.

실제 [build-tokens.mjs](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/scripts/build-tokens.mjs:17)는 JSON을 읽고 semantic 색·그림자, 간격·z-index·radius·opacity, 타입 클래스를 CSS로 출력합니다. JSON 이름 `primary.normal`을 CSS의 `--primary-normal` 같은 이름으로 바꾸며, light/dark 값을 각각 기본 `:root`와 `[data-theme="dark"]`에 적습니다.

```css
/* 실제 공통 카드 스타일의 일부 */
.panel {
    padding: var(--space-24);
    border-radius: var(--radius-12);
}
```

이는 실제 [Scaffold.module.css](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/frontend/src/components/Scaffold.module.css:15)에서 테두리 속성만 생략한 코드입니다. 토큰 변수는 각각 24px, 12px에 대응합니다. `tokens.css`를 직접 바꾸면 다음 생성 시 그 변경이 덮일 수 있습니다. 토큰 변경은 원본 JSON에서 하고 생성 명령을 다시 실행하는 것이 이 프로젝트의 규칙입니다. 다만 학습 중 값의 의미를 읽는 것과 실제 토큰을 수정하는 것은 다른 작업입니다.

타입 스타일은 글자 크기만이 아니라 행간·자간·굵기를 함께 정합니다. `.title1.bold`가 있으므로 제목마다 임의의 `font-size`를 추가하는 방식 대신 기준 스타일을 대응시킵니다. 색·간격·모서리·타입을 한 기준에서 읽어 여러 페이지의 디자인을 맞추는 것이 과제의 핵심 중 하나입니다.

### FE-18. radius 값을 추출했다는 말의 정확한 뜻

**radius**는 모서리의 둥근 정도입니다. 원래 재사용한 샘플 토큰 JSON에는 radius 항목이 빠져 있었습니다. 과제 수업 자료는 실제 컴포넌트 스타일에서 radius를 찾도록 안내하므로, Codex가 Montage 원본 컴포넌트의 `style.ts`를 읽어 상수 값을 보충했습니다.

예를 들어 실제 원본 [button/style.ts](C:/Study-saltlux-ai-agent-service/06_fronted/original-materials/99_vibe_design/vibe-design-test/montage-web-main/packages/wds/src/components/button/style.ts:73)에 `border-radius: 12px;`가 있습니다. 12라는 값을 보기 좋을 것 같아서 임의로 만든 것이 아닙니다.

[augment-radius.mjs](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/scripts/augment-radius.mjs:15)는 컴포넌트 `style.ts`를 읽고 상수인 단일 `border-radius`와 코너 radius 값을 추출합니다. 동적 표현식·`inherit`는 제외합니다. 16종의 상수를 수집했으며 JSON의 각 `sources`에 원본 파일·줄 번호를 기록했습니다.

출처에 있는 값을 모은 작업과 “이 카드에 어느 radius를 쓰는 것이 좋은가”라는 디자인 결정은 별개입니다. 큰 pill 모서리와 작은 입력창 모서리를 같은 곳에 무조건 적용하는 것이 아닙니다. Claude에게 실제 토큰 중 용도에 맞는 값을 선택하고 정확한 이름을 인계하도록 요청한 이유입니다. 추출 스크립트가 모든 동적 디자인 규칙을 완전히 복원했다는 뜻도 아닙니다.

### FE-19. 시안·프로토타입·React 구현·연동의 차이

| 결과물 | 확인하는 것 | 그것만으로 증명되지 않는 것 |
| --- | --- | --- |
| 화면 시안 | 배치·색·글자·컴포넌트 규칙 | 실제 저장·조회 |
| 클릭 가능한 프로토타입 | 화면 전환과 상태의 의도 | 실제 API·DB 동작 |
| React 기능 구현 | 입력·검증·버튼·경로·상태 처리 | 최종 디자인의 만족도 |
| 서버 연동 | 실제 API 요청과 응답 처리 | 모든 실패·모바일 상태의 완성도 |
| DB 저장·재조회 | 데이터가 실제로 저장되어 다시 보임 | 공개 배포·과제 제출 완료 |

**Claude Design에게 전달할 요청:** 준비된 API 기능과 토큰으로 공통 컴포넌트, 목록, 상세, 등록·수정 공용 폼, 대기·오류·빈 상태를 디자인합니다. 한국어 UI, 데스크톱·모바일, 정확한 토큰 이름과 구현 인계 자료를 요청합니다. API에 없는 사진·별점·주문·결제를 가정하지 않습니다.

**실제 전달 상태:** Codex가 [Claude용 프롬프트](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/design-handoff/claude-design-prompt.md:8)와 네 참고 파일을 준비했습니다. Codex가 Claude에게 직접 요청을 보낸 기록이나 디자인 결과를 받은 기록은 없습니다. 사용자께서 Claude Design에 전달하는 단계입니다. 로컬 경로를 적는 것만으로 모든 Claude 환경에서 파일 접근이 되는 것은 아니므로 접근을 지원하지 않는 환경에서는 파일 내용을 첨부합니다.

**Codex가 구현한 프론트 작업:** Vite React 프로젝트, 화면 경로, 목록·검색·상세·등록·수정·삭제, API 클라이언트, 오류·대기·취소 처리, 토큰 생성과 검사, 기능 확인용 스타일을 준비했습니다. 기존 참고 예제의 API 어댑터·토큰 생성 코드를 재사용한 부분과 새로 작성한 부분은 [sources.md](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/docs/sources.md)에 구분했습니다.

**남은 작업:** 디자인 시안 확인·조정 → 디자인을 React JSX/CSS Module과 공통 컴포넌트에 적용 → 기능·접근성·모바일 상태 재검사 → Spring Boot와 React를 함께 포함한 제출 저장소 정리 → 개인별 GitHub URL 제출입니다. 디자인 시안만 받거나 코드만 GitHub에 올린 상태를 과제 전체 완료로 기록하지 않습니다.

### FE-20. 이번 프로젝트의 제약과 공부 순서

실제 런타임 의존성은 **react, react-dom, react-router, axios**입니다. UI 라이브러리나 CSS 프레임워크를 쓰지 않고 JavaScript/JSX와 CSS Module을 사용합니다. `devDependencies`에 타입 선언 패키지가 있어도 앱 자체를 TypeScript로 작성했다는 뜻은 아닙니다. 이 기준은 첨부 수업과 프로젝트 지침의 선택이며 실무의 모든 React 앱에 적용되는 보편적인 제한은 아닙니다.

현재 lint/build와 실제 API·브라우저 CRUD를 통과했다는 작업 기록은 [verification.md](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/docs/verification.md)에 있습니다. 이 원고를 작성하는 과정에서 기능 검사를 새로 실행한 것은 아닙니다. 기존 검증의 범위는 H2 실행, 기능 확인 화면이며 최종 Claude 디자인 적용이나 MySQL 연결 검증까지 포함하지 않습니다.

권장 읽기 순서는 FE-01의 전체 흐름 → FE-03의 객체와 값 → FE-04~07의 컴포넌트·입력 → FE-08의 저장 추적 → FE-09~12의 통신·라우팅 → FE-14~18의 개발 도구·디자인입니다. 첫날 `useResource`의 Promise 연결이나 모든 토큰 이름을 외울 필요는 없습니다.

첫 읽기 목표는 다음 세 문장을 실제 코드 위치와 함께 설명할 수 있는 것입니다.

- “입력한 이름은 `form.menuName`에 있고, 저장할 때 `payload.menuName`으로 넣습니다.”
- “`createMenu`는 API 요청 함수를 통해 Spring Boot에 데이터를 보냅니다.”
- “서버가 반환한 메뉴 번호를 받아 상세 화면으로 이동하고, 화면 스타일은 토큰을 사용합니다.”

공부를 위해 기존 메뉴를 임의 삭제하거나 DB를 비울 필요는 없습니다. 파일을 읽고 값을 종이에 추적하거나 이름 검색·페이지 이동처럼 데이터가 바뀌지 않는 행동부터 확인할 수 있습니다.

### 공식 자료와 전체 주소

- [Design Tokens Community Group 형식 규격](https://www.designtokens.org/TR/2025.10/format/)
- [MDN CSS 변수](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

### 이어서 궁금할 만한 질문

**tokens.css만 고치면 되나요?**

npm run tokens가 tokens.css를 다시 만듭니다. 원본 montage.tokens.json을 기준으로 수정합니다.

**API에 없는 사진·매출 기능도 그려도 되나요?**

현재 API에는 이미지·매출·주문 내역 필드가 없습니다. 디자인은 screen-brief와 DTO 범위에 맞춥니다.

**Claude가 시안을 만들면 앱이 완성됐나요?**

시안 수신 뒤 React 컴포넌트·CSS 적용과 실제 API·브라우저 검증, GitHub 게시·제출이 남습니다.


## 14. 실행 점검과 제출

기존 데이터를 바꾸지 않는 조회부터 시작하고 실행·검증·게시·제출 상태를 구별합니다.

도해: 실행 점검과 제출 · 성공 경로 또는 표시된 조건에서의 흐름. 오프라인 HTML에서 그림으로 확인합니다.

### 공부하는 순서와 안전한 실습

- 전체 흐름: 브라우저·React·Spring Boot·DB가 각각 하는 일을 자신의 말로 설명합니다.
- DB: H2와 MySQL이 DBMS라는 공통점, 현재 실행 방식의 차이를 이해합니다.
- HTTP: 요청 주소·메서드·본문·응답·상태를 읽습니다.
- OpenAPI와 Swagger: Java 코드에서 명세가 생기는 방향을 확인하고 GET 요청을 실행합니다.
- Java 서버: Controller → Service → Repository → DB의 값 이동을 따라갑니다.
- React: 입력값 → payload → createMenu → 응답 → 화면 이동을 따라갑니다.
- 디자인: 토큰으로 같은 버튼·입력창·간격을 여러 화면에 적용하는 이유를 설명합니다.
- 실행과 제출: dev·build·테스트·GitHub·제출의 차이를 구별합니다.

첫 실습은 기존 데이터를 바꾸지 않고 진행합니다. Swagger UI에서 GET /api/menus를 펼쳐 Try it out → Execute를 누른 뒤 응답 상태 200과 result.menus를 찾습니다. /v3/api-docs에서는 paths 아래 같은 API 경로가 있는지 확인합니다. React에서 기본 메뉴 목록을 열고 브라우저 개발자 도구 Network에서 /api/menus/pages?page=1&size=12 요청과 응답을 확인합니다. 이름·카테고리 필터를 적용한 경우에는 전체 조회 /api/menus가 사용됩니다.

앞서 기록한 브라우저 검사 범위는 CRUD·검색·페이지·입력 오류·삭제 확인과 취소입니다. 모든 네트워크 실패나 timeout 상황을 브라우저에서 검사했다는 뜻은 아닙니다. 정확한 확인 범위는 docs/verification.md에 있습니다.

백과사전의 등록 흐름 버튼은 학습용 예시만 바꿉니다. 서버 요청을 보내거나 DB를 변경하지 않습니다. 예시 응답의 menuCode=101은 설명을 위해 고른 번호이며 실제 DB에서 등록됐다는 증거가 아닙니다.

### 막혔을 때 어디를 볼까요?

| 증상 | 먼저 볼 곳 | 확인할 사실 |
| --- | --- | --- |
| 화면 주소가 열리지 않음 | React 실행 터미널 | 5175 실행 여부·포트 충돌 |
| 화면은 열리나 메뉴를 못 읽음 | Network·API 서버 터미널 | 요청 주소8090·HTTP 오류 |
| CORS 오류 | OPTIONS와 응답 헤더·CorsConfig | 출처5175 허용 여부 |
| 등록이 안 됨 | 필드 오류·서버 응답 | 가격 정수·카테고리 코드 |
| DB가 바뀌어 보임 | active profile·datasource URL | dev H2와 mysql DB 구별 |
| 가격 필터에서 같은 가격이 빠짐 | API 계약 | 초과(>)이므로 같은 가격은 제외 |
| 첫 페이지가 헷갈림 | 요청·실제 응답·계약 | 이 과제는 1부터, 자동 명세의 0 표현은 보완 필요 |
| 삭제 응답이 이상함 | 실제 HTTP와 JSON 본문 | HTTP200, 본문 httpStatus204인 기존 계약 |
| 저장 버튼을 두 번 누름 | 저장 중 상태 | 요청 중 버튼 비활성 확인 |
| 디자인이 화면마다 다름 | 공통 부품·토큰 참조 | 같은 역할에 같은 규칙 적용 |

오류를 볼 때 추측으로 DB 파일을 삭제하거나 기존 서비스를 종료하지 마세요. 요청 주소·상태·응답·프로필·로그를 먼저 확인하면 문제가 발생한 단계가 좁혀집니다.

### 학습 확인과 설명 연습

아래 문장들을 자신의 말로 설명하면 과제 전체의 뼈대를 이해한 것입니다. 모르는 용어는 관련 장과 용어 사전에서 다시 읽으세요.

- React의 저장 버튼이 DB에 직접 접속하지 않고 API를 호출하는 이유.
- 현재 H2 파일 DB의 데이터가 서버 종료 후에도 남는 이유.
- Java 코드 → OpenAPI → Swagger UI라는 현재 생성 방향.
- /menus/8 화면 주소와 /api/menus/8 서버 요청 주소의 차이.
- React의 state, JSON 문자열, Java DTO, 엔티티, DB 행이 각각 다른 표현인 이유.
- 토큰 JSON을 수정하고 CSS를 다시 생성하는 이유.
- H2에서 성공한 테스트만으로 MySQL의 모든 동작을 검증했다고 할 수 없는 이유.
- 디자인 시안·코드 구현·실행 검증·GitHub 게시·과제 제출을 구별하는 이유.

학습 자료를 열었다는 사실과 이해했다는 판단은 구별합니다. 이 문서는 순서를 안내하며, 동희님이 읽고 실행 결과를 설명하는 과정이 실제 공부입니다.

### 이어서 궁금할 만한 질문

**어떤 실습부터 시작해야 하나요?**

Swagger의 GET /api/menus에서200과result.menus를 확인하고 React의 pages?page=1&size=12를 비교합니다.

**메뉴가 안 나오면 DB부터 지우나요?**

DB 삭제 대신8090 실행, Network 상태, 프로필과datasource URL을 먼저 확인합니다.

**빌드가 통과하면 디자인도 확인됐나요?**

npm run build는 소스 빌드 검사입니다. 실제 화면·브라우저 흐름·Claude 디자인 수용을 대신하지 않습니다.


## 15. 용어 사전

용어의 정의와 현재 과제에서의 실제 예를 함께 읽습니다.

도해: 용어 사전 · 성공 경로 또는 표시된 조건에서의 흐름. 오프라인 HTML에서 그림으로 확인합니다.

### 용어를 찾는 방법

검색창에 H2, state, DTO처럼 막힌 말을 입력하세요. 정의와 실제 과제에서의 예를 함께 읽고 해당 장으로 돌아가세요.

### 스택

서비스를 만드는 기술들의 조합입니다.

과제에서의 예: 이 과제는 React·Spring Boot·H2를 함께 사용합니다.

### 프론트엔드

사용자 화면과 입력·클릭을 처리하는 부분입니다.

과제에서의 예: 브라우저의 메뉴 등록 폼입니다.

### 백엔드

요청을 받아 규칙을 처리하고 데이터 저장·조회를 수행하는 부분입니다.

과제에서의 예: 8090의 Spring Boot 프로그램입니다.

### 클라이언트

다른 프로그램에 요청을 보내는 역할입니다.

과제에서의 예: React와 Swagger UI가 API 클라이언트가 됩니다.

### 서버

요청을 기다렸다가 처리 결과를 응답하는 역할의 프로그램입니다.

과제에서의 예: GET /api/menus에 메뉴 목록을 응답합니다.

### 브라우저

웹 문서를 표시하고 JavaScript를 실행하는 프로그램입니다.

과제에서의 예: React 화면을 읽고 Axios 요청을 보냅니다.

### DB

특정 목적의 데이터와 그 저장 구조입니다.

과제에서의 예: 메뉴와 카테고리 데이터입니다.

### DBMS

데이터를 저장·조회·변경하도록 관리하는 소프트웨어입니다.

과제에서의 예: H2와 MySQL은 관계형 DBMS입니다.

### 관계형 DB

테이블·행·열과 관계로 데이터를 표현하는 데이터베이스입니다.

과제에서의 예: 메뉴 행이 카테고리 번호를 참조합니다.

### 테이블

같은 구조의 행을 담는 데이터 구조입니다.

과제에서의 예: 메뉴 테이블은 이름·가격 등의 열을 가집니다.

### 행

테이블에서 한 개의 데이터 기록입니다.

과제에서의 예: 아메리카노 4500원에 해당하는 기록입니다.

### 열

각 행의 특정 속성을 담는 자리입니다.

과제에서의 예: 가격을 담는 menu_price 열입니다.

### 기본키

행을 고유하게 구별하는 키입니다.

과제에서의 예: 메뉴 번호 menuCode에 대응합니다.

### 외래키

다른 테이블의 키를 참조하는 값입니다.

과제에서의 예: 메뉴가 참조하는 categoryCode입니다.

### SQL

관계형 DB에 조회·변경·구조 정의를 요청하는 언어입니다.

과제에서의 예: SELECT는 데이터를 조회합니다.

### CRUD

생성·조회·수정·삭제 네 작업의 묶음입니다.

과제에서의 예: 메뉴 등록·목록·수정·삭제입니다.

### H2

Java로 구현된 관계형 DBMS입니다.

과제에서의 예: 기본 dev에서 내장 파일 DB로 실행합니다.

### MySQL

현재 수업에서 사용한 관계형 DBMS 제품입니다.

과제에서의 예: mysql 프로필의 기본 주소는 localhost:3306입니다. 실제 연결은 별도 준비·검증이 필요합니다.

### 내장 DB

애플리케이션 프로세스 안에서 DB 엔진이 함께 실행되는 방식입니다.

과제에서의 예: 현재 H2가 Spring Boot와 같은 JVM에서 실행합니다.

### 파일 DB

지속할 데이터를 디스크 파일에 저장하는 방식입니다.

과제에서의 예: vibe-menu.mv.db가 남습니다.

### 메모리 DB

주로 메모리 안에서 데이터를 보관하는 DB 실행 설정입니다.

과제에서의 예: JPA 테스트의 H2 메모리 DB는 개발 파일 DB와 분리됩니다.

### JDBC

Java에서 DB에 연결하고 SQL을 실행하는 표준 API입니다.

과제에서의 예: Hibernate가 JDBC를 통해 H2에 접근합니다.

### 드라이버

특정 DB 제품과 통신하는 구현입니다.

과제에서의 예: H2는 org.h2.Driver, MySQL은 com.mysql.cj.jdbc.Driver입니다.

### JPA

Java 객체와 관계형 데이터의 매핑·영속성을 다루는 표준입니다.

과제에서의 예: 엔티티를 저장하고 조회하는 규칙을 제공합니다.

### Hibernate

JPA를 구현하는 ORM 라이브러리입니다.

과제에서의 예: 객체의 저장을 SQL·JDBC 동작으로 연결합니다.

### ORM

객체와 관계형 테이블 구조를 연결하는 방식입니다.

과제에서의 예: Menu 객체와 메뉴 행을 매핑합니다.

### 엔티티

JPA가 테이블과 연결해 관리하는 Java 객체의 유형입니다.

과제에서의 예: Menu의 필드가 메뉴 데이터에 대응합니다.

### DTO

계층 사이 또는 요청·응답에 전달할 값의 구조입니다.

과제에서의 예: MenuDTO가 React에 메뉴 정보를 전달합니다.

### Controller

HTTP 요청을 메서드와 연결하고 응답을 만드는 계층입니다.

과제에서의 예: MenuController가 POST /api/menus를 받습니다.

### Service

업무 규칙과 처리 순서를 수행하는 계층입니다.

과제에서의 예: MenuService.saveMenu가 카테고리를 확인하고 저장합니다.

### Repository

엔티티의 저장·조회 등 영속성 접근을 담당하는 계층입니다.

과제에서의 예: MenuRepository.save와 findById를 사용합니다.

### Bean

Spring 컨테이너가 생성·관리하는 객체입니다.

과제에서의 예: 주입받는 MenuService 객체입니다.

### DI

필요한 객체의 참조를 외부에서 넣어주는 방식입니다.

과제에서의 예: 생성자 매개변수로 MenuRepository를 전달받습니다.

### 트랜잭션

함께 성공하거나 함께 실패하도록 묶는 데이터 작업의 경계입니다.

과제에서의 예: 메뉴 등록 도중 실패하면 해당 작업을 롤백합니다.

### 변경 감지

관리 중인 엔티티의 변경을 영속성 처리에 반영하는 기능입니다.

과제에서의 예: 수정 메서드의 필드 변경이 커밋 시 반영됩니다.

### Java

현재 서버 코드를 작성하는 프로그래밍 언어입니다.

과제에서의 예: MenuService.java의 언어입니다.

### JavaScript

브라우저 로직과 React 코드를 작성하는 언어입니다.

과제에서의 예: menu.js와 JSX 컴포넌트의 바탕입니다.

### JVM

Java 바이트코드를 실행하는 가상 머신입니다.

과제에서의 예: 실행된 JAR 안의 서버 클래스를 처리합니다.

### Gradle

Java 프로젝트의 의존성·컴파일·테스트·패키징을 관리하는 빌드 도구입니다.

과제에서의 예: gradlew.bat test bootJar를 실행했습니다.

### Wrapper

프로젝트가 지정한 Gradle 버전을 실행하는 진입점입니다.

과제에서의 예: gradlew.bat와 gradle-wrapper.properties입니다.

### JAR

Java 클래스와 자원을 묶는 파일 형식입니다.

과제에서의 예: bootJar 결과를 java -jar로 실행합니다.

### YAML

들여쓰기로 설정 구조를 표현하는 텍스트 형식입니다.

과제에서의 예: application-dev.yaml의 DB 설정입니다.

### 프로필

환경별 설정과 동작을 선택하는 Spring 기능입니다.

과제에서의 예: dev는 H2, mysql은 MySQL 연결 설정입니다.

### 의존성

프로그램이 사용하는 외부 라이브러리나 패키지입니다.

과제에서의 예: springdoc, H2, Axios입니다.

### HTTP

클라이언트와 서버가 요청·응답을 교환하는 규칙입니다.

과제에서의 예: 브라우저의 POST와 서버의 201 응답입니다.

### API

프로그램 사이에 제공하는 기능과 사용 계약입니다.

과제에서의 예: 메뉴 목록 조회와 등록 창구입니다.

### REST

리소스·표현·상태 없는 요청 등 제약으로 시스템을 구성하는 아키텍처 스타일입니다.

과제에서의 예: 우리 과제는 메뉴 리소스 중심 HTTP API를 사용합니다.

### URL

대상 리소스의 위치와 접근 정보를 나타내는 주소입니다.

과제에서의 예: localhost:8090/api/menus입니다

### localhost

현재 요청을 보내는 컴퓨터 자신을 가리키는 호스트 이름입니다.

과제에서의 예: 친구 PC의 localhost는 친구 PC 자신입니다.

### 포트

호스트 안에서 네트워크 요청을 받는 프로그램을 구분하는 번호입니다.

과제에서의 예: React 개발 서버5175와 API 서버8090입니다.

### 출처

브라우저가 스킴·호스트·포트의 조합으로 구분하는 origin입니다.

과제에서의 예: 5175와8090은 포트가 달라 다른 출처입니다.

### 경로

URL에서 리소스를 구분하는 부분입니다.

과제에서의 예: /api/menus/8입니다.

### 쿼리

URL의 물음표 뒤에 붙이는 요청 매개변수입니다.

과제에서의 예: page=1&size=12입니다.

### 헤더

HTTP 메시지의 형식과 부가 정보를 전달하는 부분입니다.

과제에서의 예: Content-Type: application/json입니다.

### 본문

요청·응답에서 실제 전달할 데이터를 담는 부분입니다.

과제에서의 예: 등록할 메뉴의 JSON입니다.

### JSON

언어에 독립적으로 구조화한 데이터를 적는 텍스트 형식입니다.

과제에서의 예: menuName과 menuPrice를 서버로 전달합니다.

### GET

리소스를 조회하도록 요청하는 HTTP 메서드입니다.

과제에서의 예: GET /api/menus입니다.

### POST

대상에 데이터를 보내 처리하도록 요청하는 HTTP 메서드입니다.

과제에서의 예: 이 과제의 POST /api/menus는 메뉴 등록입니다.

### PUT

대상 리소스의 표현을 교체하도록 요청하는 HTTP 메서드입니다.

과제에서의 예: 현재 수정 API는 폼의 전체 값을 보냅니다.

### DELETE

대상 리소스를 삭제하도록 요청하는 HTTP 메서드입니다.

과제에서의 예: DELETE /api/menus/8입니다.

### 상태 코드

HTTP 처리 결과를 나타내는 숫자입니다.

과제에서의 예: 200 성공, 201 생성, 400 요청 오류, 404 대상 없음입니다.

### OpenAPI

HTTP API를 기술하는 표준 문서 구조입니다.

과제에서의 예: servers·tags·paths·components를 정의합니다.

### 스키마

데이터의 필드·타입·제약 등을 설명하는 구조입니다.

과제에서의 예: MenuDTO의 menuPrice가 정수라는 정의입니다.

### Swagger UI

OpenAPI를 사람이 읽고 실제 API를 시험할 수 있게 보여주는 도구입니다.

과제에서의 예: swagger-ui/index.html의 개발자 화면입니다.

### springdoc

Spring 앱의 코드·어노테이션에서 OpenAPI를 생성하는 라이브러리입니다.

과제에서의 예: /v3/api-docs와 Swagger UI를 연결합니다.

### code-first

구현 코드를 바탕으로 명세를 생성하는 개발 방식입니다.

과제에서의 예: 현재 Java 코드에서 명세를 생성합니다.

### contract-first

API 계약을 먼저 정하고 구현을 맞추는 개발 방식입니다.

과제에서의 예: 명세를 먼저 작성하고 코드 생성 등을 선택합니다.

### CORS

브라우저의 다른 출처 요청에서 응답 접근을 허용하는 규칙입니다.

과제에서의 예: 8090이 5175의 요청 출처를 허용합니다.

### preflight

브라우저가 일부 교차 출처 요청 전에 보내는 사전 확인입니다.

과제에서의 예: JSON POST 전에 OPTIONS가 보일 수 있습니다.

### React

컴포넌트로 사용자 인터페이스를 구성하는 JavaScript 라이브러리입니다.

과제에서의 예: 메뉴 폼과 상세 화면을 구성합니다.

### 컴포넌트

화면의 일부를 표현하고 재사용하는 단위입니다.

과제에서의 예: Layout·Feedback·MenuFormPage입니다.

### JSX

JavaScript 안에서 UI 구조를 표현하는 문법 확장입니다.

과제에서의 예: MenuFormPage.jsx의 입력창 구조입니다.

### props

부모 컴포넌트가 자식에게 전달하는 입력입니다.

과제에서의 예: Feedback에 loading과 error를 전달합니다.

### state

컴포넌트가 기억하며 갱신에 따라 화면에 반영하는 값입니다.

과제에서의 예: 메뉴 이름 입력값을 보관합니다.

### 렌더링

현재 입력·상태를 바탕으로 화면 표현을 계산·반영하는 과정입니다.

과제에서의 예: state 변경 후 입력창 표시를 갱신합니다.

### 이벤트

클릭·입력 등 사용자 행동을 알리는 신호입니다.

과제에서의 예: onChange와 onSubmit입니다.

### 제어 입력

React의 state와 value로 입력값을 관리하는 방식입니다.

과제에서의 예: 이름 입력을 폼 상태와 연결합니다.

### Hook

React 기능을 함수 컴포넌트에서 사용하는 함수입니다.

과제에서의 예: useState·useEffect·자체 useResource입니다.

### Promise

나중에 성공하거나 실패할 비동기 결과를 표현하는 객체입니다.

과제에서의 예: Axios 요청의 응답 결과입니다.

### async/await

Promise를 기다리는 흐름을 작성하는 JavaScript 문법입니다.

과제에서의 예: await createMenu(payload)입니다.

### Axios

HTTP 요청·응답을 다루는 JavaScript 라이브러리입니다.

과제에서의 예: API 계층에서 JSON POST를 보냅니다.

### React Router

React 화면의 주소와 이동을 관리하는 라이브러리입니다.

과제에서의 예: /menus/new와 상세 화면을 연결합니다.

### Node.js

브라우저 밖에서 JavaScript를 실행하는 런타임입니다.

과제에서의 예: Vite와 토큰 생성 스크립트를 실행합니다.

### npm

패키지 설치와 package.json 스크립트를 실행하는 도구입니다.

과제에서의 예: npm ci와 npm run build입니다.

### Vite

프론트 개발 서버와 빌드를 제공하는 도구입니다.

과제에서의 예: 5175 개발 화면과 dist 결과를 만듭니다.

### 빌드

소스를 실행·배포에 사용할 형태로 처리하는 작업입니다.

과제에서의 예: bootJar와 Vite build는 대상이 다릅니다.

### CSS Module

CSS 클래스 이름을 모듈 범위로 처리하는 방식입니다.

과제에서의 예: Scaffold.module.css를 import합니다.

### 디자인 시스템

여러 화면에 일관된 규칙·컴포넌트·사용 기준을 적용하는 체계입니다.

과제에서의 예: 같은 역할의 버튼·입력창·카드 규칙입니다.

### 디자인 토큰

색·간격·글자·모서리 등 디자인 값을 이름 붙여 관리하는 데이터입니다.

과제에서의 예: montage.tokens.json에서 tokens.css를 생성합니다.

### semantic 토큰

값의 역할과 의미를 이름으로 나타내는 토큰입니다.

과제에서의 예: 텍스트·배경·주요 동작 같은 의미의 색입니다.

### Git

파일 변경의 버전을 관리하는 도구입니다.

과제에서의 예: 우리 과제의 코드 변경을 기록합니다.

### GitHub

Git 저장소를 호스팅하고 협업하는 서비스입니다.

과제에서의 예: 최종 제출물인 저장소 URL입니다.

### 배포

사용할 환경에 결과물을 올리고 실행 가능하게 하는 작업입니다.

과제에서의 예: 로컬 실행·GitHub 게시와 구별합니다.

### E2E

사용자 흐름의 여러 구성 요소를 끝까지 연결해 검사하는 범위입니다.

과제에서의 예: 브라우저 입력에서 서버 저장과 화면 표시까지 확인합니다.

### 공식 자료와 전체 주소

- [주소](http://localhost:8090/api/menus)

### 이어서 궁금할 만한 질문

**API와DTO를 함께 외우면 되나요?**

API는 기능 계약이고 MenuDTO는 전달 값 구조입니다. POST 요청 본문과 응답을 비교하세요.

**4500 값은 모든 곳에서 같은 형태인가요?**

폼에서는 문자열일 수 있고 Number 변환 뒤JSON 숫자, Java int, DB 정수 열로 이동합니다.

**스택 이름만 알면 연동을 이해한 건가요?**

React·Spring Boot·H2 이름뿐 아니라 createMenu→saveMenu→DB→result.menu 흐름을 설명해야 합니다.
