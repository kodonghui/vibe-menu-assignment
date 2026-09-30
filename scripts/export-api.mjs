import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const base = process.env.API_BASE_URL || 'http://localhost:8090';
const response = await fetch(base + '/v3/api-docs');
if (!response.ok) throw new Error('API 명세 요청 실패: ' + response.status);
const doc = await response.json();
if (!doc.openapi || !doc.paths?.['/api/menus']) throw new Error('메뉴 서버의 OpenAPI 명세가 아닙니다.');
const output = JSON.stringify(doc, null, 2) + '\n';
mkdirSync(resolve(root, 'design-handoff'), { recursive: true });
writeFileSync(resolve(root, 'api-docs.json'), output, 'utf8');
writeFileSync(resolve(root, 'design-handoff/api-docs.json'), output, 'utf8');
for (const [from, to] of [
    ['frontend/design/montage.tokens.json', 'design-handoff/montage.tokens.json'],
    ['frontend/src/tokens.css', 'design-handoff/tokens.css'],
]) writeFileSync(resolve(root, to), readFileSync(resolve(root, from)), 'utf8');
console.log('실행 서버에서 api-docs.json 추출 및 Claude 첨부 파일 갱신');
