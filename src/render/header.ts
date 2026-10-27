import type { FullResult, TestCase } from '@playwright/test/reporter';
import { formatDateTime } from '../format/date.js';
import { formatDuration } from '../format/duration.js';
import { countTests } from '../report/model.js';
import { renderOutcomeCounts } from './outcome-counts.js';

export function renderHeader(
	tests: readonly TestCase[],
	runResult: FullResult,
): string {
	const counts = countTests(tests);

	return `
## Test results

**Total: ${counts.all}** · [${renderOutcomeCounts(counts)} · Duration: ${formatDuration(runResult.duration)}]

*Generated: ${formatDateTime(new Date())} · Execution time: ${formatDuration(runResult.duration)}*

---
`;
}
