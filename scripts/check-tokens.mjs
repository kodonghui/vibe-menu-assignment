import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const css = readFileSync(join(root, 'frontend/src/tokens.css'), 'utf8');
const tokens = JSON.parse(readFileSync(join(root, 'frontend/design/montage.tokens.json'), 'utf8'));
const declared = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
const missing = [];
function walk(dir) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, item.name);
        if (item.isDirectory()) walk(path);
        else if (item.name.endsWith('.css') && item.name !== 'tokens.css') {
            const text = readFileSync(path, 'utf8');
            for (const match of text.matchAll(/var\((--[\w-]+)/g)) {
                if (!declared.has(match[1])) missing.push(path + ': ' + match[1]);
            }
            assert.ok(!/(?:#[\da-f]{3,8}\b|\b(?:rgba?|hsla?)\()/i.test(text), path + ': 하드코딩 색');
            assert.ok(!/font-size\s*:/i.test(text), path + ': 글자 크기 하드코딩');
        }
    }
}
walk(join(root, 'frontend/src'));
assert.deepEqual(missing, []);
assert.ok(Object.keys(tokens.radius).length > 0);
assert.equal(tokens.color.atomic.blue['50'].value, '#0066FF');
console.log('PASS: CSS 토큰 참조·색/글자 하드코딩·radius. 원본 blue.50 = #0066FF');
