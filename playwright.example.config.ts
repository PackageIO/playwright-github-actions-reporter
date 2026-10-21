import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './examples',
	retries: 1,
	reporter: [['list'], ['./dist/index.js']],
});