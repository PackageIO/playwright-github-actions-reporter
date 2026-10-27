import type { TestCounts } from '../report/model.js';
import { statusLabel } from './status.js';

export function renderOutcomeCounts(counts: TestCounts): string {
	const statuses: Array<[keyof typeof statusLabel, number]> = [
		['expected', counts.passed],
		['unexpected', counts.failed],
		['flaky', counts.flaky],
		['skipped', counts.skipped],
	];
	return (
		statuses
			.filter(([, count]) => count > 0)
			.map(
				([status, count]) =>
					`${statusLabel[status].character} ${count} ${statusLabel[status].title.toLowerCase()}`,
			)
			.join(' · ') || 'No tests'
	);
}
