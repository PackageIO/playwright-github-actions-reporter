import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './examples',
	testMatch: 'report-preview.spec.ts',
	retries: 1,
	reporter: [['list'], ['./dist/index.js']],
});