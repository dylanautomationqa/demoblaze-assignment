import { Page, Locator } from '@playwright/test';
import { CommonLocator } from './common-locator';

export class RegisterPageLocator extends CommonLocator {

    signUpModal!: Locator;
    userName!: Locator;
    passWord!: Locator;
    signUpButton!: Locator;
    closeButton!: Locator;

    constructor(page: Page) {
        super(page);
        this.initializeLocators();
    }

    protected initializeLocators(): void {
        this.signUpModal = this.page.locator('#signInModal');
        this.userName = this.page.locator('#sign-username');
        this.passWord = this.page.locator('#sign-password');
        this.signUpButton = this.signUpModal.getByRole('button', { name: 'Sign up' });
        this.closeButton = this.signUpModal.locator('.modal-footer').getByRole('button', { name: 'Close' });
    }

}
