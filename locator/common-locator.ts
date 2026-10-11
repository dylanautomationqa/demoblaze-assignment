// Common locators shared across multiple pages (navbar, product links)
import { Page, Locator } from '@playwright/test';

export class CommonLocator {

    readonly page: Page;
    readonly headerLink: Locator;
    readonly homeLink: Locator;
    readonly cartLink: Locator;
    readonly loginLink: Locator;
    readonly signUpLink: Locator;
    readonly logoutLink: Locator;
    readonly welcomeUser: Locator;

    constructor(page: Page) {
        this.page = page;
        this.headerLink = this.page.locator('a#nava');
        // Navbar links have different ids/hrefs per page (e.g. no #cartur on cart.html), so match by role.
        this.homeLink = this.page.locator('#navbarExample').getByRole('link', { name: 'Home' });
        this.cartLink = this.page.locator('#navbarExample').getByRole('link', { name: 'Cart', exact: true });
        this.loginLink = this.page.locator('#login2');
        this.signUpLink = this.page.locator('#signin2');
        this.logoutLink = this.page.locator('#logout2');
        this.welcomeUser = this.page.locator('#nameofuser');
    }

    elementByText(text: string): Locator {
        return this.page.getByText(text);
    }

    categoryByName(category: string): Locator {
        return this.page.getByRole('link', { name: category, exact: true });
    }

    productByName(productName: string): Locator {
        return this.page.locator('.card-title a', { hasText: productName });
    }

}
