import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './_tests_',
	reporter: [['list'], ['./dist/index.js']],
});
