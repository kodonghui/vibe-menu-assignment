import test from 'node:test';
import assert from 'node:assert/strict';
import { isApiRequest } from './e2e/mockApi.js';

test('browser API mocks never intercept Vite source modules', () => {
    for (const path of ['/api/menus', '/api/menus/pages?page=1', '/api/categories']) {
        assert.equal(isApiRequest(new URL(path, 'http://127.0.0.1:8090')), true);
    }
    for (const path of ['/src/api/menu.js', '/src/api/client.js', '/src/api/category.js', '/node_modules/.vite/deps/axios.js']) {
        assert.equal(isApiRequest(new URL(path, 'http://localhost:5175')), false);
    }
});
