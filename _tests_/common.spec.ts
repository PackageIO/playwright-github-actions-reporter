import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';
import type { FullResult, TestCase } from '@playwright/test/reporter';
import GitHubActionsReporter from '../dist/index.js';
import { formatDateTime } from '../dist/utils/date.js';
import { formatDuration } from '../dist/utils/duration.js';
import { createReport } from '../dist/reporter.js';

const require = createRequire(import.meta.url);
const packageMetadata = createRequire(import.meta.url)('../package.json');

test('formats date and time in UTC', () => {
	expect(formatDateTime(new Date('2026-10-21T08:44:58.469Z'))).toBe(
		'2026-10-21/08:44:58',
	);
});

test('formats durations as seconds, minutes and hours', () => {
	expect(formatDuration(5354)).toBe('5s');
	expect(formatDuration(150544)).toBe('2m 30.54s');
	expect(formatDuration(3723456)).toBe('1h 2m 3.46s');
});

test('renders detailed test rows grouped by project and spec file', () => {
	const testCase = {
		annotations: [
			{ type: 'skip' },
			{
				type: 'rp:setDescription',
				description: 'XRAY link: https://example.test/case/1',
			},
		],
		location: { file: '/workspace/ui/storageState.spec.ts' },
		outcome: () => 'expected',
		parent: { project: () => ({ name: 'linux / storageState' }) },
		results: [{ duration: 5354, errors: [] }],
		tags: ['smoke', 'regression'],
		titlePath: () => [
			'storageState.spec.ts',
			'setup storage state with cookies',
		],
	} as unknown as TestCase;
	const report = createReport([testCase], { duration: 5354 } as FullResult);

	expect(report).toContain('## Test results');
	expect(report).toContain(
		'**Total: 1** · *[Passed: 1 · Failed: 0 · Flaky: 0 · Skipped: 0]*',
	);
	expect(report).toMatch(
		/Generated: \d{4}-\d{2}-\d{2}\/\d{2}:\d{2}:\d{2} · Execution time: 5s/,
	);
	expect(report).toMatch(/Execution time: 5s\*\n\n---/);
	expect(report).toContain('| Status | Test | Duration | Retries | Tags |');
	expect(report).toContain(
		'<summary><strong><span title="Passed">✓</span> storageState.spec.ts</strong> · <em>linux / storageState</em> · <em>[Passed: 1 · Failed: 0 · Flaky: 0 · Skipped: 0 · Duration: 5s]</em></summary>',
	);
	expect(report).toContain('| <span title="Passed">✓</span> Passed |');
	expect(report).not.toContain('**PASS**');
	expect(report).toContain(
		'ui/storageState.spec.ts &gt; setup storage state with cookies',
	);
	expect(report).toContain('| 5s |');
	expect(report).toContain('| smoke, regression |');
	expect(report).not.toContain('| Project |');
	expect(report).not.toContain('<strong>skip</strong>');
	expect(report).not.toContain('test-status-filter');
	expect(report).toContain('smoke, regression');
	expect(report).toContain(
		'<a href="https://example.test/case/1" rel="noopener noreferrer">https://example.test/case/1</a>',
	);
});

test('strips ANSI colors from rendered errors', () => {
	const failedTest = {
		annotations: [],
		location: { file: 'error.spec.ts' },
		outcome: () => 'unexpected',
		parent: { project: () => ({ name: 'Default' }) },
		results: [
			{
				duration: 10,
				errors: [
					{
						message: '\u001b[31mExpected failure\u001b[39m\nReceived | value',
					},
				],
			},
		],
		tags: [],
		titlePath: () => ['error.spec.ts', 'fails cleanly'],
	} as unknown as TestCase;
	const report = createReport([failedTest], { duration: 10 } as FullResult);

	expect(report).toContain('Expected failure');
	expect(report).toContain(
		'| <span title="Failed">✗</span> Failed | error.spec.ts &gt; fails cleanly<br><br><details><summary><em>Error details</em></summary><pre>Expected failure&#10;Received &#124; value</pre></details> | 0s |  |  |',
	);
	expect(report).toContain('<summary><em>Error details</em></summary>');
	expect(report).not.toContain('colspan="5"><details>');
	expect(report).toContain('<span title="Failed">✗</span>');
	expect(report).not.toContain('style=');
	expect(report).not.toContain('**FAIL**');
	expect(report).not.toContain('\u001b');
});

test('renders each test error in a numbered collapsible section', () => {
	const failedTest = {
		annotations: [],
		location: { file: 'error.spec.ts' },
		outcome: () => 'unexpected',
		parent: { project: () => ({ name: 'Default' }) },
		results: [
			{
				duration: 10,
				errors: [
					{ message: 'First failure' },
					{ message: 'Second failure' },
					{ message: ' \n ' },
				],
			},
		],
		tags: [],
		titlePath: () => ['error.spec.ts', 'fails twice'],
	} as unknown as TestCase;
	const report = createReport([failedTest], { duration: 10 } as FullResult);

	expect(report).toContain(
		'<summary><em>Error details</em></summary><pre>First failure</pre></details>',
	);
	expect(report).toContain(
		'<summary><em>Error details (retry 1)</em></summary><pre>Second failure</pre></details>',
	);
	expect(report).toContain(
		'</details><details><summary><em>Error details (retry 1)</em></summary>',
	);
	expect(report).not.toContain('Error details (retry 2)');
	expect(report).not.toContain('<pre></pre>');
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
