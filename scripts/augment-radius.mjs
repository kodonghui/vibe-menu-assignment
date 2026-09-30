import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const sourceRoot = resolve(process.argv[2] ?? '');
const tokenPath = resolve(process.argv[3] ?? 'frontend/design/montage.tokens.json');
if (!process.argv[2]) throw new Error('Montage 소스 경로를 인자로 지정하세요.');
const tokens = JSON.parse(readFileSync(tokenPath, 'utf8'));
const originalSha = createHash('sha256').update(readFileSync(tokenPath)).digest('hex');
const values = new Map();
function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (entry.name === 'style.ts') {
            const lines = readFileSync(path, 'utf8').split(/\r?\n/);
            lines.forEach((line, i) => {
                const match = line.match(/border-(?:(?:top|bottom)-(?:left|right)-)?radius:\s*(\d+(?:\.\d+)?(?:px|%)?)\s*;/);
                if (!match) return;
                const value = match[1] === '0' ? '0px' : match[1];
                if (!values.has(value)) values.set(value, []);
                values.get(value).push({ file: relative(sourceRoot, path).replaceAll('\\', '/'), line: i + 1 });
            });
        }
    }
}
walk(join(sourceRoot, 'packages/wds/src/components'));
tokens.radius = {};
for (const [value, sources] of [...values].sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))) {
    const name = value.replace('px', '').replace('%', 'pct').replace('.', '-');
    tokens.radius[name] = {
        value,
        usage: 'Montage에서 실제 사용: ' + [...new Set(sources.map(s => s.file.split('/')[4]))].join(', '),
        sources,
    };
}
tokens.$meta.radiusExtraction = {
    source: 'wanteddev/montage-web / packages/wds/src/components/**/style.ts',
    method: '상수인 단일 border-radius 및 corner radius 선언만 추출. 동적 표현식·inherit는 제외.',
    baseTokensSha256: originalSha,
    count: Object.keys(tokens.radius).length,
};
tokens.$meta.notes.excluded = tokens.$meta.notes.excluded.replace('radius 토큰은 원본에 없음.', 'radius는 컴포넌트 소스의 상수를 따로 추출해 보충함.');
writeFileSync(tokenPath, JSON.stringify(tokens, null, 2) + '\n', 'utf8');
console.log('radius ' + Object.keys(tokens.radius).length + '종: ' + Object.values(tokens.radius).map(t => t.value).join(', '));
