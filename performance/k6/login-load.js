// k6 load test for the DemoBlaze API: browse products, log in, view a product.
// Run: k6 run performance/k6/login-load.js
// Tune with env: API_URL, VUS, DURATION, P95_MS, TEST_USERNAME, TEST_PASSWORD
import http from 'k6/http';
import encoding from 'k6/encoding';
import { check, group, sleep } from 'k6';

const API_URL = __ENV.API_URL || 'https://api.demoblaze.com';
const VUS = Number(__ENV.VUS || 5);
const DURATION = __ENV.DURATION || '30s';
const P95_MS = Number(__ENV.P95_MS || 1500);
const headers = { 'Content-Type': 'application/json' };

export const options = {
  stages: [
    { duration: '10s', target: VUS },
    { duration: DURATION, target: VUS },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: [`p(95)<${P95_MS}`],
    checks: ['rate>0.99'],
  },
};

// One shared account for the whole run, created once before the load starts.
export function setup() {
  const user = {
    username: __ENV.TEST_USERNAME || `k6_${Date.now()}`,
    password: __ENV.TEST_PASSWORD || 'k6_password',
  };
  if (!__ENV.TEST_USERNAME) {
    http.post(`${API_URL}/signup`, JSON.stringify({ username: user.username, password: encoding.b64encode(user.password) }), { headers });
  }
  return user;
}

export default function (user) {
  group('browse products', () => {
    const res = http.get(`${API_URL}/entries`);
    check(res, {
      'entries 200': r => r.status === 200,
      'entries has items': r => r.json('Items.#') > 0,
    });
  });

  group('login', () => {
    const res = http.post(`${API_URL}/login`, JSON.stringify({ username: user.username, password: encoding.b64encode(user.password) }), { headers });
    check(res, {
      'login 200': r => r.status === 200,
      'login returns token': r => String(r.body).includes('Auth_token'),
    });
  });

  group('view product', () => {
    const res = http.post(`${API_URL}/view`, JSON.stringify({ id: '1' }), { headers });
    check(res, { 'view 200': r => r.status === 200 });
  });

  sleep(1);
}
