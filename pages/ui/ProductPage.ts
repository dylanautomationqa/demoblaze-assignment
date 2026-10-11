import { ProductPageLocator } from '../../locator/productpage-locators';
import { BasePage } from '../common/BasePage';
import { Page, expect } from '@playwright/test';
import { step } from '../../utilities/logging';

export class ProductPage extends BasePage {

    protected productPageLocator: ProductPageLocator;

    constructor(page: Page) {
        super(page);
        this.productPageLocator = new ProductPageLocator(page);
    }

    @step('Open product page by id')
    async open(productId: number): Promise<void> {
        await this.navigateTo(`/prod.html?idp_=${productId}`);
        await expect(this.productPageLocator.addToCartButton).toBeVisible();
    }

    @step('Verify product details')
    async expectProduct(productName: string, price: number): Promise<void> {
        await expect(this.productPageLocator.productName).toHaveText(productName);
        await expect(this.productPageLocator.productPrice).toContainText(`$${price}`);
    }

    /** Clicks "Add to cart" and returns the alert message shown by the site. */
    @step('Add product to cart')
    async addToCart(): Promise<string> {
        return this.acceptDialogDuring(() => this.clickElement(this.productPageLocator.addToCartButton));
    }
}
