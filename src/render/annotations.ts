import { escapeHtml } from './escape.js';

export function parseAttributes(
	description: string | undefined,
): Array<[string, string]> {
	if (!description) return [];

	try {
		const value: unknown = JSON.parse(description);
		if (!Array.isArray(value)) return [];
		return value.flatMap((entry): Array<[string, string]> => {
			if (typeof entry !== 'object' || entry === null) return [];
			if (!('key' in entry) && !('value' in entry)) return [];
			const key =
				'key' in entry && typeof entry.key === 'string' ? entry.key : '';
			const item = 'value' in entry ? String(entry.value) : '';
			return [[key, item]];
		});
	} catch {
		return [];
	}
}

export function formatAnnotation(description: string): string {
	return description
		.split(/(https?:\/\/[^\s<>"']+)/g)
		.map((part) => {
			const escapedPart = escapeHtml(part).replace(/\|/g, '&#124;');
			if (!/^https?:\/\//i.test(part)) return escapedPart;
			return `<a href="${escapedPart}" rel="noopener noreferrer">${escapedPart}</a>`;
		})
		.join('');
}
