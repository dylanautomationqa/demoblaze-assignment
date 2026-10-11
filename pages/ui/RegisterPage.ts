import { RegisterPageLocator } from '../../locator/registerpage-locators';
import { BasePage } from '../common/BasePage';
import { Page, expect } from '@playwright/test';
import { step } from '../../utilities/logging';

export class RegisterPage extends BasePage {

    protected registerPageLocator: RegisterPageLocator;

    constructor(page: Page) {
        super(page);
        this.registerPageLocator = new RegisterPageLocator(page);
    }

    @step('Open Sign up modal')
    async openSignUpModal(): Promise<void> {
        await this.clickElement(this.registerPageLocator.signUpLink);
        await this.waitForModalShown(this.registerPageLocator.signUpModal);
    }

    /** Fills the Sign up form, submits it and returns the alert message. */
    @step('Register account')
    async registerAccount(username: string, password: string): Promise<string> {
        await this.openSignUpModal();
        await this.fillElement(this.registerPageLocator.userName, username);
        await this.fillElement(this.registerPageLocator.passWord, password);
        return this.acceptDialogDuring(() => this.clickElement(this.registerPageLocator.signUpButton));
    }
}
