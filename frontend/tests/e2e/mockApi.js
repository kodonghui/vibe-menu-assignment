export function deferred() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
}

export function isApiRequest(url) {
    // Vite also serves source modules under /src/api/; never intercept those.
    return url.pathname.startsWith('/api/');
}

export async function mockApi(page) {
    const headers = {
        'access-control-allow-origin': new URL(process.env.UI_BASE_URL || 'http://localhost:5175').origin,
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': 'Content-Type',
    };
    const state = {
        requests: [],
        overrides: new Map(),
        categories: [
            { categoryCode: 1, categoryName: '식사', refCategoryCode: null, refCategoryName: null },
            { categoryCode: 2, categoryName: '음료', refCategoryCode: null, refCategoryName: null },
            { categoryCode: 4, categoryName: '한식', refCategoryCode: 1, refCategoryName: '식사' },
            { categoryCode: 6, categoryName: '커피', refCategoryCode: 2, refCategoryName: '음료' },
        ],
        menus: Array.from({ length: 16 }, (_, index) => ({
            menuCode: index + 1, menuName: `테스트 메뉴 ${index + 1}`, menuPrice: (index + 1) * 1000,
            categoryCode: index < 8 ? 4 : 6, categoryName: index < 8 ? '한식' : '커피', orderableStatus: 'Y',
        })),
    };
    await page.route(isApiRequest, async route => {
        const request = route.request();
        const url = new URL(request.url());
        const method = request.method();
        if (method === 'OPTIONS') return route.fulfill({ status: 204, headers, body: '' });
        state.requests.push({ method, path: url.pathname, query: url.searchParams });
        const override = state.overrides.get(`${method} ${url.pathname}`);
        const overridden = override && await override(request);
        if (overridden) return route.fulfill({ status: overridden.status || 200, headers, json: overridden.body });

        let status = 200;
        let httpStatus = 200;
        let result;
        const code = Number(url.pathname.split('/').at(-1));
        const found = state.menus.find(menu => menu.menuCode === code);
        if (method === 'GET' && url.pathname === '/api/categories') result = { categories: state.categories };
        else if (method === 'GET' && url.pathname === '/api/menus/pages') {
            const number = Number(url.searchParams.get('page'));
            const size = Number(url.searchParams.get('size'));
            const totalPages = Math.ceil(state.menus.length / size);
            result = { content: state.menus.slice((number - 1) * size, number * size), number, size,
                totalElements: state.menus.length, totalPages, first: number === 1, last: number >= totalPages };
        } else if (method === 'GET' && url.pathname === '/api/menus/search') {
            result = { menus: state.menus.filter(menu => menu.menuPrice > Number(url.searchParams.get('menuPrice'))) };
        } else if (method === 'GET' && url.pathname === '/api/menus') result = { menus: state.menus };
        else if (method === 'POST' && url.pathname === '/api/menus') {
            const body = request.postDataJSON();
            const category = state.categories.find(item => item.categoryCode === body.categoryCode);
            const menu = { ...body, menuCode: Math.max(0, ...state.menus.map(item => item.menuCode)) + 1,
                categoryName: category.categoryName };
            state.menus.push(menu);
            result = { menu };
            status = 201;
            httpStatus = 201;
        } else if (!found) {
            return route.fulfill({ status: 404, headers, json: { code: 'ERROR_CODE_00001', description: '메뉴 없음' } });
        } else if (method === 'GET') result = { menu: found };
        else if (method === 'PUT') {
            Object.assign(found, request.postDataJSON());
            result = { menu: found };
        } else if (method === 'DELETE') {
            state.menus = state.menus.filter(menu => menu.menuCode !== code);
            result = { deletedMenuCode: code };
            httpStatus = 204;
        }
        return route.fulfill({ status, headers, json: { httpStatus, result } });
    });
    return state;
}
