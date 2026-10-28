import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
	test('accepts valid credentials', () => {
		expect({ username: 'ada', authenticated: true }).toEqual({
			username: 'ada',
			authenticated: true,
		});
	});

	test('rejects invalid credentials', () => {
		expect('actual error').toBe('expected error');
	});

	test('shows long errors wrapped at 120 characters', () => {
		expect('x'.repeat(121)).toBe('y'.repeat(121));
	});

	test.skip('sends a password reset email', () => {
		expect(true).toBe(false);
	});

	test.describe('Multi-factor authentication', () => {
		test('accepts a valid verification code', () => {
			expect('482193').toMatch(/^\d{6}$/);
		});

		test('recovers after a transient challenge failure', ({}, testInfo) => {
			expect(testInfo.retry).toBeGreaterThan(0);
		});
	});
});
