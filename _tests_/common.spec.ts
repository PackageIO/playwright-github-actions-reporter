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
		'<p>All: 1 | Passed: 1 | Failed: 0 | Flaky: 0 | Skipped: 0</p>',
	);
	expect(report).not.toContain('<table>');
	expect(report).toContain(
		'<summary>✅ storageState.spec.ts | <em>Passed: 1 | Failed: 0 | Flaky: 0 | Skipped: 0</em> | 🕒 Duration: 5.35s</summary>',
	);
	expect(report).toMatch(
		/<td><span title="Pass">✅<\/span> .*ui\/storageState\.spec\.ts &gt; setup storage state with cookies<\/td>/,
	);
	expect(report).toContain('🕒 5.354s');
	expect(report).toContain(
		'<td></td>\n\t\t\t\t\t<td>linux / storageState</td>',
	);
	expect(report).toContain('<th>Error</th>\n\t\t\t<th>Project</th>');
	expect(report).toContain('<th>Duration</th>');
	expect(report).toContain('<td>linux / storageState</td>');
	expect(report).not.toContain('<th>Status</th>');
	expect(report).not.toContain('test-status-filter');
	expect(report).toContain('smoke, regression');
	expect(report).toContain(
		'<a href="https://example.test/case/1" rel="noopener noreferrer">https://example.test/case/1</a>',
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
