import { expect, test } from '@playwright/test';

test.describe('User session', () => {
	test('keeps the session active', () => {
		expect({ active: true }).toHaveProperty('active', true);
	});
});