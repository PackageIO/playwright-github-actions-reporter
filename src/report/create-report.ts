import type { FullResult, TestCase } from '@playwright/test/reporter';
import { groupTests } from './model.js';
import { renderHeader } from '../render/header.js';
import { renderTestDetails } from '../render/test-details.js';

export function createReport(
	tests: readonly TestCase[],
	runResult: FullResult,
): string {
	const groups = groupTests(tests);
	return `
${renderHeader(tests, runResult)}
${renderTestDetails(groups)}
`;
}
