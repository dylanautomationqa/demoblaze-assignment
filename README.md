# Playwright Automation Assignment – DemoBlaze - Tech99

End-to-end test automation framework for **https://www.demoblaze.com**, built with **Playwright + TypeScript**.
It covers the **Login** and **Cart / Place Order** features with UI, API, regression and performance tests,
runs on several browsers and platforms, and is wired into GitHub Actions with Allure reporting.

| Deliverable | Where |
|---|---|
| Test case suite (Excel) | [`docs/test-cases/DemoBlaze_TestCases.xlsx`](docs/test-cases/DemoBlaze_TestCases.xlsx) – 60 cases, 51 automated |
| Automation framework & demo scripts | this repository |
| Documentation | this README |

----------

## Test Scope

### Demo scenario (required by the assignment)
`tests/ui/cart.spec.ts › TC-ORDER-01` – log in with valid credentials → add a product to cart →
verify the cart → place the order → verify the confirmation (id, amount, card, name) → cart is emptied.

### Coverage

| Area | Functional | Negative / edge / security | Spec |
|---|---|---|---|
| Login (UI) | valid login, session after reload, logout, sign up then log in | wrong password, unknown user, empty fields, case-sensitive password, SQL injection string, masked password, closing the modal | `tests/ui/login.spec.ts` |
| Cart (UI) | add as guest / as user, several products, delete, cart kept across logout/login | same product twice, delete last item, empty cart | `tests/ui/cart.spec.ts` |
| Place order (UI) | logged-in E2E, guest order, amount = cart total | empty form, missing name, missing card, close form, **empty cart**, **wrong date** | `tests/ui/cart.spec.ts` |
| API | sign up, login, token check, products, category filter, cart add/delete/clear | duplicate user, wrong password, unknown user, empty credentials, cart isolation between users | `tests/api/*.api.spec.ts` |
| Performance | page load budget (home, cart), API p95 under concurrency | – | `tests/performance/performance.spec.ts` |
| Load | k6 ramp-up: browse, login, view product | – | `performance/k6/login-load.js` |

### Defects found on the site
Tests for these check what the site *should* do and are marked `test.fail()`. They pass while the defect
exists and will fail – as a signal – once it is fixed.

| Test | Defect |
|---|---|
| TC-ORDER-08 | An order with an **empty cart** is accepted ("Amount: 0 USD"). |
| TC-ORDER-09 | The confirmation **date shows last month** (JavaScript `getMonth()` is 0-based). |
| TC-API-07 | `POST /login` with empty credentials returns **HTTP 500** instead of a 4xx validation error. |

----------

## Project Structure

```
demoblaze-assignment
├── .github/workflows/playwright.yml  # CI: lint → API + UI matrix + performance → Allure → GitHub Pages
├── api/
│   └── DemoblazeApi.ts               # Typed client for api.demoblaze.com (used by API tests and for fast test setup)
├── config/
│   ├── env/.env.example              # All configurable parameters (copy to .env)
│   ├── global.setup.ts               # Cleans result folders before a run
│   └── global.teardown.ts
├── data/
│   └── testData.ts                   # Users, products, customer data, expected messages
├── docs/test-cases/
│   └── DemoBlaze_TestCases.xlsx      # Test case suite
├── fixtures/
│   └── fixture.ts                    # Page objects, API client, per-worker test user, API login
├── locator/                          # Selectors only, one class per page
├── pages/
│   ├── common/BasePage.ts            # Shared actions: click, fill (verified), alerts, modals, @step logging
│   └── ui/                           # HomePage, LoginPage, RegisterPage, ProductPage, CartPage
├── performance/k6/
│   └── login-load.js                 # k6 load test
├── tests/
│   ├── api/                          # @api   – auth, products, cart
│   ├── performance/                  # @performance – page load & API latency budgets
│   └── ui/                           # @ui    – login, cart, place order
├── utilities/
│   ├── constants.ts                  # Reads config/env/.env + defaults
│   ├── assertions.ts, logging.ts, utils.ts
├── playwright.config.ts              # Projects (browsers/platforms), reporters, timeouts
└── tsconfig.json                     # Used by `npm run lint`
```

### Why it is built this way

- **Page Object Model with separate locator classes.** Selectors change more often than flows; keeping them in
  `locator/` means a UI change is fixed in one place, and page classes read as business actions
  (`cartPage.placeOrder(customer)`).
- **Fixtures instead of `beforeEach` boilerplate.** Tests ask for what they need (`loginPage`, `cartPage`,
  `api`, `loggedInUser`). Each worker signs up its own throw-away user through the API, so tests are
  independent and can run in parallel across browsers without sharing a cart.
- **API for setup, UI for what is under test.** Only the tests about logging in use the login form; cart tests
  log in by putting the API token into the `tokenp_` cookie, which is quicker and less flaky.
- **Alerts are asserted, not ignored.** DemoBlaze reports errors through native `alert()`s. `BasePage.acceptDialogDuring()`
  listens *before* the click and fails the test if no alert appears, so a negative test cannot pass by accident.
- **One project per test type.** `api`, `performance` and each browser are separate Playwright projects, so CI can
  run them as separate parallel jobs and you can pick exactly what to run with `--project`.
- **Tags for test selection.** `@smoke`, `@regression`, `@e2e`, `@negative`, `@edge`, `@security`, `@known-defect`,
  plus area tags (`@login`, `@cart`, `@placeorder`, `@api`, `@performance`). Run with `--grep`.
- **Every step is reported.** The `@step` decorator wraps page methods in `test.step`, so Allure/HTML reports show a
  readable step tree; traces, screenshots and videos are kept on failure.

### Things specific to DemoBlaze the framework handles
- A guest cart is tied to a `user` cookie that the site only creates on the home page. Each test gets its own
  `user` cookie (see `fixtures/fixture.ts`); without it, tests that open other pages first would share one cart with every anonymous visitor.
- Bootstrap moves focus into a modal when its animation ends, which can drop text typed at that moment (seen on WebKit).
  `waitForModalShown()` waits for the animation, and `fillElement()` checks the value was kept and fills again if not.

----------

## Tech Stack
Playwright · TypeScript · Node.js · Allure Report · Monocart Report · k6 · GitHub Actions

----------

## Run Tests Locally

### 1. Install
```bash
npm ci
npx playwright install --with-deps
```
Optional: [Allure CLI](https://allurereport.org/docs/install/) (needs Java) for Allure reports and
[k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) for the load test.

### 2. Configure (optional)
```bash
cp config/env/.env.example config/env/.env
```

| Variable | Default | Purpose |
|---|---|---|
| `BASE_URL` | `https://www.demoblaze.com` | Web app under test |
| `API_URL` | `https://api.demoblaze.com` | API under test |
| `TEST_USERNAME` / `TEST_PASSWORD` | empty | Use an existing account; when empty each worker signs up a new one |
| `WORKERS` | `4` | Parallel workers |
| `RETRIES` | `1` locally, `2` on CI | Retries for failed tests |
| `HEADLESS` | `true` | `false` to watch the browser |
| `BRANDED_BROWSERS` | unset | `true` adds Google Chrome and Microsoft Edge projects (must be installed) |
| `PERF_PAGE_LOAD_BUDGET_MS` | `5000` | Page load budget |
| `PERF_API_P95_BUDGET_MS` | `1500` | API p95 latency budget |
| `PERF_API_CONCURRENCY` | `10` | Concurrent API requests in the latency test |

Environment variables set in the shell override the `.env` file.

### 3. Run

| Command | What it runs |
|---|---|
| `npx playwright test --project=chromium --grep @e2e` | **The demo scenario** (login → add to cart → place order) |
| `npm test` | Everything: API, performance, UI on all browsers |
| `npm run test:smoke` | `@smoke` tests on every project |
| `npm run test:regression` | `@regression` tests |
| `npm run test:ui` | UI tests on Chromium, Firefox and WebKit |
| `npm run test:chromium` / `test:firefox` / `test:webkit` | UI tests on one browser |
| `npm run test:tablet` | UI tests on iPad Pro 11 (WebKit, touch) |
| `npm run test:branded` | UI tests on installed Google Chrome and Microsoft Edge |
| `npm run test:api` | API tests (no browser) |
| `npm run test:perf` | Performance budget tests |
| `npm run test:load` | k6 load test (`VUS`, `DURATION`, `P95_MS` env vars) |
| `npm run test:headed` | Chromium with a visible browser |
| `npm run test:debug` | Playwright UI mode |
| `npm run lint` | TypeScript type check |

Playwright options work as usual, e.g. `npx playwright test tests/ui/login.spec.ts --project=firefox --grep @negative`.

----------

## Reports

| Report | How to open |
|---|---|
| Playwright HTML | `npm run report` |
| Allure | `npm run allure` (generate + open) |
| Monocart | `npm run mono:report` |
| JUnit XML | `test-results/junit.xml` (for CI tools such as Jenkins) |

Performance tests attach their measurements (TTFB, DOMContentLoaded, load, p50/p95/max latency) as JSON to each test in the reports.

----------

## CI/CD – GitHub Actions

`.github/workflows/playwright.yml` runs on push and pull request to `main`, every night, and on demand.

```
lint ──┬── api
       ├── ui (matrix: chromium, firefox, webkit, tablet-safari)   ──┐
       ├── performance                                              ├── report (merged Allure) ── deploy to GitHub Pages
       └── load (k6, manual only)                                  ─┘
```

- **Manual run** (Actions → *Tech99 Assignment* → *Run workflow*): `grep` to run only e.g. `@smoke`, and a switch for the k6 load test.
- **Environment:** set repository variables `BASE_URL` / `API_URL` to test another environment without code changes.
- **Artifacts:** Allure results per job, Playwright HTML report for failed jobs, merged Allure report, k6 summary.
- **Allure report on GitHub Pages:** https://dylanautomationqa.github.io/demoblaze-assignment/ (published from `main`).

The same commands work in other CI tools (Jenkins, GitLab CI): `npm ci`, `npx playwright install --with-deps`,
`npx playwright test --project=<name>`, then publish `allure-results/` or `test-results/junit.xml`.

----------

## 👤 Author
Dylan – [@dylanautomationqa](https://github.com/dylanautomationqa)
