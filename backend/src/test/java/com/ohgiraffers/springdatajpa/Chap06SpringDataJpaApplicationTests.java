package com.ohgiraffers.springdatajpa;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.ohgiraffers.springdatajpa.dto.MenuDTO;
import com.ohgiraffers.springdatajpa.service.MenuService;
import com.ohgiraffers.springdatajpa.service.CategoryService;
import com.ohgiraffers.springdatajpa.exception.MenuNotFoundException;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:vibe-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
// 기본 MySQL 실행과 분리한 인메모리 DB에서 검사한다.
@ActiveProfiles("dev")
@Transactional
class Chap06SpringDataJpaApplicationTests {

    @Autowired MenuService menus;
    @Autowired CategoryService categories;

    @Test
    void menuCrudKeepsCategoryAndStatus() {
        int category = categories.findAllCategories().stream()
                .filter(c -> c.getRefCategoryCode() != null).findFirst().orElseThrow().getCategoryCode();
        MenuDTO created = menus.saveMenu(new MenuDTO(0, "통합검사 메뉴", 5000, category, null, "Y"));
        assertTrue(created.getMenuCode() > 0);
        assertEquals("통합검사 메뉴", menus.findMenuByCode(created.getMenuCode()).getMenuName());
        MenuDTO updated = menus.updateMenu(created.getMenuCode(),
                new MenuDTO(0, "수정한 검사 메뉴", 6000, category, null, "N"));
        assertEquals(6000, updated.getMenuPrice());
        assertEquals("N", updated.getOrderableStatus());
        menus.deleteMenu(created.getMenuCode());
        assertThrows(MenuNotFoundException.class, () -> menus.findMenuByCode(created.getMenuCode()));
    }

    @Test
    void invalidCategoryDoesNotCreateMenu() {
        int before = menus.findAllMenus().size();
        assertThrows(IllegalArgumentException.class,
                () -> menus.saveMenu(new MenuDTO(0, "실패해야 하는 메뉴", 1000, -1, null, "Y")));
        assertEquals(before, menus.findAllMenus().size());
    }

    @Test
    void priceSearchUsesStrictlyGreaterThan() {
        int category = categories.findAllCategories().stream()
                .filter(c -> c.getRefCategoryCode() != null).findFirst().orElseThrow().getCategoryCode();
        MenuDTO exact = menus.saveMenu(new MenuDTO(0, "경계값 메뉴", 7000, category, null, "Y"));
        MenuDTO greater = menus.saveMenu(new MenuDTO(0, "초과값 메뉴", 7001, category, null, "Y"));
        assertFalse(menus.findMenusByPrice(7000).stream().anyMatch(m -> m.getMenuCode() == exact.getMenuCode()));
        assertTrue(menus.findMenusByPrice(7000).stream().anyMatch(m -> m.getMenuCode() == greater.getMenuCode()));
    }

}
