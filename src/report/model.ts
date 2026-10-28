import { basename, isAbsolute, relative } from 'node:path';
import type { TestCase } from '@playwright/test/reporter';

export type TestCounts = {
	all: number;
	passed: number;
	failed: number;
	flaky: number;
	skipped: number;
};

export type TestGroup = {
	file: string;
	project: string;
	tests: TestCase[];
};

export const outcomeCountKey = {
	expected: 'passed',
	unexpected: 'failed',
	flaky: 'flaky',
	skipped: 'skipped',
} as const;

export function groupTests(tests: readonly TestCase[]): TestGroup[] {
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

export function countTests(tests: readonly TestCase[]): TestCounts {
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

export function sumTestDuration(tests: readonly TestCase[]): number {
	return tests.reduce(
		(groupDuration, test) =>
			groupDuration +
			test.results.reduce(
				(testDuration, result) => testDuration + result.duration,
				0,
			),
		0,
	);
}

export function groupOutcome(
	tests: readonly TestCase[],
): keyof typeof outcomeCountKey {
	if (tests.some((test) => test.outcome() === 'unexpected'))
		return 'unexpected';
	if (tests.some((test) => test.outcome() === 'flaky')) return 'flaky';
	if (tests.every((test) => test.outcome() === 'skipped')) return 'skipped';
	return 'expected';
}

export function isSpecFileTitle(title: string, file: string): boolean {
	const normalizedTitle = title.replace(/\\/g, '/');
	const normalizedFile = file.replace(/\\/g, '/');
	return (
		normalizedTitle === normalizedFile ||
		normalizedTitle === basename(normalizedFile) ||
		normalizedFile.endsWith(`/${normalizedTitle}`)
	);
}
