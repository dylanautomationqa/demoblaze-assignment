import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../config/env/.env'), quiet: true });

const num = (key: string, fallback: number) => {
    const value = Number(process.env[key]);
    return process.env[key] && Number.isFinite(value) ? value : fallback;
};

export class Constants {

    // Section timeouts
    static readonly TIMEOUTS = {
        TEST: 60000,
        EXPECT: 10000,
        ACTION: 15000,
        NAVIGATION: 30000,
        DIALOG: 10000,
    };

    // Section environment
    static readonly BASE_URL = (process.env.BASE_URL || 'https://www.demoblaze.com').replace(/\/$/, '');
    static readonly API_URL = (process.env.API_URL || 'https://api.demoblaze.com').replace(/\/$/, '');
    static readonly TEST_USERNAME = process.env.TEST_USERNAME ?? '';
    static readonly TEST_PASSWORD = process.env.TEST_PASSWORD ?? '';

    // Section execution
    static readonly WORKERS = num('WORKERS', 4);
    static readonly RETRIES = num('RETRIES', process.env.CI ? 2 : 1);
    static readonly HEADLESS = process.env.HEADLESS !== 'false';

    // Section performance budgets
    static readonly PERF = {
        PAGE_LOAD_BUDGET_MS: num('PERF_PAGE_LOAD_BUDGET_MS', 5000),
        API_P95_BUDGET_MS: num('PERF_API_P95_BUDGET_MS', 1500),
        API_CONCURRENCY: num('PERF_API_CONCURRENCY', 10),
    };

    static readonly OUTPUT_FOLDER = './output';
    static readonly DOWNLOAD_FOLDER = './downloads';
}
