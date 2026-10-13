import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: process.env.UI_BASE_URL || 'http://localhost:5175',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: process.env.UI_BASE_URL ? undefined : {
        command: 'npm run dev',
        env: { VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8090' },
        url: 'http://localhost:5175',
        reuseExistingServer: !process.env.CI,
        timeout: 30000,
    },
});
