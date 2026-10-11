import { LoginPageLocator } from '../../locator/loginpage-locators';
import { BasePage } from '../common/BasePage';
import { Page, expect } from '@playwright/test';
import { step } from '../../utilities/logging';

export class LoginPage extends BasePage {

    protected loginPageLocator: LoginPageLocator;

    constructor(page: Page) {
        super(page);
        this.loginPageLocator = new LoginPageLocator(page);
    }

    @step('Open Log in modal')
    async openLoginModal(): Promise<void> {
        await this.clickElement(this.loginPageLocator.loginLink);
        await this.waitForModalShown(this.loginPageLocator.loginModal);
    }

    @step('Input username')
    async inputUsername(username: string): Promise<void> {
        await this.fillElement(this.loginPageLocator.userName, username);
    }

    @step('Input password')
    async inputPassword(password: string): Promise<void> {
        await this.fillElement(this.loginPageLocator.passWord, password);
    }

    @step('Click Log in')
    async clickLoginToProcess(): Promise<void> {
        await this.clickElement(this.loginPageLocator.loginButton);
    }

    /** Happy path: fills the form, submits and waits for the modal to close. */
    @step('Log in through the UI')
    async login(username: string, password: string): Promise<void> {
        await this.openLoginModal();
        await this.inputUsername(username);
        await this.inputPassword(password);
        await this.clickLoginToProcess();
        await expect(this.loginPageLocator.loginModal).toBeHidden();
    }

    /** Negative path: submits the form and returns the alert message. */
    @step('Log in expecting an alert')
    async loginExpectingAlert(username: string, password: string): Promise<string> {
        await this.openLoginModal();
        await this.inputUsername(username);
        await this.inputPassword(password);
        return this.acceptDialogDuring(() => this.clickLoginToProcess());
    }

    @step('Close Log in modal')
    async closeLoginModal(): Promise<void> {
        await this.clickElement(this.loginPageLocator.closeButton);
        await expect(this.loginPageLocator.loginModal).toBeHidden();
    }

    @step('Verify Log in modal is still open')
    async expectLoginModalOpen(): Promise<void> {
        await expect(this.loginPageLocator.loginModal).toBeVisible();
    }

    @step('Verify password field is masked')
    async expectPasswordMasked(): Promise<void> {
        await expect(this.loginPageLocator.passWord).toHaveAttribute('type', 'password');
    }
}
