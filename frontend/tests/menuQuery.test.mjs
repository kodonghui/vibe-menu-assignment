import test from 'node:test';
import assert from 'node:assert/strict';
import { MENU_PAGE_SIZE, normalizeMenuQuery } from '../src/pages/menuQuery.js';

const normalize = query => normalizeMenuQuery(new URLSearchParams(query));

test('keeps valid search conditions and unrelated URL parameters', () => {
    assert.equal(normalize('q=coffee&category=6&price=0&page=2&source=bookmark').toString(),
        'q=coffee&category=6&price=0&page=2&source=bookmark');
    assert.equal(normalize('').toString(), '');
});

test('canonicalizes whitespace, leading zeroes, and repeated fields', () => {
    const result = normalize('q=++coffee++&price=0000&category=06&page=02&page=3');
    assert.deepEqual([...result], [['q', 'coffee'], ['price', '0'], ['category', '6'], ['page', '2']]);
    assert.equal(normalize('q=+++').toString(), '');
});

for (const invalid of ['NaN', 'Infinity', '-1', '1.2', '1e3', '2junk', '2147483648', '9999999999999999999999', '']) {
    test(`rejects malformed API numbers: ${JSON.stringify(invalid)}`, () => {
        const params = new URLSearchParams({ page: invalid, price: invalid, category: invalid });
        assert.deepEqual([...normalizeMenuQuery(params)], [['page', '1']]);
    });
}

test('accepts int32 price/category boundary, while page and category must be positive', () => {
    assert.equal(normalize('price=2147483647&category=2147483647').toString(),
        'price=2147483647&category=2147483647');
    assert.equal(normalize('page=0&category=0&price=0').toString(), 'page=1&price=0');
});

test('limits page offsets to the JPA int32 range', () => {
    const maxPage = Math.floor(2147483647 / MENU_PAGE_SIZE) + 1;
    assert.equal(normalize(`page=${maxPage}`).get('page'), String(maxPage));
    assert.equal(normalize(`page=${maxPage + 1}`).get('page'), '1');
    assert.equal(normalize('page=2147483647').get('page'), '1');
});

test('normalization is idempotent', () => {
    const first = normalize('q=+tea+&category=0006&price=NaN&page=2junk&source=copy');
    assert.equal(normalizeMenuQuery(first).toString(), first.toString());
});
