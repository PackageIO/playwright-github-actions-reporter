import { basename, isAbsolute, relative } from 'node:path';
import type { FullResult, TestCase } from '@playwright/test/reporter';
import { formatDateTime } from './utils/date.js';
import { formatDuration } from './utils/duration.js';
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
	expected: { character: '✓', title: 'Passed' },
	unexpected: { character: '✗', title: 'Failed' },
	flaky: { character: '⚠', title: 'Flaky' },
	skipped: { character: '⊘', title: 'Skipped' },
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
	return `<span title="${status.title}">${status.character}</span>`;
}

function renderTestStatus(outcome: keyof typeof statusLabel): string {
	return `${renderStatus(outcome)} ${statusLabel[outcome].title}`;
}

function formatAnnotation(description: string): string {
	return description
		.split(/(https?:\/\/[^\s<>"']+)/g)
		.map((part) => {
			const escapedPart = escapeHtml(part).replace(/\|/g, '&#124;');
			if (!/^https?:\/\//i.test(part)) return escapedPart;
			return `<a href="${escapedPart}" rel="noopener noreferrer">${escapedPart}</a>`;
		})
		.join('');
}

function parseAttributes(description: string | undefined): Array<[string, string]> {
	if (!description) return [];

	try {
		const value: unknown = JSON.parse(description);
		if (!Array.isArray(value)) return [];
		return value.flatMap((entry): Array<[string, string]> => {
			if (typeof entry !== 'object' || entry === null) return [];
			if (!('key' in entry) && !('value' in entry)) return [];
			const key = 'key' in entry && typeof entry.key === 'string' ? entry.key : '';
			const item = 'value' in entry ? String(entry.value) : '';
			return [[key, item]];
		});
	} catch {
		return [];
	}
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

function renderOutcomeCounts(counts: TestCounts): string {
	return `Passed: ${counts.passed} · Failed: ${counts.failed} · Flaky: ${counts.flaky} · Skipped: ${counts.skipped}`;
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
					const attributeAnnotations = test.annotations
						.map((annotation) => ({
							annotation,
							attributes: parseAttributes(annotation.description),
						}))
						.filter((item) => item.attributes.length > 0);
					const attributes = attributeAnnotations
						.flatMap((item) => item.attributes)
						.map(([key, value]) => `• ${escapeTableCell(key)}: ${escapeTableCell(value)}`)
						.join('<br>');
					const tags = test.tags
						.map((tag) => `• ${escapeTableCell(tag)}`)
						.join('<br>');
					const errors = test.results
						.flatMap((result) => result.errors)
						.map((error) => error.message ?? error.value ?? error.stack ?? '')
						.map(stripAnsi)
						.filter((error) => error.trim().length > 0);
					const annotations = test.annotations
						.filter(
							(annotation) =>
								!attributeAnnotations.some(
									(item) => item.annotation === annotation,
								),
						)
						.map(
							(annotation) => {
								if (annotation.type === 'skip') {
									return annotation.description
										? `<br>${formatAnnotation(annotation.description)}`
										: '';
								}

								return `<br><strong>${escapeTableCell(annotation.type)}</strong>${
									annotation.description
										? `: ${formatAnnotation(annotation.description)}`
										: ''
								}`;
							},
						)
						.join('');

					const errorText = errors
						.map(
							(error, index) =>
								`${index === 0 ? '<br><br>' : ''}<details><summary><em>Error details${index > 0 ? ` (retry ${index})` : ''}</em></summary><pre>${escapeHtml(error).replace(/\|/g, '&#124;').replace(/\r?\n/g, '&#10;')}</pre></details>`,
						)
						.join('');

					return `| ${renderTestStatus(test.outcome())} | ${escapeTableCell(title)}${annotations}${errorText} | ${attributes} | ${formatDuration(duration)} | ${retries || ''} | ${tags} |`;
				})
				.join('\n');

			return `<details>
<summary><strong>${renderStatus(groupOutcome)} ${escapeHtml(basename(group.file))}</strong> · <em>${escapeHtml(group.project)}</em> · <em>[${renderOutcomeCounts(counts)} · Duration: ${formatDuration(duration)}]</em></summary>

| Status | Test | Attributes | Duration | Retries | Tags |
| --- | --- | --- | ---: | ---: | --- |
${rows}

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
## Test results

**Total: ${counts.all}** · *[${renderOutcomeCounts(counts)}]*

*Generated: ${formatDateTime(new Date())} · Execution time: ${formatDuration(runResult.duration)}*

---
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
