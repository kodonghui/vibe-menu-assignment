import assert from 'node:assert/strict';
const base = process.env.API_BASE_URL || 'http://localhost:8090';
const origin = 'http://localhost:5175';
const createdCodes = new Set();
async function request(path, method = 'GET', body) {
    const response = await fetch(base + path, { method, headers: {
        Origin: origin, ...(body ? { 'Content-Type': 'application/json' } : {}),
    }, body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    signal: AbortSignal.timeout(10000) });
    const data = await response.json();
    if (method === 'POST' && path === '/api/menus' && data.result?.menu?.menuCode > 0) {
        createdCodes.add(data.result.menu.menuCode);
    }
    return { response, data };
}
let code;
try {
    const before = await request('/api/menus');
    assert.equal(before.response.status, 200);
    assert.equal(before.response.headers.get('access-control-allow-origin'), origin);
    assert.ok(Array.isArray(before.data.result.menus));
    const categories = await request('/api/categories');
    assert.equal(categories.response.status, 200);
    const child = categories.data.result.categories.find(c => c.refCategoryCode !== null);
    assert.ok(child);
    const parent = categories.data.result.categories.find(c => c.refCategoryCode === null);
    assert.ok(parent);
    const category = await request('/api/categories/' + child.categoryCode);
    assert.equal(category.response.status, 200);
    assert.equal(category.data.result.category.categoryCode, child.categoryCode);
    const page = await request('/api/menus/pages?page=1&size=3');
    assert.equal(page.response.status, 200);
    assert.equal(page.data.result.number, 1);
    assert.ok(page.data.result.content.length <= 3);
    const sorted = await request('/api/menus/pages/sort?page=1&size=3&sortBy=menuPrice&direction=ASC');
    assert.equal(sorted.response.status, 200);
    assert.equal(sorted.data.result.number, 1);
    const prices = sorted.data.result.content.map(menu => menu.menuPrice);
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
    const limited = await request('/api/menus/pages?page=1&size=1000');
    assert.equal(limited.data.result.size, 100);
    const payload = { menuName: 'API 검사 메뉴 ' + Date.now(), menuPrice: 5000, categoryCode: child.categoryCode, orderableStatus: 'Y' };
    const created = await request('/api/menus', 'POST', payload);
    assert.equal(created.response.status, 201);
    code = created.data.result.menu.menuCode;
    assert.ok(code > 0);
    assert.equal((await request('/api/menus/' + code)).data.result.menu.menuName, payload.menuName);
    const price = await request('/api/menus/search?menuPrice=5000');
    assert.ok(price.data.result.menus.every(menu => menu.menuPrice > 5000));
    assert.ok(!price.data.result.menus.some(menu => menu.menuCode === code));
    const updated = await request('/api/menus/' + code, 'PUT', { ...payload, menuName: '수정한 API 검사 메뉴', menuPrice: 6000, orderableStatus: 'N' });
    assert.equal(updated.response.status, 200);
    assert.equal(updated.data.result.menu.orderableStatus, 'N');
    const missingCategory = await request('/api/menus', 'POST', { ...payload, categoryCode: -1 });
    assert.equal(missingCategory.response.status, 400);
    assert.equal(missingCategory.data.code, 'ERROR_CODE_00003');
    for (const invalid of [
        { ...payload, menuName: '' }, { ...payload, menuName: ' '.repeat(3) },
        { ...payload, menuName: '가'.repeat(101) }, { ...payload, menuPrice: -1 },
        { ...payload, menuPrice: null }, { ...payload, menuPrice: 1.5 },
        { ...payload, menuPrice: 2147483648 }, { ...payload, menuPrice: undefined },
        { ...payload, orderableStatus: 'maybe' }, { ...payload, categoryCode: parent.categoryCode },
    ]) {
        const rejected = await request('/api/menus', 'POST', invalid);
        assert.equal(rejected.response.status, 400, JSON.stringify(invalid));
        assert.equal(rejected.data.code, 'ERROR_CODE_00003');
    }
    for (const invalidCode of [0, -1, parent.categoryCode]) {
        const rejected = await request('/api/menus/' + code, 'PUT', { ...payload, categoryCode: invalidCode });
        assert.equal(rejected.response.status, 400);
        assert.equal(rejected.data.code, 'ERROR_CODE_00003');
    }
    const preserved = await request('/api/menus/' + code);
    assert.equal(preserved.data.result.menu.menuName, '수정한 API 검사 메뉴');
    assert.equal(preserved.data.result.menu.menuPrice, 6000);
    assert.equal(preserved.data.result.menu.orderableStatus, 'N');
    const malformed = await request('/api/menus', 'POST', '{');
    assert.equal(malformed.response.status, 400);
    assert.equal(malformed.data.code, 'ERROR_CODE_00003');
    for (const path of ['/api/menus/search', '/api/menus/search?menuPrice=abc', '/api/menus/abc', '/api/menus/pages/sort?sortBy=unknown', '/api/menus/pages/sort?direction=sideways',
        '/api/menus/pages?page=2147483647&size=12', '/api/menus/pages/sort?page=2147483647&size=12']) {
        const rejected = await request(path);
        assert.equal(rejected.response.status, 400);
        assert.equal(rejected.data.code, 'ERROR_CODE_00003');
    }
    const preflight = await fetch(base + '/api/menus', { method: 'OPTIONS', headers: {
        Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type',
    } });
    assert.equal(preflight.status, 200);
    assert.ok(preflight.headers.get('access-control-allow-methods').includes('POST'));
    const denied = await fetch(base + '/api/menus', { headers: { Origin: 'http://localhost:5999' } });
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
    const deleted = await request('/api/menus/' + code, 'DELETE');
    assert.equal(deleted.response.status, 200);
    assert.equal(deleted.data.httpStatus, 204);
    assert.equal(deleted.data.result.deletedMenuCode, code);
    const missing = await request('/api/menus/' + code);
    assert.equal(missing.response.status, 404);
    assert.equal(missing.data.code, 'ERROR_CODE_00001');
    createdCodes.delete(code);
    code = null;
    const after = await request('/api/menus');
    assert.equal(after.data.result.menus.length, before.data.result.menus.length);
    const docs = await (await fetch(base + '/v3/api-docs')).json();
    const operations = Object.values(docs.paths).reduce((n, path) => n + Object.keys(path).filter(method => ['get', 'post', 'put', 'delete'].includes(method)).length, 0);
    assert.equal(operations, 10);
    assert.equal((await fetch(base + '/swagger-ui.html')).status, 200);
    console.log('PASS: 목록·페이징·정렬·카테고리·등록·상세·수정·가격 초과·입력 검증·수정 실패 보존·400/404·삭제·CORS·Swagger / 10개 API');
} finally {
    for (const createdCode of createdCodes) {
        const cleaned = await request('/api/menus/' + createdCode, 'DELETE');
        assert.ok([200, 404].includes(cleaned.response.status), '검사 메뉴 정리 실패: ' + createdCode);
    }
}
