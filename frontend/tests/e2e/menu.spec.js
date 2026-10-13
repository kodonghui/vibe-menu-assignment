import { test, expect } from '@playwright/test';
import { deferred, mockApi } from './mockApi.js';

const cards = page => page.getByRole('link', { name: /상세 보기$/ });
const failure = { status: 500, body: { code: 'ERROR_CODE_99999' } };

test('filters and pages survive reload and browser Back/Forward', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    await expect(cards(page)).toHaveCount(12);
    await page.getByRole('button', { name: '다음 페이지', exact: true }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(cards(page)).toHaveCount(4);
    await page.reload();
    await expect(cards(page)).toHaveCount(4);
    await page.getByLabel('이름 검색', { exact: true }).fill('테스트 메뉴 15');
    await page.getByLabel('하위 카테고리', { exact: true }).selectOption('6');
    await page.getByLabel('기준 가격 초과', { exact: true }).fill('14000');
    await page.getByRole('button', { name: '검색', exact: true }).click();
    await expect(cards(page)).toHaveCount(1);
    await expect(page).toHaveURL(/category=6&price=14000&page=1/);
    await page.goBack();
    await expect(cards(page)).toHaveCount(4);
    await expect(page.getByLabel('이름 검색', { exact: true })).toHaveValue('');
    await page.goForward();
    await expect(cards(page)).toHaveCount(1);
    await expect(page.getByLabel('이름 검색', { exact: true })).toHaveValue('테스트 메뉴 15');
    await page.reload();
    await expect(cards(page)).toHaveCount(1);
    await expect(page.getByLabel('하위 카테고리', { exact: true })).toHaveValue('6');
});

test('malformed URL numbers are repaired before any API request', async ({ page }) => {
    const api = await mockApi(page);
    await page.goto('/?page=9999999999999999999999&price=NaN&category=-1');
    await expect(page).toHaveURL(/\/\?page=1$/);
    await expect(cards(page)).toHaveCount(12);
    expect(api.requests.some(request => request.path === '/api/menus/search')).toBe(false);
    expect(api.requests.filter(request => request.path === '/api/menus/pages')
        .every(request => request.query.get('page') === '1')).toBe(true);
    await page.goto('/?q=테스트&page=999');
    await expect(page.getByRole('heading', { name: '이 페이지에 메뉴가 없습니다' })).toBeVisible();
    await page.getByRole('button', { name: '첫 페이지로 이동' }).click();
    await expect(cards(page)).toHaveCount(12);
    await expect(page.getByLabel('이름 검색')).toHaveValue('테스트');
    await page.goto('/?category=999');
    await expect(page.getByLabel('하위 카테고리', { exact: true })).toHaveValue('999');
    await expect(page.getByRole('heading', { name: '조건에 맞는 메뉴가 없습니다' })).toBeVisible();
});

test('price filter remains strictly greater than the boundary', async ({ page }) => {
    await mockApi(page);
    await page.goto('/?price=15000');
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page)).toHaveText(/테스트 메뉴 16/);
    await page.getByRole('button', { name: '필터 초기화', exact: true }).first().click();
    await expect(cards(page)).toHaveCount(12);
    await expect(page.getByLabel('기준 가격 초과')).toHaveValue('');
});

test('category failure and retry do not silently drop the selected filter', async ({ page }) => {
    const api = await mockApi(page);
    api.overrides.set('GET /api/categories', () => failure);
    await page.goto('/?category=6');
    await expect(page.getByText('카테고리를 불러오지 못했습니다', { exact: true })).toBeVisible();
    await page.getByLabel('이름 검색').fill('메뉴 15');
    await page.getByRole('button', { name: '검색', exact: true }).click();
    await expect(page).toHaveURL(/category=6/);
    await expect(cards(page)).toHaveCount(1);
    api.overrides.delete('GET /api/categories');
    await page.getByRole('button', { name: '카테고리 다시 시도' }).click();
    await expect(page.getByLabel('하위 카테고리', { exact: true })).toBeEnabled();
    await expect(page.getByLabel('하위 카테고리', { exact: true })).toHaveValue('6');
});

test('list failure can be retried, and missing menus show a recovery link', async ({ page }) => {
    const api = await mockApi(page);
    api.overrides.set('GET /api/menus/pages', () => failure);
    await page.goto('/');
    await expect(page.getByRole('alert')).toBeVisible();
    api.overrides.delete('GET /api/menus/pages');
    await page.getByRole('button', { name: '다시 시도', exact: true }).click();
    await expect(cards(page)).toHaveCount(12);
    await page.goto('/menus/99999');
    await expect(page.getByRole('heading', { name: '메뉴를 찾을 수 없습니다' })).toBeVisible();
    await expect(page.getByRole('alert').getByRole('link', { name: '메뉴 목록으로' })).toBeVisible();
});

test('save validation and server failure preserve inputs and allow retry', async ({ page }) => {
    const api = await mockApi(page);
    await page.goto('/menus/new');
    await page.getByRole('button', { name: '저장', exact: true }).click();
    await expect(page.getByLabel('메뉴 이름', { exact: false })).toBeFocused();
    await expect(page.getByText('메뉴 이름을 입력해 주세요.', { exact: true })).toBeVisible();
    await page.getByLabel('메뉴 이름', { exact: false }).fill('재시도 메뉴');
    await page.getByLabel('가격 필수', { exact: true }).fill('1.5');
    await page.getByLabel('하위 카테고리 필수', { exact: true }).selectOption('6');
    await page.getByRole('button', { name: '저장', exact: true }).click();
    await expect(page.getByText('가격은 0 이상의 정수로 입력해 주세요.', { exact: true })).toBeVisible();
    await page.getByLabel('가격 필수', { exact: true }).fill('0');
    api.overrides.set('POST /api/menus', () => failure);
    await page.getByRole('button', { name: '저장', exact: true }).click();
    await expect(page.getByText('메뉴를 저장하지 못했습니다', { exact: true })).toBeVisible();
    await expect(page.getByLabel('메뉴 이름', { exact: false })).toHaveValue('재시도 메뉴');
    api.overrides.delete('POST /api/menus');
    await page.getByRole('button', { name: '저장', exact: true }).click();
    await expect(page.getByText('메뉴를 등록했습니다.', { exact: true })).toBeVisible();
    await expect(page.getByText('0원', { exact: true })).toBeVisible();
});

test('a delayed save is single-submit and cannot replace newer navigation', async ({ page }) => {
    const api = await mockApi(page);
    const started = deferred();
    const release = deferred();
    api.overrides.set('POST /api/menus', async () => { started.resolve(); await release.promise; });
    try {
        await page.goto('/menus/new');
        await page.getByLabel('메뉴 이름', { exact: false }).fill('지연 저장 메뉴');
        await page.getByLabel('가격 필수', { exact: true }).fill('4000');
        await page.getByLabel('하위 카테고리 필수', { exact: true }).selectOption('6');
        await page.getByRole('button', { name: '저장', exact: true }).dblclick();
        await started.promise;
        await expect(page.getByRole('button', { name: '저장 중…' })).toBeDisabled();
        expect(api.requests.filter(request => request.method === 'POST')).toHaveLength(1);
        await page.getByRole('navigation', { name: '주 메뉴' }).getByRole('link', { name: '메뉴 목록' }).click();
        await expect(cards(page)).toHaveCount(12);
        release.resolve();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/$/);
        await expect(page.getByRole('heading', { name: '메뉴 목록', exact: true })).toBeVisible();
    } finally { release.resolve(); }
});

test('delete cancel, Escape, and keyboard focus are repeatable', async ({ page }) => {
    const api = await mockApi(page);
    await page.goto('/menus/1');
    const open = page.getByRole('button', { name: '삭제', exact: true });
    await open.click();
    const dialog = page.getByRole('alertdialog');
    const cancel = dialog.getByRole('button', { name: '취소', exact: true });
    await expect(cancel).toBeFocused();
    await cancel.press('Shift+Tab');
    await expect(dialog.getByRole('button', { name: '삭제 확인' })).toBeFocused();
    await dialog.getByRole('button', { name: '삭제 확인' }).press('Tab');
    await expect(cancel).toBeFocused();
    await cancel.click();
    await expect(dialog).toHaveCount(0);
    await expect(open).toBeFocused();
    await open.click();
    await dialog.getByRole('button', { name: '취소', exact: true }).press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(open).toBeFocused();
    expect(api.requests.filter(request => request.method === 'DELETE')).toHaveLength(0);
});

test('a delayed delete is single-submit and never interrupts a new form', async ({ page }) => {
    const api = await mockApi(page);
    const started = deferred();
    const release = deferred();
    api.overrides.set('DELETE /api/menus/1', async () => { started.resolve(); await release.promise; });
    try {
        await page.goto('/');
        await cards(page).filter({ hasText: '테스트 메뉴 1' }).first().click();
        await page.getByRole('button', { name: '삭제', exact: true }).click();
        await page.getByRole('button', { name: '삭제 확인', exact: true }).dblclick();
        await started.promise;
        expect(api.requests.filter(request => request.method === 'DELETE')).toHaveLength(1);
        await page.getByRole('alertdialog').press('Escape');
        await expect(page.getByRole('alertdialog')).toBeVisible();
        await page.goBack();
        await page.getByRole('navigation', { name: '주 메뉴' }).getByRole('link', { name: '메뉴 등록' }).click();
        await page.getByLabel('메뉴 이름', { exact: false }).fill('작성 중인 새 메뉴');
        release.resolve();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/menus\/new$/);
        await expect(page.getByLabel('메뉴 이름', { exact: false })).toHaveValue('작성 중인 새 메뉴');
    } finally { release.resolve(); }
});

test('a menu deleted elsewhere exits the confirmation dialog', async ({ page }) => {
    const api = await mockApi(page);
    await page.goto('/menus/1');
    await page.getByRole('button', { name: '삭제', exact: true }).click();
    api.menus = api.menus.filter(menu => menu.menuCode !== 1);
    await page.getByRole('button', { name: '삭제 확인', exact: true }).click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: '메뉴를 찾을 수 없습니다' })).toBeVisible();
});

test('mobile layout stays within the viewport and theme persists', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await mockApi(page);
    await page.goto('/');
    await expect(cards(page)).toHaveCount(12);
    await expect(page.getByRole('navigation', { name: '모바일 페이지 이동' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('button', { name: '다크 테마로 전환' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await cards(page).first().click();
    await page.getByRole('button', { name: '삭제', exact: true }).click();
    const bounds = await page.getByRole('alertdialog').boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(360);
    await page.getByRole('button', { name: '취소', exact: true }).click();
    await page.getByRole('link', { name: '수정', exact: true }).click();
    await expect(page.getByRole('button', { name: '저장', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
