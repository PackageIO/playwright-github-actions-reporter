const MAX_ERROR_LINE_LENGTH = 80;

export function wrapErrorLines(message: string): string {
	return message
		.split(/\r\n|\r|\n/)
		.flatMap((line) => {
			const chunks: string[] = [];
			for (let i = 0; i < line.length; i += MAX_ERROR_LINE_LENGTH) {
				chunks.push(line.slice(i, i + MAX_ERROR_LINE_LENGTH));
			}
			return chunks.length > 0 ? chunks : [''];
		})
		.join('\n');
}
