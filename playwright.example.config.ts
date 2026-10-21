import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './examples',
	retries: 3,
	reporter: [['list'], ['./dist/index.js']],
});