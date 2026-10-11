import { Page, Locator } from '@playwright/test';
import { CommonLocator } from './common-locator';

export class HomePageLocator extends CommonLocator {

    productCards!: Locator;
    productTitles!: Locator;

    constructor(page: Page) {
        super(page);
        this.initializeLocators();
    }

    protected initializeLocators(): void {
        this.productCards = this.page.locator('#tbodyid .card');
        this.productTitles = this.page.locator('#tbodyid .card-title a');
    }

}
