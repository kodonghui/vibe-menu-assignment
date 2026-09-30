import assert from 'node:assert/strict';
const base = process.env.API_BASE_URL || 'http://localhost:8090';
const origin = 'http://localhost:5175';
async function request(path, method = 'GET', body) {
    const response = await fetch(base + path, { method, headers: {
        Origin: origin, ...(body ? { 'Content-Type': 'application/json' } : {}),
    }, body: body ? JSON.stringify(body) : undefined });
    return { response, data: await response.json() };
}
let code;
try {
    const before = await request('/api/menus');
    assert.equal(before.response.status, 200);
    assert.equal(before.response.headers.get('access-control-allow-origin'), origin);
    assert.ok(Array.isArray(before.data.result.menus));
    const categories = await request('/api/categories');
    const child = categories.data.result.categories.find(c => c.refCategoryCode !== null);
    assert.ok(child);
    const page = await request('/api/menus/pages?page=1&size=3');
    assert.equal(page.data.result.number, 1);
    assert.ok(page.data.result.content.length <= 3);
    const sorted = await request('/api/menus/pages/sort?page=1&size=3&sortBy=menuPrice&direction=ASC');
    assert.equal(sorted.response.status, 200);
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
    code = null;
    const after = await request('/api/menus');
    assert.equal(after.data.result.menus.length, before.data.result.menus.length);
    const docs = await (await fetch(base + '/v3/api-docs')).json();
    const operations = Object.values(docs.paths).reduce((n, path) => n + Object.keys(path).filter(method => ['get', 'post', 'put', 'delete'].includes(method)).length, 0);
    assert.equal(operations, 10);
    assert.equal((await fetch(base + '/swagger-ui.html')).status, 200);
    console.log('PASS: 목록·페이징·정렬·카테고리·등록·상세·수정·가격 초과·400/404·삭제·CORS·Swagger / 10개 API');
} finally {
    if (code) await request('/api/menus/' + code, 'DELETE');
}
