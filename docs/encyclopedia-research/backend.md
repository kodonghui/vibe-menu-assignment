# 서버와 DB를 실제 과제 코드로 이해하기

**이 과제의 서버는 Java로 만든 Spring Boot 프로그램이고, 현재 메뉴 데이터는 그 프로그램 안에서 실행되는 H2 파일 DB에 저장됩니다.** MySQL을 쓰던 수업 코드의 메뉴 처리 방식은 재사용했지만, 기본 DB 선택은 준비 과정에서 에이전트가 바꾼 것입니다.

- H2와 MySQL은 둘 다 관계형 DBMS이며 서로 다른 제품입니다.
- 서버의 Java 코드, 실행용 JAR, DB 데이터 파일은 서로 다른 실물입니다.
- `Controller → Service → Repository → Hibernate → JDBC → DB` 순서로 읽으면 담당 범위를 구분할 수 있습니다.
- 아래 실습은 파일 읽기와 메뉴 조회만 합니다. DB를 전환하거나 기존 데이터를 바꾸는 명령은 실행하지 않습니다.

이 원고는 2026-09-30의 과제 파일을 읽고 공식 문서를 확인한 학습 자료입니다. 파일에 적힌 설정, 이전에 확인한 실행 결과, 앞으로 할 수 있는 선택을 구분합니다. 현 실행 검증 범위는 [검증 기록](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/docs/verification.md:16)에 있습니다.

## 읽는 순서

1. 서버·DB·DBMS를 구분합니다.
2. H2를 선택한 이유와 MySQL과의 차이를 봅니다.
3. DB 연결 설정과 예시 데이터 생성을 읽습니다.
4. Java·Gradle·JAR·YAML·프로필을 연결합니다.
5. JDBC·JPA·Hibernate를 구분합니다.
6. Entity·Repository·Service·Controller·DTO를 읽습니다.
7. 객체 생성·DI·트랜잭션을 봅니다.
8. 아메리카노와 `4500`이라는 값 하나를 끝까지 추적합니다.

## 1. 서버는 파일 종류인가요?

**서버 → 요청을 받고 응답하는 역할의 프로그램입니다.** “서버 컴퓨터”라고 하면 그 프로그램을 실행하는 장비를 가리키지만, 지금은 동희님 컴퓨터에서 실행되는 프로그램을 말합니다.

우리 서버는 `http://localhost:8090/api/menus`로 들어온 요청을 받아 메뉴 정보를 응답합니다. `localhost`는 요청을 보내는 컴퓨터 자신을 가리키고, `8090`은 프로그램이 요청을 받는 포트 번호입니다. Java의 확장자도 DB 이름도 아닙니다.

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

## 2. DB와 DBMS는 같은 말인가요?

**Database, DB → 구조를 정해 보관한 데이터의 모음입니다.** 메뉴의 이름·가격·카테고리 같은 실제 기록이 여기에 있습니다.

**Database Management System, DBMS → 그 데이터를 저장·조회·수정·삭제하는 소프트웨어입니다.** H2와 MySQL은 DBMS 제품 이름입니다.

**Relational DBMS, RDBMS → 테이블과 테이블 사이의 관계를 관리하는 DBMS입니다.** 관계형이라는 말은 메뉴와 카테고리를 하나의 긴 문자열에 섞어 보관하는 대신, 테이블로 구분하고 키로 연결한다는 뜻입니다.

개발자 대화에서는 “H2 DB를 쓴다”, “MySQL DB를 설치한다”처럼 DB와 DBMS를 편하게 묶어 말하기도 합니다. 지금 공부할 때는 제품과 데이터를 구분하면 덜 헷갈립니다. MySQL 공식 설명도 database를 구조화된 데이터 모음, MySQL을 그 모음을 관리하는 프로그램으로 구분합니다. [MySQL: What is MySQL?](https://dev.mysql.com/doc/refman/8.4/en/what-is-mysql.html)

우리 코드에서는 `tbl_menu`와 `tbl_category`라는 테이블 이름을 사용합니다. 다음은 구조를 설명하기 위한 예시이며, 지금 DB를 다시 조회해 얻은 전체 결과는 아닙니다.

| `tbl_menu`의 열 | 값의 예 | 의미 |
|---|---|---|
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

## 3. H2는 MySQL 같은 건가요? 누가 정했나요?

**H2 → Java로 구현된 SQL 관계형 DBMS입니다.** MySQL처럼 데이터를 테이블에 저장하고 SQL로 다룰 수 있지만, 제품과 DB 파일 형식은 다릅니다. H2는 내장 실행과 서버 실행, 디스크 저장과 메모리 저장을 지원합니다. [H2 공식 소개](https://h2database.com/html/main.html)

“데이터베이스 스택인가요?”라는 질문에는, **H2는 스택 전체가 아니라 DBMS 한 제품**이라고 답할 수 있습니다. 우리 백엔드의 여러 기술을 함께 부르면 `Java + Spring Boot + Spring Data JPA + Hibernate + H2`라는 기술 스택이라고 할 수 있습니다. 여기서 Java는 언어·실행 환경, H2는 데이터 저장을 맡는 소프트웨어입니다.

**이번 기본 H2 선택은 에이전트가 했습니다. 동희님이 MySQL을 바꾸라고 지시하신 것은 아닙니다.** 과제 전용 데이터를 수업 DB와 분리하고, 별도 DB 계정·스키마 준비 없이 먼저 전체 기능을 실행할 수 있도록 선택했습니다. H2가 과제 공지의 필수 조건이거나 MySQL보다 무조건 좋은 제품이라는 뜻은 아닙니다.

| 비교 기준 | 현재 과제의 H2 방식 | 수업에서 익숙한 MySQL 방식 |
|---|---|---|
| DBMS 실행 | 앱과 같은 Java 프로세스에서 내장 실행 | 보통 별도 MySQL 서버 프로세스에 접속 |
| 준비 | H2 라이브러리와 파일 경로 설정 | 서버·계정·권한·과제용 스키마 준비 |
| 데이터 보관 | 이 과제의 `.mv.db` 파일 | MySQL 서버가 관리하는 데이터 저장소 |
| 수업과 연결 | JPA 흐름을 그대로 읽을 수 있음 | 배운 DB 도구와 SQL 환경을 계속 사용 |
| 실제 확인 범위 | 현재 CRUD·API·브라우저 검증 완료 | 연결 프로필만 제공, 이번 실행은 미검증 |

여기서 “MySQL은 서버 방식”은 이번 수업과 일반적인 MySQL Server 사용을 비교하는 표현입니다. 제품의 모든 배포 가능성을 단정하는 분류는 아닙니다. [MySQL 공식 제품 설명](https://dev.mysql.com/doc/refman/8.4/en/what-is-mysql.html)

**학습 선택의 장단점:** H2를 유지하면 연결 준비 부담이 작아 화면→서버→DB 흐름부터 배울 수 있습니다. MySQL을 사용하면 수업과 같은 DB 환경에서 결과를 관찰하고 실제 DB 차이도 확인할 수 있습니다. 이 과제를 MySQL 학습까지 이어가려면 전용 스키마로 연결해서 검사하는 선택이 자연스럽습니다. 현재 H2 검사 통과를 MySQL 검사 통과로 바꿔 말하면 안 됩니다. 이 문서는 설명만 하며 DB를 전환하지 않습니다.

**흔한 오해:** H2가 MySQL의 간단 모드라는 생각입니다. 둘은 별도 DBMS이고, H2 파일을 MySQL에 연결해서 바로 쓰는 것도 아닙니다.

**읽기 실습:** [build.gradle](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/build.gradle:47)에 `mysql-connector-j`와 `h2`가 둘 다 있는 것을 확인하세요. 라이브러리가 둘 다 있다고 해서 현재 데이터가 두 DB에 동시에 저장되는 것은 아닙니다. 다음 설정에서 어느 연결이 선택되는지 봐야 합니다.

## 4. 파일 DB·메모리 DB와 내장·서버 실행은 다른 기준입니다

**파일형·메모리형은 데이터를 어디에 두는지에 관한 구분입니다.** **내장·서버 모드는 다른 프로그램이 DB와 어떻게 연결되는지에 관한 구분입니다.** 이 두 기준을 한 가지로 합치면 “내장 DB는 종료하면 무조건 사라진다”라는 잘못된 결론이 나옵니다.

| 기준 | 선택 | 우리 과제에서의 실물 |
|---|---|---|
| 저장 위치 | 파일 저장 | 일반 실행의 `jdbc:h2:file:...` |
| 저장 위치 | 메모리 저장 | 테스트의 `jdbc:h2:mem:vibe-test...` |
| 연결 방식 | 내장 모드 | Spring Boot와 같은 JVM에서 H2 실행 |
| 연결 방식 | 서버 모드 | H2 TCP 서버에 연결하는 별도 방식, 현재 미사용 |

**JVM, Java Virtual Machine → Java 바이트코드를 실행하는 런타임입니다.** 현재 서버의 Java 프로세스 안에서 Spring Boot 코드와 H2 라이브러리가 함께 실행됩니다. H2 파일 저장은 서버를 정상 종료한 뒤에도 파일을 남기므로, 같은 DB 경로로 다시 연결하면 데이터를 다시 읽을 수 있습니다.

H2 메모리 DB는 해당 Java 런타임의 메모리에 존재합니다. 테스트 URL에 있는 `DB_CLOSE_DELAY=-1`은 연결이 잠깐 끊겨도 JVM이 살아 있는 동안 DB를 유지하는 설정입니다. 컴퓨터를 껐다 켜도 그 메모리 데이터를 남기는 설정은 아닙니다. 내장·파일 경로·메모리 연결의 구체적 의미는 [H2 연결 모드 및 URL 설명](https://h2database.com/html/features.html#connection_modes)에 있습니다.

현재 테스트는 [테스트 클래스](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/test/java/com/ohgiraffers/springdatajpa/Chap06SpringDataJpaApplicationTests.java:13)에서 다음처럼 별도 연결을 지정합니다.

```java
@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:vibe-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
```

테스트는 일반 앱의 파일 DB와 다른 DB에서 수행했습니다. “테스트로 메뉴를 삭제했으니 앱의 메뉴도 사라진다”는 해석은 맞지 않습니다. 다만 아무 프로젝트의 모든 테스트가 자동으로 격리된다는 뜻은 아닙니다. 지금은 이 클래스의 연결 URL과 설정을 확인해서 구분하는 것입니다.

**읽기 실습:** `application-dev.yaml`의 `file`과 테스트 클래스의 `mem`을 비교하세요. 파일을 삭제하거나 `create-drop`을 일반 실행 설정에 옮기지 않고, 어느 쪽이 데이터를 보존하려는 설정인지 말로 설명해보세요.

## 5. “DB를 준비했다”는 구체적으로 무엇을 했나요?

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

H2는 내장 연결에서 DB가 없으면 새 DB를 만들 수 있습니다. 여기서는 Java 엔티티에 적힌 매핑과 `ddl-auto: update` 설정을 통해 Hibernate가 테이블 구조도 준비했습니다. [H2 내장 시작 방법](https://h2database.com/html/quickstart.html#embedding), [Spring Boot DB 초기화](https://docs.spring.io/spring-boot/how-to/data-initialization.html)

**DDL, Data Definition Language → 테이블 같은 구조를 정의하는 SQL입니다.** `CREATE TABLE`이 실물입니다. `update`는 “기존 메뉴 값을 자동으로 수정한다”가 아니라 엔티티 매핑에 맞춰 DB 구조 갱신을 시도하라는 설정입니다. 구조 변경의 완전한 이력이나 안전한 모든 변경을 보장하지 않습니다. 지금 개발 설정을 그대로 실제 운영 DB의 변경 정책으로 생각하지 마세요. 운영에서는 검토한 구조 변경을 기록하고 적용하는 별도 방식도 사용합니다.

`MODE=MySQL`은 **H2의 일부 문법·동작을 MySQL과 비슷하게 맞추는 호환 모드**입니다. 실제 접속 대상은 여전히 H2입니다. 문자열 비교·SQL 기능·타입·실행 계획 등 차이가 남으므로 H2 검사로 MySQL 호환성 전체를 증명할 수 없습니다. H2 공식 문서는 호환 모드가 차이의 일부만 구현한다고 명시합니다. [H2 MySQL 호환 모드](https://h2database.com/html/features.html#compatibility)

`DB_CLOSE_ON_EXIT=FALSE`는 JVM 종료 시 H2 자체의 자동 종료 처리를 끄는 설정입니다. Spring Boot가 연결 종료 시점을 관리하도록 사용한 것입니다. “DB를 영원히 켜둔다”거나 “프로세스가 종료되어도 메모리를 유지한다”라는 뜻은 아닙니다. [Spring Boot SQL DB 연결 안내](https://docs.spring.io/spring-boot/reference/data/sql.html#data.sql.datasource.embedded)

셋째, [DemoDataConfig.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/config/DemoDataConfig.java:27)에서 처음 빈 DB에 예시 데이터를 넣었습니다.

```java
if (categories.count() != 0 || menus.count() != 0) return;
```

카테고리나 메뉴 중 어느 쪽이라도 이미 있으면 메서드를 끝냅니다. **두 테이블이 모두 비었을 때만** 카테고리 8개와 메뉴 16개를 추가합니다. 실행할 때마다 중복으로 넣는 코드는 아닙니다. 메뉴만 전부 지웠는데 카테고리가 남았다면, 이 조건 때문에 메뉴를 자동 복원하지도 않습니다.

이 클래스는 `ApplicationRunner`를 구현해 시작 시 작업을 수행하고, `@Profile({"dev", "mysql"})` 때문에 해당 프로필에서만 준비됩니다. 지금은 코드를 읽는 단계이므로 DB를 비우거나 예시 데이터를 재입력하지 않습니다.

**읽기 실습:** 연결 URL을 `접속 종류 / 데이터 저장 위치 / 추가 옵션`으로 나눠 적어보세요. 이후 `count` 조건의 `||`가 “둘 중 하나라도 참”인지, 둘 다 참이어야 하는지 확인하세요. 이 조건의 반환 타입 `void`는 예시 데이터 작업이 호출자에게 값을 반환하지 않는다는 뜻입니다.

## 6. MySQL 프로필과 YAML은 무엇인가요?

**YAML → 들여쓰기로 키와 값을 표현하는 텍스트 형식입니다.** `application.yaml`은 Java 소스가 아니라 설정 파일입니다. 예를 들어 아래 표현은 `spring.profiles.default`라는 설정값을 `dev`로 지정합니다.

```yaml
spring:
  profiles:
    default: dev
```

**Profile → 환경에 따라 적용할 설정이나 객체를 선택하는 이름입니다.** 현재 공통 파일에서 기본 프로필을 `dev`로 지정했고, `application-dev.yaml`은 H2 설정, `application-mysql.yaml`은 MySQL 설정을 담습니다. 명시한 활성 프로필이 없을 때 기본 프로필이 쓰이는 원리입니다. [Spring Boot 프로필](https://docs.spring.io/spring-boot/reference/features/profiles.html)

**Environment variable → 실행 환경에서 전달하는 이름 붙은 값입니다.** [MySQL 설정](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/resources/application-mysql.yaml:3)의 `${DB_USERNAME}`과 `${DB_PASSWORD}`는 사용자명·비밀번호 자체가 아니라 실행 환경에서 값을 찾으라는 자리입니다.

`${DB_URL:...}`처럼 콜론이 있으면 `DB_URL` 값이 없을 때 뒤의 기본값을 사용합니다. 현재 기본 MySQL URL은 별도 스키마 `vibe_menu_assignment`를 가리킵니다. 설정 파일이 존재한다고 그 스키마와 계정·권한이 생성된 것은 아닙니다. H2 데이터가 MySQL에 복사된 것도 아닙니다. 환경변수와 설정 파일은 Spring Boot의 외부 설정 방식으로 읽힙니다. [Spring Boot 외부 설정](https://docs.spring.io/spring-boot/reference/features/external-config.html)

**현재 상태:** MySQL 드라이버와 프로필, README의 연결 방법을 준비했습니다. 실제 메뉴 CRUD·브라우저 검증은 H2에서 했습니다. MySQL로 바꾸려면 독립 스키마·권한을 확인하고 그 환경에서 다시 동작을 검증해야 합니다. 이 백과사전 작성 과정에서는 실행 프로필을 바꾸지 않았습니다.

**흔한 오해:** 프로필은 브랜치나 별도 소스 코드 복사본이 아닙니다. 같은 프로그램에서 적용할 구성을 선택하는 기능입니다. 설정 파일을 고쳐도 이미 떠 있는 JAR의 내용이 즉시 바뀌는 것은 아닙니다. 어떤 설정을 외부에서 읽는지와 재시작·재빌드가 필요한지를 구분해야 합니다.

**읽기 실습:** 공통 설정에서 `default`를 찾고, 두 프로필 파일의 `url`과 `driver-class-name`만 비교하세요. 비밀번호 환경변수를 출력하는 명령은 쓰지 않아도 됩니다.

## 7. Java·Gradle·JAR를 구분하기

**Java → 이 서버의 동작을 작성한 프로그래밍 언어입니다.** `.java`는 사람이 읽고 고치는 소스 파일입니다. **Compile → 소스를 실행 환경이 처리할 코드로 변환하는 작업입니다.** Java 컴파일 결과에는 `.class` 파일이 생깁니다.

**Gradle → 의존성을 준비하고 컴파일·검사·패키징 작업을 실행하는 빌드 도구입니다.** `build.gradle`은 이 도구에게 필요한 라이브러리와 작업 구성을 알려줍니다. **Gradle Wrapper → 프로젝트가 정한 Gradle을 사용하도록 실행하는 파일들입니다.** Windows에서는 `gradlew.bat`가 실물입니다.

**JAR, Java Archive → Java 클래스와 자원을 묶은 파일 형식입니다.** 우리 프로젝트의 `bootJar` 작업은 실행에 필요한 의존성도 포함하는 Spring Boot 실행용 JAR을 만듭니다. 모든 `.jar`가 단독 실행되는 서버는 아닙니다. 라이브러리 JAR도 있습니다. [Spring Boot 실행용 패키징](https://docs.spring.io/spring-boot/gradle-plugin/packaging.html)

현재 역할은 이렇게 나뉩니다.

| 실물 | 하는 일 | 하지 않는 일 |
|---|---|---|
| `MenuService.java` | 메뉴 처리 소스 | 소스 파일 자체가 요청을 받지는 않음 |
| `build.gradle` | 빌드와 의존성 설정 | 메뉴 데이터를 보관하지 않음 |
| `gradlew.bat` | Gradle 작업 실행 | DBMS가 아님 |
| `vibe-menu-api-0.0.1-SNAPSHOT.jar` | 서버 실행용 묶음 | DB 데이터 파일이 아님 |
| `vibe-menu.mv.db` | H2 메뉴·카테고리 데이터 | 서버 Java 소스가 아님 |

`java -jar ...`는 이미 만든 JAR을 실행합니다. `gradlew.bat bootJar`는 JAR을 만듭니다. **만드는 작업과 켜는 작업이 다릅니다.** 소스를 수정하고 예전 JAR을 실행하면 예전 코드가 실행됩니다. 이것은 Spring Boot 고유 현상이 아니라 소스와 빌드 결과가 다른 실물이기 때문입니다.

현재 [build.gradle](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/build.gradle:21)은 Java 17을 지정합니다. 같은 파일의 시작 부분에는 Spring Boot 플러그인 4.1.1이 적혀 있습니다. 참고 코드의 주석에 적힌 라이브러리 버전 전체를 실제 해결된 의존성 목록으로 취급하지는 않습니다.

**읽기 실습:** 파일 탐색기에서 `backend/src/main/java`, `backend/src/main/resources`, `backend/build/libs`, `backend/.runtime/data` 네 위치를 비교하세요. 읽기만 하면서 소스·설정·빌드 결과·데이터를 각각 어느 곳에 두었는지 확인하면 됩니다.

## 8. JDBC·JPA·Hibernate는 왜 세 개나 나오나요?

이름 세 개는 같은 프로그램의 별명이 아니라 서로 다른 층의 역할입니다.

| 용어 | 쉬운 뜻 | 정확한 역할 | 현재 과제의 연결 |
|---|---|---|---|
| JDBC, Java Database Connectivity | Java의 DB 연결 API | 연결·SQL 실행·결과 처리에 쓰는 표준 인터페이스 | H2 또는 MySQL 드라이버 |
| ORM, Object Relational Mapping | 객체와 테이블의 매핑 | Java 객체와 관계형 데이터를 연결하는 방식 | `Menu`와 `tbl_menu` 연결 |
| JPA, Jakarta Persistence | Java 영속성 표준 | 엔티티 매핑·조회·저장 등의 규칙과 API | `jakarta.persistence` 어노테이션 |
| Hibernate ORM | JPA를 실제 수행하는 라이브러리 | 매핑 정보를 사용해 SQL·객체 상태를 처리 | JPA 스타터가 가져오는 구현 |
| Spring Data JPA | Repository 작성 지원 | 인터페이스와 규칙을 이용해 데이터 접근 구현 지원 | `MenuRepository` |

JPA라는 약어는 예전 명칭 Java Persistence API로도 알려져 있습니다. 현재 코드의 import는 `jakarta.persistence.*`입니다. Hibernate 공식 설명은 Hibernate가 ORM 라이브러리이며 JPA 구현을 제공한다고 구분합니다. Spring Data JPA는 별도로 Repository 구현을 지원합니다. [Hibernate ORM API 소개](https://docs.hibernate.org/orm/7.4/javadocs/), [Spring Data JPA 소개](https://spring.io/projects/spring-data-jpa/)

**왜 필요한가요?** 순수 JDBC로도 같은 앱을 만들 수 있습니다. 그 경우 연결을 얻고 SQL을 작성하고 결과 행의 값을 Java 객체로 옮기는 코드가 많이 필요합니다. 이 과제는 JPA 매핑과 Spring Data Repository로 그 반복을 줄이고, 메뉴 처리의 의미를 Java 코드에서 읽도록 구성되어 있습니다. [Spring Boot SQL 접근 방식](https://docs.spring.io/spring-boot/reference/data/sql.html)

현재 `menuRepository.findById(menuCode)`라는 호출 아래에는 실제 DB 질의가 있습니다. 함수 이름이 SQL을 대체해 DB를 없애는 것이 아니라, 라이브러리들이 SQL 실행과 객체 변환을 담당합니다. `EntityManager`는 JPA가 엔티티의 저장·조회·상태를 관리하는 핵심 API이지만, 이 앱에서는 Repository가 그 사용을 감싸므로 서비스 코드에 직접 보이지 않습니다.

**흔한 오해:** “JPA를 쓰면 SQL을 공부하지 않아도 된다”는 해석입니다. 실제 SQL·테이블·키·조건·트랜잭션의 의미는 남습니다. 성능이나 DB 차이를 확인하려면 생성된 SQL과 테이블 구조도 이해해야 합니다. “Hibernate가 DBMS”라는 해석도 틀립니다. 실제 저장소는 H2 또는 MySQL입니다.

**읽기 실습:** `Menu.java`의 import가 `jakarta.persistence`인지, `MenuRepository.java`의 import가 `org.springframework.data.jpa.repository`인지 확인하세요. 두 파일은 같은 이름의 도구를 쓰는 것이 아닙니다.

## 9. Entity는 DB 한 행을 Java에서 다루는 구조입니다

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

## 10. Repository·Service·Controller·DTO가 맡는 일

### Repository: 저장소에 접근하는 호출

**Repository → 데이터 조회·저장에 사용하는 인터페이스입니다.** 현재 [MenuRepository.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/repository/MenuRepository.java:11)에 있습니다.

```java
public interface MenuRepository extends JpaRepository<Menu, Integer> {
    List<Menu> findByMenuPriceGreaterThan(Integer menuPrice);
}
```

`JpaRepository<Menu, Integer>`는 관리할 엔티티가 `Menu`이고 식별자 타입이 `Integer`라는 뜻입니다. `findById`, `findAll`, `save`, `delete` 같은 기본 동작을 상속받습니다. `findByMenuPriceGreaterThan`은 Spring Data가 메서드 이름의 규칙을 읽어 가격 초과 조건의 질의를 준비합니다. 임의의 영어 이름을 적으면 언제나 원하는 SQL이 만들어지는 것은 아닙니다. [Spring Data JPA 질의 메서드](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html)

**읽기 실습:** `GreaterThan`을 검색한 다음 [MenuService.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/service/MenuService.java:176)에서 누가 그 메서드를 호출하는지 찾으세요. `4500`을 조건으로 전달하면 `4500` 메뉴가 제외된다는 점만 확인합니다.

### Service: 요청을 수행하는 처리 순서

**Service → 업무 규칙과 처리 순서를 담은 객체입니다.** 메뉴 등록에서는 카테고리 유효성 확인, DTO→엔티티 변환, 저장, 응답용 DTO 변환을 묶습니다. `@Service`는 Spring이 이 클래스를 구성 요소로 발견할 수 있게 하는 표시입니다. 기능 자체는 메서드의 Java 코드가 수행합니다. [Spring의 Service 어노테이션](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Service.html)

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

이 발췌는 읽을 핵심만 남긴 부분 코드이며, 그대로 복사해서 컴파일할 완성 메서드는 아닙니다. `@RequestBody`는 HTTP 본문을 객체로 읽어들이도록 연결합니다. 현재 JSON은 메시지 변환기를 통해 `MenuDTO`로 바뀝니다. 서버가 JPA 엔티티를 직접 받는 것이 아닙니다. [Spring RequestBody](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html)

`@RestController`의 반환값은 응답 본문으로 변환되도록 처리됩니다. `ResponseEntity`는 실제 HTTP 상태와 본문을 지정하는 데 사용합니다. 현재 저장 성공 메서드는 201을 돌려줍니다. [Spring ResponseBody](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responsebody.html)

### DTO: 화면과 주고받는 데이터의 구조

**DTO, Data Transfer Object → 계층이나 프로그램 사이에 전달할 값을 담는 객체입니다.** 현재 [MenuDTO.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/dto/MenuDTO.java:12)에는 이름·가격·코드·카테고리명·주문 가능 여부가 있습니다.

| 비교 | Entity `Menu` | DTO `MenuDTO` |
|---|---|---|
| 목적 | DB와 매핑되는 상태·관계 | 요청·응답으로 전달하는 데이터 |
| 카테고리 표현 | `Category category` | `categoryCode`, `categoryName` |
| JPA 표시 | `@Entity`, `@ManyToOne` 등 | 현재 없음 |
| 저장 호출 | Repository가 관리 | 먼저 엔티티로 변환 |

DTO는 JSON과 같은 것이라는 말도 정확하지 않습니다. DTO는 Java 객체이고, JSON은 통신 본문에 사용하는 텍스트 표현입니다. JSON→DTO, DTO→JSON 변환이 일어납니다. 엔티티를 그대로 응답하면 DB 관계와 화면 데이터 구조가 함께 묶이므로, 현재 강의 코드는 DTO를 별도로 둡니다.

**읽기 실습:** [convertToDTO](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/service/MenuService.java:40)에서 `menu.getMenuPrice()`가 DTO 생성자의 어느 자리에 전달되는지 찾으세요. 같은 가격이 다른 형식으로 전달되지만 DB 저장 코드가 다시 실행되는 것은 아닙니다.

## 11. DI는 객체 참조를 넣어주는 일입니다

**DI, Dependency Injection → 객체가 필요로 하는 다른 객체를 외부에서 제공하는 방식입니다.** 현재 Spring이 서비스에 Repository 객체를, Controller에 Service 객체를 생성자 인자로 전달합니다. [Spring DI 설명](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)

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

## 12. 트랜잭션과 변경 감지

**Transaction → 여러 DB 작업을 하나의 완료·취소 단위로 다루는 범위입니다.** **Commit → 변경을 확정하는 처리입니다.** **Rollback → 그 트랜잭션의 변경을 취소하는 처리입니다.** 메뉴 등록·수정·삭제 메서드에는 `@Transactional`이 붙어 있습니다.

왜 필요한지는 수정 메서드에서 보입니다. 기존 메뉴를 읽고, 이름·가격·상태를 바꾸고, 카테고리까지 바꾸는 흐름을 한 작업으로 처리하고 싶습니다. 도중에 실패했는데 일부 변경만 남는 상황을 막기 위한 범위입니다. Spring Data 공식 설명도 여러 Repository를 묶는 서비스에서 트랜잭션 경계를 지정하는 방법을 보여줍니다. [Spring Data 트랜잭션](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html)

[MenuService.updateMenu](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/service/MenuService.java:218)는 조회한 `foundMenu`에 setter를 호출하지만 `save`를 다시 호출하지 않습니다.

```java
foundMenu.setMenuName(menuDTO.getMenuName());
foundMenu.setMenuPrice(menuDTO.getMenuPrice());
foundMenu.setOrderableStatus(menuDTO.getOrderableStatus());
```

현재 트랜잭션 안에서 조회한 엔티티는 JPA가 관리하는 상태이므로, 변경을 추적하고 DB와 동기화하는 시점에 UPDATE가 수행됩니다. **Dirty checking, 변경 감지 → 관리 중인 엔티티의 달라진 값을 확인하는 기능입니다.** 어떤 Java 객체나 전역 변수든 바꾸면 DB에 저장된다는 기능이 아닙니다. [Hibernate 객체 상태와 저장 설명](https://docs.hibernate.org/orm/7.4/introduction/html_single/)

`@Transactional`은 모든 예외나 어떤 호출에서나 동일하게 적용되는 마법이 아닙니다. 기본 규칙에서는 `RuntimeException`과 `Error`가 롤백 대상으로 취급되고 checked exception은 별도 규칙이 필요할 수 있습니다. 기본 프록시 방식에서 같은 객체 내부의 자기 호출은 별도로 붙인 트랜잭션을 새로 적용하는 호출이 아닙니다. 지금은 Controller가 Spring이 관리하는 Service를 호출하는 흐름을 기준으로 읽으세요. [Transactional API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/Transactional.html), [Spring 트랜잭션 적용 방식](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)

또한 `menuRepository.save(...)` 반환 순간과 모든 DB 변경 확정 순간이 항상 같지는 않습니다. 저장 SQL이 실행되는 시점, JPA flush, 트랜잭션 commit은 구별되는 처리입니다. 처음에는 “현재 서비스의 변경 작업이 트랜잭션 범위에서 완료된다”까지 이해하고, 더 공부할 때 정확한 실행 시점을 확인하면 됩니다.

**읽기 실습:** `saveMenu`, `updateMenu`, `deleteMenu` 위의 어노테이션을 찾으세요. 수정 메서드 끝의 반환값은 `MenuDTO`이고, 삭제 메서드 반환 타입은 `void`입니다. `void`가 데이터 삭제 실패라는 뜻은 아닙니다. 이 메서드가 호출자에게 값을 반환하지 않는다는 뜻입니다.

## 13. 아메리카노와 4500의 실제 이동

두 흐름을 나누어 봅니다. 첫 번째는 앱 시작 때 빈 DB를 채우는 흐름이고, 두 번째는 화면이 저장된 메뉴를 조회하는 흐름입니다. 같은 메뉴 이름을 쓰지만 시작 데이터 입력이 HTTP 등록 요청을 대신 호출하는 것은 아닙니다.

### 시작 데이터: 숫자를 엔티티에 저장하기

[DemoDataConfig.java](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/config/DemoDataConfig.java:44)의 호출입니다.

```java
add("아메리카노", 4500, coffee, "Y");
```

선택한 값은 `4500` 하나입니다. 이 값의 이동만 보면 다음과 같습니다.

1. 호출문의 정수 값 `4500`이 `add`의 `int price` 매개변수로 전달됩니다.
2. `Menu menu = new Menu();`에서 새 메뉴 객체를 만듭니다.
3. `menu.setMenuPrice(price)`가 호출되어 `4500`이 `Menu`의 `menuPrice` 필드에 저장됩니다.
4. `menus.save(menu)`가 그 엔티티를 저장하도록 요청합니다.
5. Hibernate가 엔티티 매핑을 사용하고 JDBC를 통해 H2에 SQL을 전달합니다.
6. DB의 `tbl_menu.menu_price`에 해당 메뉴의 가격이 보관됩니다.

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

**읽기 실습:** 서버가 이미 켜져 있을 때만 브라우저에서 [메뉴 조회](http://localhost:8090/api/menus)를 열어 `아메리카노`를 찾으세요. 응답의 `menuPrice`를 확인하고 `MenuService.convertToDTO`의 해당 getter와 연결해보세요. 메뉴가 나중에 수정되었다면 현재 값이 원래 예시 값과 다를 수 있습니다. 조회 결과를 현재 사실로, `DemoDataConfig`의 값을 초기 예시로 구분하세요.

## 14. 저장 실패는 어디에서 응답으로 바뀌나요?

**Exception → 정상 처리 흐름을 중단하고 실패를 전달하는 Java 방식입니다.** 현재 존재하지 않는 카테고리를 저장 요청에 넣으면 [findCategoryOrThrow](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/service/MenuService.java:71)가 `IllegalArgumentException`을 던집니다. [ExceptionController](C:/Study-saltlux-ai-agent-service/90_Project/08_vibe-menu-assignment/backend/src/main/java/com/ohgiraffers/springdatajpa/exception/ExceptionController.java:52)가 이를 HTTP 400 응답으로 바꿉니다.

없는 메뉴 코드를 조회했을 때는 `MenuNotFoundException`이 발생하고 해당 처리기가 HTTP 404를 돌려줍니다. Java 예외와 HTTP 상태 코드는 서로 다른 표현이므로 중간에서 연결하는 코드가 필요합니다.

현 앱은 프론트엔드의 필수값·가격·상태 검사를 구현했고, 백엔드에는 강의 코드의 카테고리 존재 확인 같은 처리가 있습니다. `@RequestBody`를 붙였다고 모든 업무 유효성 규칙이 자동 검증되는 것은 아닙니다. 현재 DTO에 모든 필드별 검증 어노테이션이 있는 것도 아닙니다. 화면 검사를 통과했다는 사실과 다른 API 클라이언트의 잘못된 입력까지 서버가 모두 막는다는 사실은 구별해야 합니다.

**읽기 실습:** 고의로 잘못된 등록 요청을 보내기보다 예외 처리 파일에서 `IllegalArgumentException`, `BAD_REQUEST`, `MenuNotFoundException`, `NOT_FOUND` 네 단어만 연결하세요. 기존 데이터를 바꾸지 않고도 실패 흐름을 읽을 수 있습니다.

## 15. 한 번에 기억할 대응표

| 동희님 표현 | 정확히 가리키는 것 | 바로 읽을 실물 |
|---|---|---|
| 서버를 복사했다 | 서버를 만드는 프로젝트 소스·설정 복사 | `backend` 폴더 |
| 서버를 켰다 | Java 프로세스에서 Spring Boot 앱 실행 | `main`, 실행 로그, 8090 응답 |
| DB를 준비했다 | DBMS 의존성·연결·테이블·초기 데이터 구성 | H2 설정과 `DemoDataConfig` |
| 메뉴를 저장했다 | 엔티티 저장 요청과 DB 변경 완료 | `MenuService.saveMenu` |
| 서버와 DB를 연결했다 | JDBC 연결 구성으로 DB에 접근 가능하게 함 | `spring.datasource.*` |
| React와 서버를 연결했다 | 브라우저 코드가 HTTP API 요청·응답을 처리 | 프론트엔드 `src/api` |
| MySQL로 바꾼다 | 실행 DB 연결 대상을 별도 MySQL로 선택·준비 | `application-mysql.yaml`, 별도 검증 필요 |
| 빌드했다 | 코드를 검사·컴파일·패키징 | Gradle 결과와 JAR |

읽기를 마치면 먼저 한 문장으로 연결해보세요. **“React의 메뉴 조회 요청을 Controller가 받아 Service를 호출하고, Repository 아래의 Hibernate·JDBC가 DB에서 메뉴를 읽어 DTO·JSON으로 돌려준다.”** 각 이름을 실제 파일 한 곳과 연결할 수 있다면 서버 구조의 첫 목표를 달성한 것입니다.

## 공식 근거를 더 읽을 때

본문 출처는 용어와 기능을 확인한 공식 자료이며, 우리 앱의 실제 상태는 해당 코드와 검증 기록으로 확인합니다. 문서 사이트의 최신 버전과 로컬 프로젝트의 해결된 라이브러리 버전이 언제나 같다고 가정하지 않습니다.

- [H2 제품 소개](https://h2database.com/html/main.html): Java SQL DB와 지원 모드.
- [H2 내장 시작](https://h2database.com/html/quickstart.html#embedding): 드라이버·연결·DB 생성.
- [H2 기능과 호환 모드](https://h2database.com/html/features.html): 저장 방식·연결 방식·부분 호환.
- [MySQL 소개](https://dev.mysql.com/doc/refman/8.4/en/what-is-mysql.html): DBMS·관계형 데이터·SQL·클라이언트/서버.
- [Spring Boot SQL](https://docs.spring.io/spring-boot/reference/data/sql.html): DataSource와 JDBC/ORM 접근.
- [Spring Boot DB 초기화](https://docs.spring.io/spring-boot/how-to/data-initialization.html): Hibernate DDL 설정.
- [Spring Boot 프로필](https://docs.spring.io/spring-boot/reference/features/profiles.html): 기본·활성 프로필.
- [Spring Boot 외부 설정](https://docs.spring.io/spring-boot/reference/features/external-config.html): YAML·환경변수·외부 값.
- [Spring Boot 실행 패키징](https://docs.spring.io/spring-boot/gradle-plugin/packaging.html): `bootJar`, `java -jar`.
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa/): Repository 지원의 목적.
- [Spring Data JPA 질의](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html): 메서드 이름과 조건.
- [Spring Data JPA 트랜잭션](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html): 서비스의 처리 범위.
- [Spring DI](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html): 생성자 인자로 협력 객체 제공.
- [Spring RequestBody](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html): HTTP 본문→객체.
- [Spring ResponseBody](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responsebody.html): 객체→HTTP 본문.
- [Spring Transactional API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/Transactional.html): 기본 롤백 규칙.
- [Spring 트랜잭션 프록시](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html): 호출 방식에 따른 적용 경계.
- [Hibernate ORM API](https://docs.hibernate.org/orm/7.4/javadocs/): ORM·JPA 구현의 구분.
- [Hibernate 입문](https://docs.hibernate.org/orm/7.4/introduction/html_single/): 엔티티·관리 상태·저장.
