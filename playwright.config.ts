import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from '@playwright/test';

const summaryPath = path.resolve('test-results/reporter-preview.md');

if (process.env.GITHUB_ACTIONS !== 'true') {
	await mkdir(path.dirname(summaryPath), { recursive: true });
	await writeFile(summaryPath, '', 'utf8');
	process.env.GITHUB_ACTIONS = 'true';
	process.env.GITHUB_STEP_SUMMARY = summaryPath;
}

export default defineConfig({
	testDir: './_tests_',
	reporter: [
		['list'],
		['./dist/index.js'],
	],
});