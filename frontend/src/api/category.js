import { getResult } from './client.js';

/**
 * 카테고리는 상위-하위 두 단계다.
 * 최상위(식사·음료·디저트)는 refCategoryCode 가 null 이고,
 * 메뉴가 실제로 속하는 것은 하위 카테고리다.
 */
export async function fetchCategories(signal) {
    const result = await getResult('/api/categories', { signal });
    return result.categories;
}

/** 메뉴를 담을 수 있는 하위 카테고리만 추린다. 필터와 폼 선택 목록에 쓴다. */
export function onlyChildren(categories) {
    return categories.filter((c) => c.refCategoryCode !== null);
}
