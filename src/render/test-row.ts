import type { TestCase } from '@playwright/test/reporter';
import { formatDuration } from '../format/duration.js';
import { formatAnnotation, parseAttributes } from './annotations.js';
import { escapeHtml, escapeTableCell, stripAnsi } from './escape.js';
import { renderTestStatus } from './status.js';
import { isSpecFileTitle } from '../report/model.js';

export function renderTestRow(test: TestCase, project: string): string {
	const titleParts = test
		.titlePath()
		.filter(
			(part) =>
				part && !isSpecFileTitle(part, test.location.file) && part !== project,
		);
	const title = titleParts.join(' > ');
	const duration = test.results.reduce(
		(total, result) => total + result.duration,
		0,
	);
	const retries = Math.max(0, test.results.length - 1);
	const attributeAnnotations = test.annotations
		.map((annotation) => ({
			annotation,
			attributes: parseAttributes(annotation.description),
		}))
		.filter((item) => item.attributes.length > 0);
	const attributeTags = attributeAnnotations
		.flatMap((item) => item.attributes)
		.map(([key, value]) => `${escapeTableCell(key)}.${escapeTableCell(value)}`);
	const tags = [
		...test.tags.map((tag) => escapeTableCell(tag.replace(/^@/, ''))),
		...attributeTags,
	].join('·');
	const metadata = tags
		? `<br><br><strong><em>tags:</em></strong> <em>${tags}</em>`
		: '';
	const errors = test.results
		.map((result) =>
			result.errors
				.map((error) => error.message ?? error.value ?? error.stack ?? '')
				.map(stripAnsi)
				.find((error) => error.trim().length > 0),
		)
		.map((error, retry) => ({ error, retry }))
		.filter(
			(entry): entry is { error: string; retry: number } =>
				typeof entry.error === 'string',
		);
	const annotations = test.annotations
		.filter(
			(annotation) =>
				!attributeAnnotations.some((item) => item.annotation === annotation),
		)
		.map((annotation) => {
			if (annotation.type === 'skip') {
				return annotation.description
					? `<br>${formatAnnotation(annotation.description)}`
					: '';
			}

			return `<br><strong>${escapeTableCell(annotation.type)}</strong>${
				annotation.description
					? `: ${formatAnnotation(annotation.description)}`
					: ''
			}`;
		})
		.join('');

	const errorText = errors
		.map(
			({ error, retry }, index) =>
				`${index === 0 ? '<br><br>' : ''}<details><summary><em>Error details${retry > 0 ? ` (retry ${retry})` : ''}</em></summary><pre>${escapeHtml(error).replace(/\|/g, '&#124;').replace(/\r?\n/g, '&#10;')}</pre></details>`,
		)
		.join('');

	return `| ${renderTestStatus(test.outcome())} | ${escapeTableCell(title)}${metadata}${annotations}${errorText} | ${retries || ''} | ${formatDuration(duration)} |`;
}
