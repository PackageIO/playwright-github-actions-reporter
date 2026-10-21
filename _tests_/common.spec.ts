import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';
import GitHubActionsReporter from '../dist/index.js';

const require = createRequire(import.meta.url);
const packageMetadata = createRequire(import.meta.url)('../package.json');

test('resolves the package name for Playwright reporter lookup', () => {
	expect(
		require.resolve('@packageio/playwright-github-actions-reporter'),
	).toBe(require.resolve('../dist/index.js'));
});

test('prints its package name and version when the run begins', () => {
	const reporter = new GitHubActionsReporter();
	const originalWrite = process.stdout.write;
	let output = '';
	process.stdout.write = (chunk) => {
		output += String(chunk);
		return true;
	};
	try {
		reporter.onBegin({} as never, { allTests: () => [] } as never);
	} finally {
		process.stdout.write = originalWrite;
	}

	expect(output).toBe(`${packageMetadata.name} v${packageMetadata.version}\n`);
});