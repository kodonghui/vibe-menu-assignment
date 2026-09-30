package com.ohgiraffers.springdatajpa.config;

import com.ohgiraffers.springdatajpa.entity.Category;
import com.ohgiraffers.springdatajpa.entity.Menu;
import com.ohgiraffers.springdatajpa.repository.CategoryRepository;
import com.ohgiraffers.springdatajpa.repository.MenuRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 처음 만든 과제 DB에만 예시 데이터를 넣는다. 기존 데이터는 변경하지 않는다. */
@Component
@Profile({"dev", "mysql"})
public class DemoDataConfig implements ApplicationRunner {
    private final CategoryRepository categories;
    private final MenuRepository menus;

    public DemoDataConfig(CategoryRepository categories, MenuRepository menus) {
        this.categories = categories;
        this.menus = menus;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (categories.count() != 0 || menus.count() != 0) return;
        Category meal = categories.save(new Category(0, "식사", null));
        Category drink = categories.save(new Category(0, "음료", null));
        Category dessert = categories.save(new Category(0, "디저트", null));
        Category korean = categories.save(new Category(0, "한식", meal));
        Category western = categories.save(new Category(0, "양식", meal));
        Category coffee = categories.save(new Category(0, "커피", drink));
        Category tea = categories.save(new Category(0, "차", drink));
        Category bakery = categories.save(new Category(0, "베이커리", dessert));
        add("소고기 비빔밥", 11000, korean, "Y");
        add("버섯 들깨탕", 9500, korean, "Y");
        add("제육 덮밥", 10000, korean, "Y");
        add("김치 볶음밥", 8500, korean, "N");
        add("바질 크림 파스타", 14500, western, "Y");
        add("토마토 리조또", 13000, western, "Y");
        add("그릴드 치킨 샐러드", 12000, western, "Y");
        add("아메리카노", 4500, coffee, "Y");
        add("카페 라떼", 5000, coffee, "Y");
        add("바닐라 라떼", 5500, coffee, "N");
        add("얼그레이", 5000, tea, "Y");
        add("캐모마일", 5000, tea, "Y");
        add("레몬 허브 티", 5500, tea, "Y");
        add("버터 크루아상", 4000, bakery, "Y");
        add("레몬 파운드 케이크", 6000, bakery, "Y");
        add("초콜릿 브라우니", 5500, bakery, "N");
    }

    private void add(String name, int price, Category category, String status) {
        Menu menu = new Menu();
        menu.setMenuName(name);
        menu.setMenuPrice(price);
        menu.setCategory(category);
        menu.setOrderableStatus(status);
        menus.save(menu);
    }
}
