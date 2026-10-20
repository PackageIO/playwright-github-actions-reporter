import { appendFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import type {
	FullConfig,
	FullResult,
	Reporter,
	Suite,
} from '@playwright/test/reporter';

const packageMetadata = createRequire(import.meta.url)('../package.json') as {
	name: string;
	version: string;
};

export default class GitHubActionsReporter implements Reporter {

	onBegin(_config: FullConfig, _suite: Suite): void {
		process.stdout.write(`${packageMetadata.name} v${packageMetadata.version}\n`);
	}

	printsToStdio(): boolean {
		return true;
	}

	async onEnd(runResult: FullResult): Promise<void> {
		const summaryPath = process.env.GITHUB_STEP_SUMMARY;
		if (process.env.GITHUB_ACTIONS === 'true' && runResult.status === 'passed' && summaryPath) {
			await appendFile(summaryPath, 'result\n', 'utf8');
		}
	}
}