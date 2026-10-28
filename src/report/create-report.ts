import type { FullResult, TestCase } from '@playwright/test/reporter';
import { groupTests } from './model.js';
import { renderHeader } from '../render/header.js';
import { renderTestGroup } from '../render/test-group.js';

export function createReport(
	tests: readonly TestCase[],
	runResult: FullResult,
): string {
	const groups = groupTests(tests);
	return `
${renderHeader(tests, runResult)}
${groups.map(renderTestGroup).join('\n')}
`;
}
