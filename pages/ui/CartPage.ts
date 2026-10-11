import { CartPageLocator } from '../../locator/cartpage-locators';
import { BasePage } from '../common/BasePage';
import { Page, expect } from '@playwright/test';
import { step } from '../../utilities/logging';
import { CustomerInformation } from '../../data/testData';

export type CartItem = { title: string; price: number };
export type OrderConfirmation = { id: string; amount: number; cardNumber: string; name: string; date: string };

export class CartPage extends BasePage {

    private readonly cartPageLocator: CartPageLocator;

    constructor(page: Page) {
        super(page);
        this.cartPageLocator = new CartPageLocator(page);
    }

    @step('Open Cart page')
    async open(): Promise<void> {
        await this.navigateTo('/cart.html');
        await expect(this.cartPageLocator.placeOrderBtn).toBeVisible();
    }

    /** Cart rows are rendered asynchronously, one request per item, so wait for the expected count. */
    @step('Verify number of items in cart')
    async expectItemCount(count: number): Promise<void> {
        await expect(this.cartPageLocator.cartRows).toHaveCount(count);
    }

    @step('Get cart items')
    async getCartItems(): Promise<CartItem[]> {
        const rows = await this.cartPageLocator.cartRows.all();
        const items: CartItem[] = [];
        for (const row of rows) {
            const cells = row.locator('td');
            items.push({
                title: (await cells.nth(1).innerText()).trim(),
                price: Number((await cells.nth(2).innerText()).trim()),
            });
        }
        return items;
    }

    @step('Verify product is in cart')
    async expectProductInCart(productName: string, price: number): Promise<void> {
        const row = this.cartPageLocator.rowByProductName(productName).first();
        await expect(row).toBeVisible();
        await expect(row.locator('td').nth(2)).toHaveText(String(price));
    }

    @step('Verify cart total')
    async expectTotal(total: number): Promise<void> {
        await expect(this.cartPageLocator.totalPrice).toHaveText(String(total));
    }

    @step('Verify cart is empty')
    async expectCartEmpty(): Promise<void> {
        await expect(this.cartPageLocator.cartRows).toHaveCount(0);
        await expect(this.cartPageLocator.totalPrice).toHaveText('');
    }

    @step('Delete product from cart')
    async deleteProduct(productName: string): Promise<void> {
        const row = this.cartPageLocator.rowByProductName(productName).first();
        const rowsBefore = await this.cartPageLocator.cartRows.count();
        await this.clickElement(row.getByRole('link', { name: 'Delete' }));
        await expect(this.cartPageLocator.cartRows).toHaveCount(rowsBefore - 1);
    }

    @step('Click Place Order')
    async clickPlaceOrder(): Promise<void> {
        await this.clickElement(this.cartPageLocator.placeOrderBtn);
        await this.waitForModalShown(this.cartPageLocator.orderModal);
    }

    @step('Fill order form')
    async fillOrderForm(customer: CustomerInformation): Promise<void> {
        await this.fillElement(this.cartPageLocator.name, customer.name);
        await this.fillElement(this.cartPageLocator.country, customer.country);
        await this.fillElement(this.cartPageLocator.city, customer.city);
        await this.fillElement(this.cartPageLocator.creditCard, customer.creditCard);
        await this.fillElement(this.cartPageLocator.month, customer.month);
        await this.fillElement(this.cartPageLocator.year, customer.year);
    }

    @step('Click Purchase')
    async clickPurchase(): Promise<void> {
        await this.clickElement(this.cartPageLocator.purchaseBtn);
    }

    /** Submits the order form when validation should block it; returns the alert message. */
    @step('Purchase expecting an alert')
    async purchaseExpectingAlert(): Promise<string> {
        return this.acceptDialogDuring(() => this.clickPurchase());
    }

    @step('Close order form')
    async closeOrderForm(): Promise<void> {
        await this.clickElement(this.cartPageLocator.closeOrderBtn);
        await expect(this.cartPageLocator.orderModal).toBeHidden();
    }

    @step('Verify order form is still open')
    async expectOrderFormOpen(): Promise<void> {
        await expect(this.cartPageLocator.orderModal).toBeVisible();
    }

    @step('Read order confirmation')
    async getOrderConfirmation(): Promise<OrderConfirmation> {
        await expect(this.cartPageLocator.confirmation).toBeVisible();
        const text = await this.cartPageLocator.confirmationDetails.innerText();
        const field = (label: string) =>
            text.match(new RegExp(`${label}:\\s*(.*?)\\s*(?=(Amount|Card Number|Name|Date):|$)`, 's'))?.[1]?.trim() ?? '';
        return {
            id: field('Id'),
            amount: Number(field('Amount').replace(/\s*USD$/, '')),
            cardNumber: field('Card Number'),
            name: field('Name'),
            date: field('Date'),
        };
    }

    @step('Verify purchase successful')
    async expectPurchaseSuccessful(text: string): Promise<void> {
        await expect(this.cartPageLocator.confirmationTitle).toHaveText(text);
    }

    @step('Click OK on confirmation')
    async clickOKButton(): Promise<void> {
        await this.clickElement(this.cartPageLocator.okBtn);
        await this.page.waitForURL(/index\.html/);
    }

    /** Full checkout: open form, fill it, purchase and return the confirmation. */
    @step('Place order')
    async placeOrder(customer: CustomerInformation): Promise<OrderConfirmation> {
        await this.clickPlaceOrder();
        await this.fillOrderForm(customer);
        await this.clickPurchase();
        return this.getOrderConfirmation();
    }
}
