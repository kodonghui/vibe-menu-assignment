package com.ohgiraffers.springdatajpa;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/** 실제 HTTP 바인딩·상태 코드와 저장 결과를 격리된 인메모리 DB에서 검사한다. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:vibe-http-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@ActiveProfiles("dev")
class MenuApiContractTests {
    @LocalServerPort int port;
    @Autowired ObjectMapper json;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private final List<Integer> createdCodes = new ArrayList<>();

    private record Result(int status, JsonNode body) {}

    private Result request(String method, String path, String body) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                .timeout(Duration.ofSeconds(10)).header("Content-Type", "application/json")
                .method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body));
        HttpResponse<String> response = client.send(request.build(), HttpResponse.BodyHandlers.ofString());
        Result result = new Result(response.statusCode(), json.readTree(response.body()));
        // 검증 실패로 예상 밖 등록이 성공해도 테스트 데이터를 정리한다.
        if (method.equals("POST") && result.status == 201) {
            createdCodes.add(result.body.path("result").path("menu").path("menuCode").asInt());
        }
        return result;
    }

    private int category(boolean child) throws Exception {
        for (JsonNode category : request("GET", "/api/categories", null).body.path("result").path("categories")) {
            if (category.path("refCategoryCode").isNull() != child) return category.path("categoryCode").asInt();
        }
        throw new AssertionError("필요한 카테고리 예시 데이터가 없습니다.");
    }

    private String payload(String name, String price, int category, String status) {
        return "{\"menuName\":\"" + name + "\",\"menuPrice\":" + price
                + ",\"categoryCode\":" + category + ",\"orderableStatus\":\"" + status + "\"}";
    }

    private int createMenu() throws Exception {
        Result created = request("POST", "/api/menus", payload("HTTP 검사 메뉴", "5000", category(true), "Y"));
        assertEquals(201, created.status);
        return created.body.path("result").path("menu").path("menuCode").asInt();
    }

    private void assertBadRequest(Result result) {
        assertEquals(400, result.status, result.body.toString());
        assertEquals("ERROR_CODE_00003", result.body.path("code").asString());
    }

    @AfterEach
    void cleanUp() throws Exception {
        for (int code : createdCodes) request("DELETE", "/api/menus/" + code, null);
    }

    @Test
    void fullUpdateRejectsMissingOrInvalidCategoryWithoutChangingMenu() throws Exception {
        int code = createMenu();
        for (int category : new int[]{0, -1, Integer.MAX_VALUE, category(false)}) {
            assertBadRequest(request("PUT", "/api/menus/" + code, payload("덮어쓰면 안 되는 값", "9000", category, "N")));
            JsonNode actual = request("GET", "/api/menus/" + code, null).body.path("result").path("menu");
            assertEquals("HTTP 검사 메뉴", actual.path("menuName").asString());
            assertEquals(5000, actual.path("menuPrice").asInt());
            assertEquals("Y", actual.path("orderableStatus").asString());
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "   "})
    void blankNamesAreRejectedOnCreateAndUpdate(String name) throws Exception {
        int code = createMenu();
        String body = payload(name, "5000", category(true), "Y");
        assertBadRequest(request("POST", "/api/menus", body));
        assertBadRequest(request("PUT", "/api/menus/" + code, body));
    }

    @Test
    void overlongNameAndInvalidStatusAreRejected() throws Exception {
        assertBadRequest(request("POST", "/api/menus", payload("가".repeat(101), "5000", category(true), "Y")));
        assertBadRequest(request("POST", "/api/menus", payload("검사 메뉴", "5000", category(true), "maybe")));
        assertBadRequest(request("POST", "/api/menus", payload("검사 메뉴", "5000", category(false), "Y")));
    }

    @ParameterizedTest
    @ValueSource(strings = {"-1", "null", "1.5", "2147483648", "\"not-a-number\""})
    void invalidPricesAreRejectedOnCreateAndUpdate(String price) throws Exception {
        int code = createMenu();
        String body = payload("검사 메뉴", price, category(true), "Y");
        assertBadRequest(request("POST", "/api/menus", body));
        assertBadRequest(request("PUT", "/api/menus/" + code, body));
        assertEquals(5000, request("GET", "/api/menus/" + code, null).body.path("result").path("menu").path("menuPrice").asInt());
    }

    @Test
    void missingPriceAndMalformedJsonAreBadRequests() throws Exception {
        String noPrice = "{\"menuName\":\"가격 누락\",\"categoryCode\":" + category(true) + ",\"orderableStatus\":\"Y\"}";
        assertBadRequest(request("POST", "/api/menus", noPrice));
        assertBadRequest(request("POST", "/api/menus", "{"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"0", "2147483647"})
    void integerPriceBoundariesRemainValid(String price) throws Exception {
        Result created = request("POST", "/api/menus", payload("경계값 검사", price, category(true), "Y"));
        assertEquals(201, created.status);
        assertEquals(Integer.parseInt(price), created.body.path("result").path("menu").path("menuPrice").asInt());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/menus/search", "/api/menus/search?menuPrice=abc", "/api/menus/abc", "/api/categories/abc"})
    void missingAndMalformedRequestParametersAreBadRequests(String path) throws Exception {
        assertBadRequest(request("GET", path, null));
    }

    @ParameterizedTest
    @ValueSource(strings = {"sortBy=unknown", "sortBy=category", "direction=sideways"})
    void unsupportedSortingIsABadRequest(String query) throws Exception {
        assertBadRequest(request("GET", "/api/menus/pages/sort?" + query, null));
    }

    @Test
    void updatePersistsEveryFieldIncludingNewCategory() throws Exception {
        int code = createMenu();
        int oldCategory = category(true);
        int newCategory = 0;
        for (JsonNode candidate : request("GET", "/api/categories", null).body.path("result").path("categories")) {
            if (!candidate.path("refCategoryCode").isNull() && candidate.path("categoryCode").asInt() != oldCategory) {
                newCategory = candidate.path("categoryCode").asInt();
                break;
            }
        }
        assertTrue(newCategory > 0);
        Result updated = request("PUT", "/api/menus/" + code, payload("전체 수정 검사", "6000", newCategory, "N"));
        assertEquals(200, updated.status);
        JsonNode persisted = request("GET", "/api/menus/" + code, null).body.path("result").path("menu");
        assertEquals("전체 수정 검사", persisted.path("menuName").asString());
        assertEquals(6000, persisted.path("menuPrice").asInt());
        assertEquals(newCategory, persisted.path("categoryCode").asInt());
        assertEquals("N", persisted.path("orderableStatus").asString());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/menus/pages", "/api/menus/pages/sort"})
    void pageOffsetsOutsideJpaIntegerRangeAreBadRequests(String path) throws Exception {
        assertBadRequest(request("GET", path + "?page=2147483647&size=12", null));
    }

    @Test
    void pagingKeepsOneBasedNumbersAndMaximumSize() throws Exception {
        JsonNode first = request("GET", "/api/menus/pages?page=1&size=3", null).body.path("result");
        JsonNode second = request("GET", "/api/menus/pages?page=2&size=3", null).body.path("result");
        assertEquals(1, first.path("number").asInt());
        assertEquals(2, second.path("number").asInt());
        assertTrue(first.path("first").asBoolean());
        assertFalse(second.path("first").asBoolean());
        assertNotEquals(first.path("content").get(0).path("menuCode").asInt(), second.path("content").get(0).path("menuCode").asInt());
        JsonNode limited = request("GET", "/api/menus/pages?page=1&size=1000", null).body.path("result");
        assertEquals(100, limited.path("size").asInt());
        Result ignoredSort = request("GET", "/api/menus/pages?page=1&size=3&sort=unknown,asc", null);
        assertEquals(200, ignoredSort.status);
        assertEquals(first.path("content"), ignoredSort.body.path("result").path("content"));
        JsonNode sorted = request("GET", "/api/menus/pages/sort?page=2&size=3&sortBy=menuPrice&direction=ASC", null).body.path("result");
        assertEquals(2, sorted.path("number").asInt());
    }

    @Test
    void deletePreservesLectureEnvelopeAndMissingMenuResponse() throws Exception {
        int code = createMenu();
        Result deleted = request("DELETE", "/api/menus/" + code, null);
        assertEquals(200, deleted.status);
        assertEquals(204, deleted.body.path("httpStatus").asInt());
        assertEquals(code, deleted.body.path("result").path("deletedMenuCode").asInt());
        Result missing = request("GET", "/api/menus/" + code, null);
        assertEquals(404, missing.status);
        assertEquals("ERROR_CODE_00001", missing.body.path("code").asString());
    }
}
