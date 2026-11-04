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
	const testLabel = counts.all === 1 ? 'test' : 'tests';
	const duration = sumTestDuration(group.tests);
	const rows = group.tests
		.map((test) => renderTestRow(test, group.project))
		.join('\n');

	return `<details>
<summary>${renderStatus(groupOutcome(group.tests))} <strong>${escapeHtml(basename(group.file))}</strong> · <em>${escapeHtml(group.project)}</em> · <code>🧪 ${counts.all} ${testLabel} · ${renderOutcomeCounts(counts)} · ⏱️ ${formatDuration(duration)}</code></summary>
| Status | Test | Retries | Duration |
| --- | --- | ---: | ---: |
${rows}
</details>`;
}
