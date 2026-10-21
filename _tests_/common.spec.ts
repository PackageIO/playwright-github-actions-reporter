import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';
import type { FullResult, TestCase } from '@playwright/test/reporter';
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

test('renders detailed test rows grouped by project and spec file', () => {
	const testCase = {
		annotations: [
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

	expect(report).toContain('<h2>Test results</h2>');
	expect(report).toContain(
		'<p><b>Total: [1]    [Passed: 1  Failed: 0  Flaky: 0  Skipped: 0]</b></p>',
	);
	expect(report).toContain('| Test | Duration | Retries | Tags | Project |');
	expect(report).toContain(
		'<summary><span style="color: #1a7f37" title="Passed">✓</span> storageState.spec.ts    [passed: 1  failed: 0  flaky: 0  skipped: 0  duration: 5.35s]</summary>',
	);
	expect(report).toContain(
		'| <span style="color: #1a7f37" title="Passed">✓</span>',
	);
	expect(report).not.toContain('**PASS**');
	expect(report).toContain(
		'ui/storageState.spec.ts &gt; setup storage state with cookies',
	);
	expect(report).toContain('| 5.354s |');
	expect(report).toContain('| smoke, regression |');
	expect(report).toContain('| linux / storageState |');
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
		'| <span style="color: #cf222e" title="Failed">✗</span> error.spec.ts &gt; fails cleanly<br><br><details><summary>Error details</summary><pre>Expected failure&#10;Received &#124; value</pre></details> | 0.010s |  |  | Default |',
	);
	expect(report).toContain('<summary>Error details</summary>');
	expect(report).not.toContain('colspan="5"><details>');
	expect(report).toContain(
		'<span style="color: #cf222e" title="Failed">✗</span>',
	);
	expect(report).not.toContain('**FAIL**');
	expect(report).not.toContain('\u001b');
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
