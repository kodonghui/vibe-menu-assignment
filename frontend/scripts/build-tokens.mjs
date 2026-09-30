/**
 * design/montage.tokens.json 을 읽어 src/tokens.css 를 만든다.
 *
 * 실행: npm run tokens
 *
 * 색은 semantic 만 내보낸다. atomic 팔레트는 토큰 파일의 usage 설명대로
 * "직접 쓸 때는 semantic 우선"이므로 CSS 변수로 노출하지 않는다.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const SRC = resolve(root, 'design/montage.tokens.json');
const OUT = resolve(root, 'src/tokens.css');

const tokens = JSON.parse(readFileSync(SRC, 'utf8'));

/* 'accent' + 'foreground' + 'lime' -> '--accent-foreground-lime'
 * 키에 점이 섞인 간격 값(0.5)은 하이픈으로 바꾼다. */
const varName = (parts) =>
    '--' +
    parts
        .join('-')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/\./g, '-')
        .toLowerCase();

/* semantic 색은 그룹 깊이가 제각각이다.
 * (primary.normal 은 2단, accent.foreground.lime 은 3단)
 * light / dark 를 함께 가진 지점을 만나면 거기가 잎이다. */
function collectThemed(node, path, light, dark) {
    if (!node || typeof node !== 'object') return;

    const hasTheme = node.light !== undefined && node.dark !== undefined;
    if (hasTheme) {
        const name = varName(path);
        light.push([name, node.light.value ?? node.light]);
        dark.push([name, node.dark.value ?? node.dark]);
        return;
    }
    for (const key of Object.keys(node)) {
        collectThemed(node[key], [...path, key], light, dark);
    }
}

const light = [];
const dark = [];
collectThemed(tokens.color.semantic, [], light, dark);
collectThemed(tokens.shadow, ['shadow'], light, dark);

/* 테마와 무관한 값들 */
const flat = [];
for (const [step, value] of Object.entries(tokens.spacing)) {
    flat.push([varName(['space', step]), value]);
}
for (const [name, value] of Object.entries(tokens.zIndex ?? {})) {
    flat.push([varName(['z', name]), String(value)]);
}
for (const [name, token] of Object.entries(tokens.radius ?? {})) {
    flat.push([varName(['radius', name]), token.value]);
}
for (const [name, value] of Object.entries(tokens.opacity ?? {})) {
    flat.push([varName(['opacity', name]), String(value)]);
}

const decls = (pairs) => pairs.map(([k, v]) => `    ${k}: ${v};`).join('\n');

/* 타입 스타일. 굵기는 스타일마다 값이 달라서(bold 가 700 또는 600)
 * 전역 유틸리티로 묶지 않고 스타일별 조합 클래스로 낸다.
 *   <h1 className="title1 bold">  ->  .title1 + .title1.bold */
const typography = Object.entries(tokens.typography)
    .map(([name, t]) => {
        const base =
            `.${name} {\n` +
            `    font-size: ${t.fontSize};\n` +
            `    line-height: ${t.lineHeight};\n` +
            `    letter-spacing: ${t.letterSpacing};\n` +
            `    font-weight: ${t.fontWeight.regular};\n` +
            `}`;
        const medium = `.${name}.medium { font-weight: ${t.fontWeight.medium}; }`;
        const bold = `.${name}.bold { font-weight: ${t.fontWeight.bold}; }`;
        return [base, medium, bold].join('\n');
    })
    .join('\n\n');

const css = `/* 이 파일은 scripts/build-tokens.mjs 가 만든다. 직접 고치지 말 것.
 * 토큰을 바꾸려면 design/montage.tokens.json 을 고치고 npm run tokens 를 다시 돌린다. */

:root {
${decls(light)}

${decls(flat)}
}

[data-theme="dark"] {
${decls(dark)}
}

${typography}
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, css, 'utf8');

console.log(`src/tokens.css 생성`);
console.log(`  색(semantic) + 그림자 : ${light.length}개, 두 테마`);
console.log(`  간격 · z-index        : ${flat.length}개`);
console.log(`  타입 스타일           : ${Object.keys(tokens.typography).length}종`);
