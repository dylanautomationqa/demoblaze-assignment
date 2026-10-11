import { test, expect } from '../../fixtures/fixture';
import { productsByCategory, messages, customers } from '../../data/testData';

const { Phones, Laptops, Monitors } = productsByCategory;

test.describe('Cart functionality', {
    tag: ['@ui', '@cart']
}, () => {

    test('TC-CART-01 - Guest adds a product to cart', {
        tag: ['@smoke', '@regression']
    }, async ({ homePage, productPage, cartPage }) => {
        await homePage.open();
        await homePage.openProductByCategory('Phones');
        await productPage.expectProduct(Phones.productName, Phones.price);
        const message = await productPage.addToCart();
        expect(message).toContain(messages.productAdded);
        await homePage.goToCart();
        await cartPage.expectItemCount(1);
        await cartPage.expectProductInCart(Phones.productName, Phones.price);
        await cartPage.expectTotal(Phones.price);
    });

    test('TC-CART-02 - Logged-in user adds a product to cart', {
        tag: ['@smoke', '@regression']
    }, async ({ loggedInUser, homePage, productPage, cartPage }) => {
        await homePage.open();
        await homePage.expectUserLoggedIn(loggedInUser.username);
        await homePage.openProductByCategory('Laptops');
        expect(await productPage.addToCart()).toContain(messages.productAdded);
        await homePage.goToCart();
        await cartPage.expectItemCount(1);
        await cartPage.expectProductInCart(Laptops.productName, Laptops.price);
    });

    test('TC-CART-03 - Add products from different categories, total is the sum', {
        tag: ['@regression']
    }, async ({ productPage, cartPage }) => {
        for (const product of [Phones, Laptops, Monitors]) {
            await productPage.open(product.id);
            expect(await productPage.addToCart()).toContain(messages.productAdded);
        }
        await cartPage.open();
        await cartPage.expectItemCount(3);
        const items = await cartPage.getCartItems();
        expect(items.map(i => i.title).sort()).toEqual([Phones, Laptops, Monitors].map(p => p.productName).sort());
        await cartPage.expectTotal(Phones.price + Laptops.price + Monitors.price);
    });

    test('TC-CART-04 - Add the same product twice creates two lines', {
        tag: ['@regression', '@edge']
    }, async ({ productPage, cartPage }) => {
        await productPage.open(Monitors.id);
        await productPage.addToCart();
        await productPage.addToCart();
        await cartPage.open();
        await cartPage.expectItemCount(2);
        await cartPage.expectTotal(Monitors.price * 2);
    });

    test('TC-CART-05 - Delete a product updates items and total', {
        tag: ['@regression']
    }, async ({ productPage, cartPage }) => {
        for (const product of [Phones, Monitors]) {
            await productPage.open(product.id);
            await productPage.addToCart();
        }
        await cartPage.open();
        await cartPage.expectItemCount(2);
        await cartPage.deleteProduct(Phones.productName);
        await cartPage.expectItemCount(1);
        await cartPage.expectProductInCart(Monitors.productName, Monitors.price);
        await cartPage.expectTotal(Monitors.price);
    });

    test('TC-CART-06 - Delete the last product leaves the cart empty', {
        tag: ['@regression', '@edge']
    }, async ({ productPage, cartPage }) => {
        await productPage.open(Phones.id);
        await productPage.addToCart();
        await cartPage.open();
        await cartPage.expectItemCount(1);
        await cartPage.deleteProduct(Phones.productName);
        await cartPage.expectCartEmpty();
    });

    test('TC-CART-07 - New visitor sees an empty cart', {
        tag: ['@regression', '@edge']
    }, async ({ cartPage }) => {
        await cartPage.open();
        await cartPage.expectCartEmpty();
    });

    test('TC-CART-08 - Logged-in cart is kept after logout and login again', {
        tag: ['@regression']
    }, async ({ loggedInUser, homePage, productPage, cartPage, loginPage }) => {
        await productPage.open(Laptops.id);
        await productPage.addToCart();
        await homePage.logout();
        await homePage.goToCart();
        await cartPage.expectCartEmpty();
        await loginPage.login(loggedInUser.username, loggedInUser.password);
        await homePage.expectUserLoggedIn(loggedInUser.username);
        await homePage.goToCart();
        await cartPage.expectItemCount(1);
        await cartPage.expectProductInCart(Laptops.productName, Laptops.price);
    });
});

test.describe('Place order functionality', {
    tag: ['@ui', '@placeorder']
}, () => {

    test('TC-ORDER-01 - Login, add to cart and place order - full end-to-end flow', {
        tag: ['@smoke', '@regression', '@e2e']
    }, async ({ testUser, api, homePage, loginPage, productPage, cartPage }) => {
        const customer = customers.valid;
        await api.deleteCart(testUser.username);

        await homePage.open();
        await loginPage.login(testUser.username, testUser.password);
        await homePage.expectUserLoggedIn(testUser.username);

        await homePage.openProductByCategory('Phones');
        expect(await productPage.addToCart()).toContain(messages.productAdded);
        await homePage.goToCart();
        await cartPage.expectItemCount(1);
        await cartPage.expectProductInCart(Phones.productName, Phones.price);
        await cartPage.expectTotal(Phones.price);

        const confirmation = await cartPage.placeOrder(customer);
        await cartPage.expectPurchaseSuccessful(messages.purchaseSuccessful);
        expect(confirmation.id).toMatch(/^\d+$/);
        expect(confirmation.amount).toBe(Phones.price);
        expect(confirmation.cardNumber).toBe(customer.creditCard);
        expect(confirmation.name).toBe(customer.name);

        await cartPage.clickOKButton();
        await homePage.expectUserLoggedIn(testUser.username);
        await homePage.goToCart();
        await cartPage.expectCartEmpty();
    });

    test('TC-ORDER-02 - Guest places an order', {
        tag: ['@regression']
    }, async ({ productPage, cartPage }) => {
        await productPage.open(Laptops.id);
        await productPage.addToCart();
        await cartPage.open();
        await cartPage.expectItemCount(1);
        const confirmation = await cartPage.placeOrder(customers.valid);
        await cartPage.expectPurchaseSuccessful(messages.purchaseSuccessful);
        expect(confirmation.amount).toBe(Laptops.price);
        await cartPage.clickOKButton();
        await cartPage.open();
        await cartPage.expectCartEmpty();
    });

    test('TC-ORDER-03 - Order amount equals the cart total for several products', {
        tag: ['@regression']
    }, async ({ loggedInUser: _user, productPage, cartPage }) => {
        for (const product of [Phones, Monitors]) {
            await productPage.open(product.id);
            await productPage.addToCart();
        }
        await cartPage.open();
        await cartPage.expectItemCount(2);
        const confirmation = await cartPage.placeOrder(customers.valid);
        expect(confirmation.amount).toBe(Phones.price + Monitors.price);
    });

    test.describe('Order form validation', () => {

        test.beforeEach(async ({ productPage, cartPage }) => {
            await productPage.open(Phones.id);
            await productPage.addToCart();
            await cartPage.open();
            await cartPage.expectItemCount(1);
            await cartPage.clickPlaceOrder();
        });

        const invalidForms = [
            { id: 'TC-ORDER-04', title: 'all fields empty', customer: customers.empty },
            { id: 'TC-ORDER-05', title: 'credit card missing', customer: customers.nameOnly },
            { id: 'TC-ORDER-06', title: 'name missing', customer: customers.cardOnly },
        ];

        for (const { id, title, customer } of invalidForms) {
            test(`${id} - Purchase is blocked when ${title}`, {
                tag: ['@regression', '@negative']
            }, async ({ cartPage }) => {
                await cartPage.fillOrderForm(customer);
                expect(await cartPage.purchaseExpectingAlert()).toBe(messages.fillNameAndCard);
                await cartPage.expectOrderFormOpen();
                await cartPage.expectItemCount(1);
            });
        }

        test('TC-ORDER-07 - Closing the order form keeps the cart', {
            tag: ['@regression', '@edge']
        }, async ({ cartPage }) => {
            await cartPage.fillOrderForm(customers.valid);
            await cartPage.closeOrderForm();
            await cartPage.expectItemCount(1);
            await cartPage.expectTotal(Phones.price);
        });
    });

    test.describe('Known defects', { tag: ['@known-defect'] }, () => {

        test('TC-ORDER-08 - Purchase with an empty cart should be blocked', {
            tag: ['@regression', '@edge'],
            annotation: { type: 'issue', description: 'DemoBlaze accepts an order with an empty cart and confirms "Amount: 0 USD".' },
        }, async ({ cartPage }) => {
            test.fail();
            await cartPage.open();
            await cartPage.expectCartEmpty();
            await cartPage.clickPlaceOrder();
            await cartPage.fillOrderForm(customers.valid);
            // Expected: the site refuses the order. Actual: it shows a success confirmation.
            await cartPage.purchaseExpectingAlert();
        });

        test('TC-ORDER-09 - Confirmation date should show the current month', {
            tag: ['@regression', '@edge'],
            annotation: { type: 'issue', description: 'Confirmation date uses JavaScript getMonth(), which is 0-based, so the month is one less than today.' },
        }, async ({ productPage, cartPage }) => {
            test.fail();
            await productPage.open(Phones.id);
            await productPage.addToCart();
            await cartPage.open();
            await cartPage.expectItemCount(1);
            const today = new Date();
            const confirmation = await cartPage.placeOrder(customers.valid);
            expect(confirmation.date).toBe(`${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`);
        });
    });
});
