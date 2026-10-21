import { appendFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import type {
	FullConfig,
	FullResult,
	Reporter,
	Suite,
} from '@playwright/test/reporter';

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
		process.stdout.write(`${packageMetadata.name} v${packageMetadata.version}\n`);
	}

	printsToStdio(): boolean {
		return true;
	}

	async onEnd(runResult: FullResult): Promise<void> {
		if (isGitHubActions === 'true' && summaryPath) {
			const counts = {
				all: 0,
				passed: 0,
				failed: 0,
				flaky: 0,
				skipped: 0,
			};

			for (const test of this.suite?.allTests() ?? []) {
				counts.all += 1;
				const outcome = test.outcome();
				if (outcome === 'expected') counts.passed += 1;
				else if (outcome === 'unexpected') counts.failed += 1;
				else if (outcome === 'flaky') counts.flaky += 1;
				else counts.skipped += 1;
			}
			const report = [
				'<h2>Test results</h2>',
				`<p>Generated: ${new Date().toISOString()}</p>`,
				'<table>',
				'<thead><tr><th>All</th><th>Passed</th><th>Failed</th><th>Flaky</th><th>Skipped</th></tr></thead>',
				`<tbody><tr><td>${counts.all}</td><td>${counts.passed}</td><td>${counts.failed}</td><td>${counts.flaky}</td><td>${counts.skipped}</td></tr></tbody>`,
				'</table>',
				'',
			].join('\n');
			await appendFile(summaryPath, report, 'utf8');
		}
	}
}