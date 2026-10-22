export function formatDuration(durationMs: number): string {
	const totalSeconds = durationMs / 1000;
	if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;

	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = Math.floor(totalSeconds % 60);
	const remainder = (totalSeconds % 1).toFixed(2).slice(1);
	const secondsText = `${seconds}${remainder}s`;
	if (hours > 0) return `${hours}h ${minutes}m ${secondsText}`;
	return `${minutes}m ${secondsText}`;
}
