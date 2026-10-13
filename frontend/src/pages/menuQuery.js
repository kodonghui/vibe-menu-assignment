const MAX_INT = 2147483647;
export const MENU_PAGE_SIZE = 12;
const MAX_PAGE = Math.floor(MAX_INT / MENU_PAGE_SIZE) + 1;

function integer(value, minimum, maximum = MAX_INT) {
    const text = value?.trim() || '';
    if (!/^\d+$/.test(text)) return null;
    const number = Number(text);
    return Number.isSafeInteger(number) && number >= minimum && number <= maximum ? String(number) : null;
}

// A copied or edited URL must obey the same integer limits as the form and API.
// Keep unrelated query parameters intact, and replace malformed values before loading.
export function normalizeMenuQuery(params) {
    const next = new URLSearchParams(params);
    const keyword = params.get('q')?.trim();
    if (keyword) next.set('q', keyword);
    else next.delete('q');
    for (const [name, minimum] of [['category', 1], ['price', 0], ['page', 1]]) {
        if (!params.has(name)) continue;
        const value = integer(params.get(name), minimum, name === 'page' ? MAX_PAGE : MAX_INT);
        if (value !== null) next.set(name, value);
        else if (name === 'page') next.set(name, '1');
        else next.delete(name);
    }
    return next;
}
