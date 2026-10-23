import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './test_examples',
	retries: 3,
	reporter: [['list'], ['./dist/index.js']],
});
