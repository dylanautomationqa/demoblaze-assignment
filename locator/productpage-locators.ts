import { Page, Locator } from '@playwright/test';
import { CommonLocator } from './common-locator';

export class ProductPageLocator extends CommonLocator {

    productName!: Locator;
    productPrice!: Locator;
    addToCartButton!: Locator;

    constructor(page: Page) {
        super(page);
        this.initializeLocators();
    }

    protected initializeLocators(): void {
        this.productName = this.page.locator('#tbodyid h2.name');
        this.productPrice = this.page.locator('#tbodyid .price-container');
        this.addToCartButton = this.page.getByRole('link', { name: 'Add to cart' });
    }

}
