import { HomePageLocator } from '../../locator/homepage-locators';
import { BasePage } from '../common/BasePage';
import { Page, expect } from '@playwright/test';
import { step } from '../../utilities/logging';
import { productsByCategory, CategoryType } from '../../data/testData';


export class HomePage extends BasePage {

    protected homePageLocator: HomePageLocator;

    constructor(page: Page) {
        super(page);
        this.homePageLocator = new HomePageLocator(page);
    }

    @step('Open Home page')
    async open(): Promise<void> {
        await this.navigateTo('/');
        await expect(this.homePageLocator.productCards.first()).toBeVisible();
    }

    @step('Verify user is logged in')
    async expectUserLoggedIn(username: string): Promise<void> {
        await expect(this.homePageLocator.welcomeUser).toHaveText(`Welcome ${username}`);
        await expect(this.homePageLocator.logoutLink).toBeVisible();
        await expect(this.homePageLocator.loginLink).toBeHidden();
    }

    @step('Verify user is logged out')
    async expectUserLoggedOut(): Promise<void> {
        await expect(this.homePageLocator.loginLink).toBeVisible();
        await expect(this.homePageLocator.welcomeUser).toBeHidden();
        await expect(this.homePageLocator.logoutLink).toBeHidden();
    }

    @step('Open product from category')
    async openProductByCategory(category: CategoryType): Promise<void> {
        const productName = productsByCategory[category].productName;
        await this.clickElement(this.homePageLocator.categoryByName(category));
        await this.openProductByName(productName);
    }

    @step('Open product by name')
    async openProductByName(productName: string): Promise<void> {
        await this.clickElement(this.homePageLocator.productByName(productName).first());
        await this.page.waitForURL(/prod\.html\?idp_=/);
    }

    @step('Go to Cart')
    async goToCart(): Promise<void> {
        await this.clickElement(this.homePageLocator.cartLink);
        await this.page.waitForURL(/cart\.html/);
    }

    @step('Go to Home')
    async goToHome(): Promise<void> {
        await this.clickElement(this.homePageLocator.homeLink);
        await this.page.waitForURL(/index\.html|\/$/);
    }

    @step('Log out')
    async logout(): Promise<void> {
        await this.clickElement(this.homePageLocator.logoutLink);
        await this.page.waitForURL(/index\.html/);
    }
}
