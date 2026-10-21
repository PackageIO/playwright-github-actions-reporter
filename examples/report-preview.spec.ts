import { expect, test } from '@playwright/test';

test('passing example', () => {
	expect(1 + 1).toBe(2);
});

test('failing example', () => {
	expect('actual').toBe('expected');
});

test.skip('skipped example', () => {
	expect(true).toBe(false);
});

test('flaky example passes on retry', ({}, testInfo) => {
	expect(testInfo.retry).toBeGreaterThan(0);
});