import { test, expect } from '../../fixtures/fixture';
import { productsByCategory } from '../../data/testData';

test.describe('Products API', { tag: ['@api', '@products'] }, () => {

    test('TC-API-08 - List products', { tag: ['@smoke', '@regression'] }, async ({ api }) => {
        const response = await api.getEntries();
        expect(response.status()).toBe(200);
        const { Items } = await response.json();
        expect(Items.length).toBeGreaterThan(0);
        for (const item of Items) {
            expect(item).toEqual(expect.objectContaining({
                id: expect.any(Number),
                title: expect.any(String),
                price: expect.any(Number),
                cat: expect.stringMatching(/^(phone|notebook|monitor)$/),
            }));
        }
    });

    for (const [category, cat] of [['Phones', 'phone'], ['Laptops', 'notebook'], ['Monitors', 'monitor']] as const) {
        test(`TC-API-09 - Filter products by category ${category}`, { tag: ['@regression'] }, async ({ api }) => {
            const { Items } = await (await api.getProductsByCategory(cat)).json();
            expect(Items.length).toBeGreaterThan(0);
            expect(Items.every((item: { cat: string }) => item.cat === cat)).toBe(true);
            expect(Items.map((item: { title: string }) => item.title.trim())).toContain(productsByCategory[category].productName);
        });
    }

    test('TC-API-10 - View product details', { tag: ['@regression'] }, async ({ api }) => {
        const { id, productName, price } = productsByCategory.Phones;
        const body = await (await api.viewProduct(id)).json();
        expect(body).toEqual(expect.objectContaining({ id, title: productName, price }));
    });
});
