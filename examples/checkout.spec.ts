import { expect, test } from '@playwright/test';

test.describe('Cart management', () => {
	test(
		'adds a product to the cart',
		{
			tag: ['@smoke', '@cart'],
			annotation: {
				type: 'test metadata',
				description: JSON.stringify([
					{ key: 'owner', value: 'checkout-team' },
					{ key: 'component', value: 'cart' },
				]),
			},
		},
		() => {
			expect(['notebook']).toContain('notebook');
		},
	);

	test('updates the item quantity', () => {
		expect(2 * 3).toBe(6);
	});

	test.describe('Saved carts', () => {
		test('restores saved items', () => {
			expect(['notebook', 'pen']).toHaveLength(2);
		});

		test('retries a temporary inventory mismatch', ({}, testInfo) => {
			expect(testInfo.retry).toBeGreaterThan(0);
		});
	});
});

test.describe('Checkout', () => {
	test('calculates the order total', () => {
		expect(24.99 + 5).toBeCloseTo(29.99, 2);
	});

	test.skip('submits payment', () => {
		expect(true).toBe(false);
	});
});
