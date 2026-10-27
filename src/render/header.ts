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
	const totalLabel = counts.all === 1 ? 'test' : 'tests';
	const generatedAt = formatDateTime(new Date()).replace('/', ' at ');

	return `
## Test results · \`${counts.all} ${totalLabel}\`

${renderOutcomeCounts(counts)} · ⏱️ Duration: ${formatDuration(runResult.duration)}

*Generated ${generatedAt}*

---
`;
}
