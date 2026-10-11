import { test, expect } from '../../fixtures/fixture';
import { productsByCategory, generateRandomUser } from '../../data/testData';

const { Phones, Monitors } = productsByCategory;

test.describe('Cart API', { tag: ['@api', '@cart'] }, () => {

    let token: string;

    test.beforeEach(async ({ api, testUser }) => {
        token = await api.getAuthToken(testUser);
        await api.deleteCart(testUser.username);
    });

    test('TC-API-11 - Add product to cart', { tag: ['@smoke', '@regression'] }, async ({ api, testUser }) => {
        const response = await api.addToCart(token, Phones.id);
        expect(response.status()).toBe(200);
        const cart = await api.viewCart(token);
        expect(cart).toHaveLength(1);
        expect(cart[0]).toEqual(expect.objectContaining({ prod_id: Phones.id, cookie: testUser.username }));
    });

    test('TC-API-12 - Delete one item from cart', { tag: ['@regression'] }, async ({ api }) => {
        await api.addToCart(token, Phones.id);
        await api.addToCart(token, Monitors.id);
        const cart = await api.viewCart(token);
        expect(cart).toHaveLength(2);
        const phoneLine = cart.find(item => item.prod_id === Phones.id)!;
        await api.deleteCartItem(phoneLine.id);
        const after = await api.viewCart(token);
        expect(after.map(item => item.prod_id)).toEqual([Monitors.id]);
    });

    test('TC-API-13 - Empty the cart', { tag: ['@regression'] }, async ({ api, testUser }) => {
        await api.addToCart(token, Phones.id);
        await api.deleteCart(testUser.username);
        expect(await api.viewCart(token)).toHaveLength(0);
    });

    test('TC-API-14 - Cart is isolated between users', { tag: ['@regression', '@security'] }, async ({ api }) => {
        const otherUser = await api.createUser(generateRandomUser());
        const otherToken = await api.getAuthToken(otherUser);
        await api.addToCart(token, Phones.id);
        expect(await api.viewCart(otherToken)).toHaveLength(0);
    });
});
