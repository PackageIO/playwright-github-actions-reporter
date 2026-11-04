import type { TestGroup } from '../report/model.js';
import { renderTestStatus } from './status.js';
import { renderTestGroup } from './test-group.js';

const filterableOutcomes = ['unexpected', 'flaky', 'skipped'] as const;

function renderIndentedTestGroup(group: TestGroup): string {
	return renderTestGroup(group)
		.split('\n')
		.map((line) => (line ? `> ${line}` : '>'))
		.join('\n');
}

function renderOutcomeDetails(
	groups: readonly TestGroup[],
	outcome: (typeof filterableOutcomes)[number],
): string {
	const matchingGroups = groups
		.map((group) => ({
			...group,
			tests: group.tests.filter((test) => test.outcome() === outcome),
		}))
		.filter((group) => group.tests.length > 0);
	const count = matchingGroups.reduce(
		(total, group) => total + group.tests.length,
		0,
	);

	if (count === 0) return '';

	return `<details>
<summary>${renderTestStatus(outcome)} (${count})</summary>

<br>

${matchingGroups.map(renderIndentedTestGroup).join('\n<br>\n')}
</details>`;
}

export function renderTestDetails(groups: readonly TestGroup[]): string {
	const allTests = `<details>
<summary>🧪 Show all</summary>

<br>

${groups.map(renderIndentedTestGroup).join('\n<br>\n')}
</details>`;
	const outcomeDetails = filterableOutcomes
		.map((outcome) => renderOutcomeDetails(groups, outcome))
		.filter((section) => section.length > 0);

	if (outcomeDetails.length === 0) return allTests;

	return `${outcomeDetails.join('\n')}\n\n---\n\n${allTests}`;
}
