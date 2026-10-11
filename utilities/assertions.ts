
import { expect } from '@playwright/test';
import { step } from './logging';
import { Utility } from './utils';

export class Assertions {

    static utility = new Utility();

    @step('Assert Equal')
    static assertEqual<T>(actual: T, expected: T, message?: string): void {
        expect.soft(actual, message ?? `Expected ${actual} to equal ${expected}`).toBe(expected);
    }

    @step('Assert Not Equal')
    static assertNotEqual<T>(actual: T, expected: T, message?: string): void {
        expect.soft(actual, message ?? `Expected ${actual} NOT to equal ${expected}`).not.toBe(expected);
    }
}
