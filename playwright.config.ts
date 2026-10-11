import { defineConfig, devices, Project } from '@playwright/test';
import os from 'os';
import { Constants } from './utilities/constants';

const isCI = !!process.env.CI;
const UI_TESTS = /tests[\\/]ui[\\/].*\.spec\.ts/;

const uiProject = (name: string, use: Project['use']): Project => ({
    name,
    testMatch: UI_TESTS,
    use: { ...use, baseURL: Constants.BASE_URL },
});

/* Cross-browser / cross-platform matrix. Pick one with --project=<name>. */
const projects: Project[] = [
    { name: 'api', testMatch: /tests[\\/]api[\\/].*\.spec\.ts/ },
    {
        name: 'performance',
        testMatch: /tests[\\/]performance[\\/].*\.spec\.ts/,
        retries: 0,
        use: { ...devices['Desktop Chrome'], baseURL: Constants.BASE_URL },
    },
    uiProject('chromium', { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } }),
    uiProject('firefox', { ...devices['Desktop Firefox'], viewport: { width: 1920, height: 1080 } }),
    uiProject('webkit', { ...devices['Desktop Safari'], viewport: { width: 1920, height: 1080 } }),
    uiProject('tablet-safari', { ...devices['iPad Pro 11 landscape'] }),
];

/* Branded browsers need a local Chrome / Edge install, so they are opt-in. */
if (process.env.BRANDED_BROWSERS === 'true') {
    projects.push(
        uiProject('chrome', { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1920, height: 1080 } }),
        uiProject('edge', { ...devices['Desktop Edge'], channel: 'msedge', viewport: { width: 1920, height: 1080 } }),
    );
}

export default defineConfig({
    globalSetup: require.resolve('./config/global.setup.ts'),
    globalTeardown: require.resolve('./config/global.teardown.ts'),
    testDir: './tests',
    timeout: Constants.TIMEOUTS.TEST,
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: isCI,
    retries: Constants.RETRIES,
    workers: Constants.WORKERS,
    reporter: [
        [isCI ? 'github' : 'list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        [
            'allure-playwright',
            {
                resultsDir: 'allure-results',
                detail: true,
                suiteTitle: true,
                environmentInfo: {
                    base_url: Constants.BASE_URL,
                    api_url: Constants.API_URL,
                    os_platform: os.platform(),
                    os_release: os.release(),
                    node_version: process.version
                }
            },
        ],
        [
            'monocart-reporter',
            {
                name: 'Tech99 DemoBlaze Report',
                outputFile: 'monocart-report/index.html',
                trend: true,
                attachments: true,
            }
        ]
    ],
    use: {
        headless: Constants.HEADLESS,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: Constants.TIMEOUTS.ACTION,
        navigationTimeout: Constants.TIMEOUTS.NAVIGATION,
    },
    expect: {
        timeout: Constants.TIMEOUTS.EXPECT,
    },
    projects,
});
