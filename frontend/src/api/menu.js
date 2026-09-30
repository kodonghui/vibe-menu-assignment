import { getResult, postResult, putResult, deleteResult } from './client.js';

/** 페이지 단위 조회. page 는 1부터 센다. */
export async function fetchMenuPage({ page = 1, size = 12 }, signal) {
    const result = await getResult('/api/menus/pages', {
        params: { page, size },
        signal,
    });
    return {
        menus: result.content,
        page: result.number,
        size: result.size,
        totalPages: result.totalPages,
        totalElements: result.totalElements,
        first: result.first,
        last: result.last,
    };
}

/** 전체 조회. 카테고리 필터와 이름 검색은 이 목록을 받아 화면에서 거른다. */
export async function fetchAllMenus(signal) {
    const result = await getResult('/api/menus', { signal });
    return result.menus;
}

export async function fetchMenu(menuCode, signal) {
    const result = await getResult(`/api/menus/${menuCode}`, { signal });
    return result.menu;
}

/** 지정한 가격을 초과하는 메뉴만 돌려준다. 미만이 아니다. */
export async function searchMenusOverPrice(menuPrice, signal) {
    const result = await getResult('/api/menus/search', {
        params: { menuPrice },
        signal,
    });
    return result.menus;
}

/** 등록할 때 menuCode 는 서버가 채우므로 보내지 않는다. */
export async function createMenu({ menuName, menuPrice, categoryCode, orderableStatus }) {
    const result = await postResult('/api/menus', {
        menuName,
        menuPrice,
        categoryCode,
        orderableStatus,
    });
    return result.menu;
}

export async function updateMenu(menuCode, { menuName, menuPrice, categoryCode, orderableStatus }) {
    const result = await putResult(`/api/menus/${menuCode}`, {
        menuName,
        menuPrice,
        categoryCode,
        orderableStatus,
    });
    return result.menu;
}

export async function removeMenu(menuCode) {
    const result = await deleteResult(`/api/menus/${menuCode}`);
    return result.deletedMenuCode;
}
