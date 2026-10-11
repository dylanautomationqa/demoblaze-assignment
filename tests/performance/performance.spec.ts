import { test, expect } from '../../fixtures/fixture';
import { Page, TestInfo } from '@playwright/test';
import { Constants } from '../../utilities/constants';
import { DemoblazeApi } from '../../api/DemoblazeApi';

const { PAGE_LOAD_BUDGET_MS, API_P95_BUDGET_MS, API_CONCURRENCY } = Constants.PERF;

const percentile = (values: number[], p: number) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
};

async function navigationTiming(page: Page) {
    return page.evaluate(() => {
        const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        return {
            ttfb: Math.round(nav.responseStart - nav.startTime),
            domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
            load: Math.round(nav.loadEventEnd - nav.startTime),
        };
    });
}

async function attachMetrics(testInfo: TestInfo, name: string, metrics: object) {
    await testInfo.attach(name, { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });
}

/** Fires `API_CONCURRENCY` identical calls at once and returns per-request latencies. */
async function measureConcurrent(call: () => Promise<{ ok: () => boolean }>) {
    return Promise.all(Array.from({ length: API_CONCURRENCY }, async () => {
        const start = performance.now();
        const response = await call();
        return { ms: performance.now() - start, ok: response.ok() };
    }));
}

test.describe('Performance', { tag: ['@performance'] }, () => {

    test('TC-PERF-01 - Home page loads within budget', async ({ page }, testInfo) => {
        const start = Date.now();
        await page.goto('/', { waitUntil: 'load' });
        await expect(page.locator('#tbodyid .card').first()).toBeVisible();
        const productsVisibleMs = Date.now() - start;
        const timing = await navigationTiming(page);
        await attachMetrics(testInfo, 'home-page-timing', { ...timing, productsVisibleMs, budgetMs: PAGE_LOAD_BUDGET_MS });

        expect(timing.load, `page load ${timing.load}ms`).toBeLessThan(PAGE_LOAD_BUDGET_MS);
        expect(productsVisibleMs, `products visible after ${productsVisibleMs}ms`).toBeLessThan(PAGE_LOAD_BUDGET_MS);
    });

    test('TC-PERF-02 - Cart page loads within budget', async ({ page }, testInfo) => {
        await page.goto('/cart.html', { waitUntil: 'load' });
        const timing = await navigationTiming(page);
        await attachMetrics(testInfo, 'cart-page-timing', { ...timing, budgetMs: PAGE_LOAD_BUDGET_MS });
        expect(timing.load, `page load ${timing.load}ms`).toBeLessThan(PAGE_LOAD_BUDGET_MS);
    });

    const apiScenarios: { name: string; call: (api: DemoblazeApi, user: { username: string; password: string }) => Promise<{ ok: () => boolean }> }[] = [
        { name: 'GET /entries', call: api => api.getEntries() },
        { name: 'POST /login', call: (api, user) => api.login(user) },
        { name: 'POST /view', call: api => api.viewProduct(1) },
    ];

    for (const scenario of apiScenarios) {
        test(`TC-PERF-03 - ${scenario.name} p95 under ${API_CONCURRENCY} concurrent requests`, async ({ api, testUser }, testInfo) => {
            const results = await measureConcurrent(() => scenario.call(api, testUser));
            const latencies = results.map(r => r.ms);
            const metrics = {
                requests: results.length,
                failed: results.filter(r => !r.ok).length,
                minMs: Math.round(Math.min(...latencies)),
                p50Ms: Math.round(percentile(latencies, 50)),
                p95Ms: Math.round(percentile(latencies, 95)),
                maxMs: Math.round(Math.max(...latencies)),
                budgetP95Ms: API_P95_BUDGET_MS,
            };
            await attachMetrics(testInfo, `${scenario.name}-latency`, metrics);

            expect(metrics.failed, 'failed requests').toBe(0);
            expect(metrics.p95Ms, `p95 ${metrics.p95Ms}ms`).toBeLessThan(API_P95_BUDGET_MS);
        });
    }
});
