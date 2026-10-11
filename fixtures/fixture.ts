import { test as baseTest, request as apiRequest } from '@playwright/test';
import { randomUUID } from 'crypto';
import { LoginPage } from '../pages/ui/LoginPage';
import { HomePage } from '../pages/ui/HomePage';
import { CartPage } from '../pages/ui/CartPage';
import { ProductPage } from '../pages/ui/ProductPage';
import { RegisterPage } from '../pages/ui/RegisterPage';
import { DemoblazeApi } from '../api/DemoblazeApi';
import { Constants } from '../utilities/constants';
import { Credentials, generateRandomUser } from '../data/testData';

type TestFixtures = {
    api: DemoblazeApi;
    loginPage: LoginPage;
    homePage: HomePage;
    productPage: ProductPage;
    cartPage: CartPage;
    registerPage: RegisterPage;
    /** Logs `testUser` in through the API (session cookie) with an empty cart. */
    loggedInUser: Credentials;
};

type WorkerFixtures = {
    /** One account per worker: TEST_USERNAME/TEST_PASSWORD if set, otherwise a fresh sign-up. */
    testUser: Credentials;
};

export const test = baseTest.extend<TestFixtures, WorkerFixtures>({
    testUser: [async ({ }, use) => {
        if (Constants.TEST_USERNAME && Constants.TEST_PASSWORD) {
            await use({ username: Constants.TEST_USERNAME, password: Constants.TEST_PASSWORD });
            return;
        }
        const context = await apiRequest.newContext();
        const user = await new DemoblazeApi(context).createUser(generateRandomUser());
        await context.dispose();
        await use(user);
    }, { scope: 'worker' }],

    /**
     * The site keys a guest cart by the whole `document.cookie` string and only
     * creates the `user` cookie on the home page. Opening any other page first
     * would put the test on a cart shared with every anonymous visitor, so
     * every test starts with its own guest id.
     */
    context: async ({ context }, use) => {
        await context.addCookies([{ name: 'user', value: randomUUID(), url: Constants.BASE_URL }]);
        await use(context);
    },

    api: async ({ request }, use) => {
        await use(new DemoblazeApi(request));
    },

    loggedInUser: async ({ api, context, testUser }, use) => {
        const token = await api.getAuthToken(testUser);
        await api.deleteCart(testUser.username);
        await context.addCookies([{ name: 'tokenp_', value: token, url: Constants.BASE_URL }]);
        await use(testUser);
    },

    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },
    productPage: async ({ page }, use) => {
        await use(new ProductPage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
    registerPage: async ({ page }, use) => {
        await use(new RegisterPage(page));
    }
});

export { expect } from '@playwright/test';
