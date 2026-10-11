import { Page, Locator } from '@playwright/test';
import { CommonLocator } from './common-locator';

export class CartPageLocator extends CommonLocator {

    cartRows!: Locator;
    totalPrice!: Locator;
    placeOrderBtn!: Locator;
    orderModal!: Locator;
    name!: Locator;
    country!: Locator;
    city!: Locator;
    creditCard!: Locator;
    month!: Locator;
    year!: Locator;
    purchaseBtn!: Locator;
    closeOrderBtn!: Locator;
    confirmation!: Locator;
    confirmationTitle!: Locator;
    confirmationDetails!: Locator;
    okBtn!: Locator;

    constructor(page: Page) {
        super(page);
        this.initializeLocators();
    }

    protected initializeLocators(): void {
        this.cartRows = this.page.locator('#tbodyid tr');
        this.totalPrice = this.page.locator('#totalp');
        this.placeOrderBtn = this.page.getByRole('button', { name: 'Place Order' });
        this.orderModal = this.page.locator('#orderModal');
        this.name = this.orderModal.locator('#name');
        this.country = this.orderModal.locator('#country');
        this.city = this.orderModal.locator('#city');
        this.creditCard = this.orderModal.locator('#card');
        this.month = this.orderModal.locator('#month');
        this.year = this.orderModal.locator('#year');
        this.purchaseBtn = this.orderModal.getByRole('button', { name: 'Purchase' });
        this.closeOrderBtn = this.orderModal.locator('.modal-footer').getByRole('button', { name: 'Close' });
        this.confirmation = this.page.locator('.sweet-alert.visible');
        this.confirmationTitle = this.confirmation.locator('h2');
        this.confirmationDetails = this.confirmation.locator('p.lead');
        this.okBtn = this.confirmation.getByRole('button', { name: 'OK' });
    }

    rowByProductName(productName: string): Locator {
        return this.cartRows.filter({ hasText: productName });
    }
}
