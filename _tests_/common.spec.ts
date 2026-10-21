import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';
import type { FullResult } from '@playwright/test/reporter';
import GitHubActionsReporter from '../dist/index.js';
import { formatDateTime } from '../dist/utils/date.js';
import { createReport } from '../dist/reporter.js';

const require = createRequire(import.meta.url);
const packageMetadata = createRequire(import.meta.url)('../package.json');

test('formats date and time in UTC', () => {
	expect(formatDateTime(new Date('2026-10-21T08:44:58.469Z'))).toBe(
		'2026-10-21/08:44:58',
	);
});

test('resolves the package name for Playwright reporter lookup', () => {
	expect(require.resolve('@packageio/playwright-github-actions-reporter')).toBe(
		require.resolve('../dist/index.js'),
	);
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
