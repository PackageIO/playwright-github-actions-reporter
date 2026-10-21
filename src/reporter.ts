import { basename, isAbsolute, relative } from 'node:path';
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

type TestGroup = {
	file: string;
	project: string;
	tests: TestCase[];
};

const statusLabel = {
	expected: { character: '✓', color: '#1a7f37', title: 'Passed' },
	unexpected: { character: '✗', color: '#cf222e', title: 'Failed' },
	flaky: { character: '↻', color: '#bf8700', title: 'Flaky' },
	skipped: { character: '○', color: '#6e7781', title: 'Skipped' },
} as const;

function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
		};
		return entities[character];
	});
}

function escapeTableCell(value: string): string {
	return escapeHtml(value).replace(/\|/g, '&#124;').replace(/\r?\n/g, '<br>');
}

function stripAnsi(value: string): string {
	return value.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, '');
}

function renderStatus(outcome: keyof typeof statusLabel): string {
	const status = statusLabel[outcome];
	return `<span style="color: ${status.color}" title="${status.title}">${status.character}</span>`;
}

function formatAnnotation(description: string): string {
	return description
		.split(/(https?:\/\/[^\s<>"']+)/g)
		.map((part) => {
			const escapedPart = escapeHtml(part);
			if (!/^https?:\/\//i.test(part)) return escapedPart;
			return `<a href="${escapedPart}" rel="noopener noreferrer">${escapedPart}</a>`;
		})
		.join('');
}

function groupTests(tests: readonly TestCase[]): TestGroup[] {
	const groups = new Map<string, TestGroup>();

	for (const test of tests) {
		const file = isAbsolute(test.location.file)
			? relative(process.cwd(), test.location.file)
			: test.location.file;
		const project = test.parent.project()?.name || 'Default';
		const key = `${project}\0${file}`;
		let group = groups.get(key);

		if (!group) {
			group = { file, project, tests: [] };
			groups.set(key, group);
		}

		group.tests.push(test);
	}

	return [...groups.values()];
}

function countTests(tests: readonly TestCase[]): TestCounts {
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

	return counts;
}

function renderTestDetails(tests: readonly TestCase[]): string {
	return groupTests(tests)
		.map((group) => {
			const counts = countTests(group.tests);
			const duration = group.tests.reduce(
				(groupDuration, test) =>
					groupDuration +
					test.results.reduce(
						(testDuration, result) => testDuration + result.duration,
						0,
					),
				0,
			);
			const groupOutcome = group.tests.some(
				(test) => test.outcome() === 'unexpected',
			)
				? 'unexpected'
				: group.tests.some((test) => test.outcome() === 'flaky')
					? 'flaky'
					: group.tests.every((test) => test.outcome() === 'skipped')
						? 'skipped'
						: 'expected';
			const rows = group.tests
				.map((test) => {
					const titleParts = test
						.titlePath()
						.filter(
							(part) =>
								part &&
								part !== test.location.file &&
								part !== basename(test.location.file) &&
								part !== group.project,
						);
					const title = [group.file, ...titleParts].join(' > ');
					const duration = test.results.reduce(
						(total, result) => total + result.duration,
						0,
					);
					const retries = Math.max(0, test.results.length - 1);
					const errors = test.results
						.flatMap((result) => result.errors)
						.map((error) => error.message ?? error.value ?? error.stack ?? '')
						.filter(Boolean)
						.join('\n');
					const annotations = test.annotations
						.map(
							(annotation) =>
								`<br><strong>${escapeTableCell(annotation.type)}</strong>${
									annotation.description
										? `: ${formatAnnotation(annotation.description)}`
										: ''
								}`,
						)
						.join('');

					const errorText = errors
						? `<br><strong>Error:</strong> ${escapeTableCell(stripAnsi(errors))}`
						: '';

					return `<tr>
					<td>${renderStatus(test.outcome())} ${escapeHtml(title)}${annotations}${errorText}</td>
					<td>${(duration / 1000).toFixed(3)}s</td>
					<td>${retries || ''}</td>
					<td>${escapeHtml(test.tags.join(', '))}</td>
					<td>${escapeHtml(group.project)}</td>
				</tr>`;
				})
				.join('\n');

			return `<details>
<summary>${renderStatus(groupOutcome)} ${escapeHtml(basename(group.file))}  passed: ${counts.passed}  failed: ${counts.failed}  flaky: ${counts.flaky}  skipped: ${counts.skipped}  duration: ${(duration / 1000).toFixed(2)}s</summary>

<table>
	<thead>
		<tr>
			<th>Test</th>
			<th>Duration</th>
			<th>Retries</th>
			<th>Tags</th>
			<th>Project</th>
		</tr>
	</thead>
	<tbody>
${rows}
</tbody>
</table>
</details>`;
		})
		.join('\n');
}

function renderHeader(
	tests: readonly TestCase[],
	runResult: FullResult,
): string {
	const counts = countTests(tests);

	return `
<h2>Test results</h2>
<h3>All: ${counts.all}  Passed: ${counts.passed}  Failed: ${counts.failed}  Flaky: ${counts.flaky}  Skipped: ${counts.skipped}</h3>
<p>Generated: <em>${formatDateTime(new Date())}</em></p>
<p>Execution time: <em> ${(runResult.duration / 1000).toFixed(2)}s</em></p>
`;
}

export function createReport(
	tests: readonly TestCase[],
	runResult: FullResult,
): string {
	return `
${renderHeader(tests, runResult)}
${renderTestDetails(tests)}
`;
}
