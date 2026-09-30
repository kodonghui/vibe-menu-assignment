"""과제 전용 백과사전. JSONL 원본에서 오프라인 HTML과 Markdown을 생성한다.

최초 통합: python scripts/build-encyclopedia.py --import-research
내용 보충: private-notes/data/vibe-menu-encyclopedia.jsonl 수정 후 기본 실행.
기존 학습 색인·노트 HTML·과제 앱은 변경하지 않는다.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
STUDY = PROJECT.parents[1]
sys.path.insert(0, str(STUDY / "scripts"))
import study_note as note
from lib.diagram import render_diagram

SOURCE = STUDY / "private-notes/data/vibe-menu-encyclopedia.jsonl"
OUT = PROJECT / "docs"
TICK = chr(96)
FENCE = TICK * 3

GLOSSARY = """
스택|서비스를 만드는 기술들의 조합입니다.|이 과제는 React·Spring Boot·H2를 함께 사용합니다.
프론트엔드|사용자 화면과 입력·클릭을 처리하는 부분입니다.|브라우저의 메뉴 등록 폼입니다.
백엔드|요청을 받아 규칙을 처리하고 데이터 저장·조회를 수행하는 부분입니다.|8090의 Spring Boot 프로그램입니다.
클라이언트|다른 프로그램에 요청을 보내는 역할입니다.|React와 Swagger UI가 API 클라이언트가 됩니다.
서버|요청을 기다렸다가 처리 결과를 응답하는 역할의 프로그램입니다.|GET /api/menus에 메뉴 목록을 응답합니다.
브라우저|웹 문서를 표시하고 JavaScript를 실행하는 프로그램입니다.|React 화면을 읽고 Axios 요청을 보냅니다.
DB|특정 목적의 데이터와 그 저장 구조입니다.|메뉴와 카테고리 데이터입니다.
DBMS|데이터를 저장·조회·변경하도록 관리하는 소프트웨어입니다.|H2와 MySQL은 관계형 DBMS입니다.
관계형 DB|테이블·행·열과 관계로 데이터를 표현하는 데이터베이스입니다.|메뉴 행이 카테고리 번호를 참조합니다.
테이블|같은 구조의 행을 담는 데이터 구조입니다.|메뉴 테이블은 이름·가격 등의 열을 가집니다.
행|테이블에서 한 개의 데이터 기록입니다.|아메리카노 4500원에 해당하는 기록입니다.
열|각 행의 특정 속성을 담는 자리입니다.|가격을 담는 menu_price 열입니다.
기본키|행을 고유하게 구별하는 키입니다.|메뉴 번호 menuCode에 대응합니다.
외래키|다른 테이블의 키를 참조하는 값입니다.|메뉴가 참조하는 categoryCode입니다.
SQL|관계형 DB에 조회·변경·구조 정의를 요청하는 언어입니다.|SELECT는 데이터를 조회합니다.
CRUD|생성·조회·수정·삭제 네 작업의 묶음입니다.|메뉴 등록·목록·수정·삭제입니다.
H2|Java로 구현된 관계형 DBMS입니다.|기본 dev에서 내장 파일 DB로 실행합니다.
MySQL|현재 수업에서 사용한 관계형 DBMS 제품입니다.|mysql 프로필의 기본 주소는 localhost:3306입니다. 실제 연결은 별도 준비·검증이 필요합니다.
내장 DB|애플리케이션 프로세스 안에서 DB 엔진이 함께 실행되는 방식입니다.|현재 H2가 Spring Boot와 같은 JVM에서 실행합니다.
파일 DB|지속할 데이터를 디스크 파일에 저장하는 방식입니다.|vibe-menu.mv.db가 남습니다.
메모리 DB|주로 메모리 안에서 데이터를 보관하는 DB 실행 설정입니다.|JPA 테스트의 H2 메모리 DB는 개발 파일 DB와 분리됩니다.
JDBC|Java에서 DB에 연결하고 SQL을 실행하는 표준 API입니다.|Hibernate가 JDBC를 통해 H2에 접근합니다.
드라이버|특정 DB 제품과 통신하는 구현입니다.|H2는 org.h2.Driver, MySQL은 com.mysql.cj.jdbc.Driver입니다.
JPA|Java 객체와 관계형 데이터의 매핑·영속성을 다루는 표준입니다.|엔티티를 저장하고 조회하는 규칙을 제공합니다.
Hibernate|JPA를 구현하는 ORM 라이브러리입니다.|객체의 저장을 SQL·JDBC 동작으로 연결합니다.
ORM|객체와 관계형 테이블 구조를 연결하는 방식입니다.|Menu 객체와 메뉴 행을 매핑합니다.
엔티티|JPA가 테이블과 연결해 관리하는 Java 객체의 유형입니다.|Menu의 필드가 메뉴 데이터에 대응합니다.
DTO|계층 사이 또는 요청·응답에 전달할 값의 구조입니다.|MenuDTO가 React에 메뉴 정보를 전달합니다.
Controller|HTTP 요청을 메서드와 연결하고 응답을 만드는 계층입니다.|MenuController가 POST /api/menus를 받습니다.
Service|업무 규칙과 처리 순서를 수행하는 계층입니다.|MenuService.saveMenu가 카테고리를 확인하고 저장합니다.
Repository|엔티티의 저장·조회 등 영속성 접근을 담당하는 계층입니다.|MenuRepository.save와 findById를 사용합니다.
Bean|Spring 컨테이너가 생성·관리하는 객체입니다.|주입받는 MenuService 객체입니다.
DI|필요한 객체의 참조를 외부에서 넣어주는 방식입니다.|생성자 매개변수로 MenuRepository를 전달받습니다.
트랜잭션|함께 성공하거나 함께 실패하도록 묶는 데이터 작업의 경계입니다.|메뉴 등록 도중 실패하면 해당 작업을 롤백합니다.
변경 감지|관리 중인 엔티티의 변경을 영속성 처리에 반영하는 기능입니다.|수정 메서드의 필드 변경이 커밋 시 반영됩니다.
Java|현재 서버 코드를 작성하는 프로그래밍 언어입니다.|MenuService.java의 언어입니다.
JavaScript|브라우저 로직과 React 코드를 작성하는 언어입니다.|menu.js와 JSX 컴포넌트의 바탕입니다.
JVM|Java 바이트코드를 실행하는 가상 머신입니다.|실행된 JAR 안의 서버 클래스를 처리합니다.
Gradle|Java 프로젝트의 의존성·컴파일·테스트·패키징을 관리하는 빌드 도구입니다.|gradlew.bat test bootJar를 실행했습니다.
Wrapper|프로젝트가 지정한 Gradle 버전을 실행하는 진입점입니다.|gradlew.bat와 gradle-wrapper.properties입니다.
JAR|Java 클래스와 자원을 묶는 파일 형식입니다.|bootJar 결과를 java -jar로 실행합니다.
YAML|들여쓰기로 설정 구조를 표현하는 텍스트 형식입니다.|application-dev.yaml의 DB 설정입니다.
프로필|환경별 설정과 동작을 선택하는 Spring 기능입니다.|dev는 H2, mysql은 MySQL 연결 설정입니다.
의존성|프로그램이 사용하는 외부 라이브러리나 패키지입니다.|springdoc, H2, Axios입니다.
HTTP|클라이언트와 서버가 요청·응답을 교환하는 규칙입니다.|브라우저의 POST와 서버의 201 응답입니다.
API|프로그램 사이에 제공하는 기능과 사용 계약입니다.|메뉴 목록 조회와 등록 창구입니다.
REST|리소스·표현·상태 없는 요청 등 제약으로 시스템을 구성하는 아키텍처 스타일입니다.|우리 과제는 메뉴 리소스 중심 HTTP API를 사용합니다.
URL|대상 리소스의 위치와 접근 정보를 나타내는 주소입니다.|메뉴 조회 주소는 http://localhost:8090/api/menus 입니다.
localhost|현재 요청을 보내는 컴퓨터 자신을 가리키는 호스트 이름입니다.|친구 PC의 localhost는 친구 PC 자신입니다.
포트|호스트 안에서 네트워크 요청을 받는 프로그램을 구분하는 번호입니다.|React 개발 서버5175와 API 서버8090입니다.
출처|브라우저가 스킴·호스트·포트의 조합으로 구분하는 origin입니다.|5175와8090은 포트가 달라 다른 출처입니다.
경로|URL에서 리소스를 구분하는 부분입니다.|/api/menus/8입니다.
쿼리|URL의 물음표 뒤에 붙이는 요청 매개변수입니다.|page=1&size=12입니다.
헤더|HTTP 메시지의 형식과 부가 정보를 전달하는 부분입니다.|Content-Type: application/json입니다.
본문|요청·응답에서 실제 전달할 데이터를 담는 부분입니다.|등록할 메뉴의 JSON입니다.
JSON|언어에 독립적으로 구조화한 데이터를 적는 텍스트 형식입니다.|menuName과 menuPrice를 서버로 전달합니다.
GET|리소스를 조회하도록 요청하는 HTTP 메서드입니다.|GET /api/menus입니다.
POST|대상에 데이터를 보내 처리하도록 요청하는 HTTP 메서드입니다.|이 과제의 POST /api/menus는 메뉴 등록입니다.
PUT|대상 리소스의 표현을 교체하도록 요청하는 HTTP 메서드입니다.|현재 수정 API는 폼의 전체 값을 보냅니다.
DELETE|대상 리소스를 삭제하도록 요청하는 HTTP 메서드입니다.|DELETE /api/menus/8입니다.
상태 코드|HTTP 처리 결과를 나타내는 숫자입니다.|200 성공, 201 생성, 400 요청 오류, 404 대상 없음입니다.
OpenAPI|HTTP API를 기술하는 표준 문서 구조입니다.|servers·tags·paths·components를 정의합니다.
스키마|데이터의 필드·타입·제약 등을 설명하는 구조입니다.|MenuDTO의 menuPrice가 정수라는 정의입니다.
Swagger UI|OpenAPI를 사람이 읽고 실제 API를 시험할 수 있게 보여주는 도구입니다.|swagger-ui/index.html의 개발자 화면입니다.
springdoc|Spring 앱의 코드·어노테이션에서 OpenAPI를 생성하는 라이브러리입니다.|/v3/api-docs와 Swagger UI를 연결합니다.
code-first|구현 코드를 바탕으로 명세를 생성하는 개발 방식입니다.|현재 Java 코드에서 명세를 생성합니다.
contract-first|API 계약을 먼저 정하고 구현을 맞추는 개발 방식입니다.|명세를 먼저 작성하고 코드 생성 등을 선택합니다.
CORS|브라우저의 다른 출처 요청에서 응답 접근을 허용하는 규칙입니다.|8090이 5175의 요청 출처를 허용합니다.
preflight|브라우저가 일부 교차 출처 요청 전에 보내는 사전 확인입니다.|JSON POST 전에 OPTIONS가 보일 수 있습니다.
React|컴포넌트로 사용자 인터페이스를 구성하는 JavaScript 라이브러리입니다.|메뉴 폼과 상세 화면을 구성합니다.
컴포넌트|화면의 일부를 표현하고 재사용하는 단위입니다.|Layout·Feedback·MenuFormPage입니다.
JSX|JavaScript 안에서 UI 구조를 표현하는 문법 확장입니다.|MenuFormPage.jsx의 입력창 구조입니다.
props|부모 컴포넌트가 자식에게 전달하는 입력입니다.|Feedback에 loading과 error를 전달합니다.
state|컴포넌트가 기억하며 갱신에 따라 화면에 반영하는 값입니다.|메뉴 이름 입력값을 보관합니다.
렌더링|현재 입력·상태를 바탕으로 화면 표현을 계산·반영하는 과정입니다.|state 변경 후 입력창 표시를 갱신합니다.
이벤트|클릭·입력 등 사용자 행동을 알리는 신호입니다.|onChange와 onSubmit입니다.
제어 입력|React의 state와 value로 입력값을 관리하는 방식입니다.|이름 입력을 폼 상태와 연결합니다.
Hook|React 기능을 함수 컴포넌트에서 사용하는 함수입니다.|useState·useEffect·자체 useResource입니다.
Promise|나중에 성공하거나 실패할 비동기 결과를 표현하는 객체입니다.|Axios 요청의 응답 결과입니다.
async/await|Promise를 기다리는 흐름을 작성하는 JavaScript 문법입니다.|await createMenu(payload)입니다.
Axios|HTTP 요청·응답을 다루는 JavaScript 라이브러리입니다.|API 계층에서 JSON POST를 보냅니다.
React Router|React 화면의 주소와 이동을 관리하는 라이브러리입니다.|/menus/new와 상세 화면을 연결합니다.
Node.js|브라우저 밖에서 JavaScript를 실행하는 런타임입니다.|Vite와 토큰 생성 스크립트를 실행합니다.
npm|패키지 설치와 package.json 스크립트를 실행하는 도구입니다.|npm ci와 npm run build입니다.
Vite|프론트 개발 서버와 빌드를 제공하는 도구입니다.|5175 개발 화면과 dist 결과를 만듭니다.
빌드|소스를 실행·배포에 사용할 형태로 처리하는 작업입니다.|bootJar와 Vite build는 대상이 다릅니다.
CSS Module|CSS 클래스 이름을 모듈 범위로 처리하는 방식입니다.|Scaffold.module.css를 import합니다.
디자인 시스템|여러 화면에 일관된 규칙·컴포넌트·사용 기준을 적용하는 체계입니다.|같은 역할의 버튼·입력창·카드 규칙입니다.
디자인 토큰|색·간격·글자·모서리 등 디자인 값을 이름 붙여 관리하는 데이터입니다.|montage.tokens.json에서 tokens.css를 생성합니다.
semantic 토큰|값의 역할과 의미를 이름으로 나타내는 토큰입니다.|텍스트·배경·주요 동작 같은 의미의 색입니다.
Git|파일 변경의 버전을 관리하는 도구입니다.|우리 과제의 코드 변경을 기록합니다.
GitHub|Git 저장소를 호스팅하고 협업하는 서비스입니다.|최종 제출물인 저장소 URL입니다.
배포|사용할 환경에 결과물을 올리고 실행 가능하게 하는 작업입니다.|로컬 실행·GitHub 게시와 구별합니다.
E2E|사용자 흐름의 여러 구성 요소를 끝까지 연결해 검사하는 범위입니다.|브라우저 입력에서 서버 저장과 화면 표시까지 확인합니다.
""".strip()

TERMS = [{"term": a, "plain": b, "examples": [c]} for a, b, c in (line.split("|", 2) for line in GLOSSARY.splitlines())]

def sequence_svg(content: str) -> str:
    names, messages = {}, []
    for line in content.splitlines():
        line = line.strip()
        match = re.match(r"(?:actor|participant)\s+(\w+)\s+as\s+(.+)", line)
        if match:
            names[match[1]] = match[2]
            continue
        match = re.match(r"(\w+)(-+>>|-+>)(\w+):\s*(.+)", line)
        if match:
            names.setdefault(match[1], match[1]); names.setdefault(match[3], match[3])
            messages.append((match[1], match[3], match[4], "--" in match[2]))
        elif line.startswith(("alt ", "else ", "opt ")):
            messages.append(("", "", line.split(" ", 1)[1], False))
    if not names or not messages:
        raise ValueError("읽을 수 없는 시퀀스입니다.")
    keys = list(names)
    width = max(760, len(keys) * 260)
    height = 120 + len(messages) * 58
    xs = {key: 115 + i * (width - 230) / max(1, len(keys) - 1) for i, key in enumerate(keys)}
    parts = [f'<svg viewBox="0 0 {width} {height}">',
             '<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#35516b"/></marker></defs>']
    for key in keys:
        x = xs[key]
        parts += [f'<rect x="{x-103}" y="12" width="206" height="48" rx="8" fill="#edf4ff" stroke="#35516b"/>',
                  f'<text x="{x}" y="43" text-anchor="middle" font-size="17" fill="#18344e">{html.escape(names[key])}</text>',
                  f'<line x1="{x}" y1="64" x2="{x}" y2="{height-20}" stroke="#8898a5" stroke-dasharray="4 4"/>']
    for i, (start, end, label, dashed) in enumerate(messages):
        y = 102 + i * 58
        if not start:
            parts += [f'<rect x="18" y="{y-22}" width="{width-36}" height="34" fill="#f6f0e3"/>',
                      f'<text x="32" y="{y}" font-size="16" fill="#594322">조건: {html.escape(label)}</text>']
        elif start == end:
            x = xs[start]
            parts += [f'<path d="M{x} {y} h45 v20 h-45" fill="none" stroke="#35516b" marker-end="url(#arrow)"/>',
                      f'<text x="{x+52}" y="{y+14}" font-size="15" fill="#18344e">{html.escape(label)}</text>']
        else:
            a, b = xs[start], xs[end]
            parts += [f'<line x1="{a}" y1="{y}" x2="{b}" y2="{y}" stroke="#35516b" {"stroke-dasharray=\"6 4\"" if dashed else ""} marker-end="url(#arrow)"/>',
                      f'<text x="{(a+b)/2}" y="{y-9}" text-anchor="middle" font-size="16" fill="#18344e">{html.escape(label)}</text>']
    return "".join(parts) + "</svg>"

def mermaid_diagram(content: str) -> dict:
    if "sequenceDiagram" in content:
        return {"type": "diagram", "diagram_type": "svg", "content": sequence_svg(content),
                "aria_label": "참여자별 요청과 응답을 따라가는 시퀀스", "caption": "시퀀스 · 위에서 아래로 읽습니다. 조건 줄은 성공과 실패 경로를 구분합니다."}
    names, edges = {}, []
    for line in content.splitlines():
        for key, label in re.findall(r'(\w+)\[([^\]]+)\]', line):
            names[key] = label.strip('"').replace("<br/>", " · ")
        pieces = line.strip().split("-->")
        for a, b in zip(pieces, pieces[1:]):
            aa = re.match(r'(\w+)', a.strip()); bb = re.match(r'(\w+)', b.strip())
            if aa and bb:
                edges.append((aa[1], bb[1]))
    if not edges:
        raise ValueError("지원하지 않는 Mermaid를 임의로 그리지 않습니다.")
    width, height = 1000, 42 + len(edges) * 66
    svg = [f'<svg viewBox="0 0 {width} {height}">']
    for i, (a, b) in enumerate(edges):
        y = 24 + i * 66
        for x, key in [(20, a), (535, b)]:
            svg += [f'<rect x="{x}" y="{y}" width="440" height="44" rx="7" fill="#edf4ff" stroke="#35516b"/>',
                    f'<text x="{x+220}" y="{y+28}" text-anchor="middle" font-size="16" fill="#18344e">{html.escape(names.get(key,key))}</text>']
        svg += [f'<path d="M470 {y+22}h52m-12-8 12 8-12 8" fill="none" stroke="#35516b" stroke-width="2"/>']
    return {"type": "diagram", "diagram_type": "svg", "content": "".join(svg)+"</svg>",
            "aria_label": "구성 요소 사이의 방향 관계 목록", "caption": "관계도 · 각 줄은 왼쪽에서 오른쪽으로 연결됩니다. 줄의 위아래 순서는 실행 순서가 아닙니다."}

def split_cells(line: str) -> list[str]:
    # 코드 안의 파이프는 열 구분자로 사용하지 않는다.
    cells, current, quoted = [], "", False
    for char in line.strip().strip("|"):
        if char == TICK: quoted = not quoted
        if char == "|" and not quoted: cells.append(current.strip()); current = ""
        else: current += char
    return cells + [current.strip()]

def parse_blocks(markdown: str) -> list[dict]:
    lines = markdown.strip().splitlines()
    result, i = [], 0
    while i < len(lines):
        line = lines[i].strip()
        if not line: i += 1; continue
        if line.startswith(FENCE):
            language = line[3:].strip() or "text"
            code = []; i += 1
            while i < len(lines) and not lines[i].strip().startswith(FENCE):
                code.append(lines[i]); i += 1
            content = "\n".join(code)
            result.append(mermaid_diagram(content) if language == "mermaid" else {"type":"code","language":language,"content":content})
            i += 1; continue
        if line.startswith("|") and i+1 < len(lines) and re.match(r"^\|?[\s:|-]+\|", lines[i+1].strip()):
            headers = split_cells(lines[i]); rows = []; i += 2
            while i < len(lines) and lines[i].strip().startswith("|"):
                row = split_cells(lines[i])
                if len(row) != len(headers): raise ValueError("표의 열 개수가 다릅니다: "+lines[i])
                rows.append(row); i += 1
            result.append({"type":"table","headers":headers,"rows":rows}); continue
        if re.match(r"^(?:[-*]|\d+\.) ", line):
            items = []
            while i < len(lines) and re.match(r"^(?:[-*]|\d+\.) ", lines[i].strip()):
                items.append(re.sub(r"^(?:[-*]|\d+\.) ", "", lines[i].strip())); i += 1
            result.append({"type":"list","items":items}); continue
        if line.startswith("#"):
            title = re.sub(r"^#+\s*", "", line)
            result.append({"type":"paragraph","text":title,"emph":[title]}); i += 1; continue
        paragraph = [line.lstrip("> ").strip()]; i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r"^(?:#|\||[-*] |\d+\. |"+FENCE+")", lines[i].strip()):
            paragraph.append(lines[i].strip().lstrip("> ")); i += 1
        text = " ".join(paragraph)
        block = {"type":"paragraph","text":text}
        strong = re.findall(r"\*\*([^*]+)\*\*", text)
        if strong: block["emph"] = [strong[0]]
        result.append(block)
    references = []
    def clean(text: str) -> str:
        def replace_link(match):
            references.append((match[1], match[2]))
            return match[1]
        text = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", replace_link, text)
        # 실제 로컬 주소는 본문에서 host:port로 읽고 전체 주소는 출처 칸에 보관한다.
        def replace_url(match):
            value=match[0].rstrip(".,")
            references.append(("주소",value))
            return value.removeprefix("https://").removeprefix("http://")
        return re.sub(r"https?://[^\s"+TICK+r")]+",replace_url,text)
    for block in result:
        if block["type"]=="paragraph":
            old=block["text"]; block["text"]=clean(old)
            if block.get("emph")==[old]: block["emph"]=[block["text"]]
            elif "emph" in block: block["emph"]=[clean(t) for t in block["emph"]]
        elif block["type"]=="list": block["items"]=[clean(t) for t in block["items"]]
        elif block["type"]=="table":
            block["headers"]=[clean(t) for t in block["headers"]]
            block["rows"]=[[clean(t) for t in row] for row in block["rows"]]
    if references:
        unique=list(dict.fromkeys(references))
        result.append({"type":"code","language":"text","content":"공식 자료와 전체 주소\n"+"\n".join("["+label+"]("+url+")" for label,url in unique)})
    return result

def sections(filename: str) -> list[tuple[str,str]]:
    text = (OUT/"encyclopedia-research"/filename).read_text(encoding="utf-8")
    pieces = re.split(r"(?m)^(## .+)$", text)
    return [(pieces[i][3:], pieces[i]+"\n"+pieces[i+1]) for i in range(1,len(pieces),2)]

def numbered(source: list[tuple[str,str]], first: int, last: int, prefix="") -> str:
    return "\n\n".join(content for title,content in source if (match:=re.match(prefix+r"(\d+)\.",title)) and first<=int(match[1])<=last)

def glossary_markdown() -> str:
    return "## 용어를 찾는 방법\n\n검색창에 H2, state, DTO처럼 막힌 말을 입력하세요. 정의와 실제 과제에서의 예를 함께 읽고 해당 장으로 돌아가세요.\n\n"+"".join("### "+t["term"]+"\n\n"+t["plain"]+"\n\n과제에서의 예: "+t["examples"][0]+"\n\n" for t in TERMS)

def import_research() -> None:
    overview, back, api, front = (sections(name) for name in ("overview.md","backend.md","api.md","frontend.md"))
    get = lambda ids: "\n\n".join(overview[i][1] for i in ids)
    plans = [
      ("start","처음 세 질문",get([0]),"H2 선택·명세 생성 방향·Swagger 역할을 먼저 구분합니다.",["H2 선택은 Codex의 구현 판단입니다.","Java 코드에서 OpenAPI가 생성됩니다.","Swagger UI는 명세 열람과 API 실행 도구입니다."],["사용자가 H2를 지정했나요?","프로그램이 JSON 문서를 읽어 메뉴를 저장하나요?","Swagger의 실행 버튼은 실제 데이터를 바꾸나요?"],["아닙니다. dev 프로필의 H2는 Codex가 선택했고 mysql 프로필은 별도로 준비했습니다.","현재 Java와 React는 api-docs.json을 메뉴 실행에 사용하지 않습니다. Java에서 springdoc가 문서를 생성합니다.","GET은 조회 연습이며 POST·PUT·DELETE는 8090 서버의 실제 DB를 변경합니다."],["dev","springdoc","GET"]),
      ("flow","메뉴 하나의 여행",get([1,2]),"입력값은 React·HTTP·Java 객체·DB 행으로 표현을 바꾸며 이동합니다.",["5175 화면과8090 API 서버는 다른 역할입니다.","DTO와 엔티티는 전달과 저장의 목적이 다릅니다.","최종 디자인과 GitHub 제출은 아직 남아 있습니다."],["두 프로그램이 같은 컴퓨터면 하나인가요?","저장 성공과 화면 이동 중 무엇이 먼저인가요?","이 자료가 완성되면 과제도 제출됐나요?"],["같은 localhost라도 5175와8090은 별도 실행 프로그램이며 서로 HTTP로 통신합니다.","createMenu의 응답에서 saved.menuCode를 얻은 뒤 상세 화면으로 이동합니다.","아닙니다. HTML 학습 자료 생성과 GitHub 게시·Discord 제출은 별개의 완료 상태입니다."],["localhost:5175","saved.menuCode","GitHub"]),
      ("database","H2와 MySQL",numbered(back,2,6),"H2와 MySQL은 다른 관계형 DBMS이며, 현재 기본 실행은 H2 내장 파일 DB입니다.",["파일/메모리와 내장/서버는 다른 구분 축입니다.","H2의 MySQL 호환 모드는 완전한 동일성을 보장하지 않습니다.","MySQL 프로필은 준비됐지만 연결 검증은 별도입니다."],["H2 데이터는 재실행하면 없어지나요?","수업 MySQL로 바꾸면 기존 H2 데이터도 따라가나요?","MODE=MySQL이면 MySQL 검사가 끝난 건가요?"],["현재 jdbc:h2:file 설정은 vibe-menu.mv.db에 저장합니다. jdbc:h2:mem 테스트와 다릅니다.","mysql 프로필은 다른 DB에 접속합니다. H2 데이터가 자동으로 MySQL에 이전되는 것은 아닙니다.","아닙니다. MODE=MySQL은 일부 호환 설정이며 실제 MySQL 드라이버·서버에서 별도 검증해야 합니다."],["jdbc:h2:file","mysql","MODE=MySQL"]),
      ("java-run","Java 서버 실행",numbered(back,1,1)+"\n\n"+numbered(back,7,7)+"\n\n"+get([4]),"Java 소스의 빌드 결과인 JAR를 JVM에서 실행하면 API 서버가 요청을 받습니다.",["소스·빌드 결과·실행 중 프로그램을 구별합니다.","Gradle Wrapper는 프로젝트 지정 버전을 실행합니다.","YAML 설정과 DB 파일은 코드와 다른 역할입니다."],["폴더를 복사하면 서버가 켜지나요?","8090 번호는 누가 정하나요?","React build도 JAR를 만들나요?"],["backend 폴더 복사와 java -jar 실행은 다른 동작입니다. 실행된 프로그램이 요청을 받습니다.","application.yaml의 server.port 기본값8090을 사용합니다. 환경변수 SERVER_PORT로 바꿀 수 있습니다.","아닙니다. bootJar는 서버 JAR, Vite build는 브라우저 정적 파일 dist를 만듭니다."],["java -jar","server.port","bootJar"]),
      ("java-data","JPA와 Java 계층",numbered(back,8,15),"Controller·Service·Repository가 요청을 처리하고 Hibernate·JDBC가 DB 저장을 연결합니다.",["JPA는 표준이고 Hibernate는 구현입니다.","DI는 필요한 객체의 참조를 전달합니다.","4500 값은 엔티티 필드에서 저장되고 DTO로 조회됩니다."],["Repository 코드를 모두 직접 구현해야 하나요?","setter 호출만 하면 어떤 객체든 저장되나요?","DTO와 엔티티를 같은 구조로 보내면 안 되나요?"],["Spring Data JPA의 JpaRepository가 기본 save·findById 기능을 제공합니다. 현재 인터페이스를 확인하세요.","관리되는 엔티티·트랜잭션·변경 감지 조건이 필요합니다. 단순 객체의 setMenuPrice만으로 DB 반영을 보장하지 않습니다.","현재 MenuDTO는 화면 계약, Menu는 Category 관계를 포함한 영속성 모델입니다. API와 저장 구조의 결합을 구분합니다."],["JpaRepository","setMenuPrice","MenuDTO"]),
      ("http","HTTP와 실제 API",numbered(api,1,7),"HTTP 요청의 주소·메서드·본문과 응답의 상태·데이터를 따로 읽습니다.",["페이지 번호는 실제 계약에서1부터입니다.","가격 검색은 입력 가격 초과입니다.","삭제는 HTTP200과본문204를 구별합니다."],["주소가 같으면 같은 작업인가요?","4500원 초과에4500원 메뉴가 포함되나요?","삭제 본문204면 HTTP204인가요?"],["GET /api/menus는 조회이고 POST /api/menus는 등록입니다. 주소와 메서드의 조합이 작업을 구분합니다.","menuPrice > 4500이므로 같은4500원 메뉴는 제외됩니다. >= 조건과 다릅니다.","현재 DELETE 응답은 실제 HTTP200이고 JSON 내부 httpStatus204입니다. 진짜 HTTP204는 본문 없는 응답입니다."],["GET /api/menus","menuPrice > 4500","HTTP 200"]),
      ("openapi","OpenAPI와 Swagger",numbered(api,8,12)+"\n\n"+api[-1][1],"OpenAPI는 표준 문서 구조이고 springdoc가 Java에서 생성하며 Swagger UI가 보여줍니다.",["servers·tags·paths는 표준 이름입니다.","명세 생성과 실제 요청 실행은 다른 흐름입니다.","자동 생성 문서의 페이지·자유형 응답 한계를 확인합니다."],["tags 안의 메뉴라는 값도 표준이 정했나요?","명세의 page minimum0을 그대로 따라야 하나요?","실무에서 가장 많이 쓰는 도구인가요?"],["tags라는 필드 이름은 표준입니다. 메뉴라는 분류 값은 SwaggerConfig와 @Tag의 프로젝트 선택입니다.","현재 실제 페이지 계약은1부터이며 자동 Pageable schema에는0이 나타납니다. docs/api-contract와 실행 결과를 대조합니다.","Swagger UI 공식 기능과 springdoc 연결은 확인했습니다. 비교 조사 없는 전세계 사용량1위 주장은 하지 않습니다."],["tags","minimum: 0","Swagger UI"]),
      ("cors","CORS와 조회 실습",numbered(api,13,15),"브라우저의 출처 접근 규칙과 서버의 처리 결과를 분리해서 점검합니다.",["5175와8090은 서로 다른 출처입니다.","OPTIONS는 사전 확인이며 본 요청과 다릅니다.","CORS 허용은 로그인·권한 검사를 대신하지 않습니다."],["Swagger에서는 되는데 React에서는 막히나요?","OPTIONS를 메뉴 등록으로 읽어도 되나요?","CORS를 허용하면 누구나 권한이 생기나요?"],["Swagger는8090과 같은 출처일 수 있지만 React는5175이므로 CORS를 함께 확인합니다.","OPTIONS는 preflight입니다. 실제 JSON 등록은 이후 POST /api/menus입니다.","CORS는 브라우저 응답 접근 규칙입니다. 인증·인가 기능은 별개이며 현재 과제에는 로그인 인증이 없습니다."],["localhost:5175","OPTIONS","POST /api/menus"]),
      ("web","HTML CSS JavaScript",numbered(front,1,3,"FE-"),"브라우저는 HTML 구조·CSS 표현·JavaScript 동작으로 화면을 처리합니다.",["Java와 JavaScript는 다른 언어입니다.","JSON 텍스트와 JavaScript 객체를 구별합니다.","React는 브라우저의 프론트엔드를 구성합니다."],["JSX에 HTML처럼 쓰면 문자열인가요?","menuPrice를 따옴표로 감싸면 같은 숫자인가요?","브라우저가 Java 파일을 실행하나요?"],["JSX는 UI 표현을 작성하는 JavaScript 문법 확장입니다. Vite 등 도구가 브라우저 실행 형태로 처리합니다.","JSON의4500은 숫자이고 문자열4500은 타입이 다릅니다. 현재 폼에서 Number로 숫자를 만듭니다.","현재 브라우저는 React의 JavaScript를 실행하고 Java 서버에는 HTTP를 보냅니다."],["JSX","Number","HTTP"]),
      ("react","React 입력과 상태",numbered(front,4,7,"FE-"),"컴포넌트의 props·state와 이벤트로 입력값과 화면을 연결합니다.",["props는 부모가 전달하는 입력입니다.","state는 기억하고 갱신하는 값입니다.","입력창value와onChange를 연결합니다."],["변수만 바꾸면 React 화면도 바뀌나요?","수정 화면에는 왜 기존 값이 보이나요?","버튼 누르면 어느 함수가 실행되나요?"],["화면 갱신을 위한 값은 useState 등 React 상태로 관리합니다. 일반 지역 변수 변경과 구별합니다.","MenuFormPage가 menuCode로 fetchMenu를 호출해 기존 값으로 입력 상태를 만듭니다.","등록 폼의 onSubmit 이벤트가 저장 핸들러를 호출하며 입력 검사 뒤 createMenu를 호출합니다."],["useState","fetchMenu","onSubmit"]),
      ("request","값 이동과 비동기",numbered(front,8,11,"FE-"),"입력값에서 payload를 만들고 Axios 결과를 기다린 뒤 저장된 메뉴 화면으로 이동합니다.",["Number로 가격·카테고리 코드를 변환합니다.","async/await는 Promise의 결과를 기다립니다.","저장 중·실패·취소를 다룹니다."],["await를 쓰면 브라우저 전체가 멈추나요?","서버 응답 전에 성공 화면을 띄워도 되나요?","요청 취소는 DB 작업을 되돌리나요?"],["await는 해당 async 함수의 진행을 기다립니다. 다른 브라우저 이벤트 전체를 멈추는 방식은 아닙니다.","현재 코드는 await createMenu 후 saved.menuCode로 이동합니다. 실패하면 오류를 보여줍니다.","AbortSignal은 클라이언트 요청 관리를 위한 기능입니다. 이미 서버가 처리한 작업의 DB 롤백을 보장하지 않습니다."],["await createMenu","saved.menuCode","AbortSignal"]),
      ("tools","주소 개발도구 CSS",numbered(front,12,15,"FE-"),"화면 주소·API 주소·개발 서버·빌드 결과·CSS 범위를 구분합니다.",["React Router와 Spring 경로는 다른 층입니다.","검색·페이지는 URL에 보관합니다.","Node·npm·Vite는 개발과 빌드를 돕습니다."],["/menus/8과/api/menus/8은 같은 주소인가요?","npm install은 서버 실행인가요?","GitHub에 dist를 올리면 API도 켜지나요?"],["5175의 /menus/8은 React 화면이고8090의 /api/menus/8은 JSON API입니다.","npm install 또는 ci는 패키지 준비이며 npm run dev가 Vite 개발 서버를 시작합니다.","dist는 프론트 정적 결과입니다. Spring Boot와 DB 실행·접속 설정은 별도로 필요합니다."],["/menus/8","npm run dev","dist"]),
      ("design","토큰과 디자인 인계",numbered(front,16,20,"FE-"),"공통 토큰·컴포넌트 규칙으로 여러 화면을 통일하고 Claude 시안을 React 구현에 적용합니다.",["토큰 JSON이 원본이고CSS는 생성 결과입니다.","radius는 실제 컴포넌트 상수에서 보충했습니다.","Claude 프롬프트 준비와 디자인 수신은 다른 상태입니다."],["tokens.css만 고치면 되나요?","API에 없는 사진·매출 기능도 그려도 되나요?","Claude가 시안을 만들면 앱이 완성됐나요?"],["npm run tokens가 tokens.css를 다시 만듭니다. 원본 montage.tokens.json을 기준으로 수정합니다.","현재 API에는 이미지·매출·주문 내역 필드가 없습니다. 디자인은 screen-brief와 DTO 범위에 맞춥니다.","시안 수신 뒤 React 컴포넌트·CSS 적용과 실제 API·브라우저 검증, GitHub 게시·제출이 남습니다."],["npm run tokens","MenuDTO","GitHub"]),
      ("practice","실행 점검과 제출",get([3,5,6]),"기존 데이터를 바꾸지 않는 조회부터 시작하고 실행·검증·게시·제출 상태를 구별합니다.",["Swagger GET과Network 조회를 비교합니다.","현재 검사 범위와 추가 검증을 구별합니다.","GitHub URL이 개인 제출물입니다."],["어떤 실습부터 시작해야 하나요?","메뉴가 안 나오면 DB부터 지우나요?","빌드가 통과하면 디자인도 확인됐나요?"],["Swagger의 GET /api/menus에서200과result.menus를 확인하고 React의 pages?page=1&size=12를 비교합니다.","DB 삭제 대신8090 실행, Network 상태, 프로필과datasource URL을 먼저 확인합니다.","npm run build는 소스 빌드 검사입니다. 실제 화면·브라우저 흐름·Claude 디자인 수용을 대신하지 않습니다."],["GET /api/menus","8090","npm run build"]),
      ("glossary","용어 사전",glossary_markdown(),"용어의 정의와 현재 과제에서의 실제 예를 함께 읽습니다.",["정의만 외우기보다 해당 값의 위치를 찾습니다.","같은 숫자·이름이 다른 층에서 다른 표현일 수 있습니다.","세부 동작은 연결된 학습 장에서 확인합니다."],["API와DTO를 함께 외우면 되나요?","4500 값은 모든 곳에서 같은 형태인가요?","스택 이름만 알면 연동을 이해한 건가요?"],["API는 기능 계약이고 MenuDTO는 전달 값 구조입니다. POST 요청 본문과 응답을 비교하세요.","폼에서는 문자열일 수 있고 Number 변환 뒤JSON 숫자, Java int, DB 정수 열로 이동합니다.","React·Spring Boot·H2 이름뿐 아니라 createMenu→saveMenu→DB→result.menu 흐름을 설명해야 합니다."],["MenuDTO","Number","createMenu"]),
    ]
    entries = []
    for idx,(slug,title,content,conclusion,points,questions,answers,examples) in enumerate(plans):
        body = parse_blocks(content)
        # 해당 장에서 실제로 추적하는 연결을 표시한다.
        if not any(b["type"]=="diagram" for b in body):
            flows = {
              "database":["dev 프로필 선택","jdbc:h2:file 연결","같은 JVM 안의 H2 엔진","vibe-menu.mv.db에 데이터 저장"],
              "java-run":["Java 소스","Gradle bootJar","실행용 JAR","JVM에서 실행","8090 API 요청 대기"],
              "java-data":["Controller의 DTO","Service의 업무 처리","Repository","Hibernate · JDBC","DB의 메뉴 행"],
              "http":["React의 입력값","HTTP 요청 메서드·주소·JSON","Spring Boot의 처리","HTTP 상태·응답 JSON","React 화면 반영"],
              "cors":["5175 브라우저의 OPTIONS","8090 서버의 출처 허용","브라우저의 본 POST 요청","서버의 처리와 응답","허용된 응답을 React가 읽음"],
              "react":["입력 이벤트","onChange","state 갱신","다시 렌더링","입력창 value 반영"],
              "request":["입력값과 Number 변환","createMenu(payload)","Axios POST","응답의 saved.menuCode","상세 화면 이동"],
              "tools":["화면 주소 /menus/8","React Router · 상세 페이지","fetchMenu(8)","API 주소 /api/menus/8","JSON으로 화면 표시"],
              "design":["montage.tokens.json","build-tokens.mjs","tokens.css","공통 컴포넌트의 CSS 참조","여러 화면에 동일 규칙 적용"],
              "practice":["Swagger GET 조회","HTTP200 · 응답 확인","React Network의 페이지 조회","실제 계약과 비교","검사 범위 기록"],
              "glossary":["입력값 문자열4500","Number로 숫자4500","JSON 숫자4500","Java int4500","DB의 가격 값4500"],
            }
            if slug in ("start","flow"):
                diagram=mermaid_diagram("sequenceDiagram\nactor U as 사용자\nparticipant R as React 화면\nparticipant S as Spring Boot\nparticipant D as 과제 DB\nU->>R: 아메리카노·4500 입력 후 저장\nR->>S: POST /api/menus · JSON\nS->>D: 메뉴 저장\nD-->>S: 저장된 메뉴와 번호\nS-->>R: HTTP201 · result.menu\nR-->>U: 상세 화면 표시")
            else:
                diagram={"type":"diagram","diagram_type":"flow","nodes":flows[slug],
                         "aria_label":title+"의 실제 연결 순서","caption":title+" · 성공 경로 또는 표시된 조건에서의 흐름"}
            body.insert(0,diagram)
        terms = TERMS if slug=="glossary" else [t for t in TERMS if t["term"].lower() in content.lower()][:10]
        faq = [{"kind":kind,"q":q,"a":a,"example":{"language":"text","content":example},
                "shows":"답에서 설명한 실제 코드·설정·요청 이름을 확인합니다."} for kind,q,a,example in zip(["how","versus","fail"],questions,answers,examples)]
        entries.append({"schema":2,"id":"vibe-"+slug,"at":f"2026-09-30T05:30:{idx:02d}Z",
                        "topic_id":"vibe-menu-encyclopedia","title":title+" · 실제 과제로 이해하기",
                        "nav":title,"conclusion":conclusion,"points":points,"terms":terms,"body":body,
                        "faq":faq,"next_review":"본문의 읽기 실습을 확인하고 "+examples[0]+"의 역할을 자신의 말로 설명합니다."})
    SOURCE.parent.mkdir(parents=True,exist_ok=True)
    SOURCE.write_text("".join(json.dumps(e,ensure_ascii=False,separators=(",",":"))+"\n" for e in entries),encoding="utf-8")

def inline(text: str) -> str:
    escaped = html.escape(text)
    escaped = re.sub(r"\[([^\]]+)\]\(([^)]+)\)",lambda m: '<span class="ref">'+m[1]+'</span> <small class="source">('+m[2]+')</small>',escaped)
    escaped = re.sub(TICK+r"([^"+TICK+r"]+)"+TICK,r"<code>\1</code>",escaped)
    return re.sub(r"\*\*([^*]+)\*\*",r"<strong>\1</strong>",escaped)

def block_html(b: dict, scope: str = "") -> str:
    kind=b["type"]
    if kind=="diagram":
        rendered = render_diagram(b)
        # 한 문서의 여러 SVG가 같은 marker ID를 공유하지 않게 한다.
        for identifier in re.findall(r'\bid="([^"]+)"', rendered):
            unique = scope + "-" + identifier
            rendered = rendered.replace('id="'+identifier+'"', 'id="'+unique+'"')
            rendered = rendered.replace('url(#'+identifier+')', 'url(#'+unique+')')
        width = re.search(r'viewBox="0 0 ([\d.]+) ', rendered)
        # SVG 글자를 축소하지 않고 그림 영역 안에서 가로로 읽는다.
        if width:
            rendered = rendered.replace('<svg ', '<svg style="width:'+width[1]+'px;max-width:none" ', 1)
        return '<figure class="diagram">'+rendered+'<figcaption>'+html.escape(b.get("caption", ""))+'</figcaption></figure>'
    if kind=="code":
        code='<div class="code-label">'+html.escape(b["language"])+'</div><pre><code>'+html.escape(b["content"])+'</code></pre>'
        return '<details><summary>공식 자료와 전체 주소</summary>'+code+'</details>' if b["content"].startswith("공식 자료와 전체 주소\n") else code
    if kind=="table":
        head="".join("<th>"+inline(c)+"</th>" for c in b["headers"])
        rows="".join("<tr>"+"".join("<td>"+inline(c)+"</td>" for c in row)+"</tr>" for row in b["rows"])
        return '<div class="table-wrap"><table><thead><tr>'+head+'</tr></thead><tbody>'+rows+'</tbody></table></div>'
    if kind=="list": return "<ul>"+"".join("<li>"+inline(c)+"</li>" for c in b["items"])+"</ul>"
    if kind=="paragraph":
        if b.get("emph")==[b["text"]]: return "<h3>"+inline(b["text"])+"</h3>"
        return "<p>"+inline(b["text"])+"</p>"
    raise ValueError("미지원 본문 블록: "+kind)

CSS = """
:root{color-scheme:light;--bg:#f6f7fb;--paper:#fff;--text:#263449;--muted:#526278;--line:#d9e0ea;--blue:#005acd;--soft:#edf4ff;--warm:#f6f0e3}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){color-scheme:dark;--bg:#101821;--paper:#172330;--text:#edf3fc;--muted:#b0bfd2;--line:#425165;--blue:#8ab9ff;--soft:#24374e;--warm:#423924}}
:root[data-theme=dark]{color-scheme:dark;--bg:#101821;--paper:#172330;--text:#edf3fc;--muted:#b0bfd2;--line:#425165;--blue:#8ab9ff;--soft:#24374e;--warm:#423924}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:104px}body{margin:0;background:var(--bg);color:var(--text);font:18px/1.8 system-ui,'Malgun Gothic',sans-serif;word-break:keep-all;overflow-wrap:anywhere}a{color:var(--blue)}a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid var(--blue);outline-offset:3px}.skip{position:absolute;top:-100px}.skip:focus{top:12px;left:12px;background:var(--paper);padding:12px;z-index:20}
header{border-bottom:1px solid var(--line);background:var(--paper);padding:12px 24px;position:sticky;top:0;z-index:10;display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;align-items:center}header .brand{font-size:16px;font-weight:750;color:var(--text)}#tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center}input{min-width:180px;max-width:300px;border:1px solid var(--line);background:var(--bg);color:var(--text);padding:9px 12px;border-radius:8px;font:inherit;font-size:15px}button{border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--text);padding:9px 12px;cursor:pointer;font:inherit;font-size:15px}button:hover{background:var(--soft)}button:disabled{opacity:.52;cursor:default}
.layout{display:grid;grid-template-columns:264px minmax(0,960px);justify-content:center;gap:36px;padding:36px 24px}aside{position:sticky;top:110px;max-height:calc(100vh - 130px);overflow:auto;align-self:start}aside summary{font-weight:750;font-size:18px}nav a{display:block;padding:8px 10px;text-decoration:none;border-radius:7px;font-size:15px}nav a:hover{background:var(--soft)}nav a.active{background:var(--soft);font-weight:750}nav .num{display:inline-block;color:var(--muted);width:30px}main{min-width:0}.hero{padding:40px;background:var(--paper);border:1px solid var(--line);border-radius:16px;margin-bottom:32px}.eyebrow{font-size:14px;font-weight:700;color:var(--blue);letter-spacing:.08em}h1{font-size:42px;line-height:1.3;margin:12px 0 24px;letter-spacing:-.04em}h2{font-size:28px;line-height:1.5;margin:8px 0 20px;letter-spacing:-.03em}h3{font-size:21px;line-height:1.5;margin:36px 0 12px}.lead{font-size:21px;line-height:1.65}.status{font-size:15px;color:var(--muted)}.jump{display:flex;flex-wrap:wrap;gap:10px}.jump a{border:1px solid var(--line);padding:8px 14px;border-radius:8px;font-size:16px;text-decoration:none}.jump a:first-child{background:var(--blue);color:var(--paper)}
.entry{padding:32px 40px;background:var(--paper);border:1px solid var(--line);border-radius:16px;margin-bottom:24px}.entry[hidden],nav a[hidden],.term[hidden],#empty[hidden]{display:none}.kicker{font-size:14px;color:var(--muted);font-weight:650}.conclusion{padding:20px 24px;background:var(--soft);border-left:4px solid var(--blue);margin-bottom:24px}.conclusion>p{font-weight:650;margin-top:0}.conclusion li{font-size:16px}.entry p{margin:18px 0}.entry li{margin:6px 0}.term-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:20px 0}.term{border:1px solid var(--line);border-radius:8px;padding:12px;font-size:15px}.term strong{display:block;color:var(--blue);margin-bottom:4px}.term small{display:block;color:var(--muted);margin-top:5px}code{font-family:Consolas,ui-monospace,monospace;font-size:.9em;background:var(--bg);padding:2px 5px;border-radius:4px}pre{overflow:auto;border:1px solid var(--line);background:var(--bg);border-radius:8px;padding:18px;line-height:1.6;font-size:15px;word-break:normal;overflow-wrap:normal;white-space:pre}pre code{padding:0;background:none}.code-label{font-size:12px;color:var(--muted);text-transform:uppercase;margin-top:20px}.source{font-size:12px;color:var(--muted);word-break:break-all}.ref{font-weight:650}.table-wrap{overflow:auto;margin:24px 0}table{width:100%;border-collapse:collapse;min-width:500px;font-size:15px}th,td{text-align:left;border-bottom:1px solid var(--line);padding:12px;vertical-align:top}th{background:var(--soft)}td{font-variant-numeric:tabular-nums}.diagram{overflow:auto;background:#fff;border:1px solid var(--line);border-radius:8px;margin:24px 0;padding:12px;color:#263449}.diagram svg{display:block;width:100%;min-width:720px;height:auto}.diagram figcaption{font-size:14px;padding:8px}.diagram .caption{font-size:14px}details.faq{border-top:1px solid var(--line);padding:12px 0;font-size:16px}summary{cursor:pointer;font-weight:650}.faq p{margin:12px 0}.review{background:var(--warm);padding:16px;border-radius:8px;font-size:16px}.next-links{display:flex;justify-content:space-between;gap:12px;border-top:1px solid var(--line);padding-top:20px;margin-top:28px;font-size:15px}.sim{padding:24px;border:1px solid var(--line);background:var(--paper);border-radius:16px;margin-bottom:32px}.sim-controls{display:flex;gap:10px}.sim-step{padding:20px;background:var(--soft);margin:16px 0;border-radius:8px}.sim-step h3{margin:0 0 8px}.sim-step pre{margin-bottom:0}.sim .status{margin:8px 0}.progress{height:5px;background:var(--line);border-radius:4px;overflow:hidden}.progress i{display:block;height:100%;background:var(--blue);width:0}#result{font-size:14px;color:var(--muted);margin:0 0 16px}#empty{padding:30px;background:var(--paper);border:1px solid var(--line);border-radius:12px}footer{padding:24px;color:var(--muted);font-size:14px;text-align:center}
@media(max-width:1050px){.layout{grid-template-columns:210px minmax(0,1fr);gap:20px}.hero,.entry{padding:28px}h1{font-size:34px}}
@media(max-width:760px){header{padding:12px 16px;position:relative}.layout{display:block;padding:16px}aside{position:static;max-height:none;margin-bottom:20px}.hero,.entry{padding:22px 18px;border-radius:10px}h1{font-size:30px}h2{font-size:25px}.term-list{grid-template-columns:1fr}#tools{width:100%}input{flex:1;min-width:120px;max-width:none}body{font-size:17px}.lead{font-size:19px}nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.next-links{font-size:14px}.source{font-size:11px}.diagram svg{min-width:720px}}
@media print{header,aside,#tools,.sim-controls,#result,.jump{display:none}.layout{display:block;padding:0}.hero,.entry,.sim{border:0;border-radius:0;padding:20px;margin:0}body{background:white;color:black;font-size:12pt}.entry[hidden]{display:block}.faq>:not(summary){display:block!important}.term[hidden]{display:block}pre,table,.diagram{break-inside:avoid}h2,h3{break-after:avoid}details{display:block}.diagram{overflow:visible}.diagram svg{min-width:0}.source{font-size:9pt}a{color:black}}
.flow-node{fill:#edf4ff;stroke:#35516b;stroke-width:1.5}.flow-edge{fill:none;stroke:#35516b;stroke-width:2}.flow-diagram text{fill:#18344e;font-size:18px}.diagram text{font-family:system-ui,'Malgun Gothic',sans-serif}.flow-diagram .flow-label{font-size:15px}
@media print{.diagram svg{width:100%!important;max-width:100%!important}}
"""

JS = """
(() => {
const entries = [...document.querySelectorAll('.entry')];
const tools = document.querySelector('#tools');
const label = document.createElement('label'); label.textContent = '찾기 ';
const input = document.createElement('input'); input.type = 'search'; input.placeholder = 'H2, Swagger, state…'; input.setAttribute('aria-label','백과사전 검색');
label.append(input); tools.append(label);
const clear = document.createElement('button'); clear.textContent = '초기화'; clear.type = 'button'; tools.append(clear);
const theme = document.createElement('button'); theme.type = 'button'; theme.textContent = '테마 전환'; tools.append(theme);
const print = document.createElement('button'); print.type = 'button'; print.textContent = '인쇄'; tools.append(print); print.onclick = () => window.print();
function search() {
 const query = input.value.trim().toLocaleLowerCase(); const words = query.split(/\\s+/).filter(Boolean); let count = 0;
 for(const entry of entries) { const text = entry.textContent.toLocaleLowerCase(); const matched = words.every(w => text.includes(w)); entry.hidden = !matched; if(matched)count++;
  const link = document.querySelector('nav a[href="#'+entry.id+'"]'); if(link)link.hidden=!matched;
 }
 document.querySelector('#empty').hidden=count!==0;
 document.querySelector('#result').textContent = query ? '"'+input.value.trim()+'" 포함 '+count+'장 · 본문과 용어를 함께 검색합니다.' : entries.length+'장 · 목차 순서대로 읽거나 용어로 찾아보세요.';
 for(const term of document.querySelectorAll('#chapter-vibe-glossary .term')) { term.hidden = words.length>0 && !words.every(w=>term.textContent.toLocaleLowerCase().includes(w)); }
}
input.oninput=search; clear.onclick=()=>{input.value='';search();input.focus();}; search();
try {const t=localStorage.getItem('vibe-encyclopedia-theme');if(t)document.documentElement.dataset.theme=t;}catch{}
theme.onclick=()=>{const root=document.documentElement;const dark=root.dataset.theme==='dark'||(!root.dataset.theme&&matchMedia('(prefers-color-scheme:dark)').matches);root.dataset.theme=dark?'light':'dark';try{localStorage.setItem('vibe-encyclopedia-theme',root.dataset.theme);}catch{}};
if(innerWidth<=760)document.querySelector('aside details').open=false;
document.querySelector('nav').addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;for(const item of document.querySelectorAll('nav a'))item.classList.toggle('active',item===a);if(innerWidth<=760)document.querySelector('aside details').open=false;});
const sim=document.querySelector('#simulation'); const controls=document.createElement('div'); controls.className='sim-controls';
const previous=document.createElement('button');previous.type='button';previous.textContent='이전 단계';
const next=document.createElement('button');next.type='button';next.textContent='다음 단계';
controls.append(previous,next);sim.append(controls);
const data=[
 ['1. 입력값','사용자가 아메리카노·4500·커피·주문 가능을 입력합니다. 폼의 입력값은 문자열일 수 있습니다.','menuName: "아메리카노"\\nmenuPrice: "4500"\\ncategoryCode: "6"\\norderableStatus: "Y"'],
 ['2. React의 payload','필수값 검사 후 가격·카테고리 번호를 Number로 바꿉니다.','{\\n  "menuName": "아메리카노",\\n  "menuPrice": 4500,\\n  "categoryCode": 6,\\n  "orderableStatus": "Y"\\n}'],
 ['3. HTTP 요청','Axios API 함수가 JSON 본문을 8090 서버로 보냅니다. Swagger 문서 파일을 실행하지 않습니다.','POST http://localhost:8090/api/menus\\nContent-Type: application/json'],
 ['4. Java와 DB','Controller가 DTO를 받고 Service가 카테고리를 확인합니다. Repository·Hibernate·JDBC가 H2에 메뉴를 저장합니다.','MenuDTO → Menu → menus.save(menu)\\n4500 → menuPrice 필드 → DB 정수 열'],
 ['5. 응답과 화면','성공하면 서버가201과메뉴를 반환합니다. React는 saved.menuCode로 상세 화면에 이동합니다. 아래101은 학습용 예시 번호입니다.','HTTP 201\\nresult.menu.menuCode: 101\\nresult.menu.menuPrice: 4500\\nReact 이동: /menus/101'],
 ['6. 실패 경로','입력 오류면 요청 전 필드 안내, 없는 카테고리면400, 연결 실패면응답이 없을 수 있습니다. 성공을 표시하지 않고 입력과 오류 안내를 유지합니다.','입력 검증 실패 → POST 없음\\n카테고리 없음 → HTTP 400\\n연결 실패 → HTTP 응답 없음']
];
let step=0;
function renderStep(){const row=data[step];const panel=sim.querySelector('.sim-step');panel.replaceChildren();const title=document.createElement('h3');title.textContent=row[0];const text=document.createElement('p');text.textContent=row[1];const pre=document.createElement('pre');pre.textContent=row[2];panel.append(title,text,pre);previous.disabled=step===0;next.disabled=step===data.length-1;sim.querySelector('.progress i').style.width=((step+1)/data.length*100)+'%';sim.querySelector('[aria-live]').textContent=(step+1)+' / '+data.length+' 단계 · 학습 예시, 서버 요청 없음';}
previous.onclick=()=>{step--;renderStep();};next.onclick=()=>{step++;renderStep();};renderStep();
})();
"""

def to_markdown(entries: list[dict]) -> str:
    chunks=["# 메뉴 관리 과제로 배우는 웹 개발 백과사전\n\n2026년 9월 30일 · 실제 과제 코드와 공식 자료를 연결한 학습 자료입니다. 오프라인 HTML에는 검색·등록 흐름 실습이 있습니다.\n"]
    for i,e in enumerate(entries,1):
        chunks.append(f"\n## {i:02d}. {e['nav']}\n\n{e['conclusion']}\n")
        for b in e["body"]:
            kind=b["type"]
            if kind=="paragraph": chunks.append(("### " if b.get("emph")==[b["text"]] else "")+b["text"]+"\n")
            elif kind=="list": chunks.append("\n".join("- "+c for c in b["items"])+"\n")
            elif kind=="code":
                if b["content"].startswith("공식 자료와 전체 주소\n"):
                    chunks.append("### 공식 자료와 전체 주소\n\n"+"\n".join("- "+line for line in b["content"].splitlines()[1:])+"\n")
                else: chunks.append(FENCE+b["language"]+"\n"+b["content"]+"\n"+FENCE+"\n")
            elif kind=="table": chunks.append("| "+" | ".join(b["headers"])+" |\n| "+" | ".join("---" for _ in b["headers"])+" |\n"+"\n".join("| "+" | ".join(row)+" |" for row in b["rows"])+"\n")
            elif kind=="diagram": chunks.append("도해: "+b.get("caption","")+". 오프라인 HTML에서 그림으로 확인합니다.\n")
        chunks.append("### 이어서 궁금할 만한 질문\n")
        chunks.extend("**"+q["q"]+"**\n\n"+q["a"]+"\n" for q in e["faq"])
    return "\n".join(chunks)

def build() -> None:
    entries=[json.loads(line) for line in SOURCE.read_text(encoding="utf-8").splitlines() if line.strip()]
    if len({e["id"] for e in entries}) != len(entries): raise ValueError("중복 항목 ID")
    for e in entries:
        note.validate_entry(e); note.check_body(e["body"])
    nav="".join(f'<a href="#chapter-{e["id"]}"><span class="num">{i:02d}</span>{html.escape(e["nav"])}</a>' for i,e in enumerate(entries,1))
    articles=[]
    for i,e in enumerate(entries,1):
        term_cards="".join('<div class="term"><strong>'+html.escape(t["term"])+'</strong>'+html.escape(t["plain"])+'<small>'+html.escape(t["examples"][0])+'</small></div>' for t in e["terms"])
        faq="".join('<details class="faq" open><summary>'+html.escape(q["q"])+'</summary><p>'+inline(q["a"])+'</p></details>' for q in e["faq"])
        prev=f'<a href="#chapter-{entries[i-2]["id"]}">← 이전 장</a>' if i>1 else '<a href="#main">↑ 처음으로</a>'
        nxt=f'<a href="#chapter-{entries[i]["id"]}">다음 장 →</a>' if i<len(entries) else '<a href="#main">↑ 처음으로</a>'
        if e['id']=='vibe-glossary':
            terms_html='<h3>정의와 과제 속 실제 예</h3><div class="term-list">'+term_cards+'</div>'
            selected_body=[b for b in e['body'] if b['type']=='diagram']
        else:
            terms_html='<details><summary>이 장의 용어와 실제 예</summary><div class="term-list">'+term_cards+'</div></details>'
            selected_body=e['body']
        content_html=''.join(block_html(b,e['id']+'-'+str(j)) for j,b in enumerate(selected_body))
        articles.append(f'<article class="entry" id="chapter-{e["id"]}"><div class="kicker">{i:02d} / {len(entries):02d} · {html.escape(e["nav"])}</div><h2>{html.escape(e["title"])}</h2><div class="conclusion"><p>{html.escape(e["conclusion"])}</p><ul>'+"".join("<li>"+html.escape(p)+"</li>" for p in e["points"])+'</ul></div>'+terms_html+content_html+'<h3>이어서 궁금할 만한 질문</h3>'+faq+'<p class="review">'+html.escape(e["next_review"])+'</p><div class="next-links">'+prev+nxt+'</div></article>')
    hero='<section class="hero"><div class="eyebrow">MENU APP · FULL STACK FIELD GUIDE</div><h1>화면에서 DB까지,<br>메뉴 하나의 여행</h1><p class="lead">H2·MySQL부터 Java·React·OpenAPI·Swagger·디자인 토큰까지. 실제 과제 코드를 따라 처음부터 이해하는 백과사전입니다.</p><p class="status">2026년 9월 30일 기준 · 기능 연동은 확인됨 · 최종 디자인과 GitHub 제출은 남아 있음</p><div class="jump"><a href="#chapter-vibe-start">세 질문부터 읽기</a><a href="#simulation">등록 흐름 따라가기</a><a href="#chapter-vibe-glossary">용어 사전</a></div></section>'
    sim='<section class="sim" id="simulation"><div class="eyebrow">실행 흐름 읽기</div><h2>4500은 어디로 이동할까요?</h2><p class="status">학습용 시뮬레이션입니다. 실제 API 요청·DB 변경을 하지 않습니다.</p><div class="progress"><i></i></div><p class="status" aria-live="polite"></p><div class="sim-step"><h3>입력 → 요청 → 저장 → 응답 → 화면</h3><p>React의 입력값을 HTTP·Java·DB 표현으로 바꿉니다. Java 서버가 저장한 결과를 돌려주면 상세 화면으로 이동합니다.</p></div></section>'
    document='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>메뉴 관리 과제 · 풀스택 백과사전</title><style>'+CSS+'</style></head><body><a class="skip" href="#main">본문으로 바로가기</a><header><a class="brand" href="#main">메뉴 관리 과제 · 학습 백과사전</a><div id="tools"></div></header><div class="layout"><aside><details open><summary>읽는 순서</summary><nav aria-label="백과사전 목차">'+nav+'</nav></details></aside><main id="main">'+hero+sim+'<p id="result" aria-live="polite"></p><p id="empty" hidden>검색 결과가 없습니다. 다른 용어를 입력하거나 초기화를 누르세요.</p>'+"".join(articles)+'</main></div><footer>내용 원본: private-notes/data/vibe-menu-encyclopedia.jsonl · 외부 라이브러리·폰트·네트워크 요청 없이 읽습니다.<br>출처 URL과 코드 경로는 본문에 표시했습니다. 클릭 가능한 출처는 함께 만든 encyclopedia.md에서 확인할 수 있습니다.</footer><script>'+JS+'</script></body></html>'
    # 연결·자원·조작부·의미 있는 도해에 대한 독립 검사.
    if re.search(r'<(?:script|link|img|iframe)[^>]+(?:src|href)=',document,re.I): raise ValueError("외부 자원 또는 프레임")
    if re.search(r'<(?:button|input|select)\b',document,re.I): raise ValueError("정적 HTML의 죽은 조작부")
    if re.search(r'(?:href|src)=["\'](?:https?:|file:|C:)',document,re.I): raise ValueError("외부 링크")
    if "@import" in CSS or "url(" in CSS: raise ValueError("외부 CSS")
    static=document.split("<script>",1)[0]
    identifiers=re.findall(r'\bid="([^"]+)"',static)
    if len(identifiers)!=len(set(identifiers)): raise ValueError("중복 HTML 또는 SVG ID")
    anchors=set(re.findall(r'\bid="([^"]+)"',static))
    for target in re.findall(r'href="#([^"]+)"',static):
        if target not in anchors: raise ValueError("끊어진 앵커: "+target)
    OUT.mkdir(exist_ok=True)
    (OUT/"encyclopedia.html").write_text(document,encoding="utf-8")
    (OUT/"encyclopedia.md").write_text(to_markdown(entries),encoding="utf-8")
    report={"chapters":len(entries),"terms":len(TERMS),"bodyBlocks":sum(len(e["body"]) for e in entries),
            "diagrams":sum(b["type"]=="diagram" for e in entries for b in e["body"]),"source":str(SOURCE),
            "htmlBytes":len(document.encode("utf-8")),"externalResources":0,"networkRequestsInBook":0}
    (OUT/"encyclopedia-check.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False))

if __name__=="__main__":
    parser=argparse.ArgumentParser();parser.add_argument("--import-research",action="store_true");args=parser.parse_args()
    if args.import_research: import_research()
    build()
