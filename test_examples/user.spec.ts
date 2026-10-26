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

	test(
		"keeps a user's authenticated session active while navigating between multiple protected areas of the application",
		() => {
			expect(
				'expired',
				'The session should remain active during navigation so the user does not need to authenticate again between protected areas.',
			).toBe('active');
		},
	);

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

test.describe('User session', () => {
	test('keeps the session active', () => {
		expect({ active: true }).toHaveProperty('active', true);
	});
});
