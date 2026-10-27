import { appendFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import type {
	FullConfig,
	FullResult,
	Reporter,
	Suite,
} from '@playwright/test/reporter';
import { createReport } from './report/create-report.js';

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const isGitHubActions = process.env.GITHUB_ACTIONS;

const packageMetadata = createRequire(import.meta.url)('../package.json') as {
	name: string;
	version: string;
};

export default class GitHubActionsReporter implements Reporter {
	private suite?: Suite;

	onBegin(_config: FullConfig, suite: Suite): void {
		this.suite = suite;
		process.stdout.write(
			`${packageMetadata.name} v${packageMetadata.version}\n`,
		);
	}

	printsToStdio(): boolean {
		return true;
	}

	async onEnd(runResult: FullResult): Promise<void> {
		if (isGitHubActions === 'true' && summaryPath) {
			const report = createReport(this.suite?.allTests() ?? [], runResult);
			await appendFile(summaryPath, report, 'utf8');
		}
	}
}
