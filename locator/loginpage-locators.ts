import { Page, Locator } from '@playwright/test';
import { CommonLocator } from './common-locator';

export class LoginPageLocator extends CommonLocator {

    loginModal!: Locator;
    userName!: Locator;
    passWord!: Locator;
    loginButton!: Locator;
    closeButton!: Locator;

    constructor(page: Page) {
        super(page);
        this.initializeLocators();
    }

    protected initializeLocators(): void {
        this.loginModal = this.page.locator('#logInModal');
        this.userName = this.page.locator('#loginusername');
        this.passWord = this.page.locator('#loginpassword');
        this.loginButton = this.loginModal.getByRole('button', { name: 'Log in' });
        this.closeButton = this.loginModal.locator('.modal-footer').getByRole('button', { name: 'Close' });
    }

}
