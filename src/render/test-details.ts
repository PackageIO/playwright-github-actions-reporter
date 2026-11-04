import type { TestGroup } from '../report/model.js';
import { renderTestGroup } from './test-group.js';

type TestOutcome = ReturnType<TestGroup['tests'][number]['outcome']>;

function renderTestSection(
	title: string,
	groups: readonly TestGroup[],
): string {
	return `<details>
<summary>${title}</summary>

<br>

${groups.map(renderTestGroup).join('\n')}
</details>`;
}

function renderOutcomeSection(
	groups: readonly TestGroup[],
	title: string,
	outcome: TestOutcome,
): string {
	const matchingGroups = groups.flatMap((group) => {
		const tests = group.tests.filter((test) => test.outcome() === outcome);
		return tests.length > 0 ? [{ ...group, tests }] : [];
	});

	return matchingGroups.length > 0
		? renderTestSection(title, matchingGroups)
		: '';
}

export function renderTestDetails(groups: readonly TestGroup[]): string {
	const outcomeSections = [
		renderOutcomeSection(groups, '❌ Show failed only', 'unexpected'),
		renderOutcomeSection(groups, '⚠️ Show Flaky only', 'flaky'),
		renderOutcomeSection(groups, '⏭️ Show Skipped only', 'skipped'),
	]
		.filter(Boolean)
		.join('\n');
	const allTestsSection = renderTestSection('🧪 Show test all', groups);

	return outcomeSections
		? `${outcomeSections}\n\n${allTestsSection}`
		: allTestsSection;
}
