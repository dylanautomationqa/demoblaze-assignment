import { test, expect } from '../../fixtures/fixture';
import { generateRandomUser, invalidUsers, messages } from '../../data/testData';

test.describe('Auth API', { tag: ['@api', '@login'] }, () => {

    test('TC-API-01 - Sign up a new user', { tag: ['@smoke', '@regression'] }, async ({ api }) => {
        const response = await api.signUp(generateRandomUser());
        expect(response.status()).toBe(200);
        expect(await response.json()).toBe('');
    });

    test('TC-API-02 - Sign up with an existing username is rejected', { tag: ['@regression', '@negative'] }, async ({ api, testUser }) => {
        const response = await api.signUp(testUser);
        expect(await response.json()).toEqual({ errorMessage: messages.userAlreadyExists });
    });

    test('TC-API-03 - Login with valid credentials returns a token', { tag: ['@smoke', '@regression'] }, async ({ api, testUser }) => {
        const response = await api.login(testUser);
        expect(response.status()).toBe(200);
        expect(await response.json()).toMatch(/^Auth_token: \S+$/);
    });

    test('TC-API-04 - Returned token is valid for the user', { tag: ['@regression'] }, async ({ api, testUser }) => {
        const token = await api.getAuthToken(testUser);
        const body = await (await api.checkToken(token)).json();
        expect(body.Item.username).toBe(testUser.username);
        expect(body.Item.token).toBe(token);
    });

    test('TC-API-05 - Login with wrong password', { tag: ['@regression', '@negative'] }, async ({ api, testUser }) => {
        const response = await api.login({ username: testUser.username, password: 'wrong_password' });
        expect(await response.json()).toEqual({ errorMessage: messages.wrongPassword });
    });

    test('TC-API-06 - Login with non-existing user', { tag: ['@regression', '@negative'] }, async ({ api }) => {
        const response = await api.login(invalidUsers.nonExistingUser);
        expect(await response.json()).toEqual({ errorMessage: messages.userNotExist });
    });

    test('TC-API-07 - Login with empty credentials should return a validation error', {
        tag: ['@regression', '@negative', '@known-defect'],
        annotation: { type: 'issue', description: 'API answers empty credentials with HTTP 500 instead of a 4xx validation error.' },
    }, async ({ api }) => {
        test.fail();
        const response = await api.login({ username: '', password: '' });
        expect(response.status()).toBeLessThan(500);
    });
});
