import { test, expect } from '@playwright/test';

// No mocks here: CI starts the Spring/MySQL service before this browser test.
test('real API: create, update, cancel deletion, delete, and verify 404', async ({ page, request }) => {
    const apiBase = process.env.API_BASE_URL || 'http://127.0.0.1:8090';
    const marker = `브라우저 검증 ${Date.now()}`;
    const categoryResponse = await request.get(`${apiBase}/api/categories`);
    expect(categoryResponse.ok()).toBe(true);
    const categories = (await categoryResponse.json()).result.categories;
    const category = categories.find(item => item.refCategoryCode !== null);
    expect(category).toBeTruthy();
    let code;
    try {
        await page.goto('/menus/new');
        await page.getByLabel('메뉴 이름', { exact: false }).fill(marker);
        await page.getByLabel('가격 필수', { exact: true }).fill('0');
        await page.getByLabel('하위 카테고리 필수', { exact: true }).selectOption(String(category.categoryCode));
        const created = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith('/api/menus'));
        await page.getByRole('button', { name: '저장', exact: true }).click();
        const response = await created;
        expect(response.status()).toBe(201);
        code = (await response.json()).result.menu.menuCode;
        await expect(page).toHaveURL(new RegExp(`/menus/${code}$`));
        await expect(page.getByText(marker, { exact: true })).toBeVisible();
        await expect(page.getByText('0원', { exact: true })).toBeVisible();
        await page.getByRole('link', { name: '수정', exact: true }).click();
        await page.getByLabel('메뉴 이름', { exact: false }).fill(`${marker} 수정`);
        await page.getByLabel('가격 필수', { exact: true }).fill('7300');
        await page.getByRole('radio', { name: '주문 불가', exact: true }).check();
        await page.getByRole('button', { name: '저장', exact: true }).click();
        await expect(page.getByText('메뉴를 수정했습니다.', { exact: true })).toBeVisible();
        await expect(page.getByText('7,300원', { exact: true })).toBeVisible();
        const saved = (await (await request.get(`${apiBase}/api/menus/${code}`)).json()).result.menu;
        expect(saved).toMatchObject({ menuName: `${marker} 수정`, menuPrice: 7300, orderableStatus: 'N', categoryCode: category.categoryCode });
        await page.getByRole('button', { name: '삭제', exact: true }).click();
        await page.getByRole('button', { name: '취소', exact: true }).click();
        expect((await request.get(`${apiBase}/api/menus/${code}`)).status()).toBe(200);
        await page.getByRole('button', { name: '삭제', exact: true }).click();
        const deleted = page.waitForResponse(result => result.request().method() === 'DELETE');
        await page.getByRole('button', { name: '삭제 확인', exact: true }).click();
        const deletion = await deleted;
        expect(deletion.status()).toBe(200);
        expect((await deletion.json()).httpStatus).toBe(204);
        await expect(page.getByText('메뉴를 삭제했습니다.', { exact: true })).toBeVisible();
        expect((await request.get(`${apiBase}/api/menus/${code}`)).status()).toBe(404);
        await page.goto(`/menus/${code}`);
        await expect(page.getByRole('heading', { name: '메뉴를 찾을 수 없습니다' })).toBeVisible();
    } finally {
        // Also clean up a created row if an assertion failed before its code was recorded.
        const response = await request.get(`${apiBase}/api/menus`);
        if (response.ok()) {
            const menus = (await response.json()).result.menus;
            for (const menu of menus.filter(item => item.menuCode === code || item.menuName === marker || item.menuName === `${marker} 수정`)) {
                await request.delete(`${apiBase}/api/menus/${menu.menuCode}`);
            }
        }
    }
});
