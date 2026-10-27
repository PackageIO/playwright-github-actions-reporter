import type { TestCounts } from '../report/model.js';

export function renderOutcomeCounts(counts: TestCounts): string {
	const statuses: Array<[string, number]> = [
		['Passed', counts.passed],
		['Failed', counts.failed],
		['Flaky', counts.flaky],
		['Skipped', counts.skipped],
	];
	return (
		statuses
			.filter(([, count]) => count > 0)
			.map(([status, count]) => `${status}: ${count}`)
			.join(' · ') || 'No tests'
	);
}
