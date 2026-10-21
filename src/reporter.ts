import type { FullResult, TestCase } from '@playwright/test/reporter';
import { formatDateTime } from './utils/date.js';
import { outcomeCountKey } from './utils/outcome.js';

export type TestCounts = {
	all: number;
	passed: number;
	failed: number;
	flaky: number;
	skipped: number;
};

export function createReport(
	tests: readonly TestCase[],
	runResult: FullResult,
): string {
	const counts: TestCounts = {
		all: 0,
		passed: 0,
		failed: 0,
		flaky: 0,
		skipped: 0,
	};

	for (const test of tests) {
		counts.all += 1;
		counts[outcomeCountKey[test.outcome()]] += 1;
	}

	return `
<h2>Test results</h2>
<p>Generated <em>${formatDateTime(new Date())}</em> Execution time: <em>${(runResult.duration / 1000).toFixed(2)}s</em></p>
<table>
	<thead>
		<tr>
			<th>All</th>
			<th>Passed</th>
			<th>Failed</th>
			<th>Flaky</th>
			<th>Skipped</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>${counts.all}</td>
			<td>${counts.passed}</td>
			<td>${counts.failed}</td>
			<td>${counts.flaky}</td>
			<td>${counts.skipped}</td>
		</tr>
	</tbody>
</table>
`;
}
