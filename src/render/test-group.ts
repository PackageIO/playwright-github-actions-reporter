import { basename } from 'node:path';
import type { TestGroup } from '../report/model.js';
import { countTests, groupOutcome, sumTestDuration } from '../report/model.js';
import { formatDuration } from '../format/duration.js';
import { escapeHtml } from './escape.js';
import { renderOutcomeCounts } from './outcome-counts.js';
import { renderStatus } from './status.js';
import { renderTestRow } from './test-row.js';

export function renderTestGroup(group: TestGroup): string {
	const counts = countTests(group.tests);
	const duration = sumTestDuration(group.tests);
	const rows = group.tests
		.map((test) => renderTestRow(test, group.project))
		.join('\n');

	return `<details>
<summary><strong>${renderStatus(groupOutcome(group.tests))} ${escapeHtml(basename(group.file))}</strong> · <em>${escapeHtml(group.project)}</em> · <em><code>${renderOutcomeCounts(counts)}</code> · <code>⏱️ ${formatDuration(duration)}</code></em></summary>

<br>

| Status | Test | Retries | Duration |
| --- | --- | ---: | ---: |
${rows}

</details>`;
}
