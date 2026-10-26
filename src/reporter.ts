import type { FullResult, TestCase } from '@playwright/test/reporter';
import { renderReportHeader, renderTestDetails } from './report-renderer.js';

export type { TestCounts } from './report-renderer.js';

export function createReport(
	tests: readonly TestCase[],
	runResult: FullResult,
): string {
	return `
${renderReportHeader(tests, runResult)}
${renderTestDetails(tests)}
`;
}
