import { APIRequestContext, APIResponse } from '@playwright/test';
import { randomUUID } from 'crypto';
import { Constants } from '../utilities/constants';
import { Credentials } from '../data/testData';

export type Product = { id: number; cat: string; title: string; price: number; desc: string; img: string };
export type CartEntry = { id: string; cookie: string; prod_id: number };

/**
 * Thin client over the DemoBlaze REST API (https://api.demoblaze.com).
 * The site sends passwords base64-encoded and returns errors as HTTP 200
 * with an `errorMessage` body, so callers assert on the body, not the status.
 */
export class DemoblazeApi {

    constructor(private readonly request: APIRequestContext, private readonly baseUrl = Constants.API_URL) { }

    static encodePassword(password: string): string {
        return Buffer.from(password, 'utf8').toString('base64');
    }

    private post(path: string, data: unknown): Promise<APIResponse> {
        return this.request.post(`${this.baseUrl}${path}`, { data, failOnStatusCode: false });
    }

    async signUp(user: Credentials): Promise<APIResponse> {
        return this.post('/signup', { username: user.username, password: DemoblazeApi.encodePassword(user.password) });
    }

    async login(user: Credentials): Promise<APIResponse> {
        return this.post('/login', { username: user.username, password: DemoblazeApi.encodePassword(user.password) });
    }

    /** Logs in and returns the auth token the site stores in the `tokenp_` cookie. */
    async getAuthToken(user: Credentials): Promise<string> {
        const response = await this.login(user);
        const body = await response.json();
        if (typeof body !== 'string' || !body.startsWith('Auth_token: ')) {
            throw new Error(`Login failed for ${user.username}: ${JSON.stringify(body)}`);
        }
        return body.replace('Auth_token: ', '');
    }

    /** Creates a fresh account and returns its credentials. */
    async createUser(user: Credentials): Promise<Credentials> {
        const response = await this.signUp(user);
        const body = await response.json();
        if (body?.errorMessage) {
            throw new Error(`Sign up failed for ${user.username}: ${body.errorMessage}`);
        }
        return user;
    }

    async checkToken(token: string): Promise<APIResponse> {
        return this.post('/check', { token });
    }

    async getEntries(): Promise<APIResponse> {
        return this.request.get(`${this.baseUrl}/entries`, { failOnStatusCode: false });
    }

    async getProductsByCategory(cat: 'phone' | 'notebook' | 'monitor'): Promise<APIResponse> {
        return this.post('/bycat', { cat });
    }

    async viewProduct(id: number | string): Promise<APIResponse> {
        return this.post('/view', { id: String(id) });
    }

    async addToCart(token: string, productId: number): Promise<APIResponse> {
        return this.post('/addtocart', { id: randomUUID(), cookie: token, prod_id: productId, flag: true });
    }

    async viewCart(token: string): Promise<CartEntry[]> {
        const response = await this.post('/viewcart', { cookie: token, flag: true });
        const body = await response.json();
        return body.Items ?? [];
    }

    async deleteCartItem(itemId: string): Promise<APIResponse> {
        return this.post('/deleteitem', { id: itemId });
    }

    /** Empties a logged-in user's cart. The site keys it by username, not token. */
    async deleteCart(username: string): Promise<APIResponse> {
        return this.post('/deletecart', { cookie: username });
    }
}
