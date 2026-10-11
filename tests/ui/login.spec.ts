import { test, expect } from '../../fixtures/fixture';
import { generateRandomUser, invalidUsers, messages } from '../../data/testData';

test.describe('Login functionality', {
    tag: ['@ui', '@login']
}, () => {

    test.beforeEach(async ({ homePage }) => {
        await homePage.open();
    });

    test('TC-LOGIN-01 - Login with valid username and password', {
        tag: ['@smoke', '@regression']
    }, async ({ loginPage, homePage, testUser }) => {
        await loginPage.login(testUser.username, testUser.password);
        await homePage.expectUserLoggedIn(testUser.username);
    });

    test('TC-LOGIN-02 - Login with valid username and wrong password', {
        tag: ['@regression', '@negative']
    }, async ({ loginPage, homePage, testUser }) => {
        const message = await loginPage.loginExpectingAlert(testUser.username, 'wrong_password_123');
        expect(message).toBe(messages.wrongPassword);
        await homePage.expectUserLoggedOut();
    });

    test('TC-LOGIN-03 - Login with non-existing username', {
        tag: ['@regression', '@negative']
    }, async ({ loginPage, homePage }) => {
        const { username, password } = invalidUsers.nonExistingUser;
        const message = await loginPage.loginExpectingAlert(username, password);
        expect(message).toBe(messages.userNotExist);
        await homePage.expectUserLoggedOut();
    });

    test('TC-LOGIN-04 - Login with empty username and password', {
        tag: ['@regression', '@negative']
    }, async ({ loginPage }) => {
        const message = await loginPage.loginExpectingAlert('', '');
        expect(message).toBe(messages.fillUsernameAndPassword);
        await loginPage.expectLoginModalOpen();
    });

    test('TC-LOGIN-05 - Login with empty password', {
        tag: ['@regression', '@negative']
    }, async ({ loginPage, testUser }) => {
        const message = await loginPage.loginExpectingAlert(testUser.username, '');
        expect(message).toBe(messages.fillUsernameAndPassword);
    });

    test('TC-LOGIN-06 - Login with empty username', {
        tag: ['@regression', '@negative']
    }, async ({ loginPage, testUser }) => {
        const message = await loginPage.loginExpectingAlert('', testUser.password);
        expect(message).toBe(messages.fillUsernameAndPassword);
    });

    test('TC-LOGIN-07 - Password is case-sensitive', {
        tag: ['@regression', '@edge']
    }, async ({ loginPage, testUser }) => {
        const message = await loginPage.loginExpectingAlert(testUser.username, testUser.password.toUpperCase());
        expect(message).toBe(messages.wrongPassword);
    });

    test('TC-LOGIN-08 - SQL injection string is rejected', {
        tag: ['@regression', '@edge', '@security']
    }, async ({ loginPage, homePage }) => {
        const { username, password } = invalidUsers.sqlInjection;
        const message = await loginPage.loginExpectingAlert(username, password);
        // Someone has registered this exact username on the public site, so either error is acceptable;
        // what matters is that the injection string does not authenticate.
        expect([messages.userNotExist, messages.wrongPassword]).toContain(message);
        await homePage.expectUserLoggedOut();
    });

    test('TC-LOGIN-09 - Password field is masked', {
        tag: ['@regression', '@edge', '@security']
    }, async ({ loginPage }) => {
        await loginPage.openLoginModal();
        await loginPage.expectPasswordMasked();
    });

    test('TC-LOGIN-10 - Closing the modal does not log in', {
        tag: ['@regression', '@edge']
    }, async ({ loginPage, homePage, testUser }) => {
        await loginPage.openLoginModal();
        await loginPage.inputUsername(testUser.username);
        await loginPage.inputPassword(testUser.password);
        await loginPage.closeLoginModal();
        await homePage.expectUserLoggedOut();
    });

    test('TC-LOGIN-11 - Session persists after page reload', {
        tag: ['@regression']
    }, async ({ loginPage, homePage, page, testUser }) => {
        await loginPage.login(testUser.username, testUser.password);
        await homePage.expectUserLoggedIn(testUser.username);
        await page.reload();
        await homePage.expectUserLoggedIn(testUser.username);
    });

    test('TC-LOGIN-12 - Logout ends the session', {
        tag: ['@smoke', '@regression']
    }, async ({ loginPage, homePage, page, testUser }) => {
        await loginPage.login(testUser.username, testUser.password);
        await homePage.expectUserLoggedIn(testUser.username);
        await homePage.logout();
        await homePage.expectUserLoggedOut();
        await page.reload();
        await homePage.expectUserLoggedOut();
    });

    test('TC-LOGIN-13 - Newly registered user can log in', {
        tag: ['@regression']
    }, async ({ registerPage, loginPage, homePage }) => {
        const newUser = generateRandomUser();
        const message = await registerPage.registerAccount(newUser.username, newUser.password);
        expect(message).toBe(messages.signUpSuccessful);
        await loginPage.login(newUser.username, newUser.password);
        await homePage.expectUserLoggedIn(newUser.username);
    });
});
