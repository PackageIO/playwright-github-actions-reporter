export const statusLabel = {
	expected: { character: '✅', title: 'Passed' },
	unexpected: { character: '❌', title: 'Failed' },
	flaky: { character: '⚠️', title: 'Flaky' },
	skipped: { character: '⏭️', title: 'Skipped' },
} as const;

export function renderStatus(outcome: keyof typeof statusLabel): string {
	const status = statusLabel[outcome];
	return `<span title="${status.title}">${status.character}</span>`;
}

export function renderTestStatus(outcome: keyof typeof statusLabel): string {
	return `${renderStatus(outcome)} ${statusLabel[outcome].title}`;
}
